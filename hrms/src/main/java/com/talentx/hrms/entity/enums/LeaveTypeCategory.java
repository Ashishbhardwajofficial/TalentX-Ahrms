package com.talentx.hrms.entity.enums;

public enum LeaveTypeCategory {
    ANNUAL("Annual Leave"),
    SICK("Sick Leave"),
    MATERNITY("Maternity Leave"),
    PATERNITY("Paternity Leave"),
    PERSONAL("Personal Leave"),
    EMERGENCY("Emergency Leave"),
    BEREAVEMENT("Bereavement Leave"),
    STUDY("Study Leave"),
    SABBATICAL("Sabbatical Leave"),
    UNPAID("Unpaid Leave"),
    PAID("Paid Leave"),
    COMPENSATORY("Compensatory Leave");

    private final String displayName;

    LeaveTypeCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

