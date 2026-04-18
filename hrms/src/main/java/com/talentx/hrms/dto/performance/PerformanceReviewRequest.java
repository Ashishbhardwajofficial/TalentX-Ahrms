package com.talentx.hrms.dto.performance;

import com.talentx.hrms.entity.performance.PerformanceReview;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

public class PerformanceReviewRequest {

    @NotNull(message = "Review cycle ID is required")
    private Long reviewCycleId;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Reviewer ID is required")
    private Long reviewerId;

    @NotNull(message = "Review type is required")
    private PerformanceReview.ReviewType reviewType;

    @Min(value = 1, message = "Overall rating must be at least 1")
    @Max(value = 5, message = "Overall rating must not exceed 5")
    private Integer overallRating;

    @Size(max = 2000, message = "Strengths must not exceed 2000 characters")
    private String strengths;

    @Size(max = 2000, message = "Areas for improvement must not exceed 2000 characters")
    private String areasForImprovement;

    @Size(max = 2000, message = "Achievements must not exceed 2000 characters")
    private String achievements;

    @Size(max = 2000, message = "Goals next period must not exceed 2000 characters")
    private String goalsNextPeriod;

    // Constructors
    public PerformanceReviewRequest() {}

    // Getters and Setters
    public Long getReviewCycleId() {
        return reviewCycleId;
    }

    public void setReviewCycleId(Long reviewCycleId) {
        this.reviewCycleId = reviewCycleId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
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
}

