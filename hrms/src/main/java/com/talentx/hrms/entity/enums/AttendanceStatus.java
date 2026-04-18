package com.talentx.hrms.entity.enums;

public enum AttendanceStatus {
    PRESENT("Present"),
    ABSENT("Absent"),
    LATE("Late"),
    HALF_DAY("Half Day"),
    ON_LEAVE("On Leave"),
    HOLIDAY("Holiday"),
    WEEKEND("Weekend"),
    WORK_FROM_HOME("Work From Home"),
    OVERTIME("Overtime"),
    COMP_OFF("Compensatory Off");

    private final String displayName;

    AttendanceStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

