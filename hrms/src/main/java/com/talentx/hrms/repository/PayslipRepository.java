package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.payroll.PayrollRun;
import com.talentx.hrms.entity.payroll.Payslip;
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
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    
    // Find payslip by payroll run and employee
    Optional<Payslip> findByPayrollRunAndEmployee(PayrollRun payrollRun, Employee employee);
    
    // Find payslips by employee
    List<Payslip> findByEmployee(Employee employee);
    
    // Find payslips by employee with pagination
    Page<Payslip> findByEmployee(Employee employee, Pageable pageable);
    
    // Find payslips by payroll run
    List<Payslip> findByPayrollRun(PayrollRun payrollRun);
    
    // Find payslips by payroll run with pagination
    Page<Payslip> findByPayrollRun(PayrollRun payrollRun, Pageable pageable);
    
    // Find payslips by organization
    @Query("SELECT p FROM Payslip p WHERE p.employee.organization = :organization")
    Page<Payslip> findByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Find payslips by employee and date range
    @Query("SELECT p FROM Payslip p WHERE p.employee = :employee AND " +
           "p.payrollRun.payDate BETWEEN :startDate AND :endDate")
    List<Payslip> findByEmployeeAndPayDateBetween(@Param("employee") Employee employee,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);
    
    // Find payslips by organization and date range
    @Query("SELECT p FROM Payslip p WHERE p.employee.organization = :organization AND " +
           "p.payrollRun.payDate BETWEEN :startDate AND :endDate")
    List<Payslip> findByOrganizationAndPayDateBetween(@Param("organization") Organization organization,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
    
    // Find payslips with PDF URL generated
    @Query("SELECT p FROM Payslip p WHERE p.employee.organization = :organization AND p.pdfUrl IS NOT NULL")
    List<Payslip> findWithPdfByOrganization(@Param("organization") Organization organization);
    
    // Find payslips without PDF URL
    @Query("SELECT p FROM Payslip p WHERE p.employee.organization = :organization AND p.pdfUrl IS NULL")
    List<Payslip> findWithoutPdfByOrganization(@Param("organization") Organization organization);
    
    // Find payslips by department
    @Query("SELECT p FROM Payslip p WHERE p.employee.department.id = :departmentId")
    List<Payslip> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    // Find payslips by department and date range
    @Query("SELECT p FROM Payslip p WHERE p.employee.department.id = :departmentId AND " +
           "p.payrollRun.payDate BETWEEN :startDate AND :endDate")
    List<Payslip> findByDepartmentIdAndPayDateBetween(@Param("departmentId") Long departmentId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
    
    // Count payslips by organization
    @Query("SELECT COUNT(p) FROM Payslip p WHERE p.employee.organization = :organization")
    long countByOrganization(@Param("organization") Organization organization);
    
    // Find payslips by employee and year
    @Query("SELECT p FROM Payslip p WHERE p.employee = :employee AND " +
           "YEAR(p.payrollRun.payDate) = :year ORDER BY p.payrollRun.payDate")
    List<Payslip> findByEmployeeAndYear(@Param("employee") Employee employee, @Param("year") int year);
    
    // Find latest payslip by employee
    @Query("SELECT p FROM Payslip p WHERE p.employee = :employee ORDER BY p.payrollRun.payDate DESC")
    List<Payslip> findLatestByEmployee(@Param("employee") Employee employee, Pageable pageable);
    
    // Check if payslip exists for payroll run and employee
    boolean existsByPayrollRunAndEmployee(PayrollRun payrollRun, Employee employee);
    
    // Find payslips by year and month
    @Query("SELECT p FROM Payslip p WHERE p.employee.organization = :organization AND " +
           "YEAR(p.payrollRun.payDate) = :year AND MONTH(p.payrollRun.payDate) = :month")
    List<Payslip> findByOrganizationAndYearAndMonth(@Param("organization") Organization organization,
                                                   @Param("year") int year,
                                                   @Param("month") int month);
    
    // Find payslips with comprehensive search (by employee name, payroll run name, and date range)
    @Query("SELECT p FROM Payslip p WHERE p.employee.organization = :organization AND " +
           "(:employeeName IS NULL OR LOWER(p.employee.firstName) LIKE LOWER(CONCAT('%', :employeeName, '%')) OR " +
           "LOWER(p.employee.lastName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) AND " +
           "(:payrollRunName IS NULL OR LOWER(p.payrollRun.name) LIKE LOWER(CONCAT('%', :payrollRunName, '%'))) AND " +
           "(:startDate IS NULL OR p.payrollRun.payDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.payrollRun.payDate <= :endDate)")
    Page<Payslip> findBySearchCriteria(@Param("organization") Organization organization,
                                      @Param("employeeName") String employeeName,
                                      @Param("payrollRunName") String payrollRunName,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate,
                                      Pageable pageable);
}

