package com.talentx.hrms.controller.permission;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.dto.permission.PermissionResponse;
import com.talentx.hrms.entity.security.Permission;
import com.talentx.hrms.mapper.PermissionMapper;
import com.talentx.hrms.service.permission.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/permissions")
@Tag(name = "Permission Management", description = "Permission retrieval and categorization")
public class PermissionController {

    private final PermissionService permissionService;
    private final PermissionMapper permissionMapper;

    @Autowired
    public PermissionController(PermissionService permissionService, PermissionMapper permissionMapper) {
        this.permissionService = permissionService;
        this.permissionMapper = permissionMapper;
    }

    /**
     * Get all permissions
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get all permissions", description = "Retrieve all permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions(
            @Parameter(description = "Search term") @RequestParam(required = false) String search) {
        
        List<Permission> permissions;
        if (search != null && !search.trim().isEmpty()) {
            permissions = permissionService.searchPermissions(search);
        } else {
            permissions = permissionService.getAllPermissions();
        }
        
        List<PermissionResponse> responses = permissions.stream()
            .map(permissionMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Permissions retrieved successfully", responses));
    }

    /**
     * Get permission by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get permission by ID", description = "Retrieve a specific permission by its ID")
    public ResponseEntity<ApiResponse<PermissionResponse>> getPermission(@PathVariable Long id) {
        try {
            Permission permission = permissionService.getPermission(id);
            PermissionResponse response = permissionMapper.toResponse(permission);
            return ResponseEntity.ok(ApiResponse.success("Permission retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get permissions grouped by category
     */
    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get permissions by category", description = "Retrieve permissions grouped by category (resource)")
    public ResponseEntity<ApiResponse<Map<String, List<PermissionResponse>>>> getPermissionsByCategory() {
        Map<String, List<Permission>> permissionsByCategory = permissionService.getPermissionsByCategory();
        
        Map<String, List<PermissionResponse>> responseMap = permissionsByCategory.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> entry.getValue().stream()
                    .map(permissionMapper::toResponse)
                    .collect(Collectors.toList())
            ));
        
        return ResponseEntity.ok(ApiResponse.success("Permissions by category retrieved successfully", responseMap));
    }

    /**
     * Get all permission categories
     */
    @GetMapping("/categories/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get all categories", description = "Retrieve list of all permission categories")
    public ResponseEntity<ApiResponse<List<String>>> getAllCategories() {
        List<String> categories = permissionService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    /**
     * Get permissions by specific category
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get permissions by specific category", description = "Retrieve permissions for a specific category")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getPermissionsBySpecificCategory(
            @PathVariable String category) {
        List<Permission> permissions = permissionService.getPermissionsBySpecificCategory(category);
        List<PermissionResponse> responses = permissions.stream()
            .map(permissionMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Permissions retrieved successfully", responses));
    }

    /**
     * Get system permissions
     */
    @GetMapping("/system")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get system permissions", description = "Retrieve system permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getSystemPermissions() {
        List<Permission> permissions = permissionService.getSystemPermissions();
        List<PermissionResponse> responses = permissions.stream()
            .map(permissionMapper::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("System permissions retrieved successfully", responses));
    }

    /**
     * Get permission statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get permission statistics", description = "Get comprehensive permission statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPermissionStatistics() {
        PermissionService.PermissionStatistics stats = permissionService.getPermissionStatistics();
        
        Map<String, Object> statisticsMap = Map.of(
            "totalPermissions", stats.getTotalPermissions(),
            "systemPermissions", stats.getSystemPermissions(),
            "categoriesCount", stats.getCategoriesCount()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Permission statistics retrieved successfully", statisticsMap));
    }
}

