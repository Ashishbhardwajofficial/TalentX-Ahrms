package com.talentx.hrms.dto.benefits;

import com.talentx.hrms.entity.enums.CoverageLevel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class EmployeeBenefitRequest {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    @NotNull(message = "Benefit plan ID is required")
    private Long benefitPlanId;
    
    private LocalDate enrollmentDate;
    
    private LocalDate effectiveDate;
    
    private CoverageLevel coverageLevel;
    
    @Size(max = 1000, message = "Beneficiaries information must not exceed 1000 characters")
    private String beneficiaries;
    
    // Constructors
    public EmployeeBenefitRequest() {}
    
    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public Long getBenefitPlanId() {
        return benefitPlanId;
    }
    
    public void setBenefitPlanId(Long benefitPlanId) {
        this.benefitPlanId = benefitPlanId;
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
}

