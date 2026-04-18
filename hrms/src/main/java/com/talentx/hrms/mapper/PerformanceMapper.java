package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.performance.*;
import com.talentx.hrms.entity.performance.Goal;
import com.talentx.hrms.entity.performance.PerformanceReview;
import com.talentx.hrms.entity.performance.PerformanceReviewCycle;
import org.springframework.stereotype.Component;

@Component
public class PerformanceMapper {

    // ===== PERFORMANCE REVIEW CYCLE MAPPING =====

    public PerformanceReviewCycleResponse toResponse(PerformanceReviewCycle cycle) {
        if (cycle == null) {
            return null;
        }

        PerformanceReviewCycleResponse response = new PerformanceReviewCycleResponse();
        response.setId(cycle.getId());
        response.setOrganizationId(cycle.getOrganization().getId());
        response.setName(cycle.getName());
        response.setReviewType(cycle.getReviewType());
        response.setStartDate(cycle.getStartDate());
        response.setEndDate(cycle.getEndDate());
        response.setSelfReviewDeadline(cycle.getSelfReviewDeadline());
        response.setManagerReviewDeadline(cycle.getManagerReviewDeadline());
        response.setStatus(cycle.getStatus());
        response.setCreatedAt(cycle.getCreatedAt());
        response.setUpdatedAt(cycle.getUpdatedAt());

        return response;
    }

    // ===== PERFORMANCE REVIEW MAPPING =====

    public PerformanceReviewResponse toResponse(PerformanceReview review) {
        if (review == null) return null;

        PerformanceReviewResponse response = new PerformanceReviewResponse();
        response.setId(review.getId());
        try { response.setReviewCycleId(review.getReviewCycle().getId()); } catch (Exception e) {}
        try { response.setReviewCycleName(review.getReviewCycle().getName()); } catch (Exception e) {}
        try {
            response.setEmployeeId(review.getEmployee().getId());
            response.setEmployeeName(buildEmployeeName(review.getEmployee().getFirstName(), review.getEmployee().getLastName()));
        } catch (Exception e) {}
        try {
            response.setReviewerId(review.getReviewer().getId());
            response.setReviewerName(buildEmployeeName(review.getReviewer().getFirstName(), review.getReviewer().getLastName()));
        } catch (Exception e) {}
        response.setReviewType(review.getReviewType());
        response.setOverallRating(review.getOverallRating() != null ? review.getOverallRating().intValue() : null);
        response.setStrengths(review.getStrengths());
        response.setAreasForImprovement(review.getAreasForImprovement());
        response.setAchievements(review.getAchievements());
        response.setGoalsNextPeriod(review.getGoalsNextPeriod());
        response.setStatus(review.getStatus());
        response.setSubmittedAt(review.getSubmittedAt() != null ?
            review.getSubmittedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null);
        response.setAcknowledgedAt(review.getAcknowledgedAt() != null ?
            review.getAcknowledgedAt().atZone(java.time.ZoneId.systemDefault()).toInstant() : null);
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }

    // ===== GOAL MAPPING =====

    public GoalResponse toResponse(Goal goal) {
        if (goal == null) return null;

        GoalResponse response = new GoalResponse();
        response.setId(goal.getId());
        try {
            response.setEmployeeId(goal.getEmployee().getId());
            response.setEmployeeName(buildEmployeeName(goal.getEmployee().getFirstName(), goal.getEmployee().getLastName()));
        } catch (Exception e) {}
        response.setTitle(goal.getTitle());
        response.setDescription(goal.getDescription());
        response.setGoalType(goal.getGoalType());
        response.setCategory(goal.getCategory());
        response.setStartDate(goal.getStartDate());
        response.setTargetDate(goal.getTargetDate());
        response.setCompletionDate(goal.getCompletionDate());
        response.setProgressPercentage(goal.getProgressPercentage());
        response.setStatus(goal.getStatus());
        response.setWeight(goal.getWeight() != null ? goal.getWeight().intValue() : null);
        response.setMeasurementCriteria(goal.getMeasurementCriteria());
        if (goal.getCreatedByEmployee() != null) {
            try {
                response.setCreatedByEmployeeId(goal.getCreatedByEmployee().getId());
                response.setCreatedByEmployeeName(buildEmployeeName(
                    goal.getCreatedByEmployee().getFirstName(), goal.getCreatedByEmployee().getLastName()));
            } catch (Exception e) {}
        }
        response.setCreatedAt(goal.getCreatedAt());
        response.setUpdatedAt(goal.getUpdatedAt());
        return response;
    }

    // ===== HELPER METHODS =====

    private String buildEmployeeName(String firstName, String lastName) {
        if (firstName == null && lastName == null) {
            return null;
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return firstName + " " + lastName;
    }
}

