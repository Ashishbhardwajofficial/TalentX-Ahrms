package com.talentx.hrms.dto.performance;

import com.talentx.hrms.entity.performance.PerformanceReview;

import java.time.Instant;

public class PerformanceReviewResponse {

    private Long id;
    private Long reviewCycleId;
    private String reviewCycleName;
    private Long employeeId;
    private String employeeName;
    private Long reviewerId;
    private String reviewerName;
    private PerformanceReview.ReviewType reviewType;
    private Integer overallRating;
    private String strengths;
    private String areasForImprovement;
    private String achievements;
    private String goalsNextPeriod;
    private PerformanceReview.ReviewStatus status;
    private Instant submittedAt;
    private Instant acknowledgedAt;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public PerformanceReviewResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReviewCycleId() {
        return reviewCycleId;
    }

    public void setReviewCycleId(Long reviewCycleId) {
        this.reviewCycleId = reviewCycleId;
    }

    public String getReviewCycleName() {
        return reviewCycleName;
    }

    public void setReviewCycleName(String reviewCycleName) {
        this.reviewCycleName = reviewCycleName;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public PerformanceReview.ReviewType getReviewType() {
        return reviewType;
    }

    public void setReviewType(PerformanceReview.ReviewType reviewType) {
        this.reviewType = reviewType;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Integer overallRating) {
        this.overallRating = overallRating;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getAreasForImprovement() {
        return areasForImprovement;
    }

    public void setAreasForImprovement(String areasForImprovement) {
        this.areasForImprovement = areasForImprovement;
    }

    public String getAchievements() {
        return achievements;
    }

    public void setAchievements(String achievements) {
        this.achievements = achievements;
    }

    public String getGoalsNextPeriod() {
        return goalsNextPeriod;
    }

    public void setGoalsNextPeriod(String goalsNextPeriod) {
        this.goalsNextPeriod = goalsNextPeriod;
    }

    public PerformanceReview.ReviewStatus getStatus() {
        return status;
    }

    public void setStatus(PerformanceReview.ReviewStatus status) {
        this.status = status;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Instant getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(Instant acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
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

