package com.talentx.hrms.service.user;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.user.UserResponse;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.Role;
import com.talentx.hrms.entity.security.UserRole;
import com.talentx.hrms.mapper.UserMapper;
import com.talentx.hrms.repository.OrganizationRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserRepository userRepository,
                      OrganizationRepository organizationRepository,
                      RoleRepository roleRepository,
                      PasswordEncoder passwordEncoder,
                      UserMapper userMapper) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    /**
     * Create a new user
     */
    public User createUser(String username, String email, String password, Long organizationId) {
        // Validate organization
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Check if username already exists
        if (userRepository.existsByUsernameAndOrganization(username, organization)) {
            throw new RuntimeException("Username already exists in organization");
        }

        // Check if email already exists
        if (userRepository.existsByEmailAndOrganization(email, organization)) {
            throw new RuntimeException("Email already exists in organization");
        }

        // Create user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setOrganization(organization);
        user.setEmailVerified(false);
        user.setAccountLocked(false);
        user.setAccountExpired(false);
        user.setCredentialsExpired(false);
        user.setFailedLoginAttempts(0);
        user.setMustChangePassword(false);
        user.setActive(true);

        return userRepository.save(user);
    }

    /**
     * Update user
     */
    public User updateUser(Long id, String email, String firstName, String lastName, String phone) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email already exists (excluding current user)
        if (email != null && !email.equals(user.getEmail())) {
            Optional<User> existingByEmail = userRepository
                .findByEmailAndOrganization(email, user.getOrganization());
            if (existingByEmail.isPresent() && !existingByEmail.get().getId().equals(id)) {
                throw new RuntimeException("Email already exists in organization");
            }
            user.setEmail(email);
        }

        if (firstName != null) {
            user.setFirstName(firstName);
        }
        if (lastName != null) {
            user.setLastName(lastName);
        }
        if (phone != null) {
            user.setPhone(phone);
        }

        return userRepository.save(user);
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public User getUser(Long id) {
        return userRepository.findByIdWithRoles(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get all users with pagination — two-query pattern: IDs first, then fetch graph.
     * Avoids Hibernate JOIN FETCH + pagination duplicate row issue.
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(PaginationRequest paginationRequest) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();
        Pageable pageable = createPageable(paginationRequest);
        return fetchUserPage(userRepository.findUserIdsByOrganization(organization, pageable));
    }

    /**
     * Search users by name — two-query pattern.
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String name, PaginationRequest paginationRequest) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();
        Pageable pageable = createPageable(paginationRequest);
        Page<Long> idPage = (name != null && !name.trim().isEmpty())
            ? userRepository.findUserIdsByOrganizationAndName(organization, name.trim(), pageable)
            : userRepository.findUserIdsByOrganization(organization, pageable);
        return fetchUserPage(idPage);
    }

    /** Fetch full graph for a page of IDs and preserve original order. */
    private Page<UserResponse> fetchUserPage(Page<Long> idPage) {
        if (idPage.isEmpty()) {
            return idPage.map(id -> null);
        }
        List<Long> ids = idPage.getContent();
        Map<Long, User> byId = userRepository.findByIdsWithFullGraph(ids)
            .stream().collect(Collectors.toMap(User::getId, Function.identity()));
        List<UserResponse> content = ids.stream()
            .map(byId::get)
            .filter(u -> u != null)
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
        return new PageImpl<>(content, idPage.getPageable(), idPage.getTotalElements());
    }

    /**
     * Get active users
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return userRepository.findActiveByOrganization(organization);
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(String roleName) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return userRepository.findByOrganizationAndRoleName(organization, roleName);
    }

    /**
     * Assign role to user
     */
    public UserRole assignRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new RuntimeException("Role not found"));

        // Check if user already has this role
        boolean hasRole = user.getUserRoles().stream()
            .anyMatch(ur -> ur.getRole().getId().equals(role.getId()) && ur.isActive());

        if (hasRole) {
            throw new RuntimeException("User already has this role");
        }

        // Create user role
        User currentUser = getCurrentUser();
        UserRole userRole = new UserRole(user, role, currentUser.getUsername());
        userRole.setActive(true);

        user.getUserRoles().add(userRole);
        userRepository.save(user);

        return userRole;
    }

    /**
     * Remove role from user
     */
    public void removeRole(Long userId, Long roleId) {
        User user = userRepository.findByIdWithRoles(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        UserRole userRole = user.getUserRoles().stream()
            .filter(ur -> ur.getRole().getId().equals(roleId) && ur.isActive())
            .findFirst()
            .orElseThrow(() -> new RuntimeException("User does not have this role"));

        userRole.setActive(false);
        userRepository.save(user);
    }

    /**
     * Activate user
     */
    public User activateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("User is already active");
        }

        user.setActive(true);
        user.setAccountLocked(false);
        user.setAccountExpired(false);

        return userRepository.save(user);
    }

    /**
     * Deactivate user
     */
    public User deactivateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new RuntimeException("User is already inactive");
        }

        user.setActive(false);

        return userRepository.save(user);
    }

    /**
     * Lock user account
     */
    public User lockUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAccountLocked(true);

        return userRepository.save(user);
    }

    /**
     * Unlock user account
     */
    public User unlockUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);

        return userRepository.save(user);
    }

    /**
     * Reset user password
     */
    public User resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Timestamp.from(Instant.now()));
        user.setMustChangePassword(true);
        user.setCredentialsExpired(false);

        return userRepository.save(user);
    }

    /**
     * Delete user
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user can be deleted
        User currentUser = getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("Cannot delete your own user account");
        }

        userRepository.delete(user);
    }

    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public UserStatistics getUserStatistics() {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        long totalUsers = userRepository.countByOrganization(organization);
        long activeUsers = userRepository.countActiveByOrganization(organization);
        long lockedUsers = userRepository.findByOrganizationAndAccountLockedTrue(organization).size();
        long expiredUsers = userRepository.findByOrganizationAndAccountExpiredTrue(organization).size();

        return new UserStatistics(totalUsers, activeUsers, lockedUsers, expiredUsers);
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
     * User statistics inner class
     */
    public static class UserStatistics {
        private final long totalUsers;
        private final long activeUsers;
        private final long lockedUsers;
        private final long expiredUsers;

        public UserStatistics(long totalUsers, long activeUsers, long lockedUsers, long expiredUsers) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.lockedUsers = lockedUsers;
            this.expiredUsers = expiredUsers;
        }

        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getLockedUsers() { return lockedUsers; }
        public long getExpiredUsers() { return expiredUsers; }
    }
}

