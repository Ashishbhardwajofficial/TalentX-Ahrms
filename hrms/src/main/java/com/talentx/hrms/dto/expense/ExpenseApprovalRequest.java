package com.talentx.hrms.dto.expense;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for expense approval/rejection requests
 */
public class ExpenseApprovalRequest {

    @NotNull(message = "Approver ID is required")
    private Long approverId;

    @Size(max = 500, message = "Rejection reason must not exceed 500 characters")
    private String rejectionReason;

    // Constructors
    public ExpenseApprovalRequest() {}

    public ExpenseApprovalRequest(Long approverId) {
        this.approverId = approverId;
    }

    public ExpenseApprovalRequest(Long approverId, String rejectionReason) {
        this.approverId = approverId;
        this.rejectionReason = rejectionReason;
    }

    // Getters and Setters
    public Long getApproverId() {
        return approverId;
    }

    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}

