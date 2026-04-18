package com.talentx.hrms.entity.enums;

public enum GoalCategory {
    INDIVIDUAL("Individual"),
    TEAM("Team"),
    DEPARTMENT("Department"),
    ORGANIZATION("Organization");

    private final String displayName;

    GoalCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
