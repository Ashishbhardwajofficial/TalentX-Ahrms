package com.talentx.hrms.entity.enums;

public enum TrainingType {
    ORIENTATION("Orientation"),
    ONBOARDING("Onboarding"),
    TECHNICAL_SKILLS("Technical Skills"),
    SOFT_SKILLS("Soft Skills"),
    COMPLIANCE("Compliance"),
    LEADERSHIP("Leadership"),
    SAFETY("Safety"),
    PRODUCT_KNOWLEDGE("Product Knowledge");

    private final String displayName;

    TrainingType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
