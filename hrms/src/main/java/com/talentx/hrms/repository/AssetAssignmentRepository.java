package com.talentx.hrms.repository;

import com.talentx.hrms.entity.assets.AssetAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {

    // Find assignments by employee
    Page<AssetAssignment> findByEmployeeId(Long employeeId, Pageable pageable);

    // Find active assignments by employee
    List<AssetAssignment> findByEmployeeIdAndReturnedDateIsNull(Long employeeId);

    // Find assignments by asset
    Page<AssetAssignment> findByAssetId(Long assetId, Pageable pageable);

    // Find active assignment by asset
    Optional<AssetAssignment> findByAssetIdAndReturnedDateIsNull(Long assetId);

    // Find assignments by organization
    @Query("SELECT aa FROM AssetAssignment aa WHERE aa.asset.organization.id = :organizationId")
    Page<AssetAssignment> findByOrganizationId(@Param("organizationId") Long organizationId, Pageable pageable);

    // Find active assignments by organization
    @Query("SELECT aa FROM AssetAssignment aa WHERE aa.asset.organization.id = :organizationId AND aa.returnedDate IS NULL")
    List<AssetAssignment> findActiveAssignmentsByOrganizationId(@Param("organizationId") Long organizationId);

    // Find assignments by date range
    @Query("SELECT aa FROM AssetAssignment aa WHERE aa.asset.organization.id = :organizationId " +
           "AND aa.assignedDate BETWEEN :startDate AND :endDate")
    Page<AssetAssignment> findByOrganizationIdAndAssignedDateBetween(
            @Param("organizationId") Long organizationId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    // Count active assignments by employee
    long countByEmployeeIdAndReturnedDateIsNull(Long employeeId);

    // Count assignments by asset
    long countByAssetId(Long assetId);

    // Check if asset is currently assigned
    boolean existsByAssetIdAndReturnedDateIsNull(Long assetId);

    // Native update to avoid @NotFound(IGNORE) null employee issue on save
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        value = "UPDATE asset_assignments SET returned_date = :returnedDate, updated_at = NOW() WHERE asset_assignment_id = :id",
        nativeQuery = true
    )
    void updateReturnedDate(@org.springframework.data.repository.query.Param("id") Long id,
                            @org.springframework.data.repository.query.Param("returnedDate") java.time.LocalDate returnedDate);
}

