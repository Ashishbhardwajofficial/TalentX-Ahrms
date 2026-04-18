package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.ExitStatus;
import com.talentx.hrms.entity.exit.EmployeeExit;
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
 * Repository interface for EmployeeExit entity
 */
@Repository
public interface EmployeeExitRepository extends JpaRepository<EmployeeExit, Long> {

    // Find by employee
    Optional<EmployeeExit> findByEmployee(Employee employee);
    List<EmployeeExit> findAllByEmployee(Employee employee);

    // Find by organization
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization")
    List<EmployeeExit> findByOrganization(@Param("organization") Organization organization);

    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization")
    Page<EmployeeExit> findByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find by status
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND e.status = :status")
    List<EmployeeExit> findByOrganizationAndStatus(@Param("organization") Organization organization, 
                                                  @Param("status") ExitStatus status);

    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND e.status = :status")
    Page<EmployeeExit> findByOrganizationAndStatus(@Param("organization") Organization organization, 
                                                  @Param("status") ExitStatus status, 
                                                  Pageable pageable);

    // Find by employee and status
    List<EmployeeExit> findByEmployeeAndStatus(Employee employee, ExitStatus status);

    // Find active exits (initiated or approved)
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "e.status IN ('INITIATED', 'APPROVED')")
    List<EmployeeExit> findActiveByOrganization(@Param("organization") Organization organization);

    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "e.status IN ('INITIATED', 'APPROVED')")
    Page<EmployeeExit> findActiveByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find pending exits (initiated status)
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND e.status = 'INITIATED'")
    List<EmployeeExit> findPendingByOrganization(@Param("organization") Organization organization);

    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND e.status = 'INITIATED'")
    Page<EmployeeExit> findPendingByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find by resignation date range
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "e.resignationDate BETWEEN :startDate AND :endDate")
    List<EmployeeExit> findByOrganizationAndResignationDateBetween(@Param("organization") Organization organization,
                                                                  @Param("startDate") LocalDate startDate,
                                                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "e.resignationDate BETWEEN :startDate AND :endDate")
    Page<EmployeeExit> findByOrganizationAndResignationDateBetween(@Param("organization") Organization organization,
                                                                  @Param("startDate") LocalDate startDate,
                                                                  @Param("endDate") LocalDate endDate,
                                                                  Pageable pageable);

    // Find by last working day range
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "e.lastWorkingDay BETWEEN :startDate AND :endDate")
    List<EmployeeExit> findByOrganizationAndLastWorkingDayBetween(@Param("organization") Organization organization,
                                                                 @Param("startDate") LocalDate startDate,
                                                                 @Param("endDate") LocalDate endDate);

    // Find by approver
    List<EmployeeExit> findByApprovedBy(Employee approver);
    Page<EmployeeExit> findByApprovedBy(Employee approver, Pageable pageable);

    // Find exits requiring approval (for managers)
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND e.status = 'INITIATED' AND " +
           "(e.employee.manager = :manager OR e.employee.department.manager = :manager)")
    List<EmployeeExit> findPendingForApproval(@Param("organization") Organization organization, 
                                             @Param("manager") Employee manager);

    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND e.status = 'INITIATED' AND " +
           "(e.employee.manager = :manager OR e.employee.department.manager = :manager)")
    Page<EmployeeExit> findPendingForApproval(@Param("organization") Organization organization, 
                                             @Param("manager") Employee manager, 
                                             Pageable pageable);

    // Find exits with upcoming last working day
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "e.status = 'APPROVED' AND e.lastWorkingDay BETWEEN CURRENT_DATE AND :endDate")
    List<EmployeeExit> findWithUpcomingLastWorkingDay(@Param("organization") Organization organization,
                                                     @Param("endDate") LocalDate endDate);

    // Comprehensive search with multiple criteria
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "(:employee IS NULL OR e.employee = :employee) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:startDate IS NULL OR e.resignationDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.resignationDate <= :endDate) AND " +
           "(:approver IS NULL OR e.approvedBy = :approver)")
    Page<EmployeeExit> findBySearchCriteria(@Param("organization") Organization organization,
                                           @Param("employee") Employee employee,
                                           @Param("status") ExitStatus status,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate,
                                           @Param("approver") Employee approver,
                                           Pageable pageable);

    // Count methods
    long countByEmployee(Employee employee);
    
    @Query("SELECT COUNT(e) FROM EmployeeExit e WHERE e.employee.organization = :organization")
    long countByOrganization(@Param("organization") Organization organization);

    @Query("SELECT COUNT(e) FROM EmployeeExit e WHERE e.employee.organization = :organization AND e.status = :status")
    long countByOrganizationAndStatus(@Param("organization") Organization organization, @Param("status") ExitStatus status);

    // Check if employee has active exit
    @Query("SELECT COUNT(e) > 0 FROM EmployeeExit e WHERE e.employee = :employee AND e.status IN ('INITIATED', 'APPROVED')")
    boolean hasEmployeeActiveExit(@Param("employee") Employee employee);

    // Find exits by month and year
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "YEAR(e.resignationDate) = :year AND MONTH(e.resignationDate) = :month")
    List<EmployeeExit> findByOrganizationAndMonthYear(@Param("organization") Organization organization,
                                                     @Param("year") int year,
                                                     @Param("month") int month);

    // Find overdue exits (approved but not completed after last working day)
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee.organization = :organization AND " +
           "e.status = 'APPROVED' AND e.lastWorkingDay < CURRENT_DATE")
    List<EmployeeExit> findOverdueExits(@Param("organization") Organization organization);

    // Check if employee has any exit record
    boolean existsByEmployee(Employee employee);

    // Find most recent exit for employee
    @Query("SELECT e FROM EmployeeExit e WHERE e.employee = :employee ORDER BY e.createdAt DESC")
    Optional<EmployeeExit> findMostRecentByEmployee(@Param("employee") Employee employee);
}

