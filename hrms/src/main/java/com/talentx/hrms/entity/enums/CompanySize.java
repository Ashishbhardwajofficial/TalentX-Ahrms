package com.talentx.hrms.entity.enums;

public enum CompanySize {
    SMALL("Small company"),
    MEDIUM("Medium company"),
    LARGE("Large company"),
    ENTERPRISE("Enterprise company");

    private final String description;

    CompanySize(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

