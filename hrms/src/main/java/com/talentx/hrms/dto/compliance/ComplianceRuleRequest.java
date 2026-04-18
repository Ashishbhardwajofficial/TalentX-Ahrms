package com.talentx.hrms.dto.compliance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ComplianceRuleRequest {

    @NotBlank(message = "Rule name is required")
    @Size(max = 255, message = "Rule name must not exceed 255 characters")
    private String name;

    @Size(max = 50, message = "Rule code must not exceed 50 characters")
    private String ruleCode;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 50, message = "Rule type must not exceed 50 characters")
    private String ruleType;

    @Size(max = 50, message = "Severity must not exceed 50 characters")
    private String severity;

    @NotNull(message = "Jurisdiction ID is required")
    private Long jurisdictionId;

    private Long organizationId;

    private LocalDate effectiveDate;

    private LocalDate expirationDate;

    @Size(max = 2000, message = "Rule text must not exceed 2000 characters")
    private String ruleText;

    @Size(max = 1000, message = "Compliance criteria must not exceed 1000 characters")
    private String complianceCriteria;

    @Size(max = 1000, message = "Violation consequences must not exceed 1000 characters")
    private String violationConsequences;

    @Size(max = 1000, message = "Remediation steps must not exceed 1000 characters")
    private String remediationSteps;

    private Integer checkFrequencyDays;

    private Boolean autoCheckEnabled;

    @Size(max = 500, message = "Check query must not exceed 500 characters")
    private String checkQuery;

    @Size(max = 255, message = "Reference URL must not exceed 255 characters")
    private String referenceUrl;

    @Size(max = 255, message = "Legal reference must not exceed 255 characters")
    private String legalReference;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    // Constructors
    public ComplianceRuleRequest() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Long getJurisdictionId() {
        return jurisdictionId;
    }

    public void setJurisdictionId(Long jurisdictionId) {
        this.jurisdictionId = jurisdictionId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public String getRuleText() {
        return ruleText;
    }

    public void setRuleText(String ruleText) {
        this.ruleText = ruleText;
    }

    public String getComplianceCriteria() {
        return complianceCriteria;
    }

    public void setComplianceCriteria(String complianceCriteria) {
        this.complianceCriteria = complianceCriteria;
    }

    public String getViolationConsequences() {
        return violationConsequences;
    }

    public void setViolationConsequences(String violationConsequences) {
        this.violationConsequences = violationConsequences;
    }

    public String getRemediationSteps() {
        return remediationSteps;
    }

    public void setRemediationSteps(String remediationSteps) {
        this.remediationSteps = remediationSteps;
    }

    public Integer getCheckFrequencyDays() {
        return checkFrequencyDays;
    }

    public void setCheckFrequencyDays(Integer checkFrequencyDays) {
        this.checkFrequencyDays = checkFrequencyDays;
    }

    public Boolean getAutoCheckEnabled() {
        return autoCheckEnabled;
    }

    public void setAutoCheckEnabled(Boolean autoCheckEnabled) {
        this.autoCheckEnabled = autoCheckEnabled;
    }

    public String getCheckQuery() {
        return checkQuery;
    }

    public void setCheckQuery(String checkQuery) {
        this.checkQuery = checkQuery;
    }

    public String getReferenceUrl() {
        return referenceUrl;
    }

    public void setReferenceUrl(String referenceUrl) {
        this.referenceUrl = referenceUrl;
    }

    public String getLegalReference() {
        return legalReference;
    }

    public void setLegalReference(String legalReference) {
        this.legalReference = legalReference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

