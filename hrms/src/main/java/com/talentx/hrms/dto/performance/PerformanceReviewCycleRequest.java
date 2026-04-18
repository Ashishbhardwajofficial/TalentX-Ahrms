package com.talentx.hrms.dto.performance;

import com.talentx.hrms.entity.performance.PerformanceReviewCycle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class PerformanceReviewCycleRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotNull(message = "Review type is required")
    private PerformanceReviewCycle.ReviewType reviewType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private LocalDate selfReviewDeadline;

    private LocalDate managerReviewDeadline;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    // Constructors
    public PerformanceReviewCycleRequest() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public PerformanceReviewCycle.ReviewType getReviewType() {
        return reviewType;
    }

    public void setReviewType(PerformanceReviewCycle.ReviewType reviewType) {
        this.reviewType = reviewType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getSelfReviewDeadline() {
        return selfReviewDeadline;
    }

    public void setSelfReviewDeadline(LocalDate selfReviewDeadline) {
        this.selfReviewDeadline = selfReviewDeadline;
    }

    public LocalDate getManagerReviewDeadline() {
        return managerReviewDeadline;
    }

    public void setManagerReviewDeadline(LocalDate managerReviewDeadline) {
        this.managerReviewDeadline = managerReviewDeadline;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
}

