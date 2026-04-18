package com.talentx.hrms.entity.enums;

public enum ProficiencyLevel {
    NOVICE("Novice"),
    BEGINNER("Beginner"),
    INTERMEDIATE("Intermediate"),
    ADVANCED("Advanced"),
    EXPERT("Expert");

    private final String displayName;

    ProficiencyLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
