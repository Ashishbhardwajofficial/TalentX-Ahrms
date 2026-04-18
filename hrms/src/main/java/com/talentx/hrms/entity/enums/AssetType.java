package com.talentx.hrms.entity.enums;

public enum AssetType {
    LAPTOP("Laptop"),
    ID_CARD("ID Card"),
    MOBILE("Mobile Phone"),
    OTHER("Other");

    private final String displayName;

    AssetType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

