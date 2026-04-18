package com.talentx.hrms.dto.compliance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ComplianceCheckResolveRequest {

    @NotBlank(message = "Resolved by is required")
    @Size(max = 255, message = "Resolved by must not exceed 255 characters")
    private String resolvedBy;

    @Size(max = 1000, message = "Resolution notes must not exceed 1000 characters")
    private String resolutionNotes;

    // Constructors
    public ComplianceCheckResolveRequest() {}

    public ComplianceCheckResolveRequest(String resolvedBy, String resolutionNotes) {
        this.resolvedBy = resolvedBy;
        this.resolutionNotes = resolutionNotes;
    }

    // Getters and Setters
    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}

