package com.talentx.hrms.dto.organization;

import com.talentx.hrms.entity.enums.CompanySize;
import com.talentx.hrms.entity.enums.SubscriptionTier;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.sql.Timestamp;

public class OrganizationResponse {
    
    private Long id;
    private String name;
    private String legalName;
    private String taxId;
    private String industry;
    private CompanySize companySize;
    private String headquartersCountry;
    private String logoUrl;
    private String website;
    @JsonProperty("isActive")
    private Boolean isActive;
    private SubscriptionTier subscriptionTier;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp updatedAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp deletedAt;
    
    public OrganizationResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getLegalName() {
        return legalName;
    }
    
    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }
    
    public String getTaxId() {
        return taxId;
    }
    
    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public CompanySize getCompanySize() {
        return companySize;
    }
    
    public void setCompanySize(CompanySize companySize) {
        this.companySize = companySize;
    }
    
    public String getHeadquartersCountry() {
        return headquartersCountry;
    }
    
    public void setHeadquartersCountry(String headquartersCountry) {
        this.headquartersCountry = headquartersCountry;
    }
    
    public String getLogoUrl() {
        return logoUrl;
    }
    
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public SubscriptionTier getSubscriptionTier() {
        return subscriptionTier;
    }
    
    public void setSubscriptionTier(SubscriptionTier subscriptionTier) {
        this.subscriptionTier = subscriptionTier;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Timestamp getDeletedAt() {
        return deletedAt;
    }
    
    public void setDeletedAt(Timestamp deletedAt) {
        this.deletedAt = deletedAt;
    }
}

