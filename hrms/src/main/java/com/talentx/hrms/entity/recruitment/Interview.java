package com.talentx.hrms.entity.recruitment;

import com.talentx.hrms.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@AttributeOverride(name = "id", column = @Column(name = "interview_id"))
@Getter
@Setter
public class Interview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type")
    private InterviewType interviewType;

    /**
     * DB column: scheduled_date (timestamp NOT NULL)
     */
    @Column(name = "scheduled_date", nullable = false)
    private LocalDateTime scheduledDate;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 60;

    @Column(name = "location")
    private String location;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    /**
     * DB column: interviewer_ids (JSON)
     * Stores interviewer employee IDs as JSON array string.
     */
    @Column(name = "interviewer_ids", columnDefinition = "JSON")
    private String interviewerIds;

    /**
     * DB column: feedback (TEXT)
     * Reused for: feedback, notes, cancellation reason.
     */
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    /**
     * DB column: rating (decimal 3,2)
     * Stores overall rating (0.00 - 5.00 or 0.00 - 10.00).
     */
    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation")
    private InterviewRecommendation recommendation;

    // =====================================================
    // TRANSIENT FIELDS — not in DB, request-scoped only
    // =====================================================

    @Transient
    private String round;

    @Transient
    private Candidate candidate;

    @Transient
    private com.talentx.hrms.entity.employee.Employee interviewer;

    @Transient
    private String additionalInterviewers;

    @Transient
    private java.time.Instant scheduledDateTime;

    @Transient
    private Integer overallRating;

    @Transient
    private Integer technicalRating;

    @Transient
    private Integer communicationRating;

    @Transient
    private Integer culturalFitRating;

    @Transient
    private String strengths;

    @Transient
    private String areasForImprovement;

    @Transient
    private String cancelledBy;

    @Transient
    private String cancellationReason;

    @Transient
    private java.time.Instant actualStartTime;

    @Transient
    private java.time.Instant actualEndTime;

    // =====================================================
    // VIRTUAL GETTERS/SETTERS — map logical names to DB columns
    // =====================================================

    /**
     * notes — stored in feedback column (reused).
     * When feedback is set via setNotes, it goes into the feedback column.
     */
    public String getNotes() {
        return feedback;
    }

    public void setNotes(String notes) {
        this.feedback = notes;
    }

    // =====================================================
    // ENUMS
    // =====================================================

    public enum InterviewType {
        PHONE_SCREEN, VIDEO, ONSITE, TECHNICAL, HR, PANEL, FINAL
    }

    public enum InterviewStatus {
        SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    }

    public enum InterviewRecommendation {
        STRONG_HIRE, HIRE, MAYBE, NO_HIRE, STRONG_NO_HIRE
    }

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public Interview() {}

    public Interview(Application application, LocalDateTime scheduledDate) {
        this.application = application;
        this.scheduledDate = scheduledDate;
    }

    // =====================================================
    // SCHEDULED DATE TIME (Instant ↔ LocalDateTime bridge)
    // =====================================================

    public java.time.Instant getScheduledDateTime() {
        if (scheduledDateTime != null) {
            return scheduledDateTime;
        }
        if (scheduledDate != null) {
            return scheduledDate.atZone(java.time.ZoneId.systemDefault()).toInstant();
        }
        return null;
    }

    public void setScheduledDateTime(java.time.Instant scheduledDateTime) {
        this.scheduledDateTime = scheduledDateTime;
        if (scheduledDateTime != null) {
            this.scheduledDate = LocalDateTime.ofInstant(scheduledDateTime, java.time.ZoneId.systemDefault());
        }
    }

    // =====================================================
    // BUSINESS METHODS
    // =====================================================

    public void start() {
        this.status = InterviewStatus.SCHEDULED;
        this.actualStartTime = java.time.Instant.now();
    }

    public void complete() {
        this.status = InterviewStatus.COMPLETED;
        this.actualEndTime = java.time.Instant.now();
    }

    public void cancel(String reason, String cancelledBy) {
        this.status = InterviewStatus.CANCELLED;
        this.cancellationReason = reason;
        this.cancelledBy = cancelledBy;
        // Store cancellation reason in feedback column so it's persisted
        this.feedback = "CANCELLED: " + reason;
    }

    public void reschedule(java.time.Instant newDateTime, String reason) {
        setScheduledDateTime(newDateTime);
        String existingFeedback = this.feedback != null ? this.feedback + "\n" : "";
        this.feedback = existingFeedback + "Rescheduled: " + reason;
    }

    // =====================================================
    // STATUS MANAGEMENT WITH STRING COMPATIBILITY
    // =====================================================

    public void setStatus(String statusStr) {
        if (statusStr != null) {
            try {
                this.status = InterviewStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                this.status = InterviewStatus.SCHEDULED;
            }
        }
    }

    public String getStatus() {
        return status != null ? status.name() : null;
    }
}
