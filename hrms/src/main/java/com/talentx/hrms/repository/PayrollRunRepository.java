package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.PayrollStatus;
import com.talentx.hrms.entity.payroll.PayrollRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
    
    // Find payroll runs by organization
    List<PayrollRun> findByOrganization(Organization organization);
    
    // Find payroll runs by organization with pagination
    Page<PayrollRun> findByOrganization(Organization organization, Pageable pageable);
    
    // Find payroll runs by organization with pagination — processedBy/approvedBy eagerly loaded
    @Query("SELECT DISTINCT pr FROM PayrollRun pr LEFT JOIN FETCH pr.processedBy LEFT JOIN FETCH pr.approvedBy WHERE pr.organization = :organization")
    List<PayrollRun> findByOrganizationWithEmployees(@Param("organization") Organization organization);
    
    // Find payroll runs by status
    List<PayrollRun> findByOrganizationAndStatus(Organization organization, PayrollStatus status);
    
    // Find payroll runs by status with pagination
    Page<PayrollRun> findByOrganizationAndStatus(Organization organization, PayrollStatus status, Pageable pageable);
    
    // Find payroll runs by pay period
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.payPeriodStart <= :endDate AND pr.payPeriodEnd >= :startDate")
    List<PayrollRun> findByOrganizationAndPayPeriodOverlap(@Param("organization") Organization organization,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);
    
    // Find payroll runs by pay date range
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.payDate BETWEEN :startDate AND :endDate")
    List<PayrollRun> findByOrganizationAndPayDateBetween(@Param("organization") Organization organization,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);
    
    // Find processed payroll runs
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.status IN ('CALCULATED', 'APPROVED', 'PAID')")
    List<PayrollRun> findProcessedByOrganization(@Param("organization") Organization organization);
    
    // Find payroll runs processed between dates
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.processedAt BETWEEN :startDate AND :endDate")
    List<PayrollRun> findByOrganizationAndProcessedAtBetween(@Param("organization") Organization organization,
                                                            @Param("startDate") Instant startDate,
                                                            @Param("endDate") Instant endDate);
    
    // Find payroll runs approved between dates
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.approvedAt BETWEEN :startDate AND :endDate")
    List<PayrollRun> findByOrganizationAndApprovedAtBetween(@Param("organization") Organization organization,
                                                           @Param("startDate") Instant startDate,
                                                           @Param("endDate") Instant endDate);
    
    // Find payroll runs paid between dates
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.paidAt BETWEEN :startDate AND :endDate")
    List<PayrollRun> findByOrganizationAndPaidAtBetween(@Param("organization") Organization organization,
                                                       @Param("startDate") Instant startDate,
                                                       @Param("endDate") Instant endDate);
    
    // Find payroll runs by processed by
    List<PayrollRun> findByOrganizationAndProcessedBy(Organization organization, Employee processedBy);
    
    // Find payroll runs by approved by
    List<PayrollRun> findByOrganizationAndApprovedBy(Organization organization, Employee approvedBy);
    
    // Find payroll runs by paid by
    List<PayrollRun> findByOrganizationAndPaidBy(Organization organization, String paidBy);
    
    // Search payroll runs by name
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "LOWER(pr.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<PayrollRun> findByOrganizationAndNameContainingIgnoreCase(@Param("organization") Organization organization,
                                                                  @Param("name") String name,
                                                                  Pageable pageable);
    
    // Find payroll runs with total gross pay greater than amount
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND pr.totalGrossPay > :amount")
    List<PayrollRun> findByOrganizationAndTotalGrossPayGreaterThan(@Param("organization") Organization organization,
                                                                  @Param("amount") BigDecimal amount);
    
    // Find payroll runs with employee count greater than count
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND pr.employeeCount > :count")
    List<PayrollRun> findByOrganizationAndEmployeeCountGreaterThan(@Param("organization") Organization organization,
                                                                  @Param("count") Integer count);
    
    // Find upcoming payroll runs (pay date in future)
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND pr.payDate > CURRENT_DATE")
    List<PayrollRun> findUpcomingByOrganization(@Param("organization") Organization organization);
    
    // Find overdue payroll runs (pay date in past but not paid)
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.payDate < CURRENT_DATE AND pr.status != 'PAID'")
    List<PayrollRun> findOverdueByOrganization(@Param("organization") Organization organization);
    
    // Find payroll runs with payslips
    @Query("SELECT DISTINCT pr FROM PayrollRun pr LEFT JOIN FETCH pr.payslips WHERE pr.id = :id")
    Optional<PayrollRun> findByIdWithPayslips(@Param("id") Long id);
    
    // Count payroll runs by organization and status
    long countByOrganizationAndStatus(Organization organization, PayrollStatus status);
    
    // Get total gross pay by organization and year
    @Query("SELECT SUM(pr.totalGrossPay) FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "YEAR(pr.payDate) = :year")
    BigDecimal getTotalGrossPayByOrganizationAndYear(@Param("organization") Organization organization,
                                                    @Param("year") int year);
    
    // Get total net pay by organization and year
    @Query("SELECT SUM(pr.totalNetPay) FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "YEAR(pr.payDate) = :year")
    BigDecimal getTotalNetPayByOrganizationAndYear(@Param("organization") Organization organization,
                                                  @Param("year") int year);
    
    // Get total taxes by organization and year
    @Query("SELECT SUM(pr.totalTaxes) FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "YEAR(pr.payDate) = :year")
    BigDecimal getTotalTaxesByOrganizationAndYear(@Param("organization") Organization organization,
                                                 @Param("year") int year);
    
    // Find latest payroll run by organization
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization ORDER BY pr.payDate DESC")
    List<PayrollRun> findLatestByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Check if payroll run exists for pay period
    @Query("SELECT COUNT(pr) > 0 FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "pr.payPeriodStart = :startDate AND pr.payPeriodEnd = :endDate")
    boolean existsByOrganizationAndPayPeriod(@Param("organization") Organization organization,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
    
    // Find payroll runs with comprehensive search
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "(:name IS NULL OR LOWER(pr.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:status IS NULL OR pr.status = :status) AND " +
           "(:startDate IS NULL OR pr.payDate >= :startDate) AND " +
           "(:endDate IS NULL OR pr.payDate <= :endDate)")
    Page<PayrollRun> findBySearchCriteria(@Param("organization") Organization organization,
                                         @Param("name") String name,
                                         @Param("status") PayrollStatus status,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate,
                                         Pageable pageable);
    
    // Get payroll run statistics by organization
    @Query("SELECT pr.status, COUNT(pr), SUM(pr.totalGrossPay), SUM(pr.totalNetPay) " +
           "FROM PayrollRun pr WHERE pr.organization = :organization GROUP BY pr.status")
    List<Object[]> getPayrollRunStatsByOrganization(@Param("organization") Organization organization);
    
    // Find payroll runs by year and month
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organization = :organization AND " +
           "YEAR(pr.payDate) = :year AND MONTH(pr.payDate) = :month")
    List<PayrollRun> findByOrganizationAndYearAndMonth(@Param("organization") Organization organization,
                                                      @Param("year") int year,
                                                      @Param("month") int month);
}

