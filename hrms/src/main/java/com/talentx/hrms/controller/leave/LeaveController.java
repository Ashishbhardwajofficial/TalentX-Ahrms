package com.talentx.hrms.controller.leave;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.leave.LeaveRequestCreateDTO;
import com.talentx.hrms.dto.leave.LeaveRequestResponseDTO;
import com.talentx.hrms.entity.enums.LeaveStatus;
import com.talentx.hrms.service.leave.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/leaves", "/leave"})
@Tag(name = "Leave Management", description = "Leave request operations and management")
public class LeaveController {

    private final LeaveService leaveService;

    @Autowired
    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    /**
     * Get all leave requests with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get all leave requests", description = "Retrieve all leave requests with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<LeaveRequestResponseDTO>>> getAllLeaveRequests(
            @Parameter(description = "Employee ID filter") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "Leave status filter") @RequestParam(required = false) LeaveStatus status,
            @Parameter(description = "Start date filter (from)") @RequestParam(required = false) LocalDate startDateFrom,
            @Parameter(description = "Start date filter (to)") @RequestParam(required = false) LocalDate startDateTo,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "appliedAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<LeaveRequestResponseDTO> leaveRequests = leaveService.getAllLeaveRequests(
            employeeId, departmentId, status, startDateFrom, startDateTo, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Leave requests retrieved successfully", leaveRequests));
    }

    /**
     * Get leave requests for current user
     */
    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my leave requests", description = "Get leave requests for the current user")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponseDTO>>> getMyLeaveRequests(
            @Parameter(description = "Leave status filter") @RequestParam(required = false) LeaveStatus status,
            @Parameter(description = "Year filter") @RequestParam(required = false) Integer year) {
        
        List<LeaveRequestResponseDTO> leaveRequests = leaveService.getCurrentUserLeaveRequests(status, year);
        return ResponseEntity.ok(ApiResponse.success("My leave requests retrieved successfully", leaveRequests));
    }

    /**
     * Get leave requests for a specific employee
     */
    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @leaveService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Get employee leave requests", description = "Get leave requests for a specific employee")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponseDTO>>> getEmployeeLeaveRequests(
            @PathVariable Long employeeId,
            @Parameter(description = "Leave status filter") @RequestParam(required = false) LeaveStatus status,
            @Parameter(description = "Year filter") @RequestParam(required = false) Integer year) {
        
        List<LeaveRequestResponseDTO> leaveRequests = leaveService.getEmployeeLeaveRequests(employeeId, status, year);
        return ResponseEntity.ok(ApiResponse.success("Employee leave requests retrieved successfully", leaveRequests));
    }

    /**
     * Get leave request by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @leaveService.isCurrentUserRequest(#id)")
    @Operation(summary = "Get leave request by ID", description = "Retrieve a specific leave request by ID")
    public ResponseEntity<ApiResponse<LeaveRequestResponseDTO>> getLeaveRequest(@PathVariable Long id) {
        try {
            LeaveRequestResponseDTO leaveRequest = leaveService.getLeaveRequest(id);
            return ResponseEntity.ok(ApiResponse.success("Leave request retrieved successfully", leaveRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create new leave request
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create leave request", description = "Create a new leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponseDTO>> createLeaveRequest(
            @Valid @RequestBody LeaveRequestCreateDTO request) {
        try {
            LeaveRequestResponseDTO leaveRequest = leaveService.createLeaveRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave request created successfully", leaveRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update leave request (before approval)
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("@leaveService.isCurrentUserRequest(#id) and @leaveService.canModifyRequest(#id)")
    @Operation(summary = "Update leave request", description = "Update a pending leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponseDTO>> updateLeaveRequest(
            @PathVariable Long id,
            @Valid @RequestBody LeaveRequestCreateDTO request) {
        try {
            LeaveRequestResponseDTO leaveRequest = leaveService.updateLeaveRequest(id, request);
            return ResponseEntity.ok(ApiResponse.success("Leave request updated successfully", leaveRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cancel leave request
     */
    @PostMapping("/{id:\\d+}/cancel")
    @PreAuthorize("@leaveService.isCurrentUserRequest(#id) and @leaveService.canCancelRequest(#id)")
    @Operation(summary = "Cancel leave request", description = "Cancel a leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponseDTO>> cancelLeaveRequest(
            @PathVariable Long id,
            @Parameter(description = "Cancellation reason") @RequestParam String reason) {
        try {
            LeaveRequestResponseDTO leaveRequest = leaveService.cancelLeaveRequest(id, reason);
            return ResponseEntity.ok(ApiResponse.success("Leave request cancelled successfully", leaveRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Approve leave request
     */
    @PostMapping("/{id:\\d+}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Approve leave request", description = "Approve a pending leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponseDTO>> approveLeaveRequest(
            @PathVariable Long id,
            @Parameter(description = "Approval comments") @RequestParam(required = false) String comments) {
        try {
            LeaveRequestResponseDTO leaveRequest = leaveService.approveLeaveRequest(id, comments);
            return ResponseEntity.ok(ApiResponse.success("Leave request approved successfully", leaveRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reject leave request
     */
    @PostMapping("/{id:\\d+}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Reject leave request", description = "Reject a pending leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponseDTO>> rejectLeaveRequest(
            @PathVariable Long id,
            @Parameter(description = "Rejection reason") @RequestParam String reason) {
        try {
            LeaveRequestResponseDTO leaveRequest = leaveService.rejectLeaveRequest(id, reason);
            return ResponseEntity.ok(ApiResponse.success("Leave request rejected successfully", leaveRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get pending leave requests for approval
     */
    @GetMapping("/pending-approval")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get pending approvals", description = "Get leave requests pending approval")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponseDTO>>> getPendingApprovals() {
        List<LeaveRequestResponseDTO> pendingRequests = leaveService.getPendingApprovals();
        return ResponseEntity.ok(ApiResponse.success("Pending approvals retrieved successfully", pendingRequests));
    }

    /**
     * Get leave requests requiring manager approval
     */
    @GetMapping("/manager-approval")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get manager approval requests", description = "Get leave requests requiring current manager's approval")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponseDTO>>> getManagerApprovalRequests() {
        List<LeaveRequestResponseDTO> managerRequests = leaveService.getManagerApprovalRequests();
        return ResponseEntity.ok(ApiResponse.success("Manager approval requests retrieved successfully", managerRequests));
    }

    /**
     * Get leave balance for employee
     */
    @GetMapping("/balance/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @leaveService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get leave balance", description = "Get leave balance for an employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLeaveBalance(@PathVariable Long employeeId) {
        Map<String, Object> leaveBalance = leaveService.getLeaveBalance(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Leave balance retrieved successfully", leaveBalance));
    }

    /**
     * Get current user's leave balance
     */
    @GetMapping("/my-balance")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my leave balance", description = "Get leave balance for current user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyLeaveBalance() {
        Map<String, Object> leaveBalance = leaveService.getCurrentUserLeaveBalance();
        return ResponseEntity.ok(ApiResponse.success("My leave balance retrieved successfully", leaveBalance));
    }

    /**
     * Get leave calendar for a date range
     */
    @GetMapping("/calendar")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get leave calendar", description = "Get leave calendar for a specific date range")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaveCalendar(
            @Parameter(description = "Start date") @RequestParam LocalDate startDate,
            @Parameter(description = "End date") @RequestParam LocalDate endDate,
            @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId) {
        
        List<Map<String, Object>> leaveCalendar = leaveService.getLeaveCalendar(startDate, endDate, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Leave calendar retrieved successfully", leaveCalendar));
    }

    /**
     * Get leave statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get leave statistics", description = "Get comprehensive leave statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLeaveStatistics(
            @Parameter(description = "Year filter") @RequestParam(required = false) Integer year,
            @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId) {
        
        Map<String, Object> statistics = leaveService.getLeaveStatistics(year, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Leave statistics retrieved successfully", statistics));
    }

    /**
     * Get leave types
     */
    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get leave types", description = "Get all available leave types")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaveTypes() {
        List<Map<String, Object>> leaveTypes = leaveService.getLeaveTypes();
        return ResponseEntity.ok(ApiResponse.success("Leave types retrieved successfully", leaveTypes));
    }

    /**
     * Create leave type
     */
    @PostMapping("/types")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create leave type", description = "Create a new leave type")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createLeaveType(
            @RequestBody Map<String, Object> request) {
        try {
            Long orgId = request.get("organizationId") instanceof Number n ? n.longValue() : 1L;
            String name = (String) request.get("name");
            String code = (String) request.get("code");
            String description = (String) request.get("description");
            Boolean isPaid = request.get("isPaid") instanceof Boolean b ? b : true;
            Integer maxDays = request.get("maxDaysPerYear") instanceof Number n ? n.intValue() : null;
            Boolean requiresApproval = request.get("requiresApproval") instanceof Boolean b ? b : true;
            Boolean allowNegative = request.get("allowNegativeBalance") instanceof Boolean b ? b : false;
            Boolean isActive = request.get("isActive") instanceof Boolean b ? b : true;

            var leaveType = leaveService.createLeaveType(orgId, name, code, description,
                isPaid, maxDays, requiresApproval, allowNegative, isActive);

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", leaveType.getId());
            response.put("name", leaveType.getName());
            response.put("code", leaveType.getCode());
            response.put("description", leaveType.getDescription());
            response.put("isPaid", leaveType.getIsPaid());
            response.put("maxDaysPerYear", leaveType.getMaxDaysPerYear());
            response.put("requiresApproval", leaveType.getRequiresApproval());
            response.put("isActive", leaveType.getActive());

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave type created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Check leave availability
     */
    @PostMapping("/check-availability")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check leave availability", description = "Check if leave can be taken for specified dates")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkLeaveAvailability(
            @Parameter(description = "Employee ID") @RequestParam Long employeeId,
            @Parameter(description = "Leave type ID") @RequestParam Long leaveTypeId,
            @Parameter(description = "Start date") @RequestParam LocalDate startDate,
            @Parameter(description = "End date") @RequestParam LocalDate endDate) {
        
        Map<String, Object> availability = leaveService.checkLeaveAvailability(employeeId, leaveTypeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Leave availability checked", availability));
    }
}

