package com.talentx.hrms.repository;

import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.performance.PerformanceReview;
import com.talentx.hrms.entity.performance.PerformanceReviewCycle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    
    // Find by review cycle
    List<PerformanceReview> findByReviewCycle(PerformanceReviewCycle reviewCycle);
    
    // Find by review cycle with pagination
    Page<PerformanceReview> findByReviewCycle(PerformanceReviewCycle reviewCycle, Pageable pageable);
    
    // Find by employee
    List<PerformanceReview> findByEmployee(Employee employee);
    
    // Find by employee with pagination
    Page<PerformanceReview> findByEmployee(Employee employee, Pageable pageable);
    
    // Find by reviewer
    List<PerformanceReview> findByReviewer(Employee reviewer);
    
    // Find by reviewer with pagination
    Page<PerformanceReview> findByReviewer(Employee reviewer, Pageable pageable);
    
    // Find by review cycle and employee
    List<PerformanceReview> findByReviewCycleAndEmployee(PerformanceReviewCycle reviewCycle, Employee employee);
    
    // Find by review cycle and reviewer
    List<PerformanceReview> findByReviewCycleAndReviewer(PerformanceReviewCycle reviewCycle, Employee reviewer);
    
    // Find by review cycle, employee and review type
    Optional<PerformanceReview> findByReviewCycleAndEmployeeAndReviewType(PerformanceReviewCycle reviewCycle, 
                                                                         Employee employee, 
                                                                         PerformanceReview.ReviewType reviewType);
    
    // Find by status
    List<PerformanceReview> findByStatus(PerformanceReview.ReviewStatus status);
    
    // Find by review type
    List<PerformanceReview> findByReviewType(PerformanceReview.ReviewType reviewType);
    
    // Find by review cycle and status
    List<PerformanceReview> findByReviewCycleAndStatus(PerformanceReviewCycle reviewCycle, 
                                                      PerformanceReview.ReviewStatus status);
    
    // Find by review cycle and review type
    List<PerformanceReview> findByReviewCycleAndReviewType(PerformanceReviewCycle reviewCycle, 
                                                          PerformanceReview.ReviewType reviewType);
    
    // Find submitted reviews
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.status = 'SUBMITTED' AND pr.submittedAt IS NOT NULL")
    List<PerformanceReview> findSubmittedReviews();
    
    // Find pending reviews for employee
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.employee = :employee AND " +
           "pr.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<PerformanceReview> findPendingByEmployee(@Param("employee") Employee employee);
    
    // Find pending reviews for reviewer
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewer = :reviewer AND " +
           "pr.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<PerformanceReview> findPendingByReviewer(@Param("reviewer") Employee reviewer);
    
    // Find reviews by organization (through review cycle)
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewCycle.organization = :organization")
    List<PerformanceReview> findByOrganization(@Param("organization") com.talentx.hrms.entity.core.Organization organization);
    
    // Find reviews by organization with pagination
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewCycle.organization = :organization")
    Page<PerformanceReview> findByOrganization(@Param("organization") com.talentx.hrms.entity.core.Organization organization, 
                                              Pageable pageable);
    
    // Find reviews submitted between dates
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.submittedAt BETWEEN :startDate AND :endDate")
    List<PerformanceReview> findBySubmittedAtBetween(@Param("startDate") Instant startDate, 
                                                    @Param("endDate") Instant endDate);
    
    // Find reviews with overall rating
    List<PerformanceReview> findByOverallRatingIsNotNull();
    
    // Find reviews with rating in range
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.overallRating BETWEEN :minRating AND :maxRating")
    List<PerformanceReview> findByOverallRatingBetween(@Param("minRating") Integer minRating, 
                                                      @Param("maxRating") Integer maxRating);
    
    // Find reviews with comprehensive search
    // Find performance reviews with comprehensive search — uses safe query without JOIN FETCH + pagination
    @Query("SELECT pr FROM PerformanceReview pr WHERE " +
           "(:reviewCycle IS NULL OR pr.reviewCycle = :reviewCycle) AND " +
           "(:employee IS NULL OR pr.employee = :employee) AND " +
           "(:reviewer IS NULL OR pr.reviewer = :reviewer) AND " +
           "(:reviewType IS NULL OR pr.reviewType = :reviewType) AND " +
           "(:status IS NULL OR pr.status = :status) AND " +
           "(:minRating IS NULL OR pr.overallRating >= :minRating) AND " +
           "(:maxRating IS NULL OR pr.overallRating <= :maxRating)")
    Page<PerformanceReview> findBySearchCriteria(@Param("reviewCycle") PerformanceReviewCycle reviewCycle,
                                                @Param("employee") Employee employee,
                                                @Param("reviewer") Employee reviewer,
                                                @Param("reviewType") PerformanceReview.ReviewType reviewType,
                                                @Param("status") PerformanceReview.ReviewStatus status,
                                                @Param("minRating") Integer minRating,
                                                @Param("maxRating") Integer maxRating,
                                                Pageable pageable);
    
    // Count reviews by status
    long countByStatus(PerformanceReview.ReviewStatus status);
    
    // Count reviews by review cycle and status
    long countByReviewCycleAndStatus(PerformanceReviewCycle reviewCycle, PerformanceReview.ReviewStatus status);
    
    // Count reviews by employee
    long countByEmployee(Employee employee);
    
    // Count reviews by reviewer
    long countByReviewer(Employee reviewer);
    
    // Check if review exists for cycle, employee and type
    boolean existsByReviewCycleAndEmployeeAndReviewType(PerformanceReviewCycle reviewCycle, 
                                                       Employee employee, 
                                                       PerformanceReview.ReviewType reviewType);
    
    // Find average rating by employee
    @Query("SELECT AVG(pr.overallRating) FROM PerformanceReview pr WHERE pr.employee = :employee AND pr.overallRating IS NOT NULL")
    Double findAverageRatingByEmployee(@Param("employee") Employee employee);
    
    // Find average rating by review cycle
    @Query("SELECT AVG(pr.overallRating) FROM PerformanceReview pr WHERE pr.reviewCycle = :reviewCycle AND pr.overallRating IS NOT NULL")
    Double findAverageRatingByReviewCycle(@Param("reviewCycle") PerformanceReviewCycle reviewCycle);
}

