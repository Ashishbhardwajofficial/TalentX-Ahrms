package com.talentx.hrms.entity.enums;

public enum EmploymentType {
    FULL_TIME("Full Time"),
    PART_TIME("Part Time"),
    CONTRACT("Contract"),
    TEMPORARY("Temporary"),
    INTERN("Intern"),
    CONSULTANT("Consultant"),
    FREELANCE("Freelance");

    private final String displayName;

    EmploymentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

