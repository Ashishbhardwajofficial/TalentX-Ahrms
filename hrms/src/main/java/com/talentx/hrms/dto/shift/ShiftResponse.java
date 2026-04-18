package com.talentx.hrms.dto.shift;

import com.talentx.hrms.entity.attendance.Shift;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;

/**
 * DTO for shift response
 */
public class ShiftResponse {

    private Long id;
    private Long organizationId;
    private String name;
    private String description;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private BigDecimal totalHours;
    private Integer gracePeriodMinutes;
    @JsonProperty("isNightShift")
    private Boolean isNightShift;
    @JsonProperty("isFlexible")
    private Boolean isFlexible;
    private BigDecimal minimumHours;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public ShiftResponse() {}

    public ShiftResponse(Shift shift) {
        this.id = shift.getId();
        this.organizationId = shift.getOrganization().getId();
        this.name = shift.getName();
        this.description = shift.getDescription();
        this.startTime = shift.getStartTime();
        this.endTime = shift.getEndTime();
        this.breakStartTime = shift.getBreakStartTime();
        this.breakEndTime = shift.getBreakEndTime();
        this.totalHours = shift.getTotalHours();
        this.gracePeriodMinutes = shift.getGracePeriodMinutes();
        this.isNightShift = shift.getIsNightShift();
        this.isFlexible = shift.getIsFlexible();
        this.minimumHours = shift.getMinimumHours();
        this.createdAt = shift.getCreatedAt();
        this.updatedAt = shift.getUpdatedAt();
    }

    // Static factory method
    public static ShiftResponse fromEntity(Shift shift) {
        return new ShiftResponse(shift);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public BigDecimal getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(BigDecimal totalHours) {
        this.totalHours = totalHours;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

