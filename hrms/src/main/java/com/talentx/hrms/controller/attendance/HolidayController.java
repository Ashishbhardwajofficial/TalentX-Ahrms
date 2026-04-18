package com.talentx.hrms.controller.attendance;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.attendance.HolidayRequest;
import com.talentx.hrms.dto.attendance.HolidayResponse;
import com.talentx.hrms.dto.attendance.HolidayCalendarResponse;
import com.talentx.hrms.service.holiday.HolidayService;
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

@RestController
@RequestMapping("/holidays")
@Tag(name = "Holiday Management", description = "Holiday CRUD operations and calendar management")
public class HolidayController {

    private final HolidayService holidayService;

    @Autowired
    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }
    /**
     * Create new holiday
     * POST /api/holidays
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create holiday", description = "Create a new holiday record")
    public ResponseEntity<ApiResponse<HolidayResponse>> createHoliday(
            @Valid @RequestBody HolidayRequest request) {
        try {
            HolidayResponse holiday = holidayService.createHoliday(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Holiday created successfully", holiday));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get holiday by ID
     * GET /api/holidays/{id}
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get holiday by ID", description = "Retrieve a specific holiday by its ID")
    public ResponseEntity<ApiResponse<HolidayResponse>> getHoliday(@PathVariable Long id) {
        try {
            HolidayResponse holiday = holidayService.getHoliday(id);
            return ResponseEntity.ok(ApiResponse.success("Holiday retrieved successfully", holiday));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update holiday
     * PUT /api/holidays/{id}
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update holiday", description = "Update an existing holiday record")
    public ResponseEntity<ApiResponse<HolidayResponse>> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayRequest request) {
        try {
            HolidayResponse holiday = holidayService.updateHoliday(id, request);
            return ResponseEntity.ok(ApiResponse.success("Holiday updated successfully", holiday));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete holiday
     * DELETE /api/holidays/{id}
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete holiday", description = "Delete a holiday record")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable Long id) {
        try {
            holidayService.deleteHoliday(id);
            return ResponseEntity.ok(ApiResponse.success("Holiday deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    /**
     * Get all holidays with pagination
     * GET /api/holidays
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get all holidays", description = "Retrieve all holidays with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<HolidayResponse>>> getAllHolidays(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<HolidayResponse> holidays = holidayService.getHolidays(organizationId, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Holidays retrieved successfully", holidays));
    }

    /**
     * Search holidays with comprehensive criteria
     * GET /api/holidays/search
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Search holidays", description = "Search holidays with various criteria")
    public ResponseEntity<ApiResponse<Page<HolidayResponse>>> searchHolidays(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Holiday name") @RequestParam(required = false) String name,
            @Parameter(description = "Holiday type") @RequestParam(required = false) String type,
            @Parameter(description = "Is mandatory") @RequestParam(required = false) Boolean isMandatory,
            @Parameter(description = "Start date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<HolidayResponse> holidays = holidayService.searchHolidays(
            organizationId, name, type, isMandatory, startDate, endDate, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Holiday search completed", holidays));
    }
    /**
     * Get holiday calendar for a year
     * GET /api/holidays/calendar/{year}
     */
    @GetMapping("/calendar/{year:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get holiday calendar", description = "Get holiday calendar for a specific year")
    public ResponseEntity<ApiResponse<HolidayCalendarResponse>> getHolidayCalendar(
            @Parameter(description = "Year") @PathVariable int year,
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            HolidayCalendarResponse calendar = holidayService.generateHolidayCalendar(organizationId, year);
            return ResponseEntity.ok(ApiResponse.success("Holiday calendar retrieved successfully", calendar));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get holidays by year
     * GET /api/holidays/year/{year}
     */
    @GetMapping("/year/{year:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get holidays by year", description = "Get all holidays for a specific year")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getHolidaysByYear(
            @Parameter(description = "Year") @PathVariable int year,
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<HolidayResponse> holidays = holidayService.getHolidaysByYear(organizationId, year);
            return ResponseEntity.ok(ApiResponse.success("Holidays retrieved successfully", holidays));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get holidays by date range
     * GET /api/holidays/range
     */
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get holidays by date range", description = "Get holidays within a specific date range")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getHolidaysByDateRange(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<HolidayResponse> holidays = holidayService.getHolidaysByDateRange(organizationId, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Holidays retrieved successfully", holidays));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    /**
     * Get mandatory holidays
     * GET /api/holidays/mandatory
     */
    @GetMapping("/mandatory")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get mandatory holidays", description = "Get all mandatory holidays for an organization")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getMandatoryHolidays(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<HolidayResponse> holidays = holidayService.getMandatoryHolidays(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Mandatory holidays retrieved successfully", holidays));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get optional holidays
     * GET /api/holidays/optional
     */
    @GetMapping("/optional")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get optional holidays", description = "Get all optional holidays for an organization")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getOptionalHolidays(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<HolidayResponse> holidays = holidayService.getOptionalHolidays(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Optional holidays retrieved successfully", holidays));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get upcoming holidays
     * GET /api/holidays/upcoming
     */
    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get upcoming holidays", description = "Get all upcoming holidays for an organization")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getUpcomingHolidays(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<HolidayResponse> holidays = holidayService.getUpcomingHolidays(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Upcoming holidays retrieved successfully", holidays));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    /**
     * Get holidays by location
     * GET /api/holidays/location
     */
    @GetMapping("/location")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get holidays by location", description = "Get holidays applicable to a specific location")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getHolidaysByLocation(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Location") @RequestParam String location) {
        try {
            List<HolidayResponse> holidays = holidayService.getHolidaysByLocation(organizationId, location);
            return ResponseEntity.ok(ApiResponse.success("Location holidays retrieved successfully", holidays));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Check if a date is a holiday
     * GET /api/holidays/check
     */
    @GetMapping("/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Check if date is holiday", description = "Check if a specific date is a holiday")
    public ResponseEntity<ApiResponse<Boolean>> isHoliday(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Date to check") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            boolean isHoliday = holidayService.isHoliday(organizationId, date);
            return ResponseEntity.ok(ApiResponse.success("Holiday check completed", isHoliday));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Calculate leave days excluding holidays and weekends
     * GET /api/holidays/calculate-leave-days
     */
    @GetMapping("/calculate-leave-days")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Calculate leave days", description = "Calculate working days between dates excluding holidays and weekends")
    public ResponseEntity<ApiResponse<Integer>> calculateLeaveDays(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            int leaveDays = holidayService.calculateLeaveDays(organizationId, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Leave days calculated successfully", leaveDays));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get holiday statistics
     * GET /api/holidays/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get holiday statistics", description = "Get holiday statistics for an organization and year")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHolidayStatistics(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Year") @RequestParam int year) {
        try {
            Map<String, Object> statistics = holidayService.getHolidayStatistics(organizationId, year);
            return ResponseEntity.ok(ApiResponse.success("Holiday statistics retrieved successfully", statistics));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}

