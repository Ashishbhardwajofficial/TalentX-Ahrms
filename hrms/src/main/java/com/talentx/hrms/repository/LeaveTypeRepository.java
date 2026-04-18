package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.enums.LeaveTypeCategory;
import com.talentx.hrms.entity.leave.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {

    Optional<LeaveType> findByNameAndOrganization(String name, Organization organization);

    Optional<LeaveType> findByCodeAndOrganization(String code, Organization organization);

    List<LeaveType> findByOrganization(Organization organization);

    Page<LeaveType> findByOrganization(Organization organization, Pageable pageable);

    List<LeaveType> findByOrganizationAndCategory(Organization organization, LeaveTypeCategory category);

    List<LeaveType> findByOrganizationAndIsPaidTrue(Organization organization);

    List<LeaveType> findByOrganizationAndIsPaidFalse(Organization organization);

    List<LeaveType> findByOrganizationAndRequiresApprovalTrue(Organization organization);

    List<LeaveType> findByOrganizationAndRequiresApprovalFalse(Organization organization);

    List<LeaveType> findByOrganizationAndIsCarryForwardTrue(Organization organization);

    Page<LeaveType> findByOrganizationAndNameContainingIgnoreCase(
            Organization organization,
            String name,
            Pageable pageable
    );

    long countByOrganization(Organization organization);

    long countByOrganizationAndCategory(Organization organization, LeaveTypeCategory category);

    boolean existsByNameAndOrganization(String name, Organization organization);

    boolean existsByCodeAndOrganization(String code, Organization organization);

    // ✅ FIXED: Active filter using BaseEntity field
    List<LeaveType> findByOrganizationAndActiveTrue(Organization organization);

    // Usage stats query (unchanged)
    @org.springframework.data.jpa.repository.Query(
            "SELECT lt, COUNT(lr) FROM LeaveType lt LEFT JOIN lt.leaveRequests lr " +
            "WHERE lt.organization = :organization GROUP BY lt"
    )
    List<Object[]> findLeaveTypesWithUsageCount(@org.springframework.data.repository.query.Param("organization") Organization organization);
}