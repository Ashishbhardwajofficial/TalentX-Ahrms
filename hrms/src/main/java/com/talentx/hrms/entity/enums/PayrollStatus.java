package com.talentx.hrms.entity.enums;

public enum PayrollStatus {
    DRAFT("Draft"),
    PROCESSING("Processing"),
    CALCULATED("Calculated"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    PAID("Paid"),
    CANCELLED("Cancelled"),
    ERROR("Error");

    private final String displayName;

    PayrollStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

