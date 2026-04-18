package com.talentx.hrms.service.expense;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.ExpenseStatus;
import com.talentx.hrms.entity.enums.ExpenseType;
import com.talentx.hrms.entity.finance.Expense;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.ExpenseRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service class for managing expenses
 */
@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthService authService;

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository,
                         EmployeeRepository employeeRepository,
                         OrganizationRepository organizationRepository,
                         AuthService authService) {
        this.expenseRepository = expenseRepository;
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.authService = authService;
    }

    /**
     * Submit a new expense
     */
    public Expense submitExpense(Long employeeId, ExpenseType expenseType, BigDecimal amount, 
                                LocalDate expenseDate, String description, String receiptUrl) {
        // Validate employee
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Get current user's organization
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Validate that employee belongs to the same organization
        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        // Create expense
        Expense expense = new Expense(employee, organization, expenseType, amount, expenseDate);
        expense.setDescription(description);
        expense.setReceiptUrl(receiptUrl);

        return expenseRepository.save(expense);
    }

    /**
     * Get expense by ID
     */
    @Transactional(readOnly = true)
    public Expense getExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify access - user can only access expenses from their organization
        User currentUser = authService.getCurrentUser();
        if (!expense.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return expense;
    }

    /**
     * Get all expenses with pagination
     */
    @Transactional(readOnly = true)
    public Page<Expense> getExpenses(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return expenseRepository.findByOrganization(organization, pageable);
    }

    /**
     * Get expenses by employee
     */
    @Transactional(readOnly = true)
    public Page<Expense> getExpensesByEmployee(Long employeeId, PaginationRequest paginationRequest) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!employee.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        Pageable pageable = createPageable(paginationRequest);
        return expenseRepository.findByEmployee(employee, pageable);
    }

    /**
     * Search expenses with comprehensive criteria
     */
    @Transactional(readOnly = true)
    public Page<Expense> searchExpenses(Long employeeId, ExpenseType expenseType, ExpenseStatus status,
                                       LocalDate startDate, LocalDate endDate, BigDecimal minAmount, 
                                       BigDecimal maxAmount, PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            // Verify employee belongs to same organization
            if (!employee.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Employee does not belong to your organization");
            }
        }

        Pageable pageable = createPageable(paginationRequest);
        return expenseRepository.findBySearchCriteria(organization, employee, expenseType, status,
                startDate, endDate, minAmount, maxAmount, pageable);
    }

    /**
     * Get pending expenses for approval
     */
    @Transactional(readOnly = true)
    public Page<Expense> getPendingExpenses(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return expenseRepository.findPendingByOrganization(organization, pageable);
    }

    /**
     * Get pending expenses for a specific manager
     */
    @Transactional(readOnly = true)
    public Page<Expense> getPendingExpensesForManager(Long managerId, PaginationRequest paginationRequest) {
        Employee manager = employeeRepository.findById(managerId)
            .orElseThrow(() -> new RuntimeException("Manager not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!manager.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        Pageable pageable = createPageable(paginationRequest);
        return expenseRepository.findPendingForApproval(manager.getOrganization(), manager, pageable);
    }

    /**
     * Get approved but unpaid expenses
     */
    @Transactional(readOnly = true)
    public Page<Expense> getApprovedUnpaidExpenses(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return expenseRepository.findApprovedUnpaidByOrganization(organization, pageable);
    }

    /**
     * Approve an expense
     */
    public Expense approveExpense(Long expenseId, Long approverId) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!expense.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Validate expense can be approved
        if (!expense.isSubmitted()) {
            throw new RuntimeException("Only submitted expenses can be approved");
        }

        // Try to find approver employee — admin users may not have one
        Employee approver = employeeRepository.findById(approverId).orElse(null);
        if (approver != null && !canApproveExpense(approver, expense.getEmployee())) {
            throw new RuntimeException("Approver does not have authority to approve this expense");
        }

        expense.approve(approver);
        return expenseRepository.save(expense);
    }

    /**
     * Reject an expense
     */
    public Expense rejectExpense(Long expenseId, Long approverId, String rejectionReason) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!expense.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Validate expense can be rejected
        if (!expense.isSubmitted()) {
            throw new RuntimeException("Only submitted expenses can be rejected");
        }

        // Try to find approver employee — admin users may not have one
        Employee approver = employeeRepository.findById(approverId).orElse(null);
        if (approver != null && !canApproveExpense(approver, expense.getEmployee())) {
            throw new RuntimeException("Approver does not have authority to reject this expense");
        }

        expense.reject(approver, rejectionReason);
        return expenseRepository.save(expense);
    }

    /**
     * Mark expense as paid
     */
    public Expense markExpenseAsPaid(Long expenseId, LocalDate paymentDate) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!expense.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Validate expense can be marked as paid
        if (!expense.isApproved()) {
            throw new RuntimeException("Only approved expenses can be marked as paid");
        }

        expense.markAsPaid(paymentDate);
        return expenseRepository.save(expense);
    }

    /**
     * Update expense (only for submitted expenses)
     */
    public Expense updateExpense(Long expenseId, ExpenseType expenseType, BigDecimal amount,
                                LocalDate expenseDate, String description, String receiptUrl) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!expense.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Only submitted expenses can be updated
        if (!expense.isSubmitted()) {
            throw new RuntimeException("Only submitted expenses can be updated");
        }

        // Update fields
        expense.setExpenseType(expenseType);
        expense.setAmount(amount);
        expense.setExpenseDate(expenseDate);
        expense.setDescription(description);
        expense.setReceiptUrl(receiptUrl);

        return expenseRepository.save(expense);
    }

    /**
     * Delete expense (only submitted expenses)
     */
    public void deleteExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!expense.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Only submitted expenses can be deleted
        if (!expense.isSubmitted()) {
            throw new RuntimeException("Only submitted expenses can be deleted");
        }

        expenseRepository.delete(expense);
    }

    /**
     * Get expense statistics
     */
    @Transactional(readOnly = true)
    public ExpenseStatistics getExpenseStatistics() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        long totalExpenses = expenseRepository.countByOrganization(organization);
        long submittedExpenses = expenseRepository.countByOrganizationAndStatus(organization, ExpenseStatus.SUBMITTED);
        long approvedExpenses = expenseRepository.countByOrganizationAndStatus(organization, ExpenseStatus.APPROVED);
        long rejectedExpenses = expenseRepository.countByOrganizationAndStatus(organization, ExpenseStatus.REJECTED);
        long paidExpenses = expenseRepository.countByOrganizationAndStatus(organization, ExpenseStatus.PAID);

        BigDecimal totalAmount = expenseRepository.sumAmountByOrganization(organization);
        BigDecimal approvedAmount = expenseRepository.sumAmountByOrganizationAndStatus(organization, ExpenseStatus.APPROVED);
        BigDecimal paidAmount = expenseRepository.sumAmountByOrganizationAndStatus(organization, ExpenseStatus.PAID);

        return new ExpenseStatistics(totalExpenses, submittedExpenses, approvedExpenses, rejectedExpenses, paidExpenses,
                totalAmount, approvedAmount, paidAmount);
    }

    /**
     * Get employee expense statistics
     */
    @Transactional(readOnly = true)
    public EmployeeExpenseStatistics getEmployeeExpenseStatistics(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!employee.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        long totalExpenses = expenseRepository.countByEmployee(employee);
        long submittedExpenses = expenseRepository.countByEmployeeAndStatus(employee, ExpenseStatus.SUBMITTED);
        long approvedExpenses = expenseRepository.countByEmployeeAndStatus(employee, ExpenseStatus.APPROVED);
        long rejectedExpenses = expenseRepository.countByEmployeeAndStatus(employee, ExpenseStatus.REJECTED);
        long paidExpenses = expenseRepository.countByEmployeeAndStatus(employee, ExpenseStatus.PAID);

        BigDecimal totalAmount = expenseRepository.sumAmountByEmployee(employee);
        BigDecimal approvedAmount = expenseRepository.sumAmountByEmployeeAndStatus(employee, ExpenseStatus.APPROVED);
        BigDecimal paidAmount = expenseRepository.sumAmountByEmployeeAndStatus(employee, ExpenseStatus.PAID);

        return new EmployeeExpenseStatistics(totalExpenses, submittedExpenses, approvedExpenses, rejectedExpenses, paidExpenses,
                totalAmount, approvedAmount, paidAmount);
    }

    /**
     * Get expenses by month and year
     */
    @Transactional(readOnly = true)
    public List<Expense> getExpensesByMonthYear(int year, int month) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return expenseRepository.findByOrganizationAndMonthYear(organization, year, month);
    }

    /**
     * Get employee expenses by month and year
     */
    @Transactional(readOnly = true)
    public List<Expense> getEmployeeExpensesByMonthYear(Long employeeId, int year, int month) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!employee.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return expenseRepository.findByEmployeeAndMonthYear(employee, year, month);
    }

    /**
     * Get overdue payments
     */
    @Transactional(readOnly = true)
    public List<Expense> getOverduePayments(int daysOverdue) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        LocalDate cutoffDate = LocalDate.now().minusDays(daysOverdue);
        return expenseRepository.findOverduePayments(organization, cutoffDate);
    }

    /**
     * Get top expense types by amount
     */
    @Transactional(readOnly = true)
    public List<Object[]> getTopExpenseTypesByAmount() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return expenseRepository.findTopExpenseTypesByAmount(organization);
    }

    /**
     * Check if approver can approve expense for employee
     */
    private boolean canApproveExpense(Employee approver, Employee employee) {
        // Direct manager can approve
        if (employee.getManager() != null && employee.getManager().getId().equals(approver.getId())) {
            return true;
        }

        // Department manager can approve
        if (employee.getDepartment() != null && employee.getDepartment().getManager() != null &&
            employee.getDepartment().getManager().getId().equals(approver.getId())) {
            return true;
        }

        // ADMIN/HR users linked to an employee can always approve
        User approverUser = approver.getUser();
        if (approverUser != null) {
            boolean isAdminOrHr = approverUser.getRoles().stream()
                .anyMatch(ur -> {
                    String code = ur.getRole() != null ? ur.getRole().getCode() : "";
                    return "ADMIN".equals(code) || "HR".equals(code);
                });
            if (isAdminOrHr) return true;
        }

        return false;
    }

    /**
     * Create pageable from pagination request
     */
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    /**
     * Expense statistics inner class
     */
    public static class ExpenseStatistics {
        private final long totalExpenses;
        private final long submittedExpenses;
        private final long approvedExpenses;
        private final long rejectedExpenses;
        private final long paidExpenses;
        private final BigDecimal totalAmount;
        private final BigDecimal approvedAmount;
        private final BigDecimal paidAmount;

        public ExpenseStatistics(long totalExpenses, long submittedExpenses, long approvedExpenses, 
                               long rejectedExpenses, long paidExpenses, BigDecimal totalAmount, 
                               BigDecimal approvedAmount, BigDecimal paidAmount) {
            this.totalExpenses = totalExpenses;
            this.submittedExpenses = submittedExpenses;
            this.approvedExpenses = approvedExpenses;
            this.rejectedExpenses = rejectedExpenses;
            this.paidExpenses = paidExpenses;
            this.totalAmount = totalAmount;
            this.approvedAmount = approvedAmount;
            this.paidAmount = paidAmount;
        }

        // Getters
        public long getTotalExpenses() { return totalExpenses; }
        public long getSubmittedExpenses() { return submittedExpenses; }
        public long getApprovedExpenses() { return approvedExpenses; }
        public long getRejectedExpenses() { return rejectedExpenses; }
        public long getPaidExpenses() { return paidExpenses; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public BigDecimal getApprovedAmount() { return approvedAmount; }
        public BigDecimal getPaidAmount() { return paidAmount; }
    }

    /**
     * Employee expense statistics inner class
     */
    public static class EmployeeExpenseStatistics {
        private final long totalExpenses;
        private final long submittedExpenses;
        private final long approvedExpenses;
        private final long rejectedExpenses;
        private final long paidExpenses;
        private final BigDecimal totalAmount;
        private final BigDecimal approvedAmount;
        private final BigDecimal paidAmount;

        public EmployeeExpenseStatistics(long totalExpenses, long submittedExpenses, long approvedExpenses, 
                                       long rejectedExpenses, long paidExpenses, BigDecimal totalAmount, 
                                       BigDecimal approvedAmount, BigDecimal paidAmount) {
            this.totalExpenses = totalExpenses;
            this.submittedExpenses = submittedExpenses;
            this.approvedExpenses = approvedExpenses;
            this.rejectedExpenses = rejectedExpenses;
            this.paidExpenses = paidExpenses;
            this.totalAmount = totalAmount;
            this.approvedAmount = approvedAmount;
            this.paidAmount = paidAmount;
        }

        // Getters
        public long getTotalExpenses() { return totalExpenses; }
        public long getSubmittedExpenses() { return submittedExpenses; }
        public long getApprovedExpenses() { return approvedExpenses; }
        public long getRejectedExpenses() { return rejectedExpenses; }
        public long getPaidExpenses() { return paidExpenses; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public BigDecimal getApprovedAmount() { return approvedAmount; }
        public BigDecimal getPaidAmount() { return paidAmount; }
    }
}

