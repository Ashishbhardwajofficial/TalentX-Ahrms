package com.talentx.hrms.dto.benefits;

import com.talentx.hrms.entity.enums.BenefitPlanType;
import com.talentx.hrms.entity.enums.BenefitStatus;
import com.talentx.hrms.entity.enums.CoverageLevel;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmployeeBenefitResponse {
    
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private Long benefitPlanId;
    private String benefitPlanName;
    private BenefitPlanType planType;
    private String provider;
    private LocalDate enrollmentDate;
    private LocalDate effectiveDate;
    private LocalDate terminationDate;
    private String terminationReason;
    private BenefitStatus status;
    private CoverageLevel coverageLevel;
    private String beneficiaries;
    private BigDecimal employeeCost;
    private BigDecimal employerCost;
    private BigDecimal totalCost;
    private String costFrequency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public EmployeeBenefitResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public String getEmployeeName() {
        return employeeName;
    }
    
    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }
    
    public String getEmployeeNumber() {
        return employeeNumber;
    }
    
    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }
    
    public Long getBenefitPlanId() {
        return benefitPlanId;
    }
    
    public void setBenefitPlanId(Long benefitPlanId) {
        this.benefitPlanId = benefitPlanId;
    }
    
    public String getBenefitPlanName() {
        return benefitPlanName;
    }
    
    public void setBenefitPlanName(String benefitPlanName) {
        this.benefitPlanName = benefitPlanName;
    }
    
    public BenefitPlanType getPlanType() {
        return planType;
    }
    
    public void setPlanType(BenefitPlanType planType) {
        this.planType = planType;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }
    
    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
    
    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public LocalDate getTerminationDate() {
        return terminationDate;
    }
    
    public void setTerminationDate(LocalDate terminationDate) {
        this.terminationDate = terminationDate;
    }
    
    public String getTerminationReason() {
        return terminationReason;
    }
    
    public void setTerminationReason(String terminationReason) {
        this.terminationReason = terminationReason;
    }
    
    public BenefitStatus getStatus() {
        return status;
    }
    
    public void setStatus(BenefitStatus status) {
        this.status = status;
    }
    
    public CoverageLevel getCoverageLevel() {
        return coverageLevel;
    }
    
    public void setCoverageLevel(CoverageLevel coverageLevel) {
        this.coverageLevel = coverageLevel;
    }
    
    public String getBeneficiaries() {
        return beneficiaries;
    }
    
    public void setBeneficiaries(String beneficiaries) {
        this.beneficiaries = beneficiaries;
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
    
    public BigDecimal getTotalCost() {
        return totalCost;
    }
    
    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
    
    public String getCostFrequency() {
        return costFrequency;
    }
    
    public void setCostFrequency(String costFrequency) {
        this.costFrequency = costFrequency;
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
}

