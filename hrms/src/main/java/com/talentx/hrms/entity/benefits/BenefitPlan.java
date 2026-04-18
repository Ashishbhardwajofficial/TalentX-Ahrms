package com.talentx.hrms.entity.benefits;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "benefit_plans")
@AttributeOverride(name = "id", column = @Column(name = "benefit_plan_id"))
@Getter
@Setter
public class BenefitPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    private BenefitPlanType planType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "provider")
    private String provider;

    @Column(name = "employee_cost", precision = 10, scale = 2)
    private BigDecimal employeeCost;

    @Column(name = "employer_cost", precision = 10, scale = 2)
    private BigDecimal employerCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "cost_frequency")
    private CostFrequency costFrequency;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    // Backward compatibility methods for service layer
    public String getProviderName() {
        return provider;
    }

    public void setProviderName(String providerName) {
        this.provider = providerName;
    }

    public LocalDate getExpirationDate() {
        return expiryDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expiryDate = expirationDate;
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(isActive);
    }

    @OneToMany(mappedBy = "benefitPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EmployeeBenefit> employeeBenefits = new ArrayList<>();

    public enum BenefitPlanType {
        HEALTH_INSURANCE, DENTAL, VISION, LIFE_INSURANCE, RETIREMENT, STOCK_OPTIONS, OTHER
    }

    public enum CostFrequency {
        MONTHLY, ANNUALLY, PER_PAY_PERIOD
    }

    // Constructors
    public BenefitPlan() {}

    public BenefitPlan(String name, BenefitPlanType planType, Organization organization) {
        this.name = name;
        this.planType = planType;
        this.organization = organization;
    }

    // Getters and Setters (manually added due to Lombok processing issues)
    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
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

    public CostFrequency getCostFrequency() {
        return costFrequency;
    }

    public void setCostFrequency(CostFrequency costFrequency) {
        this.costFrequency = costFrequency;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    public List<EmployeeBenefit> getEmployeeBenefits() {
        return employeeBenefits;
    }

    public void setEmployeeBenefits(List<EmployeeBenefit> employeeBenefits) {
        this.employeeBenefits = employeeBenefits;
    }
}

