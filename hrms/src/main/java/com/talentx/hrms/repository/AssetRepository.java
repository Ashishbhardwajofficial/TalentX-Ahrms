package com.talentx.hrms.repository;

import com.talentx.hrms.entity.assets.Asset;
import com.talentx.hrms.entity.enums.AssetStatus;
import com.talentx.hrms.entity.enums.AssetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    // Find by organization ID
    Page<Asset> findByOrganizationId(Long organizationId, Pageable pageable);

    // Find by status
    Page<Asset> findByOrganizationIdAndStatus(Long organizationId, AssetStatus status, Pageable pageable);

    // Find by asset type
    Page<Asset> findByOrganizationIdAndAssetType(Long organizationId, AssetType assetType, Pageable pageable);

    // Find by asset type (list)
    List<Asset> findByOrganizationIdAndAssetType(Long organizationId, AssetType assetType);

    // Find by asset tag
    Optional<Asset> findByOrganizationIdAndAssetTag(Long organizationId, String assetTag);

    // Find by serial number
    Optional<Asset> findByOrganizationIdAndSerialNumber(Long organizationId, String serialNumber);

    // Find available assets
    List<Asset> findByOrganizationIdAndStatus(Long organizationId, AssetStatus status);

    // Search assets
    @Query("SELECT a FROM Asset a WHERE a.organization.id = :organizationId " +
           "AND (LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Asset> searchAssets(@Param("organizationId") Long organizationId,
                             @Param("search") String search,
                             Pageable pageable);

    // Count by status
    long countByOrganizationIdAndStatus(Long organizationId, AssetStatus status);

    // Count all assets by organization
    long countByOrganizationId(Long organizationId);

    // Count by type
    long countByOrganizationIdAndAssetType(Long organizationId, AssetType assetType);
}


