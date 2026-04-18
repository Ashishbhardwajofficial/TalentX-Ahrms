package com.talentx.hrms.entity.enums;

/**
 * Enumeration for expense types
 */
public enum ExpenseType {
    TRAVEL("Travel"),
    FOOD("Food"),
    ACCOMMODATION("Accommodation"),
    OFFICE("Office"),
    OTHER("Other");

    private final String displayName;

    ExpenseType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

