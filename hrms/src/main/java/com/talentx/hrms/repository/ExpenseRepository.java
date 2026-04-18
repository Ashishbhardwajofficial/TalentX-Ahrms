package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.ExpenseStatus;
import com.talentx.hrms.entity.enums.ExpenseType;
import com.talentx.hrms.entity.finance.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Expense entity
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Find by employee
    List<Expense> findByEmployee(Employee employee);
    Page<Expense> findByEmployee(Employee employee, Pageable pageable);

    // Find by organization
    List<Expense> findByOrganization(Organization organization);

    // Find by organization with pagination
    // Uses @EntityGraph to eagerly load employee and approvedBy without JOIN FETCH pagination issue
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"employee", "approvedBy", "organization"})
    Page<Expense> findByOrganization(Organization organization, Pageable pageable);

    // Find by employee and organization
    List<Expense> findByEmployeeAndOrganization(Employee employee, Organization organization);
    Page<Expense> findByEmployeeAndOrganization(Employee employee, Organization organization, Pageable pageable);

    // Find by status
    List<Expense> findByOrganizationAndStatus(Organization organization, ExpenseStatus status);
    Page<Expense> findByOrganizationAndStatus(Organization organization, ExpenseStatus status, Pageable pageable);

    // Find by employee and status
    List<Expense> findByEmployeeAndStatus(Employee employee, ExpenseStatus status);
    Page<Expense> findByEmployeeAndStatus(Employee employee, ExpenseStatus status, Pageable pageable);

    // Find by expense type
    List<Expense> findByOrganizationAndExpenseType(Organization organization, ExpenseType expenseType);
    Page<Expense> findByOrganizationAndExpenseType(Organization organization, ExpenseType expenseType, Pageable pageable);

    // Find by employee and expense type
    List<Expense> findByEmployeeAndExpenseType(Employee employee, ExpenseType expenseType);

    // Find by date range
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findByOrganizationAndExpenseDateBetween(@Param("organization") Organization organization,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.expenseDate BETWEEN :startDate AND :endDate")
    Page<Expense> findByOrganizationAndExpenseDateBetween(@Param("organization") Organization organization,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate,
                                                         Pageable pageable);

    // Find by employee and date range
    @Query("SELECT e FROM Expense e WHERE e.employee = :employee AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findByEmployeeAndExpenseDateBetween(@Param("employee") Employee employee,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.employee = :employee AND e.expenseDate BETWEEN :startDate AND :endDate")
    Page<Expense> findByEmployeeAndExpenseDateBetween(@Param("employee") Employee employee,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate,
                                                     Pageable pageable);

    // Find by amount range
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.amount BETWEEN :minAmount AND :maxAmount")
    List<Expense> findByOrganizationAndAmountBetween(@Param("organization") Organization organization,
                                                    @Param("minAmount") BigDecimal minAmount,
                                                    @Param("maxAmount") BigDecimal maxAmount);

    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.amount BETWEEN :minAmount AND :maxAmount")
    Page<Expense> findByOrganizationAndAmountBetween(@Param("organization") Organization organization,
                                                    @Param("minAmount") BigDecimal minAmount,
                                                    @Param("maxAmount") BigDecimal maxAmount,
                                                    Pageable pageable);

    // Find by approver
    List<Expense> findByApprovedBy(Employee approver);
    Page<Expense> findByApprovedBy(Employee approver, Pageable pageable);

    // Find pending expenses (submitted status)
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.status = 'SUBMITTED'")
    List<Expense> findPendingByOrganization(@Param("organization") Organization organization);

    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.status = 'SUBMITTED'")
    Page<Expense> findPendingByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find approved but unpaid expenses
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.status = 'APPROVED'")
    List<Expense> findApprovedUnpaidByOrganization(@Param("organization") Organization organization);

    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.status = 'APPROVED'")
    Page<Expense> findApprovedUnpaidByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Comprehensive search with multiple criteria
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND " +
           "(:employee IS NULL OR e.employee = :employee) AND " +
           "(:expenseType IS NULL OR e.expenseType = :expenseType) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:startDate IS NULL OR e.expenseDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expenseDate <= :endDate) AND " +
           "(:minAmount IS NULL OR e.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR e.amount <= :maxAmount)")
    Page<Expense> findBySearchCriteria(@Param("organization") Organization organization,
                                      @Param("employee") Employee employee,
                                      @Param("expenseType") ExpenseType expenseType,
                                      @Param("status") ExpenseStatus status,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate,
                                      @Param("minAmount") BigDecimal minAmount,
                                      @Param("maxAmount") BigDecimal maxAmount,
                                      Pageable pageable);

    // Count methods
    long countByOrganization(Organization organization);
    long countByOrganizationAndStatus(Organization organization, ExpenseStatus status);
    long countByEmployee(Employee employee);
    long countByEmployeeAndStatus(Employee employee, ExpenseStatus status);

    // Sum methods for reporting
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.organization = :organization")
    BigDecimal sumAmountByOrganization(@Param("organization") Organization organization);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.organization = :organization AND e.status = :status")
    BigDecimal sumAmountByOrganizationAndStatus(@Param("organization") Organization organization, @Param("status") ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.employee = :employee")
    BigDecimal sumAmountByEmployee(@Param("employee") Employee employee);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.employee = :employee AND e.status = :status")
    BigDecimal sumAmountByEmployeeAndStatus(@Param("employee") Employee employee, @Param("status") ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.organization = :organization AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByOrganizationAndDateRange(@Param("organization") Organization organization,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate);

    // Find expenses requiring approval (for managers)
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.status = 'SUBMITTED' AND " +
           "(e.employee.manager = :manager OR e.employee.department.manager = :manager)")
    List<Expense> findPendingForApproval(@Param("organization") Organization organization, @Param("manager") Employee manager);

    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.status = 'SUBMITTED' AND " +
           "(e.employee.manager = :manager OR e.employee.department.manager = :manager)")
    Page<Expense> findPendingForApproval(@Param("organization") Organization organization, @Param("manager") Employee manager, Pageable pageable);

    // Find expenses by month and year
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND " +
           "YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month")
    List<Expense> findByOrganizationAndMonthYear(@Param("organization") Organization organization,
                                                @Param("year") int year,
                                                @Param("month") int month);

    @Query("SELECT e FROM Expense e WHERE e.employee = :employee AND " +
           "YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month")
    List<Expense> findByEmployeeAndMonthYear(@Param("employee") Employee employee,
                                            @Param("year") int year,
                                            @Param("month") int month);

    // Find overdue expenses (approved but not paid for more than X days)
    @Query("SELECT e FROM Expense e WHERE e.organization = :organization AND e.status = 'APPROVED' AND " +
           "e.approvedAt < :cutoffDate")
    List<Expense> findOverduePayments(@Param("organization") Organization organization, @Param("cutoffDate") LocalDate cutoffDate);

    // Check if employee has any pending expenses
    @Query("SELECT COUNT(e) > 0 FROM Expense e WHERE e.employee = :employee AND e.status = 'SUBMITTED'")
    boolean hasEmployeePendingExpenses(@Param("employee") Employee employee);

    // Find top expense types by amount
    @Query("SELECT e.expenseType, SUM(e.amount) FROM Expense e WHERE e.organization = :organization AND e.status = 'PAID' " +
           "GROUP BY e.expenseType ORDER BY SUM(e.amount) DESC")
    List<Object[]> findTopExpenseTypesByAmount(@Param("organization") Organization organization);
}

