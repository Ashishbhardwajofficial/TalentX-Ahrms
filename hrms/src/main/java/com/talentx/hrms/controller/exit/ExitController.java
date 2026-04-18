package com.talentx.hrms.controller.exit;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.exit.ExitApprovalRequest;
import com.talentx.hrms.dto.exit.ExitRequest;
import com.talentx.hrms.dto.exit.ExitResponse;
import com.talentx.hrms.dto.exit.ExitWithdrawalRequest;
import com.talentx.hrms.entity.enums.ExitStatus;
import com.talentx.hrms.entity.exit.EmployeeExit;
import com.talentx.hrms.mapper.ExitMapper;
import com.talentx.hrms.service.exit.ExitService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for employee exit management
 */
@RestController
@RequestMapping("/exits")
@Tag(name = "Exit Management", description = "Employee exit initiation, approval, and completion operations")
public class ExitController {

    private final ExitService exitService;
    private final ExitMapper exitMapper;

    @Autowired
    public ExitController(ExitService exitService, ExitMapper exitMapper) {
        this.exitService = exitService;
        this.exitMapper = exitMapper;
    }

    /**
     * Initiate employee exit
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Initiate exit", description = "Initiate employee exit process")
    public ResponseEntity<ApiResponse<ExitResponse>> initiateExit(@Valid @RequestBody ExitRequest request) {
        try {
            EmployeeExit exit = exitService.initiateExit(
                request.getEmployeeId(),
                request.getResignationDate(),
                request.getLastWorkingDay(),
                request.getExitReason(),
                request.getNotes()
            );
            
            ExitResponse response = exitMapper.toResponse(exit);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exit initiated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all exits with pagination and filtering
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "List exits", description = "Get all exits with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<ExitResponse>>> getExits(
            @Parameter(description = "Employee ID filter") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Status filter") @RequestParam(required = false) ExitStatus status,
            @Parameter(description = "Start date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Approver ID filter") @RequestParam(required = false) Long approverId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        
        Page<EmployeeExit> exits;
        if (employeeId != null || status != null || startDate != null || endDate != null || approverId != null) {
            // Use search with filters
            exits = exitService.searchExits(employeeId, status, startDate, endDate, approverId, paginationRequest);
        } else {
            // Get all exits
            exits = exitService.getExits(paginationRequest);
        }
        
        Page<ExitResponse> responseExits = exits.map(exitMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.success("Exits retrieved successfully", responseExits));
    }

    /**
     * Get exit by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get exit by ID", description = "Retrieve a specific exit by its ID")
    public ResponseEntity<ApiResponse<ExitResponse>> getExit(@PathVariable Long id) {
        try {
            EmployeeExit exit = exitService.getExit(id);
            ExitResponse response = exitMapper.toResponse(exit);
            return ResponseEntity.ok(ApiResponse.success("Exit retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update exit (only for initiated exits)
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Update exit", description = "Update an initiated exit")
    public ResponseEntity<ApiResponse<ExitResponse>> updateExit(
            @PathVariable Long id, 
            @Valid @RequestBody ExitRequest request) {
        try {
            EmployeeExit exit = exitService.updateExit(
                id,
                request.getResignationDate(),
                request.getLastWorkingDay(),
                request.getExitReason(),
                request.getNotes()
            );
            
            ExitResponse response = exitMapper.toResponse(exit);
            return ResponseEntity.ok(ApiResponse.success("Exit updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete exit (only initiated exits)
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Delete exit", description = "Delete an initiated exit")
    public ResponseEntity<ApiResponse<Void>> deleteExit(@PathVariable Long id) {
        try {
            exitService.deleteExit(id);
            return ResponseEntity.ok(ApiResponse.success("Exit deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Approve an exit
     */
    @PutMapping("/{id:\\d+}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Approve exit", description = "Approve an initiated exit")
    public ResponseEntity<ApiResponse<ExitResponse>> approveExit(
            @PathVariable Long id,
            @Valid @RequestBody ExitApprovalRequest request) {
        try {
            EmployeeExit exit = exitService.approveExit(id, request.getApproverId());
            ExitResponse response = exitMapper.toResponse(exit);
            return ResponseEntity.ok(ApiResponse.success("Exit approved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Withdraw an exit
     */
    @PutMapping("/{id:\\d+}/withdraw")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Withdraw exit", description = "Withdraw an initiated exit")
    public ResponseEntity<ApiResponse<ExitResponse>> withdrawExit(
            @PathVariable Long id,
            @RequestBody ExitWithdrawalRequest request) {
        try {
            EmployeeExit exit = exitService.withdrawExit(id, request.getWithdrawalReason());
            ExitResponse response = exitMapper.toResponse(exit);
            return ResponseEntity.ok(ApiResponse.success("Exit withdrawn successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Complete an exit
     */
    @PutMapping("/{id:\\d+}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Complete exit", description = "Complete an approved exit")
    public ResponseEntity<ApiResponse<ExitResponse>> completeExit(@PathVariable Long id) {
        try {
            EmployeeExit exit = exitService.completeExit(id);
            ExitResponse response = exitMapper.toResponse(exit);
            return ResponseEntity.ok(ApiResponse.success("Exit completed successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get exit by employee
     */
    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get employee exit", description = "Get exit record for a specific employee")
    public ResponseEntity<ApiResponse<ExitResponse>> getEmployeeExit(@PathVariable Long employeeId) {
        try {
            EmployeeExit exit = exitService.getExitByEmployee(employeeId);
            ExitResponse response = exitMapper.toResponse(exit);
            return ResponseEntity.ok(ApiResponse.success("Employee exit retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get exits by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get exits by status", description = "Get all exits with a specific status")
    public ResponseEntity<ApiResponse<Page<ExitResponse>>> getExitsByStatus(
            @PathVariable ExitStatus status,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeExit> exits = exitService.getExitsByStatus(status, paginationRequest);
        Page<ExitResponse> responseExits = exits.map(exitMapper::toResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Exits by status retrieved successfully", responseExits));
    }

    /**
     * Get pending exits for approval
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get pending exits", description = "Get all exits pending approval")
    public ResponseEntity<ApiResponse<Page<ExitResponse>>> getPendingExits(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeExit> exits = exitService.getPendingExits(paginationRequest);
        Page<ExitResponse> responseExits = exits.map(exitMapper::toResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Pending exits retrieved successfully", responseExits));
    }

    /**
     * Get active exits (initiated or approved)
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get active exits", description = "Get all active exits (initiated or approved)")
    public ResponseEntity<ApiResponse<Page<ExitResponse>>> getActiveExits(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeExit> exits = exitService.getActiveExits(paginationRequest);
        Page<ExitResponse> responseExits = exits.map(exitMapper::toResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Active exits retrieved successfully", responseExits));
    }

    /**
     * Get exits with upcoming last working day
     */
    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get upcoming exits", description = "Get exits with upcoming last working day")
    public ResponseEntity<ApiResponse<List<ExitResponse>>> getUpcomingExits(
            @Parameter(description = "Days ahead to look") @RequestParam(defaultValue = "30") int daysAhead) {
        
        List<EmployeeExit> exits = exitService.getExitsWithUpcomingLastWorkingDay(daysAhead);
        List<ExitResponse> responseExits = exits.stream()
            .map(exitMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Upcoming exits retrieved successfully", responseExits));
    }

    /**
     * Get overdue exits
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get overdue exits", description = "Get exits that are overdue for completion")
    public ResponseEntity<ApiResponse<List<ExitResponse>>> getOverdueExits() {
        List<EmployeeExit> exits = exitService.getOverdueExits();
        List<ExitResponse> responseExits = exits.stream()
            .map(exitMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Overdue exits retrieved successfully", responseExits));
    }

    /**
     * Get exit statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get exit statistics", description = "Get comprehensive exit statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExitStatistics() {
        ExitService.ExitStatistics stats = exitService.getExitStatistics();
        
        Map<String, Object> statisticsMap = Map.of(
            "totalExits", stats.getTotalExits(),
            "initiatedExits", stats.getInitiatedExits(),
            "approvedExits", stats.getApprovedExits(),
            "withdrawnExits", stats.getWithdrawnExits(),
            "completedExits", stats.getCompletedExits()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Exit statistics retrieved successfully", statisticsMap));
    }

    /**
     * Get exits by month and year
     */
    @GetMapping("/monthly/{year}/{month:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get monthly exits", description = "Get exits for a specific month and year")
    public ResponseEntity<ApiResponse<List<ExitResponse>>> getMonthlyExits(
            @PathVariable int year,
            @PathVariable int month) {
        
        List<EmployeeExit> exits = exitService.getExitsByMonthYear(year, month);
        List<ExitResponse> responseExits = exits.stream()
            .map(exitMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Monthly exits retrieved successfully", responseExits));
    }
}

