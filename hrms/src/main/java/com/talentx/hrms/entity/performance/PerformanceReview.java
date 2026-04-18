package com.talentx.hrms.entity.performance;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_reviews")
@Getter
@Setter
@AttributeOverride(name = "id", column = @Column(name = "performance_review_id"))
public class PerformanceReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_cycle_id", nullable = false)
    private PerformanceReviewCycle reviewCycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    // DB stores '360' but Java identifier cannot start with a digit — use converter
    @Convert(converter = ReviewType.ReviewTypeConverter.class)
    @Column(name = "review_type", nullable = false)
    private ReviewType reviewType;

    @Column(name = "overall_rating", precision = 3, scale = 2)
    private BigDecimal overallRating;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement;

    @Column(name = "achievements", columnDefinition = "TEXT")
    private String achievements;

    @Column(name = "goals_next_period", columnDefinition = "TEXT")
    private String goalsNextPeriod;

    @Convert(converter = ReviewStatus.ReviewStatusConverter.class)
    @Column(name = "status", nullable = false)
    private ReviewStatus status = ReviewStatus.NOT_STARTED;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    public enum ReviewType {
        SELF, MANAGER, PEER, THREE_SIXTY;

        /** Maps Java enum value to DB column value */
        public String toDbValue() {
            return this == THREE_SIXTY ? "360" : this.name();
        }

        /** Maps DB column value to Java enum value */
        public static ReviewType fromDbValue(String value) {
            if (value == null) return null;
            if ("360".equals(value)) return THREE_SIXTY;
            try {
                return ReviewType.valueOf(value);
            } catch (IllegalArgumentException e) {
                // Unknown DB value — default to SELF to avoid crash
                return SELF;
            }
        }

        @jakarta.persistence.Converter(autoApply = false)
        public static class ReviewTypeConverter
                implements jakarta.persistence.AttributeConverter<ReviewType, String> {
            @Override
            public String convertToDatabaseColumn(ReviewType attribute) {
                return attribute == null ? null : attribute.toDbValue();
            }
            @Override
            public ReviewType convertToEntityAttribute(String dbData) {
                return dbData == null ? null : ReviewType.fromDbValue(dbData);
            }
        }
    }

    public enum ReviewStatus {
        NOT_STARTED, IN_PROGRESS, SUBMITTED, ACKNOWLEDGED;

        public static ReviewStatus fromDbValue(String value) {
            if (value == null || value.trim().isEmpty()) return NOT_STARTED;
            try { return ReviewStatus.valueOf(value.trim()); }
            catch (IllegalArgumentException e) { return NOT_STARTED; }
        }

        @jakarta.persistence.Converter(autoApply = false)
        public static class ReviewStatusConverter
                implements jakarta.persistence.AttributeConverter<ReviewStatus, String> {
            @Override
            public String convertToDatabaseColumn(ReviewStatus attribute) {
                return attribute == null ? null : attribute.name();
            }
            @Override
            public ReviewStatus convertToEntityAttribute(String dbData) {
                return ReviewStatus.fromDbValue(dbData);
            }
        }
    }

    // Constructors
    public PerformanceReview() {}

    public PerformanceReview(PerformanceReviewCycle reviewCycle, Employee employee, 
                           Employee reviewer, ReviewType reviewType) {
        this.reviewCycle = reviewCycle;
        this.employee = employee;
        this.reviewer = reviewer;
        this.reviewType = reviewType;
    }
}

