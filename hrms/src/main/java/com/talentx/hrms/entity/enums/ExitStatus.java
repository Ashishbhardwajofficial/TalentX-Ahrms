package com.talentx.hrms.entity.enums;

/**
 * Enumeration for employee exit status
 */
public enum ExitStatus {
    INITIATED("Initiated"),
    PENDING("Pending"),
    APPROVED("Approved"),
    WITHDRAWN("Withdrawn"),
    COMPLETED("Completed");

    private final String displayName;

    ExitStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}

