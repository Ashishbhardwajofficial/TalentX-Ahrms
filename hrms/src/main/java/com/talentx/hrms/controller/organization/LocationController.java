package com.talentx.hrms.controller.organization;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.organization.LocationRequest;
import com.talentx.hrms.dto.organization.LocationResponse;
import com.talentx.hrms.service.organization.LocationService;
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
@RequestMapping("/locations")
@Tag(name = "Location Management", description = "Location CRUD operations and management")
public class LocationController {

    private final LocationService locationService;

    @Autowired
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    /**
     * Create new location
     * POST /api/locations
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create location", description = "Create a new location record")
    public ResponseEntity<ApiResponse<LocationResponse>> createLocation(
            @Valid @RequestBody LocationRequest request) {
        try {
            LocationResponse location = locationService.createLocation(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Location created successfully", location));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get location by ID
     * GET /api/locations/{id}
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get location by ID", description = "Retrieve a specific location by its ID")
    public ResponseEntity<ApiResponse<LocationResponse>> getLocation(@PathVariable Long id) {
        try {
            LocationResponse location = locationService.getLocation(id);
            return ResponseEntity.ok(ApiResponse.success("Location retrieved successfully", location));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update location
     * PUT /api/locations/{id}
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update location", description = "Update an existing location record")
    public ResponseEntity<ApiResponse<LocationResponse>> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest request) {
        try {
            LocationResponse location = locationService.updateLocation(id, request);
            return ResponseEntity.ok(ApiResponse.success("Location updated successfully", location));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete location
     * DELETE /api/locations/{id}
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete location", description = "Delete a location record (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable Long id) {
        try {
            locationService.deleteLocation(id);
            return ResponseEntity.ok(ApiResponse.success("Location deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all locations with pagination
     * GET /api/locations
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get all locations", description = "Retrieve all locations with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<LocationResponse>>> getAllLocations(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<LocationResponse> locations = locationService.getLocations(paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Locations retrieved successfully", locations));
    }

    /**
     * Get locations by organization
     * GET /api/locations/organization/{organizationId}
     */
    @GetMapping("/organization/{organizationId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get locations by organization", description = "Retrieve all locations for a specific organization")
    public ResponseEntity<ApiResponse<Page<LocationResponse>>> getLocationsByOrganization(
            @PathVariable Long organizationId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        try {
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            Page<LocationResponse> locations = locationService.getLocationsByOrganization(
                organizationId, paginationRequest);
            
            return ResponseEntity.ok(ApiResponse.success("Locations retrieved successfully", locations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Search locations by name
     * GET /api/locations/search
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Search locations", description = "Search locations by name within an organization")
    public ResponseEntity<ApiResponse<Page<LocationResponse>>> searchLocations(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Location name") @RequestParam String name,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        try {
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            Page<LocationResponse> locations = locationService.searchLocationsByName(
                organizationId, name, paginationRequest);
            
            return ResponseEntity.ok(ApiResponse.success("Location search completed", locations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get locations by city
     * GET /api/locations/city
     */
    @GetMapping("/city")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get locations by city", description = "Retrieve locations filtered by city")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getLocationsByCity(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "City name") @RequestParam String city) {
        
        try {
            List<LocationResponse> locations = locationService.getLocationsByCity(organizationId, city);
            return ResponseEntity.ok(ApiResponse.success("Locations by city retrieved successfully", locations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get locations by country
     * GET /api/locations/country
     */
    @GetMapping("/country")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get locations by country", description = "Retrieve locations filtered by country")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getLocationsByCountry(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Country name") @RequestParam String country) {
        
        try {
            List<LocationResponse> locations = locationService.getLocationsByCountry(organizationId, country);
            return ResponseEntity.ok(ApiResponse.success("Locations by country retrieved successfully", locations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get locations by state/province
     * GET /api/locations/state
     */
    @GetMapping("/state")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get locations by state/province", description = "Retrieve locations filtered by state or province")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getLocationsByStateProvince(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "State/Province name") @RequestParam String stateProvince) {
        
        try {
            List<LocationResponse> locations = locationService.getLocationsByStateProvince(
                organizationId, stateProvince);
            return ResponseEntity.ok(ApiResponse.success("Locations by state/province retrieved successfully", locations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get headquarters location
     * GET /api/locations/headquarters/{organizationId}
     */
    @GetMapping("/headquarters/{organizationId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get headquarters location", description = "Retrieve the headquarters location for an organization")
    public ResponseEntity<ApiResponse<LocationResponse>> getHeadquarters(@PathVariable Long organizationId) {
        try {
            LocationResponse location = locationService.getHeadquarters(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Headquarters location retrieved successfully", location));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get active locations
     * GET /api/locations/active/{organizationId}
     */
    @GetMapping("/active/{organizationId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get active locations", description = "Retrieve all active locations for an organization")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getActiveLocations(@PathVariable Long organizationId) {
        try {
            List<LocationResponse> locations = locationService.getActiveLocations(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Active locations retrieved successfully", locations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Activate location
     * POST /api/locations/{id}/activate
     */
    @PostMapping("/{id:\\d+}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Activate location", description = "Activate a location")
    public ResponseEntity<ApiResponse<LocationResponse>> activateLocation(@PathVariable Long id) {
        try {
            LocationResponse location = locationService.activateLocation(id);
            return ResponseEntity.ok(ApiResponse.success("Location activated successfully", location));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Deactivate location
     * POST /api/locations/{id}/deactivate
     */
    @PostMapping("/{id:\\d+}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Deactivate location", description = "Deactivate a location")
    public ResponseEntity<ApiResponse<LocationResponse>> deactivateLocation(@PathVariable Long id) {
        try {
            LocationResponse location = locationService.deactivateLocation(id);
            return ResponseEntity.ok(ApiResponse.success("Location deactivated successfully", location));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Count locations by organization
     * GET /api/locations/count/{organizationId}
     */
    @GetMapping("/count/{organizationId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Count locations", description = "Get the count of locations for an organization")
    public ResponseEntity<ApiResponse<Long>> countLocations(@PathVariable Long organizationId) {
        try {
            long count = locationService.countLocationsByOrganization(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Location count retrieved successfully", count));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}

