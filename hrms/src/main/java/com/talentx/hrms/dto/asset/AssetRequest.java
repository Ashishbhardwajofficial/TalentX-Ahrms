package com.talentx.hrms.dto.asset;

import com.talentx.hrms.entity.enums.AssetStatus;
import com.talentx.hrms.entity.enums.AssetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AssetRequest {

    @NotNull(message = "Asset type is required")
    private AssetType assetType;

    @Size(max = 100, message = "Asset tag must not exceed 100 characters")
    private String assetTag;

    @Size(max = 100, message = "Serial number must not exceed 100 characters")
    private String serialNumber;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;

    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    private AssetStatus status;

    // Constructors
    public AssetRequest() {}

    public AssetRequest(AssetType assetType, String assetTag, String serialNumber, 
                       String description, String brand, String model) {
        this.assetType = assetType;
        this.assetTag = assetTag;
        this.serialNumber = serialNumber;
        this.description = description;
        this.brand = brand;
        this.model = model;
    }

    // Getters and Setters
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

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }
}

