package com.talentx.hrms.repository;

import com.talentx.hrms.entity.benefits.BenefitPlan;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.enums.BenefitPlanType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BenefitPlanRepository extends JpaRepository<BenefitPlan, Long> {
    
    // Find by name and organization
    Optional<BenefitPlan> findByNameAndOrganization(String name, Organization organization);
    
    // Find all benefit plans by organization
    List<BenefitPlan> findByOrganization(Organization organization);
    
    // Find all benefit plans by organization with pagination — organization eagerly loaded
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"organization"})
    Page<BenefitPlan> findByOrganization(Organization organization, Pageable pageable);
    
    // Find active benefit plans by organization
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.organization = :organization AND bp.isActive = true")
    List<BenefitPlan> findActiveByOrganization(@Param("organization") Organization organization);
    
    // Find benefit plans by type
    List<BenefitPlan> findByOrganizationAndPlanType(Organization organization, BenefitPlanType planType);
    
    // Find benefit plans by provider
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.organization = :organization AND " +
           "LOWER(bp.provider) LIKE LOWER(CONCAT('%', :provider, '%'))")
    List<BenefitPlan> findByOrganizationAndProviderContainingIgnoreCase(@Param("organization") Organization organization, 
                                                                        @Param("provider") String provider);
    
    // Find benefit plans effective on a specific date
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.organization = :organization AND " +
           "bp.effectiveDate <= :date AND (bp.expiryDate IS NULL OR bp.expiryDate >= :date)")
    List<BenefitPlan> findByOrganizationAndEffectiveOnDate(@Param("organization") Organization organization, 
                                                          @Param("date") LocalDate date);
    
    // Find benefit plans expiring soon
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.organization = :organization AND " +
           "bp.expiryDate IS NOT NULL AND bp.expiryDate BETWEEN CURRENT_DATE AND :endDate")
    List<BenefitPlan> findByOrganizationWithUpcomingExpiry(@Param("organization") Organization organization, 
                                                          @Param("endDate") LocalDate endDate);
    
    // Search benefit plans by name
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.organization = :organization AND " +
           "LOWER(bp.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<BenefitPlan> findByOrganizationAndNameContainingIgnoreCase(@Param("organization") Organization organization, 
                                                                   @Param("name") String name, 
                                                                   Pageable pageable);
    
    // Find benefit plans with comprehensive search
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.organization = :organization AND " +
           "(:name IS NULL OR LOWER(bp.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:planType IS NULL OR bp.planType = :planType) AND " +
           "(:provider IS NULL OR LOWER(bp.provider) LIKE LOWER(CONCAT('%', :provider, '%'))) AND " +
           "(:isActive IS NULL OR bp.isActive = :isActive)")
    Page<BenefitPlan> findBySearchCriteria(@Param("organization") Organization organization,
                                          @Param("name") String name,
                                          @Param("planType") BenefitPlanType planType,
                                          @Param("provider") String provider,
                                          @Param("isActive") Boolean isActive,
                                          Pageable pageable);
    
    // Count benefit plans by organization
    long countByOrganization(Organization organization);
    
    // Count active benefit plans by organization
    long countByOrganizationAndIsActive(Organization organization, boolean isActive);
    
    // Count benefit plans by type
    long countByOrganizationAndPlanType(Organization organization, BenefitPlanType planType);
    
    // Check if benefit plan name exists in organization
    boolean existsByNameAndOrganization(String name, Organization organization);
    
    // Find benefit plans with employee enrollments
    @Query("SELECT DISTINCT bp FROM BenefitPlan bp " +
           "JOIN bp.employeeBenefits eb " +
           "WHERE bp.organization = :organization AND eb.status = 'ACTIVE'")
    List<BenefitPlan> findByOrganizationWithActiveEnrollments(@Param("organization") Organization organization);
    
    // Find benefit plans without any enrollments
    @Query("SELECT bp FROM BenefitPlan bp WHERE bp.organization = :organization AND " +
           "NOT EXISTS (SELECT eb FROM EmployeeBenefit eb WHERE eb.benefitPlan = bp)")
    List<BenefitPlan> findByOrganizationWithoutEnrollments(@Param("organization") Organization organization);
}

