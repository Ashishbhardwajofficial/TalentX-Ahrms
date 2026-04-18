package com.talentx.hrms.entity.enums;

/**
 * Enumeration for expense status
 */
public enum ExpenseStatus {
    SUBMITTED("Submitted"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    PAID("Paid");

    private final String displayName;

    ExpenseStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

