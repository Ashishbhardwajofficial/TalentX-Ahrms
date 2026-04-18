package com.talentx.hrms.controller.organization;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.organization.OrganizationRequest;
import com.talentx.hrms.dto.organization.OrganizationResponse;
import com.talentx.hrms.entity.enums.CompanySize;
import com.talentx.hrms.service.organization.OrganizationService;
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

@RestController
@RequestMapping("/organizations")
@Tag(name = "Organization Management", description = "Organization CRUD operations and management")
public class OrganizationController {

    private final OrganizationService organizationService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    /**
     * Create new organization
     * POST /api/organizations
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create organization", description = "Create a new organization record")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody OrganizationRequest request) {
        try {
            OrganizationResponse organization = organizationService.createOrganization(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Organization created successfully", organization));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get organization by ID
     * GET /api/organizations/{id}
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get organization by ID", description = "Retrieve a specific organization by its ID")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganization(@PathVariable Long id) {
        try {
            OrganizationResponse organization = organizationService.getOrganization(id);
            return ResponseEntity.ok(ApiResponse.success("Organization retrieved successfully", organization));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update organization
     * PUT /api/organizations/{id}
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update organization", description = "Update an existing organization record")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationRequest request) {
        try {
            OrganizationResponse organization = organizationService.updateOrganization(id, request);
            return ResponseEntity.ok(ApiResponse.success("Organization updated successfully", organization));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete organization
     * DELETE /api/organizations/{id}
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete organization", description = "Delete an organization record (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(@PathVariable Long id) {
        try {
            organizationService.deleteOrganization(id);
            return ResponseEntity.ok(ApiResponse.success("Organization deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all organizations with pagination
     * GET /api/organizations
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get all organizations", description = "Retrieve all organizations with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<OrganizationResponse>>> getAllOrganizations(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<OrganizationResponse> organizations = organizationService.getOrganizations(paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Organizations retrieved successfully", organizations));
    }

    /**
     * Search organizations with comprehensive criteria
     * GET /api/organizations/search
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Search organizations", description = "Search organizations with various criteria")
    public ResponseEntity<ApiResponse<Page<OrganizationResponse>>> searchOrganizations(
            @Parameter(description = "Organization name") @RequestParam(required = false) String name,
            @Parameter(description = "Industry") @RequestParam(required = false) String industry,
            @Parameter(description = "Company size") @RequestParam(required = false) CompanySize companySize,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<OrganizationResponse> organizations = organizationService.searchOrganizations(
            name, industry, companySize, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Organization search completed", organizations));
    }

    /**
     * Get active organizations
     * GET /api/organizations/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get active organizations", description = "Retrieve all active organizations")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getActiveOrganizations() {
        List<OrganizationResponse> organizations = organizationService.getActiveOrganizations();
        return ResponseEntity.ok(ApiResponse.success("Active organizations retrieved successfully", organizations));
    }

    /**
     * Get organizations by company size
     * GET /api/organizations/company-size/{companySize}
     */
    @GetMapping("/company-size/{companySize}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get organizations by company size", description = "Retrieve organizations filtered by company size")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getOrganizationsByCompanySize(
            @PathVariable CompanySize companySize) {
        List<OrganizationResponse> organizations = organizationService.getOrganizationsByCompanySize(companySize);
        return ResponseEntity.ok(ApiResponse.success("Organizations by company size retrieved successfully", organizations));
    }

    /**
     * Get organizations by industry
     * GET /api/organizations/industry/{industry}
     */
    @GetMapping("/industry/{industry}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get organizations by industry", description = "Retrieve organizations filtered by industry")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getOrganizationsByIndustry(
            @PathVariable String industry) {
        List<OrganizationResponse> organizations = organizationService.getOrganizationsByIndustry(industry);
        return ResponseEntity.ok(ApiResponse.success("Organizations by industry retrieved successfully", organizations));
    }

    /**
     * Activate organization
     * POST /api/organizations/{id}/activate
     */
    @PostMapping("/{id:\\d+}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate organization", description = "Activate an organization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> activateOrganization(@PathVariable Long id) {
        try {
            OrganizationResponse organization = organizationService.activateOrganization(id);
            return ResponseEntity.ok(ApiResponse.success("Organization activated successfully", organization));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Deactivate organization
     * POST /api/organizations/{id}/deactivate
     */
    @PostMapping("/{id:\\d+}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate organization", description = "Deactivate an organization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> deactivateOrganization(@PathVariable Long id) {
        try {
            OrganizationResponse organization = organizationService.deactivateOrganization(id);
            return ResponseEntity.ok(ApiResponse.success("Organization deactivated successfully", organization));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get organization statistics
     * GET /api/organizations/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get organization statistics", description = "Get comprehensive organization statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrganizationStatistics() {
        OrganizationService.OrganizationStatistics stats = organizationService.getOrganizationStatistics();
        
        Map<String, Object> statisticsMap = Map.of(
            "totalOrganizations", stats.getTotalOrganizations(),
            "activeOrganizations", stats.getActiveOrganizations(),
            "smallCompanies", stats.getSmallCompanies(),
            "mediumCompanies", stats.getMediumCompanies(),
            "largeCompanies", stats.getLargeCompanies(),
            "enterpriseCompanies", stats.getEnterpriseCompanies()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Organization statistics retrieved successfully", statisticsMap));
    }
}

