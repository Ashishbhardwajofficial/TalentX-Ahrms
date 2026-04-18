package com.talentx.hrms.entity.recruitment;

import com.talentx.hrms.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"job_posting_id", "candidate_id"})
})
@AttributeOverride(name = "id", column = @Column(name = "application_id"))
@Getter
@Setter
public class Application extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    /**
     * DB column: stage (varchar 100)
     * Used to track current pipeline stage / screening stage label.
     * Also used as a comma-separated tag store when needed.
     */
    @Column(name = "stage", length = 100)
    private String stage;

    @Column(name = "applied_date", nullable = false)
    private LocalDate appliedDate;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    /**
     * DB column: rejection_reason (TEXT)
     * Reused for: rejection reason, screening notes, internal notes, withdrawal reason.
     * When status != REJECTED, this stores screening/internal notes.
     */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "rejection_date")
    private LocalDate rejectionDate;

    @Column(name = "offer_amount", precision = 15, scale = 2)
    private BigDecimal offerAmount;

    @Column(name = "offer_currency", length = 3)
    private String offerCurrency;

    @Column(name = "offer_date")
    private LocalDate offerDate;

    @Column(name = "offer_accepted")
    private Boolean offerAccepted;

    // =====================================================
    // TRANSIENT FIELDS — not persisted, request-scoped only
    // =====================================================

    @Transient
    private String resumePath;

    @Transient
    private String portfolioPath;

    @Transient
    private BigDecimal expectedSalary;

    @Transient
    private String salaryCurrency;

    @Transient
    private Integer noticePeriodDays;

    @Transient
    private Boolean isAvailableImmediately;

    @Transient
    private LocalDate earliestStartDate;

    @Transient
    private Boolean isWillingToRelocate;

    @Transient
    private Boolean isOpenToRemote;

    @Transient
    private String additionalNotes;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Interview> interviews = new ArrayList<>();

    public enum ApplicationStatus {
        APPLIED, SCREENING, INTERVIEW, ASSESSMENT, OFFER, REJECTED, WITHDRAWN, HIRED
    }

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public Application() {}

    public Application(JobPosting jobPosting, Candidate candidate, LocalDate appliedDate) {
        this.jobPosting = jobPosting;
        this.candidate = candidate;
        this.appliedDate = appliedDate;
    }

    // =====================================================
    // VIRTUAL GETTERS/SETTERS — map logical names to DB columns
    // =====================================================

    /** Maps to DB column: stage */
    public String getCurrentStage() {
        return stage;
    }

    public void setCurrentStage(String currentStage) {
        this.stage = currentStage;
    }

    /** Maps to DB column: rejection_reason (reused for screening notes) */
    public String getScreeningNotes() {
        return (status != ApplicationStatus.REJECTED) ? rejectionReason : null;
    }

    public void setScreeningNotes(String screeningNotes) {
        if (status != ApplicationStatus.REJECTED) {
            this.rejectionReason = screeningNotes;
        }
    }

    /** Maps to DB column: rejection_reason (reused for internal notes) */
    public String getInternalNotes() {
        return (status != ApplicationStatus.REJECTED) ? rejectionReason : null;
    }

    public void setInternalNotes(String internalNotes) {
        if (status != ApplicationStatus.REJECTED) {
            this.rejectionReason = internalNotes;
        }
    }

    /**
     * Screening score — stored in stage column as "SCORE:<value>" prefix.
     * Returns null if not set.
     */
    public Integer getScreeningScore() {
        if (stage != null && stage.startsWith("SCORE:")) {
            try {
                return Integer.parseInt(stage.substring(6).split(":")[0]);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    public void setScreeningScore(Integer score) {
        if (score != null) {
            // Preserve existing stage label after score if present
            String existingLabel = (stage != null && stage.contains(":") && !stage.startsWith("SCORE:"))
                ? stage : "";
            this.stage = "SCORE:" + score + (existingLabel.isEmpty() ? "" : ":" + existingLabel);
        }
    }

    /** screenedBy — not persisted, transient use only */
    @Transient
    private String screenedBy;

    public String getScreenedBy() { return screenedBy; }
    public void setScreenedBy(String screenedBy) { this.screenedBy = screenedBy; }

    /**
     * offerAcceptedAt — derived from offer_date + offer_accepted flag.
     * Returns offer_date as Instant when offer is accepted.
     */
    public Instant getOfferAcceptedAt() {
        if (Boolean.TRUE.equals(offerAccepted) && offerDate != null) {
            return offerDate.atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
        }
        return null;
    }

    // =====================================================
    // BUSINESS METHODS
    // =====================================================

    public void setApplicationDate(LocalDate applicationDate) {
        this.appliedDate = applicationDate;
    }

    public LocalDate getApplicationDate() {
        return appliedDate;
    }

    public void moveToScreening(String screenedBy, Integer score, String notes) {
        this.status = ApplicationStatus.SCREENING;
        this.screenedBy = screenedBy;
        this.stage = "SCREENING" + (score != null ? ":SCORE:" + score : "");
        if (notes != null) {
            this.rejectionReason = notes; // reuse column for notes when not rejected
        }
    }

    public void reject(String reason) {
        this.status = ApplicationStatus.REJECTED;
        this.rejectionReason = reason;
        this.rejectionDate = LocalDate.now();
        this.stage = "REJECTED";
    }

    public void withdraw(String reason) {
        this.status = ApplicationStatus.WITHDRAWN;
        this.rejectionReason = reason; // store withdrawal reason in same column
        this.stage = "WITHDRAWN";
    }

    public void scheduleInterview() {
        this.status = ApplicationStatus.INTERVIEW;
        this.stage = "INTERVIEW";
    }

    public void extendOffer(BigDecimal amount) {
        this.status = ApplicationStatus.OFFER;
        this.offerAmount = amount;
        this.offerDate = LocalDate.now();
        this.stage = "OFFER";
    }

    public void acceptOffer() {
        this.offerAccepted = true;
        this.offerDate = LocalDate.now(); // record acceptance date
        this.stage = "OFFER_ACCEPTED";
    }

    public void rejectOffer(String reason) {
        this.offerAccepted = false;
        this.rejectionReason = reason;
        this.status = ApplicationStatus.REJECTED;
        this.stage = "OFFER_REJECTED";
    }

    public void hire() {
        this.status = ApplicationStatus.HIRED;
        this.stage = "HIRED";
    }

    // =====================================================
    // STATUS MANAGEMENT WITH STRING COMPATIBILITY
    // =====================================================

    public void setStatus(String statusStr) {
        if (statusStr != null) {
            try {
                this.status = ApplicationStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                this.status = ApplicationStatus.APPLIED;
            }
        }
    }

    public String getStatus() {
        return status != null ? status.name() : null;
    }
}
