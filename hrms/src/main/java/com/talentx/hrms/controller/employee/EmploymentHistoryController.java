package com.talentx.hrms.controller.employee;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.dto.employee.EmploymentHistoryRequest;
import com.talentx.hrms.dto.employee.EmploymentHistoryResponse;
import com.talentx.hrms.entity.employee.EmployeeEmploymentHistory;
import com.talentx.hrms.mapper.EmploymentHistoryMapper;
import com.talentx.hrms.service.employee.EmploymentHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/employment-history")
@Tag(name = "Employment History Management", description = "Employee employment history tracking and management")
public class EmploymentHistoryController {

    private final EmploymentHistoryService employmentHistoryService;
    private final EmploymentHistoryMapper employmentHistoryMapper;

    @Autowired
    public EmploymentHistoryController(EmploymentHistoryService employmentHistoryService,
                                     EmploymentHistoryMapper employmentHistoryMapper) {
        this.employmentHistoryService = employmentHistoryService;
        this.employmentHistoryMapper = employmentHistoryMapper;
    }

    /**
     * Get employment history for an employee
     */
    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee employment history", 
               description = "Retrieve employment history records for a specific employee")
    public ResponseEntity<ApiResponse<List<EmploymentHistoryResponse>>> getEmployeeHistory(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        List<EmployeeEmploymentHistory> historyList = employmentHistoryService.getEmployeeHistory(employeeId);
        List<EmploymentHistoryResponse> responseList = historyList.stream()
                .map(employmentHistoryMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Employment history retrieved successfully", responseList));
    }

    /**
     * Get current employment history record for an employee
     */
    @GetMapping("/employee/{employeeId:\\d+}/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get current employment record", 
               description = "Retrieve current employment history record for a specific employee")
    public ResponseEntity<ApiResponse<EmploymentHistoryResponse>> getCurrentEmploymentHistory(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        return employmentHistoryService.getCurrentEmploymentHistory(employeeId)
                .map(history -> {
                    EmploymentHistoryResponse response = employmentHistoryMapper.toResponse(history);
                    return ResponseEntity.ok(ApiResponse.success("Current employment history retrieved successfully", response));
                })
                .orElse(ResponseEntity.ok(ApiResponse.success("No current employment history found")));
    }

    /**
     * Create a new employment history record
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create employment history record", 
               description = "Create a new employment history record for an employee")
    public ResponseEntity<ApiResponse<EmploymentHistoryResponse>> createEmploymentHistory(
            @Valid @RequestBody EmploymentHistoryRequest request) {
        
        EmployeeEmploymentHistory history = employmentHistoryMapper.toEntity(request);
        EmployeeEmploymentHistory savedHistory = employmentHistoryService.createEmploymentHistory(history);
        EmploymentHistoryResponse response = employmentHistoryMapper.toResponse(savedHistory);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employment history record created successfully", response));
    }

    /**
     * Get employment history by change type
     */
    @GetMapping("/employee/{employeeId}/change-type/{changeType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employment history by change type", 
               description = "Retrieve employment history records for a specific employee filtered by change type")
    public ResponseEntity<ApiResponse<List<EmploymentHistoryResponse>>> getHistoryByChangeType(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId,
            @Parameter(description = "Change type (JOINING, PROMOTION, TRANSFER, SALARY_REVISION, ROLE_CHANGE)") 
            @PathVariable String changeType) {
        
        List<EmployeeEmploymentHistory> historyList = employmentHistoryService.getHistoryByChangeType(employeeId, changeType);
        List<EmploymentHistoryResponse> responseList = historyList.stream()
                .map(employmentHistoryMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(
                "Employment history for change type '" + changeType + "' retrieved successfully", responseList));
    }

    /**
     * Get promotions for an employee
     */
    @GetMapping("/employee/{employeeId:\\d+}/promotions")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee promotions", 
               description = "Retrieve promotion history for a specific employee")
    public ResponseEntity<ApiResponse<List<EmploymentHistoryResponse>>> getPromotions(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        List<EmployeeEmploymentHistory> promotions = employmentHistoryService.getPromotions(employeeId);
        List<EmploymentHistoryResponse> responseList = promotions.stream()
                .map(employmentHistoryMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Promotions retrieved successfully", responseList));
    }

    /**
     * Get transfers for an employee
     */
    @GetMapping("/employee/{employeeId:\\d+}/transfers")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee transfers", 
               description = "Retrieve transfer history for a specific employee")
    public ResponseEntity<ApiResponse<List<EmploymentHistoryResponse>>> getTransfers(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        List<EmployeeEmploymentHistory> transfers = employmentHistoryService.getTransfers(employeeId);
        List<EmploymentHistoryResponse> responseList = transfers.stream()
                .map(employmentHistoryMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Transfers retrieved successfully", responseList));
    }

    /**
     * Get salary revisions for an employee
     */
    @GetMapping("/employee/{employeeId:\\d+}/salary-revisions")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee salary revisions", 
               description = "Retrieve salary revision history for a specific employee")
    public ResponseEntity<ApiResponse<List<EmploymentHistoryResponse>>> getSalaryRevisions(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        List<EmployeeEmploymentHistory> salaryRevisions = employmentHistoryService.getSalaryRevisions(employeeId);
        List<EmploymentHistoryResponse> responseList = salaryRevisions.stream()
                .map(employmentHistoryMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Salary revisions retrieved successfully", responseList));
    }

    /**
     * Check if employee has employment history
     */
    @GetMapping("/employee/{employeeId:\\d+}/exists")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Check if employee has employment history", 
               description = "Check if an employee has any employment history records")
    public ResponseEntity<ApiResponse<Boolean>> hasEmploymentHistory(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        boolean hasHistory = employmentHistoryService.hasEmploymentHistory(employeeId);
        return ResponseEntity.ok(ApiResponse.success(
                hasHistory ? "Employee has employment history" : "Employee has no employment history", hasHistory));
    }

    /**
     * Get employment history count for an employee
     */
    @GetMapping("/employee/{employeeId:\\d+}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get employment history count", 
               description = "Get the count of employment history records for an employee")
    public ResponseEntity<ApiResponse<Long>> getHistoryCount(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        long count = employmentHistoryService.getHistoryCount(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Employment history count retrieved successfully", count));
    }
}

