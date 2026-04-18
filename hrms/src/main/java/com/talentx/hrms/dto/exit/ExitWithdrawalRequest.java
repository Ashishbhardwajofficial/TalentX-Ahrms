package com.talentx.hrms.dto.exit;

import jakarta.validation.constraints.Size;

/**
 * DTO for exit withdrawal requests
 */
public class ExitWithdrawalRequest {

    @Size(max = 500, message = "Withdrawal reason must not exceed 500 characters")
    private String withdrawalReason;

    // Constructors
    public ExitWithdrawalRequest() {}

    public ExitWithdrawalRequest(String withdrawalReason) {
        this.withdrawalReason = withdrawalReason;
    }

    // Getters and Setters
    public String getWithdrawalReason() {
        return withdrawalReason;
    }

    public void setWithdrawalReason(String withdrawalReason) {
        this.withdrawalReason = withdrawalReason;
    }
}

