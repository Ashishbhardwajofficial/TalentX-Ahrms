package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.entity.recruitment.JobPosting;
import com.talentx.hrms.entity.recruitment.JobPosting.JobPostingStatus;
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
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    
    // Find job postings by organization
    List<JobPosting> findByOrganization(Organization organization);
    
    // Find job postings by organization with pagination
    Page<JobPosting> findByOrganization(Organization organization, Pageable pageable);
    
    // Find job postings by status
    List<JobPosting> findByOrganizationAndStatus(Organization organization, JobPostingStatus status);
    
    // Find job postings by status with pagination
    Page<JobPosting> findByOrganizationAndStatus(Organization organization, JobPostingStatus status, Pageable pageable);
    
    // Find job postings by department
    List<JobPosting> findByDepartment(Department department);
    
    // Find job postings by department with pagination
    Page<JobPosting> findByDepartment(Department department, Pageable pageable);
    
    // Find job postings by location
    List<JobPosting> findByLocation(Location location);
    
    // Find job postings by employment type
    List<JobPosting> findByOrganizationAndEmploymentType(Organization organization, EmploymentType employmentType);
    
    // Find job postings by hiring manager
    List<JobPosting> findByHiringManager(Employee hiringManager);
    
    // Find job postings by recruiter
    List<JobPosting> findByRecruiter(Employee recruiter);
    
    // Search job postings by title
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "LOWER(jp.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<JobPosting> findByOrganizationAndTitleContainingIgnoreCase(@Param("organization") Organization organization,
                                                                    @Param("title") String title,
                                                                    Pageable pageable);
    
    // Find job postings posted between dates
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "jp.postedDate BETWEEN :startDate AND :endDate")
    List<JobPosting> findByOrganizationAndPostedDateBetween(@Param("organization") Organization organization,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);
    
    // Find job postings with closing date between dates
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "jp.closingDate BETWEEN :startDate AND :endDate")
    List<JobPosting> findByOrganizationAndClosingDateBetween(@Param("organization") Organization organization,
                                                            @Param("startDate") LocalDate startDate,
                                                            @Param("endDate") LocalDate endDate);
    
    // Find expired job postings
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "jp.closingDate < CURRENT_DATE AND jp.status = 'OPEN'")
    List<JobPosting> findExpiredByOrganization(@Param("organization") Organization organization);
    
    // Find job postings with open positions
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "jp.openings > 0 AND jp.status = 'OPEN'")
    List<JobPosting> findWithOpenPositionsByOrganization(@Param("organization") Organization organization);
    
    // Find job postings by salary range
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "jp.salaryMin <= :maxSalary AND jp.salaryMax >= :minSalary")
    List<JobPosting> findByOrganizationAndSalaryRange(@Param("organization") Organization organization,
                                                     @Param("minSalary") BigDecimal minSalary,
                                                     @Param("maxSalary") BigDecimal maxSalary);
    
    // Find job postings with applications
    @Query("SELECT DISTINCT jp FROM JobPosting jp LEFT JOIN FETCH jp.applications WHERE jp.id = :id")
    Optional<JobPosting> findByIdWithApplications(@Param("id") Long id);
    
    // Count job postings by organization and status
    long countByOrganizationAndStatus(Organization organization, JobPostingStatus status);
    
    // Count applications by job posting
    @Query("SELECT COUNT(a) FROM Application a WHERE a.jobPosting = :jobPosting")
    long countApplicationsByJobPosting(@Param("jobPosting") JobPosting jobPosting);
    
    // Find job postings with application count
    @Query("SELECT jp, COUNT(a) FROM JobPosting jp LEFT JOIN jp.applications a " +
           "WHERE jp.organization = :organization GROUP BY jp")
    List<Object[]> findJobPostingsWithApplicationCount(@Param("organization") Organization organization);
    
    // Find job postings with comprehensive search — hiringManager eagerly loaded to avoid lazy proxy 500
    @Query("SELECT jp FROM JobPosting jp LEFT JOIN FETCH jp.hiringManager LEFT JOIN FETCH jp.department LEFT JOIN FETCH jp.location WHERE jp.organization = :organization AND " +
           "(:title IS NULL OR LOWER(jp.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:status IS NULL OR jp.status = :status) AND " +
           "(:department IS NULL OR jp.department = :department) AND " +
           "(:location IS NULL OR jp.location = :location) AND " +
           "(:employmentType IS NULL OR jp.employmentType = :employmentType)")
    Page<JobPosting> findBySearchCriteria(@Param("organization") Organization organization,
                                         @Param("title") String title,
                                         @Param("status") JobPostingStatus status,
                                         @Param("department") Department department,
                                         @Param("location") Location location,
                                         @Param("employmentType") EmploymentType employmentType,
                                         Pageable pageable);
    
    // Find recently posted job postings
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "jp.postedDate >= :sinceDate ORDER BY jp.postedDate DESC")
    List<JobPosting> findRecentlyPostedByOrganization(@Param("organization") Organization organization,
                                                     @Param("sinceDate") LocalDate sinceDate);
    
    // Find job postings closing soon
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "jp.closingDate BETWEEN CURRENT_DATE AND :beforeDate AND jp.status = 'OPEN'")
    List<JobPosting> findClosingSoonByOrganization(@Param("organization") Organization organization,
                                                  @Param("beforeDate") LocalDate beforeDate);
    
    // Get job posting statistics by organization
    @Query("SELECT jp.status, COUNT(jp), SUM(jp.openings) " +
           "FROM JobPosting jp WHERE jp.organization = :organization GROUP BY jp.status")
    List<Object[]> getJobPostingStatsByOrganization(@Param("organization") Organization organization);
    
    // Find job postings by year and month
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "YEAR(jp.postedDate) = :year AND MONTH(jp.postedDate) = :month")
    List<JobPosting> findByOrganizationAndYearAndMonth(@Param("organization") Organization organization,
                                                      @Param("year") int year,
                                                      @Param("month") int month);
    
    // Find job postings by requirements (text search)
    @Query("SELECT jp FROM JobPosting jp WHERE jp.organization = :organization AND " +
           "LOWER(jp.requirements) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<JobPosting> findByOrganizationAndRequirementsContaining(@Param("organization") Organization organization,
                                                                @Param("keyword") String keyword);
}
