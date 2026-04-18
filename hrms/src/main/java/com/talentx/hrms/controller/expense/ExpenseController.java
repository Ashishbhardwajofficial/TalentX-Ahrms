package com.talentx.hrms.controller.expense;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.expense.ExpenseApprovalRequest;
import com.talentx.hrms.dto.expense.ExpensePaymentRequest;
import com.talentx.hrms.dto.expense.ExpenseRequest;
import com.talentx.hrms.dto.expense.ExpenseResponse;
import com.talentx.hrms.entity.enums.ExpenseStatus;
import com.talentx.hrms.entity.enums.ExpenseType;
import com.talentx.hrms.entity.finance.Expense;
import com.talentx.hrms.mapper.ExpenseMapper;
import com.talentx.hrms.service.expense.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for expense management
 */
@RestController
@RequestMapping("/expenses")
@Tag(name = "Expense Management", description = "Expense submission, approval, and payment operations")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ExpenseMapper expenseMapper;

    @Autowired
    public ExpenseController(ExpenseService expenseService, ExpenseMapper expenseMapper) {
        this.expenseService = expenseService;
        this.expenseMapper = expenseMapper;
    }

    /**
     * Submit a new expense
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    @Operation(summary = "Submit expense", description = "Submit a new expense claim")
    public ResponseEntity<ApiResponse<ExpenseResponse>> submitExpense(@Valid @RequestBody ExpenseRequest request) {
        try {
            Expense expense = expenseService.submitExpense(
                request.getEmployeeId(),
                request.getExpenseType(),
                request.getAmount(),
                request.getExpenseDate(),
                request.getDescription(),
                request.getReceiptUrl()
            );
            
            ExpenseResponse response = expenseMapper.toResponse(expense);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense submitted successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all expenses with pagination and filtering
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "List expenses", description = "Get all expenses with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getExpenses(
            @Parameter(description = "Employee ID filter") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Expense type filter") @RequestParam(required = false) ExpenseType expenseType,
            @Parameter(description = "Status filter") @RequestParam(required = false) ExpenseStatus status,
            @Parameter(description = "Start date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Minimum amount filter") @RequestParam(required = false) BigDecimal minAmount,
            @Parameter(description = "Maximum amount filter") @RequestParam(required = false) BigDecimal maxAmount,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        
        Page<Expense> expenses;
        if (employeeId != null || expenseType != null || status != null || 
            startDate != null || endDate != null || minAmount != null || maxAmount != null) {
            // Use search with filters
            expenses = expenseService.searchExpenses(employeeId, expenseType, status, 
                startDate, endDate, minAmount, maxAmount, paginationRequest);
        } else {
            // Get all expenses
            expenses = expenseService.getExpenses(paginationRequest);
        }
        
        Page<ExpenseResponse> responseExpenses = expenses.map(expenseMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", responseExpenses));
    }

    /**
     * Get expense by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get expense by ID", description = "Retrieve a specific expense by its ID")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpense(@PathVariable Long id) {
        try {
            Expense expense = expenseService.getExpense(id);
            ExpenseResponse response = expenseMapper.toResponse(expense);
            return ResponseEntity.ok(ApiResponse.success("Expense retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update expense (only for submitted expenses)
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    @Operation(summary = "Update expense", description = "Update a submitted expense")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id, 
            @Valid @RequestBody ExpenseRequest request) {
        try {
            Expense expense = expenseService.updateExpense(
                id,
                request.getExpenseType(),
                request.getAmount(),
                request.getExpenseDate(),
                request.getDescription(),
                request.getReceiptUrl()
            );
            
            ExpenseResponse response = expenseMapper.toResponse(expense);
            return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete expense (only submitted expenses)
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    @Operation(summary = "Delete expense", description = "Delete a submitted expense")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        try {
            expenseService.deleteExpense(id);
            return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Approve an expense
     */
    @PutMapping("/{id:\\d+}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Approve expense", description = "Approve a submitted expense")
    public ResponseEntity<ApiResponse<ExpenseResponse>> approveExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseApprovalRequest request) {
        try {
            Expense expense = expenseService.approveExpense(id, request.getApproverId());
            ExpenseResponse response = expenseMapper.toResponse(expense);
            return ResponseEntity.ok(ApiResponse.success("Expense approved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reject an expense
     */
    @PutMapping("/{id:\\d+}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Reject expense", description = "Reject a submitted expense")
    public ResponseEntity<ApiResponse<ExpenseResponse>> rejectExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseApprovalRequest request) {
        try {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Rejection reason is required"));
            }
            
            Expense expense = expenseService.rejectExpense(id, request.getApproverId(), request.getRejectionReason());
            ExpenseResponse response = expenseMapper.toResponse(expense);
            return ResponseEntity.ok(ApiResponse.success("Expense rejected successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Mark expense as paid
     */
    @PutMapping("/{id:\\d+}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Mark expense as paid", description = "Mark an approved expense as paid")
    public ResponseEntity<ApiResponse<ExpenseResponse>> markExpenseAsPaid(
            @PathVariable Long id,
            @Valid @RequestBody ExpensePaymentRequest request) {
        try {
            Expense expense = expenseService.markExpenseAsPaid(id, request.getPaymentDate());
            ExpenseResponse response = expenseMapper.toResponse(expense);
            return ResponseEntity.ok(ApiResponse.success("Expense marked as paid successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get expenses by employee
     */
    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get employee expenses", description = "Get all expenses for a specific employee")
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getEmployeeExpenses(
            @PathVariable Long employeeId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        try {
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            Page<Expense> expenses = expenseService.getExpensesByEmployee(employeeId, paginationRequest);
            Page<ExpenseResponse> responseExpenses = expenses.map(expenseMapper::toResponse);
            
            return ResponseEntity.ok(ApiResponse.success("Employee expenses retrieved successfully", responseExpenses));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get pending expenses for approval
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get pending expenses", description = "Get all expenses pending approval")
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getPendingExpenses(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<Expense> expenses = expenseService.getPendingExpenses(paginationRequest);
        Page<ExpenseResponse> responseExpenses = expenses.map(expenseMapper::toResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Pending expenses retrieved successfully", responseExpenses));
    }

    /**
     * Get approved but unpaid expenses
     */
    @GetMapping("/approved-unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get approved unpaid expenses", description = "Get all approved expenses that haven't been paid")
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getApprovedUnpaidExpenses(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<Expense> expenses = expenseService.getApprovedUnpaidExpenses(paginationRequest);
        Page<ExpenseResponse> responseExpenses = expenses.map(expenseMapper::toResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Approved unpaid expenses retrieved successfully", responseExpenses));
    }

    /**
     * Get expense statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get expense statistics", description = "Get comprehensive expense statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExpenseStatistics() {
        ExpenseService.ExpenseStatistics stats = expenseService.getExpenseStatistics();
        
        Map<String, Object> statisticsMap = Map.of(
            "totalExpenses", stats.getTotalExpenses(),
            "submittedExpenses", stats.getSubmittedExpenses(),
            "approvedExpenses", stats.getApprovedExpenses(),
            "rejectedExpenses", stats.getRejectedExpenses(),
            "paidExpenses", stats.getPaidExpenses(),
            "totalAmount", stats.getTotalAmount(),
            "approvedAmount", stats.getApprovedAmount(),
            "paidAmount", stats.getPaidAmount()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Expense statistics retrieved successfully", statisticsMap));
    }

    /**
     * Get employee expense statistics
     */
    @GetMapping("/employee/{employeeId:\\d+}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get employee expense statistics", description = "Get expense statistics for a specific employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeExpenseStatistics(@PathVariable Long employeeId) {
        try {
            ExpenseService.EmployeeExpenseStatistics stats = expenseService.getEmployeeExpenseStatistics(employeeId);
            
            Map<String, Object> statisticsMap = Map.of(
                "totalExpenses", stats.getTotalExpenses(),
                "submittedExpenses", stats.getSubmittedExpenses(),
                "approvedExpenses", stats.getApprovedExpenses(),
                "rejectedExpenses", stats.getRejectedExpenses(),
                "paidExpenses", stats.getPaidExpenses(),
                "totalAmount", stats.getTotalAmount(),
                "approvedAmount", stats.getApprovedAmount(),
                "paidAmount", stats.getPaidAmount()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Employee expense statistics retrieved successfully", statisticsMap));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get overdue payments
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get overdue payments", description = "Get expenses that are overdue for payment")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getOverduePayments(
            @Parameter(description = "Days overdue threshold") @RequestParam(defaultValue = "30") int daysOverdue) {
        
        List<Expense> expenses = expenseService.getOverduePayments(daysOverdue);
        List<ExpenseResponse> responseExpenses = expenses.stream()
            .map(expenseMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Overdue payments retrieved successfully", responseExpenses));
    }

    /**
     * Get expenses by month and year
     */
    @GetMapping("/monthly/{year}/{month:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get monthly expenses", description = "Get expenses for a specific month and year")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getMonthlyExpenses(
            @PathVariable int year,
            @PathVariable int month) {
        
        List<Expense> expenses = expenseService.getExpensesByMonthYear(year, month);
        List<ExpenseResponse> responseExpenses = expenses.stream()
            .map(expenseMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Monthly expenses retrieved successfully", responseExpenses));
    }

    /**
     * Get employee expenses by month and year
     */
    @GetMapping("/employee/{employeeId}/monthly/{year}/{month:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get employee monthly expenses", description = "Get employee expenses for a specific month and year")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getEmployeeMonthlyExpenses(
            @PathVariable Long employeeId,
            @PathVariable int year,
            @PathVariable int month) {
        
        try {
            List<Expense> expenses = expenseService.getEmployeeExpensesByMonthYear(employeeId, year, month);
            List<ExpenseResponse> responseExpenses = expenses.stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Employee monthly expenses retrieved successfully", responseExpenses));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get top expense types by amount
     */
    @GetMapping("/analytics/top-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get top expense types", description = "Get expense types ranked by total amount")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopExpenseTypes() {
        try {
            List<Object[]> results = expenseService.getTopExpenseTypesByAmount();
            List<Map<String, Object>> topTypes = results.stream()
                .map(result -> {
                    Map<String, Object> item = new java.util.HashMap<>();
                    item.put("expenseType", result[0] != null ? result[0].toString() : "UNKNOWN");
                    item.put("totalAmount", result[1] != null ? result[1] : 0);
                    return item;
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Top expense types retrieved successfully", topTypes));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.success("Top expense types retrieved successfully", List.of()));
        }
    }
}

