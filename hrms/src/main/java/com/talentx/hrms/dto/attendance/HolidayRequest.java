package com.talentx.hrms.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class HolidayRequest {

    @NotBlank(message = "Holiday name is required")
    @Size(max = 255, message = "Holiday name must not exceed 255 characters")
    private String name;

    @NotNull(message = "Holiday date is required")
    private LocalDate holidayDate;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Holiday type is required")
    private String holidayType; // NATIONAL, OPTIONAL, COMPANY

    private Boolean isOptional = false;

    private Boolean isRecurring = false;

    @Size(max = 100, message = "Applicable locations must not exceed 100 characters")
    private String applicableLocations;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    // Constructors
    public HolidayRequest() {}

    public HolidayRequest(String name, LocalDate holidayDate, String holidayType, Long organizationId) {
        this.name = name;
        this.holidayDate = holidayDate;
        this.holidayType = holidayType;
        this.organizationId = organizationId;
    }

    // Getters and Setters
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
}

