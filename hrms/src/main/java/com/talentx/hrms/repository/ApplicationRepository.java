package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.recruitment.Application;
import com.talentx.hrms.entity.recruitment.Candidate;
import com.talentx.hrms.entity.recruitment.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Find applications by candidate
    List<Application> findByCandidate(Candidate candidate);
    
    // Find applications by candidate with pagination
    Page<Application> findByCandidate(Candidate candidate, Pageable pageable);
    
    // Find applications by job posting
    List<Application> findByJobPosting(JobPosting jobPosting);
    
    // Find applications by job posting with pagination
    Page<Application> findByJobPosting(JobPosting jobPosting, Pageable pageable);
    
    // Find application by candidate and job posting
    Optional<Application> findByCandidateAndJobPosting(Candidate candidate, JobPosting jobPosting);
    
    // Find applications by organization
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization")
    Page<Application> findByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Find applications by status (using actual entity field)
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND a.status = :status")
    Page<Application> findByOrganizationAndStatus(@Param("organization") Organization organization,
                                                 @Param("status") Application.ApplicationStatus status,
                                                 Pageable pageable);
    
    // Find applications by candidate and status
    List<Application> findByCandidateAndStatus(Candidate candidate, Application.ApplicationStatus status);
    
    // Find applications by job posting and status
    List<Application> findByJobPostingAndStatus(JobPosting jobPosting, Application.ApplicationStatus status);
    
    // Find applications applied between dates (using actual entity field: appliedDate)
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND " +
           "a.appliedDate BETWEEN :startDate AND :endDate")
    List<Application> findByOrganizationAndAppliedDateBetween(@Param("organization") Organization organization,
                                                             @Param("startDate") LocalDate startDate,
                                                             @Param("endDate") LocalDate endDate);
    
    // Find hired applications
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND a.status = 'HIRED'")
    List<Application> findHiredByOrganization(@Param("organization") Organization organization);
    
    // Find rejected applications
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND a.status = 'REJECTED'")
    List<Application> findRejectedByOrganization(@Param("organization") Organization organization);
    
    // Find withdrawn applications
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND a.status = 'WITHDRAWN'")
    List<Application> findWithdrawnByOrganization(@Param("organization") Organization organization);
    
    // Find active applications
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND " +
           "a.status NOT IN ('HIRED', 'REJECTED', 'WITHDRAWN')")
    List<Application> findActiveByOrganization(@Param("organization") Organization organization);
    
    // Find applications by department
    @Query("SELECT a FROM Application a WHERE a.jobPosting.department.id = :departmentId")
    List<Application> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    // Count applications by organization
    @Query("SELECT COUNT(a) FROM Application a WHERE a.jobPosting.organization = :organization")
    long countByOrganization(@Param("organization") Organization organization);
    
    // Count applications by organization and status
    @Query("SELECT COUNT(a) FROM Application a WHERE a.jobPosting.organization = :organization AND a.status = :status")
    long countByOrganizationAndStatus(@Param("organization") Organization organization, 
                                     @Param("status") Application.ApplicationStatus status);
    
    // Count applications by job posting and status
    long countByJobPostingAndStatus(JobPosting jobPosting, Application.ApplicationStatus status);
    
    // Count applications by candidate
    long countByCandidate(Candidate candidate);
    
    // Check if application exists for candidate and job posting
    boolean existsByCandidateAndJobPosting(Candidate candidate, JobPosting jobPosting);
    
    // Find applications with comprehensive search (using actual entity fields)
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND " +
           "(:candidateName IS NULL OR LOWER(a.candidate.firstName) LIKE LOWER(CONCAT('%', :candidateName, '%')) OR " +
           "LOWER(a.candidate.lastName) LIKE LOWER(CONCAT('%', :candidateName, '%'))) AND " +
           "(:jobTitle IS NULL OR LOWER(a.jobPosting.title) LIKE LOWER(CONCAT('%', :jobTitle, '%'))) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:startDate IS NULL OR a.appliedDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.appliedDate <= :endDate)")
    Page<Application> findBySearchCriteria(@Param("organization") Organization organization,
                                          @Param("candidateName") String candidateName,
                                          @Param("jobTitle") String jobTitle,
                                          @Param("status") Application.ApplicationStatus status,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate,
                                          Pageable pageable);
    
    // Get application statistics by organization
    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.jobPosting.organization = :organization GROUP BY a.status")
    List<Object[]> getApplicationStatsByOrganization(@Param("organization") Organization organization);
    
    // Find applications by year and month (using actual entity field: appliedDate)
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND " +
           "YEAR(a.appliedDate) = :year AND MONTH(a.appliedDate) = :month")
    List<Application> findByOrganizationAndYearAndMonth(@Param("organization") Organization organization,
                                                       @Param("year") int year,
                                                       @Param("month") int month);
    
    // Find applications with interviews
    @Query("SELECT DISTINCT a FROM Application a LEFT JOIN FETCH a.interviews WHERE a.id = :id")
    Optional<Application> findByIdWithInterviews(@Param("id") Long id);
    
    // Find applications with offers (using actual entity field: offerDate)
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND a.offerDate IS NOT NULL")
    List<Application> findWithOffersExtendedByOrganization(@Param("organization") Organization organization);
    
    // Find applications with offers accepted (using actual entity field: offerAccepted)
    @Query("SELECT a FROM Application a WHERE a.jobPosting.organization = :organization AND a.offerAccepted = true")
    List<Application> findWithOffersAcceptedByOrganization(@Param("organization") Organization organization);
}

