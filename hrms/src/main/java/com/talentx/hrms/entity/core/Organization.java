package com.talentx.hrms.entity.core;

import com.talentx.hrms.entity.enums.CompanySize;
import com.talentx.hrms.entity.enums.SubscriptionTier;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "organization_id")
    private Long id;

    @NotBlank(message = "Organization name is required")
    @Size(max = 255, message = "Organization name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 255, message = "Legal name must not exceed 255 characters")
    @Column(name = "legal_name")
    private String legalName;

    @Size(max = 50, message = "Tax ID must not exceed 50 characters")
    @Column(name = "tax_id")
    private String taxId;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    @Column(name = "industry")
    private String industry;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_size")
    private CompanySize companySize;

    @Size(max = 2, message = "Headquarters country must be 2 characters")
    @Column(name = "headquarters_country")
    private String headquartersCountry;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    @Column(name = "logo_url")
    private String logoUrl;

    @Size(max = 255, message = "Website must not exceed 255 characters")
    @Column(name = "website")
    private String website;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier")
    private SubscriptionTier subscriptionTier;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "deleted_at")
    private Timestamp deletedAt;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Department> departments = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Location> locations = new ArrayList<>();

    // Constructors
    public Organization() {}

    public Organization(String name) {
        this.name = name;
    }

    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

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

    public List<Department> getDepartments() {
        return departments;
    }

    public void setDepartments(List<Department> departments) {
        this.departments = departments;
    }

    public List<Location> getLocations() {
        return locations;
    }

    public void setLocations(List<Location> locations) {
        this.locations = locations;
    }

    // Additional methods for compatibility
    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        this.isActive = active;
    }

    // Helper methods
    public void addDepartment(Department department) {
        departments.add(department);
        department.setOrganization(this);
    }

    public void removeDepartment(Department department) {
        departments.remove(department);
        department.setOrganization(null);
    }

    public void addLocation(Location location) {
        locations.add(location);
        location.setOrganization(this);
    }

    public void removeLocation(Location location) {
        locations.remove(location);
        location.setOrganization(null);
    }
}

