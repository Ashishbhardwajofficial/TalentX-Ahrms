package com.talentx.hrms.service.asset;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.assets.Asset;
import com.talentx.hrms.entity.assets.AssetAssignment;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.AssetStatus;
import com.talentx.hrms.entity.enums.AssetType;
import com.talentx.hrms.repository.AssetAssignmentRepository;
import com.talentx.hrms.repository.AssetRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetAssignmentRepository assetAssignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    @Autowired
    public AssetService(AssetRepository assetRepository,
                       AssetAssignmentRepository assetAssignmentRepository,
                       EmployeeRepository employeeRepository,
                       AuthService authService) {
        this.assetRepository = assetRepository;
        this.assetAssignmentRepository = assetAssignmentRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
    }

    // ===== ASSET MANAGEMENT =====

    /**
     * Create a new asset
     */
    public Asset createAsset(AssetType assetType, String assetTag, String serialNumber) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Check if asset tag already exists (if provided)
        if (assetTag != null && !assetTag.trim().isEmpty()) {
            Optional<Asset> existingByTag = assetRepository.findByOrganizationIdAndAssetTag(
                organization.getId(), assetTag);
            if (existingByTag.isPresent()) {
                throw new RuntimeException("Asset with this tag already exists in organization");
            }
        }

        // Check if serial number already exists (if provided)
        if (serialNumber != null && !serialNumber.trim().isEmpty()) {
            Optional<Asset> existingBySerial = assetRepository.findByOrganizationIdAndSerialNumber(
                organization.getId(), serialNumber);
            if (existingBySerial.isPresent()) {
                throw new RuntimeException("Asset with this serial number already exists in organization");
            }
        }

        Asset asset = new Asset();
        asset.setOrganization(organization);
        asset.setAssetType(assetType);
        asset.setAssetTag(assetTag);
        asset.setSerialNumber(serialNumber);
        asset.setStatus(AssetStatus.AVAILABLE);

        return assetRepository.save(asset);
    }

    /**
     * Update an existing asset
     */
    public Asset updateAsset(Long id, AssetType assetType, String assetTag, String serialNumber,
                            AssetStatus status) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Asset not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the asset belongs to the current organization
        if (!asset.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Asset does not belong to your organization");
        }

        // Check if asset tag already exists (excluding current asset)
        if (assetTag != null && !assetTag.trim().isEmpty()) {
            Optional<Asset> existingByTag = assetRepository.findByOrganizationIdAndAssetTag(
                organization.getId(), assetTag);
            if (existingByTag.isPresent() && !existingByTag.get().getId().equals(id)) {
                throw new RuntimeException("Asset with this tag already exists in organization");
            }
        }

        // Check if serial number already exists (excluding current asset)
        if (serialNumber != null && !serialNumber.trim().isEmpty()) {
            Optional<Asset> existingBySerial = assetRepository.findByOrganizationIdAndSerialNumber(
                organization.getId(), serialNumber);
            if (existingBySerial.isPresent() && !existingBySerial.get().getId().equals(id)) {
                throw new RuntimeException("Asset with this serial number already exists in organization");
            }
        }

        // Validate status change
        if (status != null && status != asset.getStatus()) {
            validateStatusChange(asset, status);
        }

        if (assetType != null) asset.setAssetType(assetType);
        if (assetTag != null) asset.setAssetTag(assetTag);
        if (serialNumber != null) asset.setSerialNumber(serialNumber);
        if (status != null) asset.setStatus(status);

        return assetRepository.save(asset);
    }

    /**
     * Get asset by ID
     */
    @Transactional(readOnly = true)
    public Asset getAsset(Long id) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Asset not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the asset belongs to the current organization
        if (!asset.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Asset does not belong to your organization");
        }

        return asset;
    }

    /**
     * Get all assets with pagination
     */
    @Transactional(readOnly = true)
    public Page<Asset> getAssets(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return assetRepository.findByOrganizationId(organization.getId(), pageable);
    }

    /**
     * Search assets
     */
    @Transactional(readOnly = true)
    public Page<Asset> searchAssets(String search, AssetType assetType, AssetStatus status,
                                   PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);

        if (search != null && !search.trim().isEmpty()) {
            return assetRepository.searchAssets(organization.getId(), search.trim(), pageable);
        }

        if (assetType != null && status != null) {
            // Need to create a custom query for both filters
            return assetRepository.findByOrganizationId(organization.getId(), pageable);
        } else if (assetType != null) {
            return assetRepository.findByOrganizationIdAndAssetType(organization.getId(), assetType, pageable);
        } else if (status != null) {
            return assetRepository.findByOrganizationIdAndStatus(organization.getId(), status, pageable);
        }

        return assetRepository.findByOrganizationId(organization.getId(), pageable);
    }

    /**
     * Get available assets
     */
    @Transactional(readOnly = true)
    public List<Asset> getAvailableAssets() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return assetRepository.findByOrganizationIdAndStatus(organization.getId(), AssetStatus.AVAILABLE);
    }

    /**
     * Get assets by type
     */
    @Transactional(readOnly = true)
    public List<Asset> getAssetsByType(AssetType assetType) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return assetRepository.findByOrganizationIdAndAssetType(organization.getId(), assetType);
    }

    /**
     * Delete asset
     */
    public void deleteAsset(Long id) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Asset not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the asset belongs to the current organization
        if (!asset.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Asset does not belong to your organization");
        }

        // Check if asset is currently assigned
        if (assetAssignmentRepository.existsByAssetIdAndReturnedDateIsNull(id)) {
            throw new RuntimeException("Cannot delete asset that is currently assigned");
        }

        assetRepository.delete(asset);
    }

    // ===== ASSET ASSIGNMENT WORKFLOW =====

    /**
     * Assign asset to employee
     */
    public AssetAssignment assignAsset(Long assetId, Long employeeId, LocalDate assignedDate) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new RuntimeException("Asset not found"));

        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify both asset and employee belong to the current organization
        if (!asset.getOrganization().getId().equals(organization.getId()) ||
            !employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Asset or employee does not belong to your organization");
        }

        // Check if asset can be assigned
        if (!asset.canBeAssigned()) {
            throw new RuntimeException("Asset is not available for assignment. Current status: " + asset.getStatus());
        }

        // Check if asset is already assigned
        if (assetAssignmentRepository.existsByAssetIdAndReturnedDateIsNull(assetId)) {
            throw new RuntimeException("Asset is already assigned to another employee");
        }

        // Create assignment
        AssetAssignment assignment = new AssetAssignment();
        assignment.setAsset(asset);
        assignment.setEmployee(employee);
        assignment.setAssignedDate(assignedDate != null ? assignedDate : LocalDate.now());

        // Update asset status
        asset.setStatus(AssetStatus.ASSIGNED);
        assetRepository.save(asset);

        return assetAssignmentRepository.save(assignment);
    }

    /**
     * Return asset from employee
     */
    public AssetAssignment returnAsset(Long assetId, LocalDate returnedDate) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new RuntimeException("Asset not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the asset belongs to the current organization
        if (!asset.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Asset does not belong to your organization");
        }

        // Find active assignment
        AssetAssignment assignment = assetAssignmentRepository.findByAssetIdAndReturnedDateIsNull(assetId)
            .orElseThrow(() -> new RuntimeException("No active assignment found for this asset"));

        // Update assignment — use direct field update to avoid @NotFound(IGNORE) null employee issue
        LocalDate returnDate = returnedDate != null ? returnedDate : LocalDate.now();
        assignment.setReturnedDate(returnDate);

        // Update asset status to available
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        // Use native update to avoid employee_id null constraint from @NotFound(IGNORE)
        assetAssignmentRepository.updateReturnedDate(assignment.getId(), returnDate);

        return assetAssignmentRepository.findById(assignment.getId())
            .orElse(assignment);
    }

    /**
     * Get employee assets (currently assigned)
     */
    @Transactional(readOnly = true)
    public List<AssetAssignment> getEmployeeAssets(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the employee belongs to the current organization
        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        return assetAssignmentRepository.findByEmployeeIdAndReturnedDateIsNull(employeeId);
    }

    /**
     * Get all employee assignments (including returned)
     */
    @Transactional(readOnly = true)
    public Page<AssetAssignment> getEmployeeAssignmentHistory(Long employeeId, PaginationRequest paginationRequest) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the employee belongs to the current organization
        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        Pageable pageable = createPageable(paginationRequest);
        return assetAssignmentRepository.findByEmployeeId(employeeId, pageable);
    }

    /**
     * Get asset assignment history
     */
    @Transactional(readOnly = true)
    public Page<AssetAssignment> getAssetAssignmentHistory(Long assetId, PaginationRequest paginationRequest) {
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new RuntimeException("Asset not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the asset belongs to the current organization
        if (!asset.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Asset does not belong to your organization");
        }

        Pageable pageable = createPageable(paginationRequest);
        return assetAssignmentRepository.findByAssetId(assetId, pageable);
    }

    /**
     * Get all assignments with pagination
     */
    @Transactional(readOnly = true)
    public Page<AssetAssignment> getAllAssignments(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return assetAssignmentRepository.findByOrganizationId(organization.getId(), pageable);
    }

    /**
     * Get active assignments
     */
    @Transactional(readOnly = true)
    public List<AssetAssignment> getActiveAssignments() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return assetAssignmentRepository.findActiveAssignmentsByOrganizationId(organization.getId());
    }

    // ===== ASSET STATISTICS =====

    /**
     * Get asset statistics
     */
    @Transactional(readOnly = true)
    public AssetStatistics getAssetStatistics() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        long totalAssets = assetRepository.countByOrganizationId(organization.getId());
        long availableAssets = assetRepository.countByOrganizationIdAndStatus(organization.getId(), AssetStatus.AVAILABLE);
        long assignedAssets = assetRepository.countByOrganizationIdAndStatus(organization.getId(), AssetStatus.ASSIGNED);
        long damagedAssets = assetRepository.countByOrganizationIdAndStatus(organization.getId(), AssetStatus.DAMAGED);
        long retiredAssets = assetRepository.countByOrganizationIdAndStatus(organization.getId(), AssetStatus.RETIRED);

        return new AssetStatistics(totalAssets, availableAssets, assignedAssets, damagedAssets, retiredAssets);
    }

    // ===== HELPER METHODS =====

    /**
     * Validate status change
     */
    private void validateStatusChange(Asset asset, AssetStatus newStatus) {
        AssetStatus currentStatus = asset.getStatus();

        // Check if asset is currently assigned
        boolean isAssigned = assetAssignmentRepository.existsByAssetIdAndReturnedDateIsNull(asset.getId());

        if (isAssigned && newStatus == AssetStatus.AVAILABLE) {
            throw new RuntimeException("Cannot mark asset as available while it is assigned to an employee");
        }

        if (currentStatus == AssetStatus.RETIRED && newStatus != AssetStatus.RETIRED) {
            throw new RuntimeException("Cannot change status of retired asset");
        }
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

    // ===== INNER CLASSES =====

    /**
     * Asset statistics
     */
    public static class AssetStatistics {
        private final long totalAssets;
        private final long availableAssets;
        private final long assignedAssets;
        private final long damagedAssets;
        private final long retiredAssets;

        public AssetStatistics(long totalAssets, long availableAssets, long assignedAssets, 
                              long damagedAssets, long retiredAssets) {
            this.totalAssets = totalAssets;
            this.availableAssets = availableAssets;
            this.assignedAssets = assignedAssets;
            this.damagedAssets = damagedAssets;
            this.retiredAssets = retiredAssets;
        }

        public long getTotalAssets() { return totalAssets; }
        public long getAvailableAssets() { return availableAssets; }
        public long getAssignedAssets() { return assignedAssets; }
        public long getDamagedAssets() { return damagedAssets; }
        public long getRetiredAssets() { return retiredAssets; }
        public double getUtilizationRate() { 
            return totalAssets > 0 ? (double) assignedAssets / totalAssets * 100 : 0; 
        }
    }
}

