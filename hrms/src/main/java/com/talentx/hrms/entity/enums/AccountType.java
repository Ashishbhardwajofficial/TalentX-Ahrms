package com.talentx.hrms.entity.enums;

/**
 * Enumeration for bank account types
 */
public enum AccountType {
    SAVINGS("Savings"),
    CURRENT("Current"),
    SALARY("Salary");

    private final String displayName;

    AccountType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}

