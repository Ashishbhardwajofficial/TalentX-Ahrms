package com.talentx.hrms.dto.performance;

import com.talentx.hrms.entity.performance.Goal;

import java.time.Instant;
import java.time.LocalDate;

public class GoalResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String title;
    private String description;
    private Goal.GoalType goalType;
    private Goal.GoalCategory category;
    private LocalDate startDate;
    private LocalDate targetDate;
    private LocalDate completionDate;
    private Integer progressPercentage;
    private Goal.GoalStatus status;
    private Integer weight;
    private String measurementCriteria;
    private Long createdByEmployeeId;
    private String createdByEmployeeName;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public GoalResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public Goal.GoalStatus getStatus() {
        return status;
    }

    public void setStatus(Goal.GoalStatus status) {
        this.status = status;
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

    public String getCreatedByEmployeeName() {
        return createdByEmployeeName;
    }

    public void setCreatedByEmployeeName(String createdByEmployeeName) {
        this.createdByEmployeeName = createdByEmployeeName;
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

