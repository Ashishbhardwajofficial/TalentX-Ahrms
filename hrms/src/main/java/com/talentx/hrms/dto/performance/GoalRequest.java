package com.talentx.hrms.dto.performance;

import com.talentx.hrms.entity.performance.Goal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.time.LocalDate;

public class GoalRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Goal type is required")
    private Goal.GoalType goalType;

    @NotNull(message = "Category is required")
    private Goal.GoalCategory category;

    private LocalDate startDate;

    private LocalDate targetDate;

    @Min(value = 0, message = "Progress percentage must be at least 0")
    @Max(value = 100, message = "Progress percentage must not exceed 100")
    private Integer progressPercentage = 0;

    @Min(value = 0, message = "Weight must be at least 0")
    @Max(value = 100, message = "Weight must not exceed 100")
    private Integer weight;

    @Size(max = 1000, message = "Measurement criteria must not exceed 1000 characters")
    private String measurementCriteria;

    private Long createdByEmployeeId;

    // Constructors
    public GoalRequest() {}

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Goal.GoalType getGoalType() {
        return goalType;
    }

    public void setGoalType(Goal.GoalType goalType) {
        this.goalType = goalType;
    }

    public Goal.GoalCategory getCategory() {
        return category;
    }

    public void setCategory(Goal.GoalCategory category) {
        this.category = category;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public String getMeasurementCriteria() {
        return measurementCriteria;
    }

    public void setMeasurementCriteria(String measurementCriteria) {
        this.measurementCriteria = measurementCriteria;
    }

    public Long getCreatedByEmployeeId() {
        return createdByEmployeeId;
    }

    public void setCreatedByEmployeeId(Long createdByEmployeeId) {
        this.createdByEmployeeId = createdByEmployeeId;
    }
}

