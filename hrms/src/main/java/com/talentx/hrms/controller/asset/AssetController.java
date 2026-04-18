package com.talentx.hrms.controller.asset;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.asset.*;
import com.talentx.hrms.entity.assets.Asset;
import com.talentx.hrms.entity.assets.AssetAssignment;
import com.talentx.hrms.entity.enums.AssetStatus;
import com.talentx.hrms.entity.enums.AssetType;
import com.talentx.hrms.mapper.AssetMapper;
import com.talentx.hrms.service.asset.AssetService;
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
@RequestMapping("/assets")
@Tag(name = "Asset Management", description = "Asset management and assignment operations")
public class AssetController {

    private final AssetService assetService;
    private final AssetMapper assetMapper;

    @Autowired
    public AssetController(AssetService assetService, AssetMapper assetMapper) {
        this.assetService = assetService;
        this.assetMapper = assetMapper;
    }

    // ===== ASSET MANAGEMENT ENDPOINTS =====

    /**
     * Create a new asset
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN')")
    @Operation(summary = "Create asset", description = "Create a new asset")
    public ResponseEntity<ApiResponse<AssetResponse>> createAsset(@Valid @RequestBody AssetRequest request) {
        try {
            Asset asset = assetService.createAsset(
                request.getAssetType(),
                request.getAssetTag(),
                request.getSerialNumber()
            );
            
            AssetResponse response = assetMapper.toAssetResponse(asset);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update an existing asset
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN')")
    @Operation(summary = "Update asset", description = "Update an existing asset")
    public ResponseEntity<ApiResponse<AssetResponse>> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request) {
        try {
            Asset asset = assetService.updateAsset(
                id,
                request.getAssetType(),
                request.getAssetTag(),
                request.getSerialNumber(),
                request.getStatus()
            );
            
            AssetResponse response = assetMapper.toAssetResponse(asset);
            return ResponseEntity.ok(ApiResponse.success("Asset updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get asset by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get asset by ID", description = "Retrieve a specific asset by ID")
    public ResponseEntity<ApiResponse<AssetResponse>> getAsset(@PathVariable Long id) {
        try {
            Asset asset = assetService.getAsset(id);
            AssetResponse response = assetMapper.toAssetResponse(asset);
            return ResponseEntity.ok(ApiResponse.success("Asset retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all assets with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER')")
    @Operation(summary = "Get all assets", description = "Retrieve all assets with pagination")
    public ResponseEntity<ApiResponse<Page<AssetResponse>>> getAllAssets(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<Asset> assets = assetService.getAssets(paginationRequest);
        Page<AssetResponse> response = assets.map(assetMapper::toAssetResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Assets retrieved successfully", response));
    }

    /**
     * Search assets
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER')")
    @Operation(summary = "Search assets", description = "Search assets with various criteria")
    public ResponseEntity<ApiResponse<Page<AssetResponse>>> searchAssets(
            @Parameter(description = "Search term") @RequestParam(required = false) String search,
            @Parameter(description = "Asset type") @RequestParam(required = false) AssetType assetType,
            @Parameter(description = "Asset status") @RequestParam(required = false) AssetStatus status,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<Asset> assets = assetService.searchAssets(search, assetType, status, paginationRequest);
        Page<AssetResponse> response = assets.map(assetMapper::toAssetResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Asset search completed", response));
    }

    /**
     * Get available assets
     */
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER')")
    @Operation(summary = "Get available assets", description = "Retrieve all available assets")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getAvailableAssets() {
        List<Asset> assets = assetService.getAvailableAssets();
        List<AssetResponse> response = assets.stream()
            .map(assetMapper::toAssetResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Available assets retrieved successfully", response));
    }

    /**
     * Delete asset
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete asset", description = "Delete an asset (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(@PathVariable Long id) {
        try {
            assetService.deleteAsset(id);
            return ResponseEntity.ok(ApiResponse.success("Asset deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ===== ASSET ASSIGNMENT ENDPOINTS =====

    /**
     * Assign asset to employee
     */
    @PostMapping("/{id:\\d+}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER')")
    @Operation(summary = "Assign asset", description = "Assign an asset to an employee")
    public ResponseEntity<ApiResponse<AssetAssignmentResponse>> assignAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetAssignmentRequest request) {
        try {
            AssetAssignment assignment = assetService.assignAsset(
                id,
                request.getEmployeeId(),
                request.getAssignedDate()
            );
            
            AssetAssignmentResponse response = assetMapper.toAssetAssignmentResponse(assignment);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset assigned successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Return asset from employee
     */
    @PostMapping("/{id:\\d+}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER')")
    @Operation(summary = "Return asset", description = "Return an asset from an employee")
    public ResponseEntity<ApiResponse<AssetAssignmentResponse>> returnAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetReturnRequest request) {
        try {
            AssetAssignment assignment = assetService.returnAsset(
                id,
                request.getReturnedDate()
            );
            
            AssetAssignmentResponse response = assetMapper.toAssetAssignmentResponse(assignment);
            return ResponseEntity.ok(ApiResponse.success("Asset returned successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee assets (currently assigned)
     */
    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER') or @employeeService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Get employee assets", description = "Get all assets currently assigned to an employee")
    public ResponseEntity<ApiResponse<List<AssetAssignmentResponse>>> getEmployeeAssets(@PathVariable Long employeeId) {
        try {
            List<AssetAssignment> assignments = assetService.getEmployeeAssets(employeeId);
            List<AssetAssignmentResponse> response = assignments.stream()
                .map(assetMapper::toAssetAssignmentResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Employee assets retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee assignment history
     */
    @GetMapping("/employee/{employeeId:\\d+}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER') or @employeeService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Get employee assignment history", description = "Get all asset assignments for an employee (including returned)")
    public ResponseEntity<ApiResponse<Page<AssetAssignmentResponse>>> getEmployeeAssignmentHistory(
            @PathVariable Long employeeId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        try {
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            Page<AssetAssignment> assignments = assetService.getEmployeeAssignmentHistory(employeeId, paginationRequest);
            Page<AssetAssignmentResponse> response = assignments.map(assetMapper::toAssetAssignmentResponse);
            
            return ResponseEntity.ok(ApiResponse.success("Employee assignment history retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get asset assignment history
     */
    @GetMapping("/{id:\\d+}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER')")
    @Operation(summary = "Get asset assignment history", description = "Get assignment history for a specific asset")
    public ResponseEntity<ApiResponse<Page<AssetAssignmentResponse>>> getAssetAssignmentHistory(
            @PathVariable Long id,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        try {
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            Page<AssetAssignment> assignments = assetService.getAssetAssignmentHistory(id, paginationRequest);
            Page<AssetAssignmentResponse> response = assignments.map(assetMapper::toAssetAssignmentResponse);
            
            return ResponseEntity.ok(ApiResponse.success("Asset assignment history retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all assignments with pagination
     */
    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN')")
    @Operation(summary = "Get all assignments", description = "Retrieve all asset assignments with pagination")
    public ResponseEntity<ApiResponse<Page<AssetAssignmentResponse>>> getAllAssignments(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<AssetAssignment> assignments = assetService.getAllAssignments(paginationRequest);
        Page<AssetAssignmentResponse> response = assignments.map(assetMapper::toAssetAssignmentResponse);
        
        return ResponseEntity.ok(ApiResponse.success("Asset assignments retrieved successfully", response));
    }

    /**
     * Get active assignments
     */
    @GetMapping("/assignments/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN', 'MANAGER')")
    @Operation(summary = "Get active assignments", description = "Retrieve all active asset assignments")
    public ResponseEntity<ApiResponse<List<AssetAssignmentResponse>>> getActiveAssignments() {
        List<AssetAssignment> assignments = assetService.getActiveAssignments();
        List<AssetAssignmentResponse> response = assignments.stream()
            .map(assetMapper::toAssetAssignmentResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Active assignments retrieved successfully", response));
    }

    // ===== ASSET STATISTICS ENDPOINTS =====

    /**
     * Get asset statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'IT_ADMIN')")
    @Operation(summary = "Get asset statistics", description = "Get comprehensive asset statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAssetStatistics() {
        AssetService.AssetStatistics stats = assetService.getAssetStatistics();
        
        Map<String, Object> response = Map.of(
            "totalAssets", stats.getTotalAssets(),
            "availableAssets", stats.getAvailableAssets(),
            "assignedAssets", stats.getAssignedAssets(),
            "damagedAssets", stats.getDamagedAssets(),
            "retiredAssets", stats.getRetiredAssets(),
            "utilizationRate", stats.getUtilizationRate()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Asset statistics retrieved successfully", response));
    }
}

