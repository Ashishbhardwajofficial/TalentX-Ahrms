package com.talentx.hrms.entity.compliance;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_checks")
@AttributeOverride(name = "id", column = @Column(name = "compliance_check_id"))
@Getter
@Setter
public class ComplianceCheck extends BaseEntity {

    @NotNull(message = "Organization is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee employee;

    @NotNull(message = "Compliance rule is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    private ComplianceRule rule;

    @NotNull(message = "Check date is required")
    @Column(name = "check_date", nullable = false)
    private LocalDate checkDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private CheckStatus status;

    @Column(name = "violation_details", columnDefinition = "JSON")
    private String violationDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity")
    private Severity severity;

    @Column(name = "resolved", nullable = false)
    private Boolean resolved = false;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee resolvedBy;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    // Constructors
    public ComplianceCheck() {}

    public ComplianceCheck(Organization organization, ComplianceRule rule, LocalDate checkDate) {
        this.organization = organization;
        this.rule = rule;
        this.checkDate = checkDate;
    }

    // Helper methods
    public boolean isCompliant() {
        return CheckStatus.COMPLIANT.equals(status);
    }

    public boolean isNonCompliant() {
        return CheckStatus.NON_COMPLIANT.equals(status);
    }

    public boolean isWarning() {
        return CheckStatus.WARNING.equals(status);
    }

    public boolean requiresReview() {
        return CheckStatus.REVIEW_REQUIRED.equals(status);
    }

    public void markCompliant() {
        this.status = CheckStatus.COMPLIANT;
        this.severity = null;
        this.violationDetails = null;
    }

    public void markNonCompliant(Severity severity, String violationDetails) {
        this.status = CheckStatus.NON_COMPLIANT;
        this.severity = severity;
        this.violationDetails = violationDetails;
    }

    public void resolve(Employee resolvedBy, String resolutionNotes) {
        this.resolved = true;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = resolvedBy;
        this.resolutionNotes = resolutionNotes;
    }

    // Backward compatibility methods
    public ComplianceRule getComplianceRule() {
        return rule;
    }

    public void setComplianceRule(ComplianceRule complianceRule) {
        this.rule = complianceRule;
    }

    public boolean isPassed() {
        return isCompliant();
    }

    public void setPassed(boolean passed) {
        this.status = passed ? CheckStatus.COMPLIANT : CheckStatus.NON_COMPLIANT;
    }

    public String getDetails() {
        return violationDetails;
    }

    public void setDetails(String details) {
        this.violationDetails = details;
    }

    public Boolean getIsResolved() {
        return resolved;
    }

    public void setIsResolved(Boolean isResolved) {
        this.resolved = isResolved;
    }

    // Additional backward compatibility methods for service layer
    public String getStatus() {
        return status != null ? status.name() : null;
    }

    public void setStatus(String status) {
        if (status != null) {
            try {
                this.status = CheckStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore
            }
        }
    }

    public Integer getComplianceScore() {
        return null; // This field doesn't exist in database schema
    }

    public void setComplianceScore(Integer complianceScore) {
        // This field doesn't exist in database schema
    }

    public String getCheckResults() {
        return violationDetails;
    }

    public void setCheckResults(String checkResults) {
        this.violationDetails = checkResults;
    }

    public String getFindings() {
        return violationDetails;
    }

    public void setFindings(String findings) {
        this.violationDetails = findings;
    }

    public String getViolations() {
        return violationDetails;
    }

    public void setViolations(String violations) {
        this.violationDetails = violations;
    }

    public String getRecommendations() {
        return null; // This field doesn't exist in database schema
    }

    public void setRecommendations(String recommendations) {
        // This field doesn't exist in database schema
    }

    public String getCheckedBy() {
        return resolvedBy != null ? resolvedBy.getFirstName() + " " + resolvedBy.getLastName() : null;
    }

    public void setCheckedBy(String checkedBy) {
        // This field doesn't exist in database schema
    }

    public String getCheckType() {
        return null; // This field doesn't exist in database schema
    }

    public void setCheckType(String checkType) {
        // This field doesn't exist in database schema
    }

    public LocalDate getRemediationDueDate() {
        return null; // This field doesn't exist in database schema
    }

    public void setRemediationDueDate(LocalDate remediationDueDate) {
        // This field doesn't exist in database schema
    }

    public LocalDate getNextCheckDate() {
        return null; // This field doesn't exist in database schema
    }

    public void setNextCheckDate(LocalDate nextCheckDate) {
        // This field doesn't exist in database schema
    }

    // Additional backward compatibility methods
    // Additional backward compatibility methods
    public LocalDateTime getCheckedAt() {
        return getCreatedAt() != null ? LocalDateTime.ofInstant(getCreatedAt(), java.time.ZoneId.systemDefault()) : null;
    }

    public String getRemediationActions() {
        return resolutionNotes;
    }

    public LocalDateTime getRemediationCompletedAt() {
        return resolvedAt;
    }

    public String getRemediatedBy() {
        return resolvedBy != null ? resolvedBy.getFullName() : null;
    }

    public String getNotes() {
        return resolutionNotes;
    }

    public LocalDateTime getAlertSentAt() {
        return null; // This field doesn't exist in database schema
    }

    public String getEvidencePath() {
        return null; // This field doesn't exist in database schema
    }

    public Boolean getAlertSent() {
        return false; // This field doesn't exist in database schema
    }

    public void setAlertSent(Boolean alertSent) {
        // This field doesn't exist in database schema
    }

    public void sendAlert() {
        // This method doesn't exist in database schema
    }

    public boolean isOverdue() {
        return false; // This field doesn't exist in database schema
    }

    public void completeRemediation(String remediatedBy) {
        // This method doesn't exist in database schema
    }

    public enum CheckStatus {
        COMPLIANT,
        NON_COMPLIANT,
        WARNING,
        REVIEW_REQUIRED
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }
}

