package com.talentx.hrms.service.role;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.role.RoleResponse;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.Permission;
import com.talentx.hrms.entity.security.Role;
import com.talentx.hrms.entity.security.RolePermission;
import com.talentx.hrms.mapper.RoleMapper;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.PermissionRepository;
import com.talentx.hrms.repository.RoleRepository;
import com.talentx.hrms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleMapper roleMapper;

    @Autowired
    public RoleService(RoleRepository roleRepository,
                      PermissionRepository permissionRepository,
                      OrganizationRepository organizationRepository,
                      UserRepository userRepository,
                      RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roleMapper = roleMapper;
    }

    /**
     * Create a new role
     */
    public Role createRole(String name, String description, Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (roleRepository.existsByNameAndOrganization(name, organization)) {
            throw new RuntimeException("Role name already exists in organization");
        }

        Role role = new Role();
        role.setName(name);
        // Generate code from name if not provided: "HR Manager" → "HR_MANAGER"
        role.setCode(name.toUpperCase().replaceAll("[^A-Z0-9]", "_").replaceAll("_+", "_").replaceAll("^_|_$", ""));
        role.setDescription(description);
        role.setOrganization(organization);
        role.setIsSystemRole(false);

        return roleRepository.save(role);
    }

    /**
     * Save role entity (for code override after creation)
     */
    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    /**
     * Get role by ID — fetch full graph inside transaction, return DTO
     */
    @Transactional(readOnly = true)
    public RoleResponse getRoleResponse(Long id) {
        Role role = roleRepository.findByIdWithFullGraph(id)
            .orElseThrow(() -> new RuntimeException("Role not found"));
        return roleMapper.toResponse(role);
    }

    /**
     * Get role entity by ID (for internal use only — no lazy collections accessed)
     */
    @Transactional(readOnly = true)
    public Role getRole(Long id) {
        return roleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    /**
     * Get all roles with pagination — two-query pattern: IDs first, then fetch graph.
     * Avoids Hibernate JOIN FETCH + pagination duplicate row issue.
     */
    @Transactional(readOnly = true)
    public Page<RoleResponse> getRoles(PaginationRequest paginationRequest) {
        Organization organization = getCurrentUser().getOrganization();
        Pageable pageable = createPageable(paginationRequest);
        return fetchRolePage(roleRepository.findRoleIdsByOrganization(organization, pageable));
    }

    /**
     * Search roles by name — two-query pattern.
     */
    @Transactional(readOnly = true)
    public Page<RoleResponse> searchRoles(String name, PaginationRequest paginationRequest) {
        Organization organization = getCurrentUser().getOrganization();
        Pageable pageable = createPageable(paginationRequest);
        Page<Long> idPage = (name != null && !name.trim().isEmpty())
            ? roleRepository.findRoleIdsByOrganizationAndName(organization, name.trim(), pageable)
            : roleRepository.findRoleIdsByOrganization(organization, pageable);
        return fetchRolePage(idPage);
    }

    /** Fetch full graph for a page of IDs and preserve original order. */
    private Page<RoleResponse> fetchRolePage(Page<Long> idPage) {
        if (idPage.isEmpty()) {
            return idPage.map(id -> null);
        }
        List<Long> ids = idPage.getContent();
        Map<Long, Role> byId = roleRepository.findByIdsWithFullGraph(ids)
            .stream().collect(Collectors.toMap(Role::getId, Function.identity()));
        List<RoleResponse> content = ids.stream()
            .map(byId::get)
            .filter(r -> r != null)
            .map(roleMapper::toResponse)
            .collect(Collectors.toList());
        return new PageImpl<>(content, idPage.getPageable(), idPage.getTotalElements());
    }

    /**
     * Get all roles for organization (non-paginated) — mapped inside transaction
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRolesAsResponse() {
        Organization organization = getCurrentUser().getOrganization();
        List<Long> ids = roleRepository.findAllByOrganization(organization)
            .stream().map(Role::getId).collect(Collectors.toList());
        if (ids.isEmpty()) return List.of();
        return roleRepository.findByIdsWithFullGraph(ids)
            .stream().map(roleMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        Organization organization = getCurrentUser().getOrganization();
        return roleRepository.findAllByOrganization(organization);
    }

    /**
     * Get custom (non-system) roles — mapped inside transaction
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> getCustomRolesAsResponse() {
        Organization organization = getCurrentUser().getOrganization();
        List<Long> ids = roleRepository.findCustomRolesByOrganization(organization)
            .stream().map(Role::getId).collect(Collectors.toList());
        if (ids.isEmpty()) return List.of();
        return roleRepository.findByIdsWithFullGraph(ids)
            .stream().map(roleMapper::toResponse).collect(Collectors.toList());
    }

    /**
     * Get custom (non-system) roles — entity list for internal use
     */
    @Transactional(readOnly = true)
    public List<Role> getCustomRoles() {
        Organization organization = getCurrentUser().getOrganization();
        return roleRepository.findCustomRolesByOrganization(organization);
    }

    /**
     * Get system roles — mapped inside transaction
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> getSystemRolesAsResponse() {
        List<Long> ids = roleRepository.findByIsSystemRoleTrue()
            .stream().map(Role::getId).collect(Collectors.toList());
        if (ids.isEmpty()) return List.of();
        return roleRepository.findByIdsWithFullGraph(ids)
            .stream().map(roleMapper::toResponse).collect(Collectors.toList());
    }

    /**
     * Get system roles — entity list for internal use
     */
    @Transactional(readOnly = true)
    public List<Role> getSystemRoles() {
        return roleRepository.findByIsSystemRoleTrue();
    }

    /**
     * Update role
     */
    public Role updateRole(Long id, String name, String description) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        // Check if it's a system role
        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new RuntimeException("Cannot modify system role");
        }

        // Check if new name already exists (excluding current role)
        if (name != null && !name.equals(role.getName())) {
            Optional<Role> existingRole = roleRepository
                .findByNameAndOrganization(name, role.getOrganization());
            if (existingRole.isPresent() && !existingRole.get().getId().equals(id)) {
                throw new RuntimeException("Role name already exists in organization");
            }
            role.setName(name);
        }

        if (description != null) {
            role.setDescription(description);
        }

        return roleRepository.save(role);
    }

    /**
     * Delete role
     */
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        // Check if it's a system role
        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new RuntimeException("Cannot delete system role");
        }

        // Check if role is assigned to any users
        if (!role.getUserRoles().isEmpty()) {
            long activeAssignments = role.getUserRoles().stream()
                .filter(ur -> Boolean.TRUE.equals(ur.isActive()))
                .count();
            if (activeAssignments > 0) {
                throw new RuntimeException("Cannot delete role that is assigned to users");
            }
        }

        roleRepository.delete(role);
    }

    /**
     * Assign permission to role
     */
    public RolePermission assignPermission(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new RuntimeException("Permission not found"));

        // Check if role already has this permission
        boolean hasPermission = role.getRolePermissions().stream()
            .anyMatch(rp -> rp.getPermission().getId().equals(permission.getId()) 
                && Boolean.TRUE.equals(rp.isActive()));

        if (hasPermission) {
            throw new RuntimeException("Role already has this permission");
        }

        // Create role permission
        String currentUsername = getCurrentUser().getUsername();
        RolePermission rolePermission = new RolePermission(role, permission, currentUsername);
        rolePermission.setActive(true);

        role.getRolePermissions().add(rolePermission);
        roleRepository.save(role);

        return rolePermission;
    }

    /**
     * Remove permission from role
     */
    public void removePermission(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        // Check if it's a system role
        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new RuntimeException("Cannot modify permissions of system role");
        }

        RolePermission rolePermission = role.getRolePermissions().stream()
            .filter(rp -> rp.getPermission().getId().equals(permissionId) 
                && Boolean.TRUE.equals(rp.isActive()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Role does not have this permission"));

        rolePermission.setActive(false);
        roleRepository.save(role);
    }

    /**
     * Get role statistics
     */
    @Transactional(readOnly = true)
    public RoleStatistics getRoleStatistics() {
        Organization organization = getCurrentUser().getOrganization();

        long totalRoles = roleRepository.countByOrganization(organization);
        long systemRoles = roleRepository.findByIsSystemRoleTrue().size();
        long customRoles = roleRepository.findCustomRolesByOrganization(organization).size();

        return new RoleStatistics(totalRoles, systemRoles, customRoles);
    }

    /**
     * Create pageable from pagination request
     */
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userRepository.findByUsernameWithOrganization(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        }
        throw new RuntimeException("No authenticated user found");
    }

    /**
     * Role statistics inner class
     */
    public static class RoleStatistics {
        private final long totalRoles;
        private final long systemRoles;
        private final long customRoles;

        public RoleStatistics(long totalRoles, long systemRoles, long customRoles) {
            this.totalRoles = totalRoles;
            this.systemRoles = systemRoles;
            this.customRoles = customRoles;
        }

        // Getters
        public long getTotalRoles() { return totalRoles; }
        public long getSystemRoles() { return systemRoles; }
        public long getCustomRoles() { return customRoles; }
    }
}

