package com.talentx.hrms.dto.compliance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ComplianceJurisdictionRequest {

    @NotBlank(message = "Jurisdiction name is required")
    @Size(max = 255, message = "Jurisdiction name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Jurisdiction code is required")
    @Size(max = 20, message = "Jurisdiction code must not exceed 20 characters")
    private String code;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    private String stateProvince;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 2, message = "Country code must be 2 characters")
    private String countryCode;

    @Size(max = 10, message = "State/Province code must not exceed 10 characters")
    private String stateProvinceCode;

    @Size(max = 50, message = "Jurisdiction type must not exceed 50 characters")
    private String jurisdictionType;

    private Boolean isDefault;

    @Size(max = 255, message = "Regulatory body must not exceed 255 characters")
    private String regulatoryBody;

    @Size(max = 500, message = "Contact information must not exceed 500 characters")
    private String contactInformation;

    @Size(max = 255, message = "Website must not exceed 255 characters")
    private String website;

    // Constructors
    public ComplianceJurisdictionRequest() {
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getStateProvince() {
        return stateProvince;
    }

    public void setStateProvince(String stateProvince) {
        this.stateProvince = stateProvince;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getStateProvinceCode() {
        return stateProvinceCode;
    }

    public void setStateProvinceCode(String stateProvinceCode) {
        this.stateProvinceCode = stateProvinceCode;
    }

    public String getJurisdictionType() {
        return jurisdictionType;
    }

    public void setJurisdictionType(String jurisdictionType) {
        this.jurisdictionType = jurisdictionType;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public String getRegulatoryBody() {
        return regulatoryBody;
    }

    public void setRegulatoryBody(String regulatoryBody) {
        this.regulatoryBody = regulatoryBody;
    }

    public String getContactInformation() {
        return contactInformation;
    }

    public void setContactInformation(String contactInformation) {
        this.contactInformation = contactInformation;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}
