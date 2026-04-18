package com.talentx.hrms.service.organization;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.organization.LocationRequest;
import com.talentx.hrms.dto.organization.LocationResponse;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.repository.LocationRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LocationService {

    private final LocationRepository locationRepository;
    private final OrganizationRepository organizationRepository;

    @Autowired
    public LocationService(LocationRepository locationRepository, 
                          OrganizationRepository organizationRepository) {
        this.locationRepository = locationRepository;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Create a new location
     */
    public LocationResponse createLocation(LocationRequest request) {
        // Validate organization exists
        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Validate unique constraints
        if (request.getName() != null && 
            locationRepository.findByNameAndOrganization(request.getName(), organization).isPresent()) {
            throw new RuntimeException("Location with this name already exists in the organization");
        }

        // Create location entity
        Location location = new Location();
        mapRequestToEntity(request, location, organization);

        // Save location
        location = locationRepository.save(location);

        return mapEntityToResponse(location);
    }

    /**
     * Update an existing location
     */
    public LocationResponse updateLocation(Long id, LocationRequest request) {
        Location location = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));

        // Validate organization exists
        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Validate unique constraints (excluding current location)
        if (request.getName() != null) {
            locationRepository.findByNameAndOrganization(request.getName(), organization)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Location with this name already exists in the organization");
                    }
                });
        }

        // Update location entity
        mapRequestToEntity(request, location, organization);

        // Save location
        location = locationRepository.save(location);

        return mapEntityToResponse(location);
    }

    /**
     * Get location by ID
     */
    @Transactional(readOnly = true)
    public LocationResponse getLocation(Long id) {
        Location location = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));

        return mapEntityToResponse(location);
    }

    /**
     * Get all locations with pagination
     */
    @Transactional(readOnly = true)
    public Page<LocationResponse> getLocations(PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        Page<Location> locations = locationRepository.findAll(pageable);

        return locations.map(this::mapEntityToResponse);
    }

    /**
     * Get locations by organization
     */
    @Transactional(readOnly = true)
    public Page<LocationResponse> getLocationsByOrganization(Long organizationId, 
                                                             PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        Pageable pageable = createPageable(paginationRequest);
        Page<Location> locations = locationRepository.findByOrganization(organization, pageable);

        return locations.map(this::mapEntityToResponse);
    }

    /**
     * Search locations by name within organization
     */
    @Transactional(readOnly = true)
    public Page<LocationResponse> searchLocationsByName(Long organizationId, String name, 
                                                        PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        Pageable pageable = createPageable(paginationRequest);
        Page<Location> locations = locationRepository.findByOrganizationAndNameContainingIgnoreCase(
            organization, name, pageable);

        return locations.map(this::mapEntityToResponse);
    }

    /**
     * Get locations by city
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getLocationsByCity(Long organizationId, String city) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        List<Location> locations = locationRepository.findByOrganizationAndCity(organization, city);
        return locations.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get locations by country
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getLocationsByCountry(Long organizationId, String country) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        List<Location> locations = locationRepository.findByOrganizationAndCountry(organization, country);
        return locations.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get locations by state/province
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getLocationsByStateProvince(Long organizationId, String stateProvince) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        List<Location> locations = locationRepository.findByOrganizationAndStateProvince(
            organization, stateProvince);
        return locations.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get headquarters location
     */
    @Transactional(readOnly = true)
    public LocationResponse getHeadquarters(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        Location location = locationRepository.findByOrganizationAndIsHeadquartersTrue(organization)
            .orElseThrow(() -> new RuntimeException("Headquarters location not found"));

        return mapEntityToResponse(location);
    }

    /**
     * Get active locations
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getActiveLocations(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        List<Location> locations = locationRepository.findActiveByOrganization(organization);
        return locations.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Delete location
     */
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));

        // Check if location is headquarters
        if (Boolean.TRUE.equals(location.getIsHeadquarters())) {
            throw new RuntimeException("Cannot delete headquarters location");
        }

        locationRepository.delete(location);
    }

    /**
     * Activate location
     */
    public LocationResponse activateLocation(Long id) {
        Location location = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));

        location.setActive(true);
        location = locationRepository.save(location);

        return mapEntityToResponse(location);
    }

    /**
     * Deactivate location
     */
    public LocationResponse deactivateLocation(Long id) {
        Location location = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));

        // Check if location is headquarters
        if (Boolean.TRUE.equals(location.getIsHeadquarters())) {
            throw new RuntimeException("Cannot deactivate headquarters location");
        }

        location.setActive(false);
        location = locationRepository.save(location);

        return mapEntityToResponse(location);
    }

    /**
     * Count locations by organization
     */
    @Transactional(readOnly = true)
    public long countLocationsByOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        return locationRepository.countByOrganization(organization);
    }

    /**
     * Map request DTO to entity
     */
    private void mapRequestToEntity(LocationRequest request, Location location, Organization organization) {
        location.setName(request.getName());
        location.setAddressLine1(request.getAddressLine1());
        location.setAddressLine2(request.getAddressLine2());
        location.setCity(request.getCity());
        location.setStateProvince(request.getStateProvince());
        location.setPostalCode(request.getPostalCode());
        location.setCountry(request.getCountry());
        location.setTimeZone(request.getTimezone());
        location.setIsHeadquarters(request.getIsHeadquarters());
        location.setOrganization(organization);
        
        if (request.getIsActive() != null) {
            location.setActive(request.getIsActive());
        }
    }

    /**
     * Map entity to response DTO
     */
    private LocationResponse mapEntityToResponse(Location location) {
        LocationResponse response = new LocationResponse();
        response.setId(location.getId());
        response.setOrganizationId(location.getOrganization().getId());
        response.setName(location.getName());
        response.setAddressLine1(location.getAddressLine1());
        response.setAddressLine2(location.getAddressLine2());
        response.setCity(location.getCity());
        response.setStateProvince(location.getStateProvince());
        response.setPostalCode(location.getPostalCode());
        response.setCountry(location.getCountry());
        response.setTimezone(location.getTimeZone());
        response.setIsHeadquarters(location.getIsHeadquarters());
        response.setIsActive(location.getActive());
        
        if (location.getCreatedAt() != null) {
            response.setCreatedAt(location.getCreatedAt());
        }
        if (location.getUpdatedAt() != null) {
            response.setUpdatedAt(location.getUpdatedAt());
        }
        
        return response;
    }

    /**
     * Create pageable from pagination request
     */
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }
}

