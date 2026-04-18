package com.talentx.hrms.entity.enums;

public enum SubscriptionTier {
    STARTER("Starter tier"),
    PROFESSIONAL("Professional tier"),
    ENTERPRISE("Enterprise tier");

    private final String description;

    SubscriptionTier(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

