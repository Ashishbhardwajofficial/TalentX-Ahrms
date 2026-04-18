package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.security.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    // Find by name
    Optional<Role> findByName(String name);
    
    // Find by name and organization
    Optional<Role> findByNameAndOrganization(String name, Organization organization);
    
    // Find by code and organization
    Optional<Role> findByOrganizationAndCode(Organization organization, String code);
    
    // Find all roles by organization (list — no pagination)
    @Query("SELECT r FROM Role r WHERE r.organization = :organization")
    List<Role> findAllByOrganization(@Param("organization") Organization organization);

    // Find system roles
    List<Role> findByIsSystemRoleTrue();
    
    // Find non-system roles by organization
    @Query("SELECT r FROM Role r WHERE r.organization = :organization AND r.isSystemRole = false")
    List<Role> findCustomRolesByOrganization(@Param("organization") Organization organization);
    
    // Check if role name exists in organization
    boolean existsByNameAndOrganization(String name, Organization organization);
    
    // Count roles by organization
    long countByOrganization(Organization organization);

    // Step 1: Get paged IDs only (safe for pagination — no JOIN FETCH)
    @Query("SELECT r.id FROM Role r WHERE r.organization = :organization")
    org.springframework.data.domain.Page<Long> findRoleIdsByOrganization(
        @Param("organization") Organization organization,
        org.springframework.data.domain.Pageable pageable);

    // Step 1 (search): Get paged IDs matching name filter
    @Query("SELECT r.id FROM Role r WHERE r.organization = :organization AND LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    org.springframework.data.domain.Page<Long> findRoleIdsByOrganizationAndName(
        @Param("organization") Organization organization,
        @Param("name") String name,
        org.springframework.data.domain.Pageable pageable);

    // Step 2: Fetch full graph for a known set of IDs (no pagination — no duplicate risk)
    // NOTE: userRoles NOT fetched here to avoid Employee lazy load chain → 500 error
    @Query("SELECT DISTINCT r FROM Role r JOIN FETCH r.organization LEFT JOIN FETCH r.rolePermissions rp LEFT JOIN FETCH rp.permission WHERE r.id IN :ids")
    List<Role> findByIdsWithFullGraph(@Param("ids") List<Long> ids);

    // Fetch full graph for a single role by ID
    // NOTE: userRoles NOT fetched here to avoid Employee lazy load chain → 500 error
    @Query("SELECT DISTINCT r FROM Role r JOIN FETCH r.organization LEFT JOIN FETCH r.rolePermissions rp LEFT JOIN FETCH rp.permission WHERE r.id = :id")
    java.util.Optional<Role> findByIdWithFullGraph(@Param("id") Long id);

    // Count users assigned to a role (safe — no Employee join)
    @Query("SELECT COUNT(ur) FROM UserRole ur WHERE ur.role.id = :roleId AND ur.active = true")
    long countActiveUsersByRoleId(@Param("roleId") Long roleId);

    // Find roles by organization with pagination (DEPRECATED — kept for non-paginated callers)
    @Query("SELECT r FROM Role r WHERE r.organization = :organization")
    org.springframework.data.domain.Page<Role> findByOrganization(
        @Param("organization") Organization organization,
        org.springframework.data.domain.Pageable pageable);
}

