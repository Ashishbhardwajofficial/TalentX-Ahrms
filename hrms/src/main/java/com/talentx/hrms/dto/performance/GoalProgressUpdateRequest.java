package com.talentx.hrms.dto.performance;

import com.talentx.hrms.entity.performance.Goal;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

public class GoalProgressUpdateRequest {

    @NotNull(message = "Progress percentage is required")
    @Min(value = 0, message = "Progress percentage must be at least 0")
    @Max(value = 100, message = "Progress percentage must not exceed 100")
    private Integer progressPercentage;

    @NotNull(message = "Status is required")
    private Goal.GoalStatus status;

    // Constructors
    public GoalProgressUpdateRequest() {}

    public GoalProgressUpdateRequest(Integer progressPercentage, Goal.GoalStatus status) {
        this.progressPercentage = progressPercentage;
        this.status = status;
    }

    // Getters and Setters
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
}

