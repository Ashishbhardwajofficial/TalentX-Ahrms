package com.talentx.hrms.dto.benefits;

import com.talentx.hrms.entity.enums.CoverageLevel;
import jakarta.validation.constraints.Size;

public class EmployeeBenefitUpdateRequest {
    
    private CoverageLevel coverageLevel;
    
    @Size(max = 1000, message = "Beneficiaries information must not exceed 1000 characters")
    private String beneficiaries;
    
    // Constructors
    public EmployeeBenefitUpdateRequest() {}
    
    // Getters and Setters
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

