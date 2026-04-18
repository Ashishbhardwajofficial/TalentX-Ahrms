package com.talentx.hrms.dto.attendance;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class HolidayResponse {

    private Long id;
    private String name;
    private LocalDate holidayDate;
    private String description;
    private String holidayType;
    private Boolean isOptional;
    private Boolean isRecurring;
    private String applicableLocations;
    private Long organizationId;
    private String organizationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public HolidayResponse() {}

    public HolidayResponse(Long id, String name, LocalDate holidayDate, String holidayType, Long organizationId) {
        this.id = id;
        this.name = name;
        this.holidayDate = holidayDate;
        this.holidayType = holidayType;
        this.organizationId = organizationId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getHolidayDate() {
        return holidayDate;
    }

    public void setHolidayDate(LocalDate holidayDate) {
        this.holidayDate = holidayDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHolidayType() {
        return holidayType;
    }

    public void setHolidayType(String holidayType) {
        this.holidayType = holidayType;
    }

    public Boolean getIsOptional() {
        return isOptional;
    }

    public void setIsOptional(Boolean isOptional) {
        this.isOptional = isOptional;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public String getApplicableLocations() {
        return applicableLocations;
    }

    public void setApplicableLocations(String applicableLocations) {
        this.applicableLocations = applicableLocations;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

