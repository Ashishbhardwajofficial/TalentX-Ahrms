package com.talentx.hrms.entity.enums;

public enum HolidayType {
    NATIONAL("National"),
    OPTIONAL("Optional"),
    COMPANY("Company");

    private final String displayName;

    HolidayType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

