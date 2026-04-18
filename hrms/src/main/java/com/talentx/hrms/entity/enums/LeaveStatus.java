package com.talentx.hrms.entity.enums;

public enum LeaveStatus {
    PENDING("Pending"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled"),
    WITHDRAWN("Withdrawn"),
    EXPIRED("Expired");

    private final String displayName;

    LeaveStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

