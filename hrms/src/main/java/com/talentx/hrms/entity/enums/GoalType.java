package com.talentx.hrms.entity.enums;

public enum GoalType {
    PERFORMANCE("Performance"),
    DEVELOPMENT("Development"),
    BEHAVIORAL("Behavioral"),
    TECHNICAL("Technical"),
    PROJECT("Project");

    private final String displayName;

    GoalType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
