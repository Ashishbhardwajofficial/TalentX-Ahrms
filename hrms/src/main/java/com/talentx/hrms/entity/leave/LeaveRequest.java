package com.talentx.hrms.entity.leave;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.LeaveStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.sql.Timestamp;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@AttributeOverride(name = "id", column = @Column(name = "leave_request_id"))
public class LeaveRequest extends BaseEntity {

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull(message = "Leave type is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull(message = "Total days is required")
    @Column(name = "total_days", precision = 5, scale = 2, nullable = false)
    private BigDecimal totalDays;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "is_half_day")
    private Boolean isHalfDay = false;

    @Column(name = "half_day_period")
    private String halfDayPeriod;

    @Column(name = "contact_details")
    private String contactDetails;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "is_emergency")
    private Boolean isEmergency = false;

    @Column(name = "attachment_path")
    private String attachmentPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private LeaveStatus status = LeaveStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee reviewedBy;

    @Column(name = "reviewed_at")
    private Timestamp reviewedAt;

    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private Timestamp cancelledAt;

    // Constructors
    public LeaveRequest() {
        this.appliedAt = Instant.now();
    }

    public LeaveRequest(Employee employee, LeaveType leaveType, LocalDate startDate, LocalDate endDate, BigDecimal totalDays) {
        this.employee = employee;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalDays = totalDays;
        this.appliedAt = Instant.now();
    }

    // Business logic methods
    public void setIsHalfDay(Boolean isHalfDay) {
        this.isHalfDay = isHalfDay;
    }

    public void setHalfDayPeriod(String halfDayPeriod) {
        this.halfDayPeriod = halfDayPeriod;
    }

    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public void setIsEmergency(Boolean isEmergency) {
        this.isEmergency = isEmergency;
    }

    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public Timestamp getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Timestamp cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public boolean canBeModified() {
        return status == LeaveStatus.PENDING;
    }

    public void approve(Employee approver, String comments) {
        this.status = LeaveStatus.APPROVED;
        this.reviewedBy = approver;
        this.reviewedAt = new Timestamp(System.currentTimeMillis());
        this.reviewComments = comments;
    }

    public void reject(Employee approver, String comments) {
        this.status = LeaveStatus.REJECTED;
        this.reviewedBy = approver;
        this.reviewedAt = new Timestamp(System.currentTimeMillis());
        this.reviewComments = comments;
    }

    public void cancel(String reason) {
        this.status = LeaveStatus.CANCELLED;
        this.cancellationReason = reason;
        this.cancelledAt = new Timestamp(System.currentTimeMillis());
    }

    public void withdraw(String reason) {
        this.status = LeaveStatus.WITHDRAWN;
        this.cancellationReason = reason;
        this.cancelledAt = new Timestamp(System.currentTimeMillis());
    }

    public boolean canBeCancelled() {
        return status == LeaveStatus.PENDING || status == LeaveStatus.APPROVED;
    }
}

