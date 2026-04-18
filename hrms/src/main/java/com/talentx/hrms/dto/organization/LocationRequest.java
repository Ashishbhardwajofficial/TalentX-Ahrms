package com.talentx.hrms.dto.organization;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LocationRequest {
    
    @NotNull(message = "Organization ID is required")
    private Long organizationId;
    
    @NotBlank(message = "Location name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    private String addressLine1;
    
    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String addressLine2;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    private String stateProvince;
    
    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;
    
    @Size(max = 2, message = "Country must be 2 characters")
    private String country;
    
    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone;
    
    @JsonProperty("isHeadquarters")
    private Boolean isHeadquarters = false;
    
    @JsonProperty("isActive")
    private Boolean isActive = true;
    
    public LocationRequest() {}
    
    // Getters and Setters
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getAddressLine1() {
        return addressLine1;
    }
    
    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }
    
    public String getAddressLine2() {
        return addressLine2;
    }
    
    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getStateProvince() {
        return stateProvince;
    }
    
    public void setStateProvince(String stateProvince) {
        this.stateProvince = stateProvince;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public Boolean getIsHeadquarters() {
        return isHeadquarters;
    }
    
    public void setIsHeadquarters(Boolean isHeadquarters) {
        this.isHeadquarters = isHeadquarters;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

