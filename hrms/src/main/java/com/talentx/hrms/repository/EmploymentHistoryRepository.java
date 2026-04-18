package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.employee.EmployeeEmploymentHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for EmployeeEmploymentHistory entity
 * 
 * Entity field mappings:
 * - effectiveFrom (not effectiveDate)
 * - effectiveTo (not endDate)
 * - reason (enum, not changeType string)
 * - No isCurrent field (computed from effectiveTo IS NULL)
 */
@Repository
public interface EmploymentHistoryRepository extends JpaRepository<EmployeeEmploymentHistory, Long> {

    // Find by employee
    List<EmployeeEmploymentHistory> findByEmployee(Employee employee);
    Page<EmployeeEmploymentHistory> findByEmployee(Employee employee, Pageable pageable);

    // Find by employee ordered by effective date
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee ORDER BY h.effectiveFrom DESC")
    List<EmployeeEmploymentHistory> findByEmployeeOrderByEffectiveDateDesc(@Param("employee") Employee employee);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee ORDER BY h.effectiveFrom DESC")
    Page<EmployeeEmploymentHistory> findByEmployeeOrderByEffectiveDateDesc(@Param("employee") Employee employee, Pageable pageable);

    // Find by organization
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization")
    List<EmployeeEmploymentHistory> findByOrganization(@Param("organization") Organization organization);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization")
    Page<EmployeeEmploymentHistory> findByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find current history record for employee (effectiveTo IS NULL means current)
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee AND h.effectiveTo IS NULL")
    Optional<EmployeeEmploymentHistory> findCurrentByEmployee(@Param("employee") Employee employee);

    // Find by reason (enum field, not changeType string)
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND h.reason = :reason")
    List<EmployeeEmploymentHistory> findByOrganizationAndReason(@Param("organization") Organization organization,
                                                               @Param("reason") EmployeeEmploymentHistory.HistoryReason reason);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND h.reason = :reason")
    Page<EmployeeEmploymentHistory> findByOrganizationAndReason(@Param("organization") Organization organization,
                                                               @Param("reason") EmployeeEmploymentHistory.HistoryReason reason,
                                                               Pageable pageable);

    // Find by employee and reason
    List<EmployeeEmploymentHistory> findByEmployeeAndReason(Employee employee, EmployeeEmploymentHistory.HistoryReason reason);

    // Find by department
    List<EmployeeEmploymentHistory> findByDepartment(Department department);
    Page<EmployeeEmploymentHistory> findByDepartment(Department department, Pageable pageable);

    // Find by manager
    List<EmployeeEmploymentHistory> findByManager(Employee manager);
    Page<EmployeeEmploymentHistory> findByManager(Employee manager, Pageable pageable);

    // Find by effective date range (using effectiveFrom)
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "h.effectiveFrom BETWEEN :startDate AND :endDate")
    List<EmployeeEmploymentHistory> findByOrganizationAndEffectiveDateBetween(@Param("organization") Organization organization,
                                                                             @Param("startDate") LocalDate startDate,
                                                                             @Param("endDate") LocalDate endDate);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "h.effectiveFrom BETWEEN :startDate AND :endDate")
    Page<EmployeeEmploymentHistory> findByOrganizationAndEffectiveDateBetween(@Param("organization") Organization organization,
                                                                             @Param("startDate") LocalDate startDate,
                                                                             @Param("endDate") LocalDate endDate,
                                                                             Pageable pageable);

    // Find by employee and effective date range
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee AND " +
           "h.effectiveFrom BETWEEN :startDate AND :endDate")
    List<EmployeeEmploymentHistory> findByEmployeeAndEffectiveDateBetween(@Param("employee") Employee employee,
                                                                         @Param("startDate") LocalDate startDate,
                                                                         @Param("endDate") LocalDate endDate);

    // Find active history records (effectiveTo is null or in future)
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "(h.effectiveTo IS NULL OR h.effectiveTo > CURRENT_DATE)")
    List<EmployeeEmploymentHistory> findActiveByOrganization(@Param("organization") Organization organization);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "(h.effectiveTo IS NULL OR h.effectiveTo > CURRENT_DATE)")
    Page<EmployeeEmploymentHistory> findActiveByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find by employee and active status
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee AND " +
           "(h.effectiveTo IS NULL OR h.effectiveTo > CURRENT_DATE)")
    List<EmployeeEmploymentHistory> findActiveByEmployee(@Param("employee") Employee employee);

    // Find promotions
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "h.reason = com.talentx.hrms.entity.employee.EmployeeEmploymentHistory$HistoryReason.PROMOTION")
    List<EmployeeEmploymentHistory> findPromotionsByOrganization(@Param("organization") Organization organization);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee AND " +
           "h.reason = com.talentx.hrms.entity.employee.EmployeeEmploymentHistory$HistoryReason.PROMOTION")
    List<EmployeeEmploymentHistory> findPromotionsByEmployee(@Param("employee") Employee employee);

    // Find transfers
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "h.reason = com.talentx.hrms.entity.employee.EmployeeEmploymentHistory$HistoryReason.TRANSFER")
    List<EmployeeEmploymentHistory> findTransfersByOrganization(@Param("organization") Organization organization);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee AND " +
           "h.reason = com.talentx.hrms.entity.employee.EmployeeEmploymentHistory$HistoryReason.TRANSFER")
    List<EmployeeEmploymentHistory> findTransfersByEmployee(@Param("employee") Employee employee);

    // Find salary revisions
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "h.reason = com.talentx.hrms.entity.employee.EmployeeEmploymentHistory$HistoryReason.SALARY_REVISION")
    List<EmployeeEmploymentHistory> findSalaryRevisionsByOrganization(@Param("organization") Organization organization);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee AND " +
           "h.reason = com.talentx.hrms.entity.employee.EmployeeEmploymentHistory$HistoryReason.SALARY_REVISION")
    List<EmployeeEmploymentHistory> findSalaryRevisionsByEmployee(@Param("employee") Employee employee);

    // Comprehensive search with multiple criteria
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "(:employee IS NULL OR h.employee = :employee) AND " +
           "(:reason IS NULL OR h.reason = :reason) AND " +
           "(:department IS NULL OR h.department = :department) AND " +
           "(:manager IS NULL OR h.manager = :manager) AND " +
           "(:startDate IS NULL OR h.effectiveFrom >= :startDate) AND " +
           "(:endDate IS NULL OR h.effectiveFrom <= :endDate)")
    Page<EmployeeEmploymentHistory> findBySearchCriteria(@Param("organization") Organization organization,
                                                        @Param("employee") Employee employee,
                                                        @Param("reason") EmployeeEmploymentHistory.HistoryReason reason,
                                                        @Param("department") Department department,
                                                        @Param("manager") Employee manager,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate,
                                                        Pageable pageable);

    // Count methods
    long countByEmployee(Employee employee);

    @Query("SELECT COUNT(h) FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization")
    long countByOrganization(@Param("organization") Organization organization);

    @Query("SELECT COUNT(h) FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND h.reason = :reason")
    long countByOrganizationAndReason(@Param("organization") Organization organization, 
                                      @Param("reason") EmployeeEmploymentHistory.HistoryReason reason);

    long countByDepartment(Department department);

    // Find history by month and year
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "YEAR(h.effectiveFrom) = :year AND MONTH(h.effectiveFrom) = :month")
    List<EmployeeEmploymentHistory> findByOrganizationAndMonthYear(@Param("organization") Organization organization,
                                                                  @Param("year") int year,
                                                                  @Param("month") int month);

    // Find most recent history record for employee
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee ORDER BY h.effectiveFrom DESC LIMIT 1")
    Optional<EmployeeEmploymentHistory> findMostRecentByEmployee(@Param("employee") Employee employee);

    // Find history records by job title
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND " +
           "LOWER(h.jobTitle) LIKE LOWER(CONCAT('%', :jobTitle, '%'))")
    List<EmployeeEmploymentHistory> findByOrganizationAndJobTitleContaining(@Param("organization") Organization organization,
                                                                           @Param("jobTitle") String jobTitle);

    // Find history records by job level
    List<EmployeeEmploymentHistory> findByJobLevel(String jobLevel);

    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee.organization = :organization AND h.jobLevel = :jobLevel")
    List<EmployeeEmploymentHistory> findByOrganizationAndJobLevel(@Param("organization") Organization organization,
                                                                 @Param("jobLevel") String jobLevel);

    // Check if employee has any history records
    boolean existsByEmployee(Employee employee);

    // Find history records with overlapping dates
    @Query("SELECT h FROM EmployeeEmploymentHistory h WHERE h.employee = :employee AND " +
           "h.effectiveFrom <= :endDate AND (h.effectiveTo IS NULL OR h.effectiveTo >= :startDate)")
    List<EmployeeEmploymentHistory> findOverlappingRecords(@Param("employee") Employee employee,
                                                          @Param("startDate") LocalDate startDate,
                                                          @Param("endDate") LocalDate endDate);
}
