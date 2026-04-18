package com.talentx.hrms.dto.benefits;

import com.talentx.hrms.entity.enums.BenefitPlanType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BenefitPlanResponse {
    
    private Long id;
    private String name;
    private BenefitPlanType planType;
    private String description;
    private String provider;
    private BigDecimal employeeCost;
    private BigDecimal employerCost;
    private String costFrequency;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private boolean isActive;
    private Long organizationId;
    private String organizationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int enrollmentCount;
    
    // Constructors
    public BenefitPlanResponse() {}
    
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
    
    public BenefitPlanType getPlanType() {
        return planType;
    }
    
    public void setPlanType(BenefitPlanType planType) {
        this.planType = planType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public BigDecimal getEmployeeCost() {
        return employeeCost;
    }
    
    public void setEmployeeCost(BigDecimal employeeCost) {
        this.employeeCost = employeeCost;
    }
    
    public BigDecimal getEmployerCost() {
        return employerCost;
    }
    
    public void setEmployerCost(BigDecimal employerCost) {
        this.employerCost = employerCost;
    }
    
    public String getCostFrequency() {
        return costFrequency;
    }
    
    public void setCostFrequency(String costFrequency) {
        this.costFrequency = costFrequency;
    }
    
    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public LocalDate getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    
    public String getOrganizationName() {
        return organizationName;
    }
    
    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public int getEnrollmentCount() {
        return enrollmentCount;
    }
    
    public void setEnrollmentCount(int enrollmentCount) {
        this.enrollmentCount = enrollmentCount;
    }
}

