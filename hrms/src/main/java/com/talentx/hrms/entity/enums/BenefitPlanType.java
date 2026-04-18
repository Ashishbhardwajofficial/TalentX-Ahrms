package com.talentx.hrms.entity.enums;

/**
 * Benefit plan types — must match DB enum values exactly:
 * HEALTH_INSURANCE, DENTAL, VISION, LIFE_INSURANCE, RETIREMENT, STOCK_OPTIONS, OTHER
 */
public enum BenefitPlanType {
    HEALTH_INSURANCE("Health Insurance"),
    DENTAL("Dental Insurance"),
    VISION("Vision Insurance"),
    LIFE_INSURANCE("Life Insurance"),
    RETIREMENT("Retirement Plan"),
    STOCK_OPTIONS("Stock Options"),
    OTHER("Other");

    private final String displayName;

    BenefitPlanType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
