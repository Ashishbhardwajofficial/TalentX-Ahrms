package com.talentx.hrms.controller.organization;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.organization.DepartmentRequest;
import com.talentx.hrms.dto.organization.DepartmentResponse;
import com.talentx.hrms.service.organization.DepartmentService;
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

@RestController
@RequestMapping("/departments")
@Tag(name = "Department Management", description = "Department CRUD operations and hierarchy management")
public class DepartmentController {

    private final DepartmentService departmentService;

    @org.springframework.beans.factory.annotation.Autowired
    private com.talentx.hrms.common.SecurityUtils securityUtils;

    @Autowired
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    /**
     * Create new department
     * POST /api/departments
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create department", description = "Create a new department record")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentRequest request) {
        try {
            DepartmentResponse department = departmentService.createDepartment(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully", department));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get department by ID
     * GET /api/departments/{id}
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get department by ID", description = "Retrieve a specific department by its ID")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartment(@PathVariable Long id) {
        try {
            DepartmentResponse department = departmentService.getDepartment(id);
            return ResponseEntity.ok(ApiResponse.success("Department retrieved successfully", department));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update department
     * PUT /api/departments/{id}
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update department", description = "Update an existing department record")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request) {
        try {
            DepartmentResponse department = departmentService.updateDepartment(id, request);
            return ResponseEntity.ok(ApiResponse.success("Department updated successfully", department));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete department
     * DELETE /api/departments/{id}
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete department", description = "Delete a department record")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.ok(ApiResponse.success("Department deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all departments with pagination
     * GET /api/departments
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get all departments", description = "Retrieve all departments for an organization with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<DepartmentResponse>>> getAllDepartments(
            @Parameter(description = "Organization ID (optional — auto-resolved from current user)") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        try {
            // Auto-resolve organizationId from current user if not provided
            Long resolvedOrgId = organizationId != null ? organizationId : securityUtils.getCurrentUserOrgId();
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            Page<DepartmentResponse> departments = departmentService.getDepartments(resolvedOrgId, paginationRequest);
            
            return ResponseEntity.ok(ApiResponse.success("Departments retrieved successfully", departments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Search departments by name
     * GET /api/departments/search
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Search departments", description = "Search departments by name within an organization")
    public ResponseEntity<ApiResponse<Page<DepartmentResponse>>> searchDepartments(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Department name") @RequestParam String name,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        try {
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            Page<DepartmentResponse> departments = departmentService.searchDepartments(organizationId, name, paginationRequest);
            
            return ResponseEntity.ok(ApiResponse.success("Department search completed", departments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get root departments (departments without parent)
     * GET /api/departments/roots
     */
    @GetMapping("/roots")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get root departments", description = "Retrieve all root departments (departments without parent) for an organization")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getRootDepartments(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<DepartmentResponse> departments = departmentService.getRootDepartments(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Root departments retrieved successfully", departments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get sub-departments of a parent department
     * GET /api/departments/{id}/sub-departments
     */
    @GetMapping("/{id:\\d+}/sub-departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get sub-departments", description = "Retrieve all sub-departments of a parent department")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getSubDepartments(@PathVariable Long id) {
        try {
            List<DepartmentResponse> departments = departmentService.getSubDepartments(id);
            return ResponseEntity.ok(ApiResponse.success("Sub-departments retrieved successfully", departments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get department hierarchy tree
     * GET /api/departments/hierarchy
     */
    @GetMapping("/hierarchy")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get department hierarchy", description = "Retrieve complete department hierarchy tree for an organization")
    public ResponseEntity<ApiResponse<List<DepartmentService.DepartmentHierarchyNode>>> getDepartmentHierarchy(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<DepartmentService.DepartmentHierarchyNode> hierarchy = departmentService.getDepartmentHierarchy(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Department hierarchy retrieved successfully", hierarchy));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}

