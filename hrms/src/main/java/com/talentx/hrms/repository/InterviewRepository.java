package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.recruitment.Application;
import com.talentx.hrms.entity.recruitment.Interview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    
    // Find interviews by application
    List<Interview> findByApplication(Application application);
    
    // Find interviews by application with pagination
    Page<Interview> findByApplication(Application application, Pageable pageable);
    
    // Find interviews by organization
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization")
    Page<Interview> findByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Find interviews by status (using actual entity field)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.status = :status")
    List<Interview> findByOrganizationAndStatus(@Param("organization") Organization organization, 
                                               @Param("status") Interview.InterviewStatus status);
    
    // Find interviews by interview type (using actual entity field)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.interviewType = :interviewType")
    List<Interview> findByOrganizationAndInterviewType(@Param("organization") Organization organization, 
                                                      @Param("interviewType") Interview.InterviewType interviewType);
    
    // Find scheduled interviews
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.status = 'SCHEDULED'")
    List<Interview> findScheduledByOrganization(@Param("organization") Organization organization);
    
    // Find completed interviews
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.status = 'COMPLETED'")
    List<Interview> findCompletedByOrganization(@Param("organization") Organization organization);
    
    // Find cancelled interviews
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.status = 'CANCELLED'")
    List<Interview> findCancelledByOrganization(@Param("organization") Organization organization);
    
    // Find interviews scheduled between dates (using actual entity field: scheduledDate)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND " +
           "i.scheduledDate BETWEEN :startDate AND :endDate")
    List<Interview> findByOrganizationAndScheduledDateBetween(@Param("organization") Organization organization,
                                                             @Param("startDate") LocalDateTime startDate,
                                                             @Param("endDate") LocalDateTime endDate);
    
    // Find upcoming interviews (next 7 days)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND " +
           "i.scheduledDate BETWEEN CURRENT_TIMESTAMP AND :endDate AND i.status = 'SCHEDULED'")
    List<Interview> findUpcomingByOrganization(@Param("organization") Organization organization,
                                              @Param("endDate") LocalDateTime endDate);
    
    // Find overdue interviews (scheduled in the past but not completed)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND " +
           "i.scheduledDate < CURRENT_TIMESTAMP AND i.status = 'SCHEDULED'")
    List<Interview> findOverdueByOrganization(@Param("organization") Organization organization);
    
    // Count interviews by organization and status
    @Query("SELECT COUNT(i) FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.status = :status")
    long countByOrganizationAndStatus(@Param("organization") Organization organization, 
                                     @Param("status") Interview.InterviewStatus status);
    
    // Get interview statistics by organization
    @Query("SELECT i.status, COUNT(i) FROM Interview i WHERE i.application.jobPosting.organization = :organization GROUP BY i.status")
    List<Object[]> getInterviewStatsByOrganization(@Param("organization") Organization organization);
    
    // Find interviews with ratings (using actual entity field: rating)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.rating IS NOT NULL")
    List<Interview> findWithRatingsByOrganization(@Param("organization") Organization organization);
    
    // Find interviews by recommendation (using actual entity field)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND i.recommendation = :recommendation")
    List<Interview> findByOrganizationAndRecommendation(@Param("organization") Organization organization,
                                                       @Param("recommendation") Interview.InterviewRecommendation recommendation);
    
    // Find interviews by comprehensive search criteria (using actual entity fields)
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:interviewType IS NULL OR i.interviewType = :interviewType) AND " +
           "(:startDate IS NULL OR i.scheduledDate >= :startDate) AND " +
           "(:endDate IS NULL OR i.scheduledDate <= :endDate)")
    Page<Interview> findBySearchCriteria(@Param("organization") Organization organization,
                                        @Param("status") Interview.InterviewStatus status,
                                        @Param("interviewType") Interview.InterviewType interviewType,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate,
                                        Pageable pageable);
    
    // Find today's interviews by organization
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND " +
           "FUNCTION('DATE', i.scheduledDate) = CURRENT_DATE AND i.status = 'SCHEDULED'")
    List<Interview> findTodaysInterviewsByOrganization(@Param("organization") Organization organization);
    
    // Find upcoming interviews with LocalDateTime parameter
    @Query("SELECT i FROM Interview i WHERE i.application.jobPosting.organization = :organization AND " +
           "i.scheduledDate BETWEEN CURRENT_TIMESTAMP AND :endDate AND i.status = 'SCHEDULED'")
    List<Interview> findUpcomingByOrganizationWithLocalDateTime(@Param("organization") Organization organization,
                                                                @Param("endDate") LocalDateTime endDate);
}

