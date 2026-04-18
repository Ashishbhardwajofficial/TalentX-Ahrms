package com.talentx.hrms.entity.enums;

public enum CoverageLevel {
    EMPLOYEE_ONLY("Employee Only"),
    EMPLOYEE_SPOUSE("Employee + Spouse"),
    EMPLOYEE_CHILDREN("Employee + Children"),
    FAMILY("Family"),
    EMPLOYEE_DOMESTIC_PARTNER("Employee + Domestic Partner");

    private final String displayName;

    CoverageLevel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

