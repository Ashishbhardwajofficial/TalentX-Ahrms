package com.talentx.hrms.entity.compliance;

import com.talentx.hrms.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "compliance_jurisdictions")
@AttributeOverride(name = "id", column = @Column(name = "jurisdiction_id"))
@Getter
@Setter
public class ComplianceJurisdiction extends BaseEntity {

    @NotBlank(message = "Country code is required")
    @Size(max = 2, message = "Country code must not exceed 2 characters")
    @Column(name = "country_code", nullable = false)
    private String countryCode;

    @Size(max = 10, message = "State/Province code must not exceed 10 characters")
    @Column(name = "state_province_code")
    private String stateProvinceCode;

    @NotBlank(message = "Jurisdiction name is required")
    @Size(max = 255, message = "Jurisdiction name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "jurisdiction_type")
    private JurisdictionType jurisdictionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_jurisdiction_id")
    private ComplianceJurisdiction parentJurisdiction;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "parentJurisdiction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ComplianceJurisdiction> childJurisdictions = new ArrayList<>();

    @OneToMany(mappedBy = "jurisdiction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ComplianceRule> complianceRules = new ArrayList<>();

    // Constructors
    public ComplianceJurisdiction() {}

    public ComplianceJurisdiction(String countryCode, String name) {
        this.countryCode = countryCode;
        this.name = name;
    }

    // Helper methods
    public void addComplianceRule(ComplianceRule rule) {
        complianceRules.add(rule);
        rule.setJurisdiction(this);
    }

    public void removeComplianceRule(ComplianceRule rule) {
        complianceRules.remove(rule);
        rule.setJurisdiction(null);
    }

    public void addChildJurisdiction(ComplianceJurisdiction child) {
        childJurisdictions.add(child);
        child.setParentJurisdiction(this);
    }

    public void removeChildJurisdiction(ComplianceJurisdiction child) {
        childJurisdictions.remove(child);
        child.setParentJurisdiction(null);
    }

    public String getFullName() {
        StringBuilder fullName = new StringBuilder(name);
        if (stateProvinceCode != null) {
            fullName.append(", ").append(stateProvinceCode);
        }
        if (countryCode != null) {
            fullName.append(", ").append(countryCode);
        }
        return fullName.toString();
    }

    // Backward compatibility methods
    public String getCode() {
        return countryCode + (stateProvinceCode != null ? "-" + stateProvinceCode : "");
    }

    public void setCode(String code) {
        if (code != null && code.contains("-")) {
            String[] parts = code.split("-", 2);
            this.countryCode = parts[0];
            this.stateProvinceCode = parts[1];
        } else {
            this.countryCode = code;
        }
    }

    // Additional backward compatibility methods for service layer
    public String getCity() {
        return null; // This field doesn't exist in database schema
    }

    public void setCity(String city) {
        // This field doesn't exist in database schema
    }

    public Boolean getIsDefault() {
        return false; // This field doesn't exist in database schema
    }

    public void setIsDefault(Boolean isDefault) {
        // This field doesn't exist in database schema
    }

    public String getRegulatoryBody() {
        return null; // This field doesn't exist in database schema
    }

    public void setRegulatoryBody(String regulatoryBody) {
        // This field doesn't exist in database schema
    }

    public String getContactInformation() {
        return null; // This field doesn't exist in database schema
    }

    public void setContactInformation(String contactInformation) {
        // This field doesn't exist in database schema
    }

    public String getWebsite() {
        return null; // This field doesn't exist in database schema
    }

    public void setWebsite(String website) {
        // This field doesn't exist in database schema
    }
    public String getDescription() {
        return null; // This field doesn't exist in database schema
    }

    public void setDescription(String description) {
        // This field doesn't exist in database schema
    }

    public String getCountry() {
        return countryCode;
    }

    public void setCountry(String country) {
        this.countryCode = country;
    }

    public String getStateProvince() {
        return stateProvinceCode;
    }

    public void setStateProvince(String stateProvince) {
        this.stateProvinceCode = stateProvince;
    }

    public enum JurisdictionType {
        COUNTRY,
        STATE,
        PROVINCE,
        REGION,
        CITY
    }
}

