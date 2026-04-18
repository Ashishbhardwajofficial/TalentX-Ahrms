package com.talentx.hrms.dto.shift;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * DTO for creating or updating a shift
 */
public class ShiftRequest {

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotBlank(message = "Shift name is required")
    @Size(max = 100, message = "Shift name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private LocalTime breakStartTime;

    private LocalTime breakEndTime;

    private Integer gracePeriodMinutes;

    private Boolean isNightShift;

    private Boolean isFlexible;

    private BigDecimal minimumHours;

    // Constructors
    public ShiftRequest() {}

    // Getters and Setters
    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public LocalTime getBreakStartTime() {
        return breakStartTime;
    }

    public void setBreakStartTime(LocalTime breakStartTime) {
        this.breakStartTime = breakStartTime;
    }

    public LocalTime getBreakEndTime() {
        return breakEndTime;
    }

    public void setBreakEndTime(LocalTime breakEndTime) {
        this.breakEndTime = breakEndTime;
    }

    public Integer getGracePeriodMinutes() {
        return gracePeriodMinutes;
    }

    public void setGracePeriodMinutes(Integer gracePeriodMinutes) {
        this.gracePeriodMinutes = gracePeriodMinutes;
    }

    public Boolean getIsNightShift() {
        return isNightShift;
    }

    public void setIsNightShift(Boolean isNightShift) {
        this.isNightShift = isNightShift;
    }

    public Boolean getIsFlexible() {
        return isFlexible;
    }

    public void setIsFlexible(Boolean isFlexible) {
        this.isFlexible = isFlexible;
    }

    public BigDecimal getMinimumHours() {
        return minimumHours;
    }

    public void setMinimumHours(BigDecimal minimumHours) {
        this.minimumHours = minimumHours;
    }
}

