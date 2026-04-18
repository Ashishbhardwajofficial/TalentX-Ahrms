package com.talentx.hrms.entity.assets;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.enums.AssetStatus;
import com.talentx.hrms.entity.enums.AssetType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assets")
@Getter
@Setter
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false)
    private AssetType assetType;

    @Column(name = "asset_tag", unique = true, length = 100)
    private String assetTag;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AssetStatus status = AssetStatus.AVAILABLE;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssetAssignment> assignments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Constructors
    public Asset() {}

    public Asset(Organization organization, AssetType assetType, AssetStatus status) {
        this.organization = organization;
        this.assetType = assetType;
        this.status = status;
    }

    // Getters and Setters (manually added due to Lombok processing issues)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public AssetType getAssetType() {
        return assetType;
    }

    public void setAssetType(AssetType assetType) {
        this.assetType = assetType;
    }

    public String getAssetTag() {
        return assetTag;
    }

    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<AssetAssignment> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<AssetAssignment> assignments) {
        this.assignments = assignments;
    }

    // Helper method for business logic
    public boolean canBeAssigned() {
        return status == AssetStatus.AVAILABLE;
    }

    public Boolean getActive() {
        return status != AssetStatus.DISPOSED && status != AssetStatus.RETIRED;
    }
}

