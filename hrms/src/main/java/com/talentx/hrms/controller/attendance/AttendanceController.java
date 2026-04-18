package com.talentx.hrms.controller.attendance;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.dto.attendance.*;
import com.talentx.hrms.entity.enums.AttendanceStatus;
import com.talentx.hrms.service.attendance.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@Tag(name = "Attendance Management", description = "Attendance tracking and management operations")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * Check in an employee
     * POST /api/attendance/check-in
     */
    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    @Operation(summary = "Check in employee", description = "Record employee check-in with timestamp and location")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> checkIn(@Valid @RequestBody CheckInRequest request) {
        try {
            AttendanceRecordResponse response = attendanceService.checkIn(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Check-in recorded successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Check out an employee
     * POST /api/attendance/check-out
     */
    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    @Operation(summary = "Check out employee", description = "Record employee check-out with timestamp and calculate hours worked")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> checkOut(@Valid @RequestBody CheckOutRequest request) {
        try {
            AttendanceRecordResponse response = attendanceService.checkOut(request);
            return ResponseEntity.ok(ApiResponse.success("Check-out recorded successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get attendance records with filtering and pagination
     * GET /api/attendance/records
     */
    @GetMapping("/records")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get attendance records", description = "Retrieve attendance records with filtering and pagination")
    public ResponseEntity<ApiResponse<Page<AttendanceRecordResponse>>> getAttendanceRecords(
            @Parameter(description = "Organization ID") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "Employee name") @RequestParam(required = false) String employeeName,
            @Parameter(description = "Attendance status") @RequestParam(required = false) AttendanceStatus status,
            @Parameter(description = "Start date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "attendanceDate") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<AttendanceRecordResponse> records = attendanceService.getAttendanceRecords(
            organizationId, employeeName, status, startDate, endDate, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved successfully", records));
    }

    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get attendance record by ID", description = "Retrieve a single attendance record by ID")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> getAttendanceRecord(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Attendance record retrieved successfully", attendanceService.getAttendanceRecord(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create attendance record", description = "Create a manual attendance record")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> createAttendanceRecord(@Valid @RequestBody AttendanceRecordRequest request) {
        AttendanceRecordResponse response = attendanceService.createAttendanceRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Attendance record created successfully", response));
    }

    /**
     * Get attendance records for a specific employee
     * GET /api/attendance/employee/{id}
     */
    @GetMapping("/employee/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @attendanceService.isCurrentUser(#id)")
    @Operation(summary = "Get employee attendance", description = "Retrieve attendance records for a specific employee")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getEmployeeAttendance(
            @Parameter(description = "Employee ID") @PathVariable Long id,
            @Parameter(description = "Start date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            List<AttendanceRecordResponse> records = attendanceService.getEmployeeAttendance(id, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Employee attendance retrieved successfully", records));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/employee/{id:\\d+}/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @attendanceService.isCurrentUser(#id)")
    @Operation(summary = "Get employee attendance by date range", description = "Retrieve attendance records for a specific employee within a date range")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getEmployeeAttendanceByDateRange(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
            "Employee attendance retrieved successfully",
            attendanceService.getEmployeeAttendanceByDateRange(id, startDate, endDate)
        ));
    }

    @GetMapping("/employee/{id:\\d+}/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @attendanceService.isCurrentUser(#id)")
    @Operation(summary = "Get today's attendance for employee", description = "Retrieve today's attendance record for a specific employee")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> getEmployeeTodayAttendance(@PathVariable Long id) {
        // Returns null data when employee hasn't checked in yet today — that's a valid empty state
        return ResponseEntity.ok(ApiResponse.success(
            "Today's attendance retrieved successfully",
            attendanceService.getTodayAttendanceForEmployee(id)
        ));
    }

    /**
     * Get attendance summary — matches frontend /attendance/summary
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get attendance summary")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAttendanceSummary(
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
            "Attendance summary retrieved",
            attendanceService.getAttendanceSummary(organizationId, startDate, endDate)
        ));
    }

    /**
     * Get today's attendance — matches frontend /attendance/today
     */
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get today's attendance records")
    public ResponseEntity<ApiResponse<java.util.List<AttendanceRecordResponse>>> getTodayAttendance(
            @RequestParam(required = false) Long organizationId) {
        try {
            java.time.LocalDate today = java.time.LocalDate.now();
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 500);
            org.springframework.data.domain.Page<AttendanceRecordResponse> records =
                attendanceService.getAttendanceRecords(organizationId, null, null, today, today, pageable);
            return ResponseEntity.ok(ApiResponse.success("Today's attendance retrieved", records.getContent()));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.success("Today's attendance retrieved", java.util.List.of()));
        }
    }

    @GetMapping("/department/{departmentId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get department attendance", description = "Retrieve attendance records for a department")
    public ResponseEntity<ApiResponse<Page<AttendanceRecordResponse>>> getDepartmentAttendance(
            @PathVariable Long departmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "attendanceDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(ApiResponse.success(
            "Department attendance retrieved successfully",
            attendanceService.getDepartmentAttendance(departmentId, startDate, endDate, pageable)
        ));
    }

    /**
     * Update an attendance record
     * PUT /api/attendance/{id}
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update attendance record", description = "Update an existing attendance record")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> updateAttendanceRecord(
            @Parameter(description = "Attendance record ID") @PathVariable Long id,
            @Valid @RequestBody AttendanceRecordRequest request) {
        
        try {
            AttendanceRecordResponse response = attendanceService.updateAttendanceRecord(id, request);
            return ResponseEntity.ok(ApiResponse.success("Attendance record updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete attendance record", description = "Delete an attendance record by ID")
    public ResponseEntity<ApiResponse<Void>> deleteAttendanceRecord(@PathVariable Long id) {
        attendanceService.deleteAttendanceRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Attendance record deleted successfully"));
    }

    @PutMapping("/{id:\\d+}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Approve attendance record", description = "Approve an attendance record")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> approveAttendance(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long approverId = request.get("approverId");
        return ResponseEntity.ok(ApiResponse.success(
            "Attendance record approved successfully",
            attendanceService.approveAttendance(id, approverId)
        ));
    }

    @PostMapping("/bulk-approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Bulk approve attendance records", description = "Approve multiple attendance records at once")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> bulkApproveAttendance(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Integer> ids = (List<Integer>) request.getOrDefault("ids", List.of());
        Long approverId = request.get("approverId") instanceof Number number ? number.longValue() : null;
        List<Long> normalizedIds = ids.stream().map(Integer::longValue).toList();
        return ResponseEntity.ok(ApiResponse.success(
            "Attendance records approved successfully",
            attendanceService.bulkApproveAttendance(normalizedIds, approverId)
        ));
    }

    /**
     * Generate attendance report for an employee
     * GET /api/attendance/employee/{id}/report
     */
    @GetMapping("/employee/{id:\\d+}/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @attendanceService.isCurrentUser(#id)")
    @Operation(summary = "Generate attendance report", description = "Generate attendance summary report for an employee")
    public ResponseEntity<ApiResponse<AttendanceReportResponse>> generateAttendanceReport(
            @Parameter(description = "Employee ID") @PathVariable Long id,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            AttendanceReportResponse report = attendanceService.generateAttendanceReport(id, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Attendance report generated successfully", report));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Generate attendance report", description = "Generate attendance report using query params")
    public ResponseEntity<ApiResponse<AttendanceReportResponse>> generateAttendanceReportFromQuery(
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return generateAttendanceReport(employeeId, startDate, endDate);
    }
}

