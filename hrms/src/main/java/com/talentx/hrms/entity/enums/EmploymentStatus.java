package com.talentx.hrms.entity.enums;

public enum EmploymentStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    TERMINATED("Terminated"),
    SUSPENDED("Suspended"),
    ON_LEAVE("On Leave"),
    PROBATION("Probation"),
    NOTICE_PERIOD("Notice Period");

    private final String displayName;

    EmploymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

