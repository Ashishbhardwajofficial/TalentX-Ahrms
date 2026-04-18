package com.talentx.hrms.dto.benefits;

import com.talentx.hrms.entity.enums.BenefitPlanType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BenefitPlanRequest {
    
    @NotBlank(message = "Benefit plan name is required")
    @Size(max = 255, message = "Benefit plan name must not exceed 255 characters")
    private String name;
    
    @NotNull(message = "Plan type is required")
    private BenefitPlanType planType;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Size(max = 255, message = "Provider name must not exceed 255 characters")
    private String provider;
    
    private BigDecimal employeeCost;
    
    private BigDecimal employerCost;
    
    @Size(max = 50, message = "Cost frequency must not exceed 50 characters")
    private String costFrequency;
    
    private LocalDate effectiveDate;
    
    private LocalDate expiryDate;
    
    private Boolean isActive;
    
    // Constructors
    public BenefitPlanRequest() {}
    
    // Getters and Setters
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
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

