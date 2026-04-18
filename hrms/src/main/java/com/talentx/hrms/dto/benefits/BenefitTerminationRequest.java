package com.talentx.hrms.dto.benefits;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class BenefitTerminationRequest {
    
    private LocalDate terminationDate;
    
    @Size(max = 500, message = "Termination reason must not exceed 500 characters")
    private String terminationReason;
    
    // Constructors
    public BenefitTerminationRequest() {}
    
    // Getters and Setters
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
}

