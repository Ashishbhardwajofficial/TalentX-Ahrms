package com.talentx.hrms.controller.employee;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.employee.EmployeeRequest;
import com.talentx.hrms.dto.employee.EmployeeResponse;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.service.employee.EmployeeService;
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
@RequestMapping("/employees")
@Tag(name = "Employee Management", description = "Employee CRUD operations and management")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Get all employees with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get all employees", description = "Retrieve all employees with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployees(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeResponse> employees = employeeService.getEmployees(paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Employees retrieved successfully", employees));
    }

    /**
     * Search employees with comprehensive criteria
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Search employees", description = "Search employees with various criteria")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> searchEmployees(
            @Parameter(description = "Employee name (first or last)") @RequestParam(required = false) String name,
            @Parameter(description = "Employee number") @RequestParam(required = false) String employeeNumber,
            @Parameter(description = "Job title") @RequestParam(required = false) String jobTitle,
            @Parameter(description = "Department ID") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "Location ID") @RequestParam(required = false) Long locationId,
            @Parameter(description = "Employment status") @RequestParam(required = false) EmploymentStatus employmentStatus,
            @Parameter(description = "Employment type") @RequestParam(required = false) EmploymentType employmentType,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeResponse> employees = employeeService.searchEmployees(
            name, employeeNumber, jobTitle, departmentId, locationId, 
            employmentStatus, employmentType, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Employee search completed", employees));
    }

    /**
     * Get employee by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUserOrManager(#id)")
    @Operation(summary = "Get employee by ID", description = "Retrieve a specific employee by their ID")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployee(@PathVariable Long id) {
        try {
            EmployeeResponse employee = employeeService.getEmployee(id);
            return ResponseEntity.ok(ApiResponse.success("Employee retrieved successfully", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Employee not found: " + e.getMessage()));
        }
    }

    /**
     * Create new employee
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create employee", description = "Create a new employee record")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        try {
            EmployeeResponse employee = employeeService.createEmployee(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update employee
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update employee", description = "Update an existing employee record")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id, 
            @Valid @RequestBody EmployeeRequest request) {
        try {
            EmployeeResponse employee = employeeService.updateEmployee(id, request);
            return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete employee
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete employee", description = "Delete an employee record (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employees by department
     */
    @GetMapping("/department/{departmentId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get employees by department", description = "Retrieve employees in a specific department")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getEmployeesByDepartment(
            @PathVariable Long departmentId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeResponse> employees = employeeService.getEmployeesByDepartment(departmentId, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Department employees retrieved successfully", employees));
    }

    /**
     * Get direct reports for a manager
     */
    @GetMapping("/{managerId:\\d+}/direct-reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @employeeService.isCurrentUser(#managerId)")
    @Operation(summary = "Get direct reports", description = "Get employees who report directly to a manager")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getDirectReports(@PathVariable Long managerId) {
        List<EmployeeResponse> directReports = employeeService.getDirectReports(managerId);
        return ResponseEntity.ok(ApiResponse.success("Direct reports retrieved successfully", directReports));
    }

    /**
     * Get employees on probation
     */
    @GetMapping("/probation")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get employees on probation", description = "Retrieve all employees currently on probation")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getEmployeesOnProbation() {
        List<EmployeeResponse> employees = employeeService.getEmployeesOnProbation();
        return ResponseEntity.ok(ApiResponse.success("Probation employees retrieved successfully", employees));
    }

    /**
     * Get employees with upcoming probation end dates
     */
    @GetMapping("/probation/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get upcoming probation ends", description = "Get employees with probation ending soon")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getUpcomingProbationEnds(
            @Parameter(description = "Days ahead to check") @RequestParam(defaultValue = "30") int daysAhead) {
        List<EmployeeResponse> employees = employeeService.getEmployeesWithUpcomingProbationEnd(daysAhead);
        return ResponseEntity.ok(ApiResponse.success("Upcoming probation ends retrieved successfully", employees));
    }

    /**
     * Get employees with birthdays this month
     */
    @GetMapping("/birthdays")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get birthday employees", description = "Get employees with birthdays in current month")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getBirthdayEmployees() {
        List<EmployeeResponse> employees = employeeService.getEmployeesWithBirthdaysThisMonth();
        return ResponseEntity.ok(ApiResponse.success("Birthday employees retrieved successfully", employees));
    }

    /**
     * Get managers
     */
    @GetMapping("/managers")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get managers", description = "Get all employees who are managers")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getManagers() {
        List<EmployeeResponse> managers = employeeService.getManagers();
        return ResponseEntity.ok(ApiResponse.success("Managers retrieved successfully", managers));
    }

    /**
     * Terminate employee
     */
    @PostMapping("/{id:\\d+}/terminate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Terminate employee", description = "Terminate an employee with termination details")
    public ResponseEntity<ApiResponse<EmployeeResponse>> terminateEmployee(
            @PathVariable Long id,
            @Parameter(description = "Termination date") @RequestParam LocalDate terminationDate,
            @Parameter(description = "Termination reason") @RequestParam String reason) {
        try {
            EmployeeResponse employee = employeeService.terminateEmployee(id, terminationDate, reason);
            return ResponseEntity.ok(ApiResponse.success("Employee terminated successfully", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reactivate terminated employee
     */
    @PostMapping("/{id:\\d+}/reactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Reactivate employee", description = "Reactivate a terminated employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> reactivateEmployee(@PathVariable Long id) {
        try {
            EmployeeResponse employee = employeeService.reactivateEmployee(id);
            return ResponseEntity.ok(ApiResponse.success("Employee reactivated successfully", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Confirm employee (end probation)
     */
    @PostMapping("/{id:\\d+}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Confirm employee", description = "Confirm employee and end probation period")
    public ResponseEntity<ApiResponse<EmployeeResponse>> confirmEmployee(
            @PathVariable Long id,
            @Parameter(description = "Confirmation date") @RequestParam LocalDate confirmationDate) {
        try {
            EmployeeResponse employee = employeeService.confirmEmployee(id, confirmationDate);
            return ResponseEntity.ok(ApiResponse.success("Employee confirmed successfully", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee statistics
     */
    @GetMapping({"/statistics", "/stats"})
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get employee statistics", description = "Get comprehensive employee statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeStatistics() {
        EmployeeService.EmployeeStatistics stats = employeeService.getEmployeeStatistics();
        
        Map<String, Object> statisticsMap = Map.of(
            "totalEmployees", stats.getTotalEmployees(),
            "activeEmployees", stats.getActiveEmployees(),
            "terminatedEmployees", stats.getTerminatedEmployees(),
            "fullTimeEmployees", stats.getFullTimeEmployees(),
            "partTimeEmployees", stats.getPartTimeEmployees()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Employee statistics retrieved successfully", statisticsMap));
    }
}

