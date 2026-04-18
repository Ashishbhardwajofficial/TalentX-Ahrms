package com.talentx.hrms.entity.enums;

public enum ReviewType {
    ANNUAL("Annual"),
    SEMI_ANNUAL("Semi-Annual"),
    QUARTERLY("Quarterly"),
    MONTHLY("Monthly"),
    PROBATION("Probation"),
    PROJECT_BASED("Project-Based"),
    AD_HOC("Ad-Hoc");

    private final String displayName;

    ReviewType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
