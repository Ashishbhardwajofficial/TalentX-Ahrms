package com.talentx.hrms.controller.shift;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.shift.EmployeeShiftResponse;
import com.talentx.hrms.dto.shift.ShiftAssignmentRequest;
import com.talentx.hrms.dto.shift.ShiftRequest;
import com.talentx.hrms.dto.shift.ShiftResponse;
import com.talentx.hrms.entity.attendance.EmployeeShift;
import com.talentx.hrms.entity.attendance.Shift;
import com.talentx.hrms.service.shift.ShiftService;
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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/shifts")
@Tag(name = "Shift Management", description = "Shift and shift assignment operations")
public class ShiftController {

    private final ShiftService shiftService;

    @Autowired
    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    /**
     * Create a new shift
     * POST /api/shifts
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create shift", description = "Create a new shift for an organization")
    public ResponseEntity<ApiResponse<ShiftResponse>> createShift(@Valid @RequestBody ShiftRequest request) {
        try {
            Shift shift = shiftService.createShift(
                request.getOrganizationId(),
                request.getName(),
                request.getDescription(),
                request.getStartTime(),
                request.getEndTime(),
                request.getBreakStartTime(),
                request.getBreakEndTime(),
                request.getGracePeriodMinutes(),
                request.getIsNightShift(),
                request.getIsFlexible(),
                request.getMinimumHours()
            );
            
            ShiftResponse response = ShiftResponse.fromEntity(shift);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shift created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get shift by ID
     * GET /api/shifts/{id}
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get shift", description = "Retrieve a shift by ID")
    public ResponseEntity<ApiResponse<ShiftResponse>> getShift(
            @Parameter(description = "Shift ID") @PathVariable Long id) {
        try {
            Shift shift = shiftService.getShift(id);
            ShiftResponse response = ShiftResponse.fromEntity(shift);
            return ResponseEntity.ok(ApiResponse.success("Shift retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update a shift
     * PUT /api/shifts/{id}
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update shift", description = "Update an existing shift")
    public ResponseEntity<ApiResponse<ShiftResponse>> updateShift(
            @Parameter(description = "Shift ID") @PathVariable Long id,
            @Valid @RequestBody ShiftRequest request) {
        try {
            Shift shift = shiftService.updateShift(
                id,
                request.getName(),
                request.getDescription(),
                request.getStartTime(),
                request.getEndTime(),
                request.getBreakStartTime(),
                request.getBreakEndTime(),
                request.getGracePeriodMinutes(),
                request.getIsNightShift(),
                request.getIsFlexible(),
                request.getMinimumHours()
            );
            
            ShiftResponse response = ShiftResponse.fromEntity(shift);
            return ResponseEntity.ok(ApiResponse.success("Shift updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete a shift
     * DELETE /api/shifts/{id}
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete shift", description = "Delete a shift")
    public ResponseEntity<ApiResponse<Void>> deleteShift(
            @Parameter(description = "Shift ID") @PathVariable Long id) {
        try {
            shiftService.deleteShift(id);
            return ResponseEntity.ok(ApiResponse.success("Shift deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * List shifts with pagination and filtering
     * GET /api/shifts
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "List shifts", description = "Retrieve shifts with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<ShiftResponse>>> listShifts(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Shift name (partial match)") @RequestParam(required = false) String name,
            @Parameter(description = "Is night shift") @RequestParam(required = false) Boolean isNightShift,
            @Parameter(description = "Is flexible") @RequestParam(required = false) Boolean isFlexible,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "startTime") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        try {
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            
            Page<Shift> shifts;
            if (name != null || isNightShift != null || isFlexible != null) {
                shifts = shiftService.searchShifts(organizationId, name, isNightShift, isFlexible, paginationRequest);
            } else {
                shifts = shiftService.getShifts(organizationId, paginationRequest);
            }
            
            Page<ShiftResponse> response = shifts.map(ShiftResponse::fromEntity);
            return ResponseEntity.ok(ApiResponse.success("Shifts retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Assign shift to employee
     * POST /api/shifts/assign
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Assign shift to employee", description = "Assign a shift to an employee with effective dates")
    public ResponseEntity<ApiResponse<EmployeeShiftResponse>> assignShift(
            @Valid @RequestBody ShiftAssignmentRequest request) {
        try {
            EmployeeShift employeeShift = shiftService.assignShiftToEmployee(
                request.getEmployeeId(),
                request.getShiftId(),
                request.getEffectiveDate(),
                request.getEndDate()
            );
            
            EmployeeShiftResponse response = EmployeeShiftResponse.fromEntity(employeeShift);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shift assigned to employee successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee shifts
     * GET /api/shifts/employee/{id}
     */
    @GetMapping("/employee/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @shiftService.isCurrentUser(#id)")
    @Operation(summary = "Get employee shifts", description = "Retrieve all shift assignments for an employee")
    public ResponseEntity<ApiResponse<List<EmployeeShiftResponse>>> getEmployeeShifts(
            @Parameter(description = "Employee ID") @PathVariable Long id) {
        try {
            List<EmployeeShift> employeeShifts = shiftService.getEmployeeShifts(id);
            List<EmployeeShiftResponse> response = employeeShifts.stream()
                .map(EmployeeShiftResponse::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Employee shifts retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get active shift for employee
     * GET /api/shifts/employee/{id}/active
     */
    @GetMapping("/employee/{id:\\d+}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @shiftService.isCurrentUser(#id)")
    @Operation(summary = "Get active employee shift", description = "Retrieve the current active shift for an employee")
    public ResponseEntity<ApiResponse<EmployeeShiftResponse>> getActiveEmployeeShift(
            @Parameter(description = "Employee ID") @PathVariable Long id) {
        try {
            EmployeeShift employeeShift = shiftService.getCurrentEmployeeShift(id);
            if (employeeShift == null) {
                return ResponseEntity.ok(ApiResponse.success("No active shift found", null));
            }
            return ResponseEntity.ok(ApiResponse.success("Active shift retrieved successfully",
                EmployeeShiftResponse.fromEntity(employeeShift)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all shift assignments
     * GET /api/shifts/assignments
     */
    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get all shift assignments", description = "Retrieve all employee shift assignments")
    public ResponseEntity<ApiResponse<List<EmployeeShiftResponse>>> getShiftAssignments(
            @Parameter(description = "Shift ID filter") @RequestParam(required = false) Long shiftId) {
        try {
            List<EmployeeShift> assignments;
            if (shiftId != null) {
                assignments = shiftService.getShiftAssignments(shiftId);
            } else {
                assignments = java.util.Collections.emptyList();
            }
            List<EmployeeShiftResponse> response = assignments.stream()
                .map(EmployeeShiftResponse::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Shift assignments retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update shift assignment (end date)
     * PUT /api/shifts/assignments/{id}
     */
    @PutMapping("/assignments/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Update shift assignment", description = "Update or end a shift assignment")
    public ResponseEntity<ApiResponse<EmployeeShiftResponse>> updateShiftAssignment(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> request) {
        try {
            java.time.LocalDate endDate = null;
            if (request.get("effectiveTo") != null) {
                endDate = java.time.LocalDate.parse(request.get("effectiveTo").toString());
            } else if (request.get("endDate") != null) {
                endDate = java.time.LocalDate.parse(request.get("endDate").toString());
            }
            EmployeeShift updated = shiftService.endEmployeeShift(id, endDate);
            return ResponseEntity.ok(ApiResponse.success("Shift assignment updated successfully",
                EmployeeShiftResponse.fromEntity(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete shift assignment
     * DELETE /api/shifts/assignments/{id}
     */
    @DeleteMapping("/assignments/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete shift assignment", description = "Remove a shift assignment")
    public ResponseEntity<ApiResponse<Void>> deleteShiftAssignment(@PathVariable Long id) {
        try {
            shiftService.endEmployeeShift(id, java.time.LocalDate.now());
            return ResponseEntity.ok(ApiResponse.success("Shift assignment removed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Check shift conflict for employee
     * GET /api/shifts/check-conflict
     */
    @GetMapping("/check-conflict")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Check shift conflict", description = "Check if an employee has a conflicting shift assignment")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> checkShiftConflict(
            @RequestParam Long employeeId,
            @RequestParam String effectiveFrom,
            @RequestParam(required = false) String effectiveTo) {
        try {
            java.time.LocalDate startDate = java.time.LocalDate.parse(effectiveFrom);
            java.time.LocalDate endDate = effectiveTo != null ? java.time.LocalDate.parse(effectiveTo) : null;

            // Use existing service method to check conflicts
            List<EmployeeShift> existing = shiftService.getEmployeeShifts(employeeId);
            boolean hasConflict = existing.stream().anyMatch(es ->
                es.getIsCurrent() != null && es.getIsCurrent() &&
                (endDate == null || !es.getEffectiveDate().isAfter(endDate)) &&
                (es.getEndDate() == null || !es.getEndDate().isBefore(startDate))
            );

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("hasConflict", hasConflict);
            result.put("conflictingAssignments", java.util.Collections.emptyList());
            if (hasConflict) {
                result.put("message", "Employee already has a shift assignment for the selected date range.");
            }
            return ResponseEntity.ok(ApiResponse.success("Conflict check completed", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}

