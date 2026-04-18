package com.talentx.hrms.dto.asset;

import com.talentx.hrms.entity.enums.AssetStatus;
import com.talentx.hrms.entity.enums.AssetType;

import java.time.Instant;

public class AssetResponse {

    private Long id;
    private Long organizationId;
    private AssetType assetType;
    private String assetTag;
    private String serialNumber;
    private AssetStatus status;
    private String description;
    private String brand;
    private String model;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean active;

    // Constructors
    public AssetResponse() {}

    public AssetResponse(Long id, Long organizationId, AssetType assetType, String assetTag,
                        String serialNumber, AssetStatus status, String description,
                        String brand, String model, Instant createdAt, Instant updatedAt, Boolean active) {
        this.id = id;
        this.organizationId = organizationId;
        this.assetType = assetType;
        this.assetTag = assetTag;
        this.serialNumber = serialNumber;
        this.status = status;
        this.description = description;
        this.brand = brand;
        this.model = model;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}

