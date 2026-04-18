package com.talentx.hrms.entity.enums;

public enum CostFrequency {
    DAILY("Daily"),
    WEEKLY("Weekly"),
    BI_WEEKLY("Bi-Weekly"),
    SEMIMONTHLY("Semi-Monthly"),
    MONTHLY("Monthly"),
    QUARTERLY("Quarterly"),
    SEMI_ANNUALLY("Semi-Annually"),
    ANNUALLY("Annually"),
    ONE_TIME("One-Time");

    private final String displayName;

    CostFrequency(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
