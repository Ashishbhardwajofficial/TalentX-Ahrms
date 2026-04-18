package com.talentx.hrms.dto.performance;

import com.talentx.hrms.entity.performance.PerformanceReviewCycle;

import java.time.Instant;
import java.time.LocalDate;

public class PerformanceReviewCycleResponse {

    private Long id;
    private Long organizationId;
    private String name;
    private PerformanceReviewCycle.ReviewType reviewType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate selfReviewDeadline;
    private LocalDate managerReviewDeadline;
    private PerformanceReviewCycle.ReviewCycleStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public PerformanceReviewCycleResponse() {}

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

    public PerformanceReviewCycle.ReviewCycleStatus getStatus() {
        return status;
    }

    public void setStatus(PerformanceReviewCycle.ReviewCycleStatus status) {
        this.status = status;
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

