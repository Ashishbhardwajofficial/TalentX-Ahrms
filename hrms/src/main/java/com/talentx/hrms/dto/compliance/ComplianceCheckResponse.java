package com.talentx.hrms.dto.compliance;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ComplianceCheckResponse {

    private Long id;
    private ComplianceRuleResponse complianceRule;
    private Long organizationId;
    private String organizationName;
    private Long employeeId;
    private String employeeName;
    private LocalDate checkDate;
    private Instant checkedAt;
    private String checkedBy;
    private String checkType;
    private String status;
    private Integer complianceScore;
    private String checkResults;
    private String findings;
    private String violations;
    private String recommendations;
    private String remediationActions;
    private LocalDate remediationDueDate;
    private Instant remediationCompletedAt;
    private String remediatedBy;
    private Boolean isResolved;
    private Instant resolvedAt;
    private String resolvedBy;
    private String resolutionNotes;
    private LocalDate nextCheckDate;
    private String notes;
    private Boolean alertSent;
    private Instant alertSentAt;
    private String evidencePath;
    private Boolean isOverdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ComplianceCheckResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ComplianceRuleResponse getComplianceRule() {
        return complianceRule;
    }

    public void setComplianceRule(ComplianceRuleResponse complianceRule) {
        this.complianceRule = complianceRule;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
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

    public LocalDate getCheckDate() {
        return checkDate;
    }

    public void setCheckDate(LocalDate checkDate) {
        this.checkDate = checkDate;
    }

    public Instant getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(Instant checkedAt) {
        this.checkedAt = checkedAt;
    }

    public String getCheckedBy() {
        return checkedBy;
    }

    public void setCheckedBy(String checkedBy) {
        this.checkedBy = checkedBy;
    }

    public String getCheckType() {
        return checkType;
    }

    public void setCheckType(String checkType) {
        this.checkType = checkType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getComplianceScore() {
        return complianceScore;
    }

    public void setComplianceScore(Integer complianceScore) {
        this.complianceScore = complianceScore;
    }

    public String getCheckResults() {
        return checkResults;
    }

    public void setCheckResults(String checkResults) {
        this.checkResults = checkResults;
    }

    public String getFindings() {
        return findings;
    }

    public void setFindings(String findings) {
        this.findings = findings;
    }

    public String getViolations() {
        return violations;
    }

    public void setViolations(String violations) {
        this.violations = violations;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public String getRemediationActions() {
        return remediationActions;
    }

    public void setRemediationActions(String remediationActions) {
        this.remediationActions = remediationActions;
    }

    public LocalDate getRemediationDueDate() {
        return remediationDueDate;
    }

    public void setRemediationDueDate(LocalDate remediationDueDate) {
        this.remediationDueDate = remediationDueDate;
    }

    public Instant getRemediationCompletedAt() {
        return remediationCompletedAt;
    }

    public void setRemediationCompletedAt(Instant remediationCompletedAt) {
        this.remediationCompletedAt = remediationCompletedAt;
    }

    public String getRemediatedBy() {
        return remediatedBy;
    }

    public void setRemediatedBy(String remediatedBy) {
        this.remediatedBy = remediatedBy;
    }

    public Boolean getIsResolved() {
        return isResolved;
    }

    public void setIsResolved(Boolean isResolved) {
        this.isResolved = isResolved;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDate getNextCheckDate() {
        return nextCheckDate;
    }

    public void setNextCheckDate(LocalDate nextCheckDate) {
        this.nextCheckDate = nextCheckDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getAlertSent() {
        return alertSent;
    }

    public void setAlertSent(Boolean alertSent) {
        this.alertSent = alertSent;
    }

    public Instant getAlertSentAt() {
        return alertSentAt;
    }

    public void setAlertSentAt(Instant alertSentAt) {
        this.alertSentAt = alertSentAt;
    }

    public String getEvidencePath() {
        return evidencePath;
    }

    public void setEvidencePath(String evidencePath) {
        this.evidencePath = evidencePath;
    }

    public Boolean getIsOverdue() {
        return isOverdue;
    }

    public void setIsOverdue(Boolean isOverdue) {
        this.isOverdue = isOverdue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

