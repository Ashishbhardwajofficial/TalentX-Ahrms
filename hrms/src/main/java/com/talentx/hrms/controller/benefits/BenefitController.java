package com.talentx.hrms.controller.benefits;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.benefits.*;
import com.talentx.hrms.entity.benefits.BenefitPlan;
import com.talentx.hrms.entity.benefits.EmployeeBenefit;
import com.talentx.hrms.entity.enums.BenefitPlanType;
import com.talentx.hrms.entity.enums.BenefitStatus;
import com.talentx.hrms.entity.enums.CoverageLevel;
import com.talentx.hrms.mapper.BenefitMapper;
import com.talentx.hrms.service.benefits.BenefitService;
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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/benefits")
@Tag(name = "Benefits Management", description = "Benefit plan and employee benefit enrollment operations")
public class BenefitController {

    private final BenefitService benefitService;
    private final BenefitMapper benefitMapper;

    @Autowired
    public BenefitController(BenefitService benefitService, BenefitMapper benefitMapper) {
        this.benefitService = benefitService;
        this.benefitMapper = benefitMapper;
    }

    // ===== BENEFIT PLAN ENDPOINTS =====

    /**
     * Create a new benefit plan
     */
    @PostMapping("/plans")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create benefit plan", description = "Create a new benefit plan")
    public ResponseEntity<ApiResponse<BenefitPlanResponse>> createBenefitPlan(@Valid @RequestBody BenefitPlanRequest request) {
        try {
            BenefitPlan benefitPlan = benefitService.createBenefitPlan(
                request.getName(),
                request.getPlanType(),
                request.getDescription(),
                request.getProvider(),
                request.getEmployeeCost(),
                request.getEmployerCost(),
                request.getCostFrequency(),
                request.getEffectiveDate(),
                request.getExpiryDate()
            );
            
            BenefitPlanResponse response = benefitMapper.toBenefitPlanResponse(benefitPlan);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Benefit plan created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update an existing benefit plan
     */
    @PutMapping("/plans/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update benefit plan", description = "Update an existing benefit plan")
    public ResponseEntity<ApiResponse<BenefitPlanResponse>> updateBenefitPlan(
            @PathVariable Long id,
            @Valid @RequestBody BenefitPlanRequest request) {
        try {
            BenefitPlan benefitPlan = benefitService.updateBenefitPlan(
                id,
                request.getName(),
                request.getPlanType(),
                request.getDescription(),
                request.getProvider(),
                request.getEmployeeCost(),
                request.getEmployerCost(),
                request.getCostFrequency(),
                request.getEffectiveDate(),
                request.getExpiryDate(),
                request.getIsActive()
            );
            
            BenefitPlanResponse response = benefitMapper.toBenefitPlanResponse(benefitPlan);
            return ResponseEntity.ok(ApiResponse.success("Benefit plan updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get benefit plan by ID
     */
    @GetMapping("/plans/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get benefit plan by ID", description = "Retrieve a specific benefit plan by ID")
    public ResponseEntity<ApiResponse<BenefitPlanResponse>> getBenefitPlan(@PathVariable Long id) {
        try {
            BenefitPlan benefitPlan = benefitService.getBenefitPlan(id);
            BenefitPlanResponse response = benefitMapper.toBenefitPlanResponse(benefitPlan);
            return ResponseEntity.ok(ApiResponse.success("Benefit plan retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all benefit plans with pagination
     */
    @GetMapping("/plans")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get all benefit plans", description = "Retrieve all benefit plans with pagination")
    public ResponseEntity<ApiResponse<Page<BenefitPlanResponse>>> getAllBenefitPlans(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<BenefitPlan> benefitPlans = benefitService.getBenefitPlans(paginationRequest);
        Page<BenefitPlanResponse> response = benefitPlans.map(benefitMapper::toBenefitPlanResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Benefit plans retrieved successfully", response));
    }

    /**
     * Get active benefit plans
     */
    @GetMapping("/plans/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get active benefit plans", description = "Retrieve all active benefit plans")
    public ResponseEntity<ApiResponse<List<BenefitPlanResponse>>> getActiveBenefitPlans() {
        List<BenefitPlan> benefitPlans = benefitService.getActiveBenefitPlans();
        List<BenefitPlanResponse> response = benefitPlans.stream()
            .map(benefitMapper::toBenefitPlanResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Active benefit plans retrieved successfully", response));
    }

    /**
     * Search benefit plans
     */
    @GetMapping("/plans/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Search benefit plans", description = "Search benefit plans with various criteria")
    public ResponseEntity<ApiResponse<Page<BenefitPlanResponse>>> searchBenefitPlans(
            @Parameter(description = "Plan name") @RequestParam(required = false) String name,
            @Parameter(description = "Plan type") @RequestParam(required = false) BenefitPlanType planType,
            @Parameter(description = "Provider") @RequestParam(required = false) String provider,
            @Parameter(description = "Is active") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<BenefitPlan> benefitPlans = benefitService.searchBenefitPlans(name, planType, provider, isActive, paginationRequest);
        Page<BenefitPlanResponse> response = benefitPlans.map(benefitMapper::toBenefitPlanResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Benefit plan search completed", response));
    }

    /**
     * Delete benefit plan
     */
    @DeleteMapping("/plans/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete benefit plan", description = "Delete a benefit plan (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteBenefitPlan(@PathVariable Long id) {
        try {
            benefitService.deleteBenefitPlan(id);
            return ResponseEntity.ok(ApiResponse.success("Benefit plan deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== EMPLOYEE BENEFIT ENROLLMENT ENDPOINTS =====

    /**
     * Enroll employee in benefit plan
     */
    @PostMapping("/enrollments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Enroll employee", description = "Enroll an employee in a benefit plan")
    public ResponseEntity<ApiResponse<EmployeeBenefitResponse>> enrollEmployee(@Valid @RequestBody EmployeeBenefitRequest request) {
        try {
            EmployeeBenefit employeeBenefit = benefitService.enrollEmployee(
                request.getEmployeeId(),
                request.getBenefitPlanId(),
                request.getEnrollmentDate(),
                request.getEffectiveDate(),
                request.getCoverageLevel(),
                request.getBeneficiaries()
            );
            
            EmployeeBenefitResponse response = benefitMapper.toEmployeeBenefitResponse(employeeBenefit);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee enrolled successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update employee benefit enrollment
     */
    @PutMapping("/enrollments/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update employee benefit", description = "Update an employee benefit enrollment")
    public ResponseEntity<ApiResponse<EmployeeBenefitResponse>> updateEmployeeBenefit(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeBenefitUpdateRequest request) {
        try {
            EmployeeBenefit employeeBenefit = benefitService.updateEmployeeBenefit(
                id,
                request.getCoverageLevel(),
                request.getBeneficiaries()
            );
            
            EmployeeBenefitResponse response = benefitMapper.toEmployeeBenefitResponse(employeeBenefit);
            return ResponseEntity.ok(ApiResponse.success("Employee benefit updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Terminate employee benefit enrollment
     */
    @PutMapping("/enrollments/{id:\\d+}/terminate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Terminate employee benefit", description = "Terminate an employee benefit enrollment")
    public ResponseEntity<ApiResponse<EmployeeBenefitResponse>> terminateEmployeeBenefit(
            @PathVariable Long id,
            @Valid @RequestBody BenefitTerminationRequest request) {
        try {
            EmployeeBenefit employeeBenefit = benefitService.terminateEmployeeBenefit(
                id,
                request.getTerminationDate(),
                request.getTerminationReason()
            );
            
            EmployeeBenefitResponse response = benefitMapper.toEmployeeBenefitResponse(employeeBenefit);
            return ResponseEntity.ok(ApiResponse.success("Employee benefit terminated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee benefits
     */
    @GetMapping("/enrollments/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Get employee benefits", description = "Get all benefits for a specific employee")
    public ResponseEntity<ApiResponse<List<EmployeeBenefitResponse>>> getEmployeeBenefits(@PathVariable Long employeeId) {
        try {
            List<EmployeeBenefit> employeeBenefits = benefitService.getEmployeeBenefits(employeeId);
            List<EmployeeBenefitResponse> response = employeeBenefits.stream()
                .map(benefitMapper::toEmployeeBenefitResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Employee benefits retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get active employee benefits
     */
    @GetMapping("/enrollments/employee/{employeeId:\\d+}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Get active employee benefits", description = "Get active benefits for a specific employee")
    public ResponseEntity<ApiResponse<List<EmployeeBenefitResponse>>> getActiveEmployeeBenefits(@PathVariable Long employeeId) {
        try {
            List<EmployeeBenefit> employeeBenefits = benefitService.getActiveEmployeeBenefits(employeeId);
            List<EmployeeBenefitResponse> response = employeeBenefits.stream()
                .map(benefitMapper::toEmployeeBenefitResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Active employee benefits retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee benefit enrollment by ID
     */
    @GetMapping("/enrollments/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get employee benefit by ID", description = "Retrieve a specific employee benefit enrollment")
    public ResponseEntity<ApiResponse<EmployeeBenefitResponse>> getEmployeeBenefit(@PathVariable Long id) {
        try {
            EmployeeBenefit employeeBenefit = benefitService.getEmployeeBenefit(id);
            EmployeeBenefitResponse response = benefitMapper.toEmployeeBenefitResponse(employeeBenefit);
            return ResponseEntity.ok(ApiResponse.success("Employee benefit retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all employee benefits with pagination
     */
    @GetMapping("/enrollments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get all employee benefits", description = "Retrieve all employee benefits with pagination")
    public ResponseEntity<ApiResponse<Page<EmployeeBenefitResponse>>> getAllEmployeeBenefits(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeBenefit> employeeBenefits = benefitService.getAllEmployeeBenefits(paginationRequest);
        Page<EmployeeBenefitResponse> response = employeeBenefits.map(benefitMapper::toEmployeeBenefitResponse);

        return ResponseEntity.ok(ApiResponse.success("Employee benefits retrieved successfully", response));
    }

    /**
     * Delete employee benefit enrollment
     */
    @DeleteMapping("/enrollments/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete employee benefit", description = "Delete an employee benefit enrollment")
    public ResponseEntity<ApiResponse<Void>> deleteEmployeeBenefit(@PathVariable Long id) {
        try {
            benefitService.deleteEmployeeBenefit(id);
            return ResponseEntity.ok(ApiResponse.success("Employee benefit deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Search employee benefits
     */
    @GetMapping("/enrollments/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Search employee benefits", description = "Search employee benefits with various criteria")
    public ResponseEntity<ApiResponse<Page<EmployeeBenefitResponse>>> searchEmployeeBenefits(
            @Parameter(description = "Employee ID") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Benefit plan ID") @RequestParam(required = false) Long benefitPlanId,
            @Parameter(description = "Status") @RequestParam(required = false) BenefitStatus status,
            @Parameter(description = "Coverage level") @RequestParam(required = false) CoverageLevel coverageLevel,
            @Parameter(description = "Plan type") @RequestParam(required = false) BenefitPlanType planType,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeBenefit> employeeBenefits = benefitService.searchEmployeeBenefits(
            employeeId, benefitPlanId, status, coverageLevel, planType, paginationRequest);
        Page<EmployeeBenefitResponse> response = employeeBenefits.map(benefitMapper::toEmployeeBenefitResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Employee benefit search completed", response));
    }

    // ===== BENEFIT COST AND STATISTICS ENDPOINTS =====

    /**
     * Calculate employee benefit costs
     */
    @GetMapping("/enrollments/employee/{employeeId:\\d+}/costs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Calculate employee benefit costs", description = "Calculate total benefit costs for an employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateEmployeeBenefitCosts(@PathVariable Long employeeId) {
        try {
            BenefitService.BenefitCostSummary costSummary = benefitService.calculateEmployeeBenefitCosts(employeeId);
            
            Map<String, Object> response = Map.of(
                "totalEmployeeCost", costSummary.getTotalEmployeeCost(),
                "totalEmployerCost", costSummary.getTotalEmployerCost(),
                "totalCost", costSummary.getTotalCost(),
                "activeBenefitCount", costSummary.getActiveBenefitCount()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Benefit costs calculated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get benefit statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get benefit statistics", description = "Get comprehensive benefit statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBenefitStatistics() {
        BenefitService.BenefitStatistics stats = benefitService.getBenefitStatistics();
        
        Map<String, Object> response = Map.of(
            "totalPlans", stats.getTotalPlans(),
            "activePlans", stats.getActivePlans(),
            "totalEnrollments", stats.getTotalEnrollments(),
            "activeEnrollments", stats.getActiveEnrollments()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Benefit statistics retrieved successfully", response));
    }
}

