package com.talentx.hrms.dto.compliance;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ComplianceRuleResponse {

    private Long id;
    private String name;
    private String ruleCode;
    private String description;
    private String category;
    private String ruleType;
    private String severity;
    private ComplianceJurisdictionResponse jurisdiction;
    private Long organizationId;
    private String organizationName;
    private LocalDate effectiveDate;
    private LocalDate expirationDate;
    private String ruleText;
    private String complianceCriteria;
    private String violationConsequences;
    private String remediationSteps;
    private Integer checkFrequencyDays;
    private Boolean autoCheckEnabled;
    private String checkQuery;
    private String referenceUrl;
    private String legalReference;
    private String notes;
    private Boolean isSystemRule;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ComplianceRuleResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public ComplianceJurisdictionResponse getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(ComplianceJurisdictionResponse jurisdiction) {
        this.jurisdiction = jurisdiction;
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

    public Boolean getIsSystemRule() {
        return isSystemRule;
    }

    public void setIsSystemRule(Boolean isSystemRule) {
        this.isSystemRule = isSystemRule;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

