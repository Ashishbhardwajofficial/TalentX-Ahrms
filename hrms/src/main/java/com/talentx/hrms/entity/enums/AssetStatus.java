package com.talentx.hrms.entity.enums;

public enum AssetStatus {
    AVAILABLE("Available"),
    ASSIGNED("Assigned"),
    DAMAGED("Damaged"),
    RETIRED("Retired"),
    DISPOSED("Disposed");

    private final String displayName;

    AssetStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

