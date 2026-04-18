package com.talentx.hrms.entity.enums;

public enum DeliveryMethod {
    IN_PERSON("In-Person"),
    VIRTUAL_CLASSROOM("Virtual Classroom"),
    E_LEARNING("E-Learning"),
    ON_THE_JOB("On-the-Job"),
    BLENDED("Blended"),
    VIDEO_BASED("Video-Based"),
    EXTERNAL_WORKSHOP("External Workshop");

    private final String displayName;

    DeliveryMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
