package com.talentx.hrms.dto.exit;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for exit approval requests
 */
public class ExitApprovalRequest {

    @NotNull(message = "Approver ID is required")
    private Long approverId;

    // Constructors
    public ExitApprovalRequest() {}

    public ExitApprovalRequest(Long approverId) {
        this.approverId = approverId;
    }

    // Getters and Setters
    public Long getApproverId() {
        return approverId;
    }

    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }
}

