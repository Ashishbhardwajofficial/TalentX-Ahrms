package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.performance.PerformanceReviewCycle;
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
public interface PerformanceReviewCycleRepository extends JpaRepository<PerformanceReviewCycle, Long> {
    
    // Find by organization
    List<PerformanceReviewCycle> findByOrganization(Organization organization);
    
    // Find by organization with pagination
    Page<PerformanceReviewCycle> findByOrganization(Organization organization, Pageable pageable);
    
    // Find by organization and status
    List<PerformanceReviewCycle> findByOrganizationAndStatus(Organization organization, 
                                                            PerformanceReviewCycle.ReviewCycleStatus status);
    
    // Find by organization and review type
    List<PerformanceReviewCycle> findByOrganizationAndReviewType(Organization organization, 
                                                                PerformanceReviewCycle.ReviewType reviewType);
    
    // Find active cycles by organization
    @Query("SELECT prc FROM PerformanceReviewCycle prc WHERE prc.organization = :organization AND prc.status = 'ACTIVE'")
    List<PerformanceReviewCycle> findActiveByOrganization(@Param("organization") Organization organization);
    
    // Find cycles by date range
    @Query("SELECT prc FROM PerformanceReviewCycle prc WHERE prc.organization = :organization AND " +
           "prc.startDate <= :endDate AND prc.endDate >= :startDate")
    List<PerformanceReviewCycle> findByOrganizationAndDateRange(@Param("organization") Organization organization,
                                                               @Param("startDate") LocalDate startDate,
                                                               @Param("endDate") LocalDate endDate);
    
    // Find cycles with upcoming deadlines
    @Query("SELECT prc FROM PerformanceReviewCycle prc WHERE prc.organization = :organization AND " +
           "prc.status = 'ACTIVE' AND " +
           "(prc.selfReviewDeadline BETWEEN CURRENT_DATE AND :deadlineDate OR " +
           "prc.managerReviewDeadline BETWEEN CURRENT_DATE AND :deadlineDate)")
    List<PerformanceReviewCycle> findByOrganizationWithUpcomingDeadlines(@Param("organization") Organization organization,
                                                                        @Param("deadlineDate") LocalDate deadlineDate);
    
    // Find cycles by name containing (case insensitive)
    @Query("SELECT prc FROM PerformanceReviewCycle prc WHERE prc.organization = :organization AND " +
           "LOWER(prc.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<PerformanceReviewCycle> findByOrganizationAndNameContainingIgnoreCase(@Param("organization") Organization organization,
                                                                              @Param("name") String name,
                                                                              Pageable pageable);
    
    // Find cycles with comprehensive search
    @Query("SELECT prc FROM PerformanceReviewCycle prc WHERE prc.organization = :organization AND " +
           "(:name IS NULL OR LOWER(prc.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:reviewType IS NULL OR prc.reviewType = :reviewType) AND " +
           "(:status IS NULL OR prc.status = :status) AND " +
           "(:startDate IS NULL OR prc.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR prc.endDate <= :endDate)")
    Page<PerformanceReviewCycle> findBySearchCriteria(@Param("organization") Organization organization,
                                                     @Param("name") String name,
                                                     @Param("reviewType") PerformanceReviewCycle.ReviewType reviewType,
                                                     @Param("status") PerformanceReviewCycle.ReviewCycleStatus status,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate,
                                                     Pageable pageable);
    
    // Find cycles that are currently active (within date range)
    @Query("SELECT prc FROM PerformanceReviewCycle prc WHERE prc.organization = :organization AND " +
           "prc.status = 'ACTIVE' AND prc.startDate <= CURRENT_DATE AND prc.endDate >= CURRENT_DATE")
    List<PerformanceReviewCycle> findCurrentlyActiveByOrganization(@Param("organization") Organization organization);
    
    // Find cycles by year
    @Query("SELECT prc FROM PerformanceReviewCycle prc WHERE prc.organization = :organization AND " +
           "YEAR(prc.startDate) = :year")
    List<PerformanceReviewCycle> findByOrganizationAndYear(@Param("organization") Organization organization,
                                                          @Param("year") int year);
    
    // Count cycles by organization and status
    long countByOrganizationAndStatus(Organization organization, PerformanceReviewCycle.ReviewCycleStatus status);
    
    // Count cycles by organization and review type
    long countByOrganizationAndReviewType(Organization organization, PerformanceReviewCycle.ReviewType reviewType);
    
    // Check if cycle name exists in organization
    boolean existsByOrganizationAndNameIgnoreCase(Organization organization, String name);
    
    // Find cycle with reviews
    @Query("SELECT DISTINCT prc FROM PerformanceReviewCycle prc " +
           "LEFT JOIN FETCH prc.reviews " +
           "WHERE prc.id = :id")
    Optional<PerformanceReviewCycle> findByIdWithReviews(@Param("id") Long id);
}

