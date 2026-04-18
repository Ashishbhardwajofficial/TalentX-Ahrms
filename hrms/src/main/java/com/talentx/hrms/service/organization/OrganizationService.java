package com.talentx.hrms.service.organization;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.organization.OrganizationRequest;
import com.talentx.hrms.dto.organization.OrganizationResponse;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.enums.CompanySize;
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
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Autowired
    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    /**
     * Create a new organization
     */
    public OrganizationResponse createOrganization(OrganizationRequest request) {
        // Validate unique constraints
        if (organizationRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Organization with this name already exists");
        }

        if (request.getLegalName() != null && 
            organizationRepository.findByLegalName(request.getLegalName()).isPresent()) {
            throw new RuntimeException("Organization with this legal name already exists");
        }

        if (request.getTaxId() != null && 
            organizationRepository.findByTaxId(request.getTaxId()).isPresent()) {
            throw new RuntimeException("Organization with this tax ID already exists");
        }

        // Create organization entity
        Organization organization = new Organization();
        mapRequestToEntity(request, organization);

        // Save organization
        organization = organizationRepository.save(organization);

        return mapEntityToResponse(organization);
    }

    /**
     * Update an existing organization
     */
    public OrganizationResponse updateOrganization(Long id, OrganizationRequest request) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Validate unique constraints (excluding current organization)
        organizationRepository.findByName(request.getName())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Organization with this name already exists");
                }
            });

        if (request.getLegalName() != null) {
            organizationRepository.findByLegalName(request.getLegalName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Organization with this legal name already exists");
                    }
                });
        }

        if (request.getTaxId() != null) {
            organizationRepository.findByTaxId(request.getTaxId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new RuntimeException("Organization with this tax ID already exists");
                    }
                });
        }

        // Update organization entity
        mapRequestToEntity(request, organization);

        // Save organization
        organization = organizationRepository.save(organization);

        return mapEntityToResponse(organization);
    }

    /**
     * Get organization by ID
     */
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        return mapEntityToResponse(organization);
    }

    /**
     * Get all organizations with pagination
     */
    @Transactional(readOnly = true)
    public Page<OrganizationResponse> getOrganizations(PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        Page<Organization> organizations = organizationRepository.findAll(pageable);

        return organizations.map(this::mapEntityToResponse);
    }

    /**
     * Search organizations with comprehensive criteria
     */
    @Transactional(readOnly = true)
    public Page<OrganizationResponse> searchOrganizations(String name, String industry, 
                                                         CompanySize companySize,
                                                         PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        Page<Organization> organizations = organizationRepository.findBySearchCriteria(
            name, industry, companySize, pageable);

        return organizations.map(this::mapEntityToResponse);
    }

    /**
     * Get active organizations
     */
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getActiveOrganizations() {
        List<Organization> organizations = organizationRepository.findActiveOrganizations();
        return organizations.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get organizations by company size
     */
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getOrganizationsByCompanySize(CompanySize companySize) {
        List<Organization> organizations = organizationRepository.findByCompanySize(companySize);
        return organizations.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get organizations by industry
     */
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getOrganizationsByIndustry(String industry) {
        List<Organization> organizations = organizationRepository.findByIndustry(industry);
        return organizations.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Delete organization
     */
    public void deleteOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Check if organization has dependencies
        if (!organization.getDepartments().isEmpty()) {
            throw new RuntimeException("Cannot delete organization with existing departments");
        }

        if (!organization.getLocations().isEmpty()) {
            throw new RuntimeException("Cannot delete organization with existing locations");
        }

        organizationRepository.delete(organization);
    }

    /**
     * Activate organization
     */
    public OrganizationResponse activateOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        organization.setActive(true);
        organization = organizationRepository.save(organization);

        return mapEntityToResponse(organization);
    }

    /**
     * Deactivate organization
     */
    public OrganizationResponse deactivateOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        organization.setActive(false);
        organization = organizationRepository.save(organization);

        return mapEntityToResponse(organization);
    }

    /**
     * Get organization statistics
     */
    @Transactional(readOnly = true)
    public OrganizationStatistics getOrganizationStatistics() {
        long totalOrganizations = organizationRepository.count();
        long activeOrganizations = organizationRepository.findActiveOrganizations().size();
        long smallCompanies = organizationRepository.countByCompanySize(CompanySize.SMALL);
        long mediumCompanies = organizationRepository.countByCompanySize(CompanySize.MEDIUM);
        long largeCompanies = organizationRepository.countByCompanySize(CompanySize.LARGE);
        long enterpriseCompanies = organizationRepository.countByCompanySize(CompanySize.ENTERPRISE);

        return new OrganizationStatistics(totalOrganizations, activeOrganizations, 
            smallCompanies, mediumCompanies, largeCompanies, enterpriseCompanies);
    }

    /**
     * Map request DTO to entity
     */
    private void mapRequestToEntity(OrganizationRequest request, Organization organization) {
        organization.setName(request.getName());
        organization.setLegalName(request.getLegalName());
        organization.setTaxId(request.getTaxId());
        organization.setIndustry(request.getIndustry());
        organization.setCompanySize(request.getCompanySize());
        organization.setWebsite(request.getWebsite());
        
        if (request.getIsActive() != null) {
            organization.setActive(request.getIsActive());
        }
    }

    /**
     * Map entity to response DTO
     */
    private OrganizationResponse mapEntityToResponse(Organization organization) {
        OrganizationResponse response = new OrganizationResponse();
        response.setId(organization.getId());
        response.setName(organization.getName());
        response.setLegalName(organization.getLegalName());
        response.setTaxId(organization.getTaxId());
        response.setIndustry(organization.getIndustry());
        response.setCompanySize(organization.getCompanySize());
        response.setWebsite(organization.getWebsite());
        response.setIsActive(organization.getActive());
        
        if (organization.getCreatedAt() != null) {
            response.setCreatedAt(organization.getCreatedAt());
        }
        if (organization.getUpdatedAt() != null) {
            response.setUpdatedAt(organization.getUpdatedAt());
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

    /**
     * Organization statistics inner class
     */
    public static class OrganizationStatistics {
        private final long totalOrganizations;
        private final long activeOrganizations;
        private final long smallCompanies;
        private final long mediumCompanies;
        private final long largeCompanies;
        private final long enterpriseCompanies;

        public OrganizationStatistics(long totalOrganizations, long activeOrganizations,
                                     long smallCompanies, long mediumCompanies, 
                                     long largeCompanies, long enterpriseCompanies) {
            this.totalOrganizations = totalOrganizations;
            this.activeOrganizations = activeOrganizations;
            this.smallCompanies = smallCompanies;
            this.mediumCompanies = mediumCompanies;
            this.largeCompanies = largeCompanies;
            this.enterpriseCompanies = enterpriseCompanies;
        }

        // Getters
        public long getTotalOrganizations() { return totalOrganizations; }
        public long getActiveOrganizations() { return activeOrganizations; }
        public long getSmallCompanies() { return smallCompanies; }
        public long getMediumCompanies() { return mediumCompanies; }
        public long getLargeCompanies() { return largeCompanies; }
        public long getEnterpriseCompanies() { return enterpriseCompanies; }
    }
}

