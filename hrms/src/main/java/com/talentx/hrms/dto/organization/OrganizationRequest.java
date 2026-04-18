package com.talentx.hrms.dto.organization;

import com.talentx.hrms.entity.enums.CompanySize;
import com.talentx.hrms.entity.enums.SubscriptionTier;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class OrganizationRequest {
    
    @NotBlank(message = "Organization name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @Size(max = 255, message = "Legal name must not exceed 255 characters")
    private String legalName;
    
    @Size(max = 50, message = "Tax ID must not exceed 50 characters")
    private String taxId;
    
    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;
    
    private CompanySize companySize;
    
    @Size(max = 2, message = "Headquarters country must be 2 characters")
    private String headquartersCountry;
    
    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;
    
    @Size(max = 255, message = "Website must not exceed 255 characters")
    private String website;
    
    @JsonProperty("isActive")
    private Boolean isActive = true;
    
    private SubscriptionTier subscriptionTier;
    
    public OrganizationRequest() {}
    
    // Getters and Setters
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
}

