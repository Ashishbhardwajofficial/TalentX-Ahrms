package com.talentx.hrms.entity.compliance;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "compliance_rules")
@AttributeOverride(name = "id", column = @Column(name = "compliance_rule_id"))
@Getter
@Setter
public class ComplianceRule extends BaseEntity {

    @NotNull(message = "Jurisdiction is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jurisdiction_id", nullable = false)
    private ComplianceJurisdiction jurisdiction;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_category")
    private RuleCategory ruleCategory;

    @NotBlank(message = "Rule name is required")
    @Size(max = 255, message = "Rule name must not exceed 255 characters")
    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "rule_data", columnDefinition = "JSON")
    private String ruleData;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Size(max = 500, message = "Source URL must not exceed 500 characters")
    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "rule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ComplianceCheck> complianceChecks = new ArrayList<>();

    // Constructors
    public ComplianceRule() {}

    public ComplianceRule(String ruleName, ComplianceJurisdiction jurisdiction) {
        this.ruleName = ruleName;
        this.jurisdiction = jurisdiction;
    }

    // Helper methods
    public boolean isActive() {
        LocalDate now = LocalDate.now();
        return Boolean.TRUE.equals(isActive) &&
               (effectiveDate == null || !now.isBefore(effectiveDate)) &&
               (expiryDate == null || !now.isAfter(expiryDate));
    }

    public void addComplianceCheck(ComplianceCheck check) {
        complianceChecks.add(check);
        check.setRule(this);
    }

    public void removeComplianceCheck(ComplianceCheck check) {
        complianceChecks.remove(check);
        check.setRule(null);
    }

    // Backward compatibility methods
    public String getName() {
        return ruleName;
    }

    public void setName(String name) {
        this.ruleName = name;
    }

    public ComplianceRule getComplianceRule() {
        return this;
    }

    public void setComplianceRule(ComplianceRule complianceRule) {
        // This method exists for backward compatibility but doesn't make logical sense
        // It's kept to avoid breaking existing code
    }

    // Additional backward compatibility methods for service layer
    public String getRuleCode() {
        return null; // This field doesn't exist in database schema
    }

    public void setRuleCode(String ruleCode) {
        // This field doesn't exist in database schema
    }

    public String getCategory() {
        return ruleCategory != null ? ruleCategory.name() : null;
    }

    public void setCategory(String category) {
        if (category != null) {
            try {
                this.ruleCategory = RuleCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid category, ignore
            }
        }
    }

    public String getRuleType() {
        return null; // This field doesn't exist in database schema
    }

    public void setRuleType(String ruleType) {
        // This field doesn't exist in database schema
    }

    public String getSeverity() {
        return null; // This field doesn't exist in database schema
    }

    public void setSeverity(String severity) {
        // This field doesn't exist in database schema
    }

    public LocalDate getExpirationDate() {
        return expiryDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expiryDate = expirationDate;
    }

    public String getRuleText() {
        return description;
    }

    public void setRuleText(String ruleText) {
        this.description = ruleText;
    }

    public String getComplianceCriteria() {
        return null; // This field doesn't exist in database schema
    }

    public void setComplianceCriteria(String complianceCriteria) {
        // This field doesn't exist in database schema
    }

    public String getViolationConsequences() {
        return null; // This field doesn't exist in database schema
    }

    public void setViolationConsequences(String violationConsequences) {
        // This field doesn't exist in database schema
    }

    public String getRemediationSteps() {
        return null; // This field doesn't exist in database schema
    }

    public void setRemediationSteps(String remediationSteps) {
        // This field doesn't exist in database schema
    }

    public Integer getCheckFrequencyDays() {
        return null; // This field doesn't exist in database schema
    }

    public void setCheckFrequencyDays(Integer checkFrequencyDays) {
        // This field doesn't exist in database schema
    }

    public Boolean getAutoCheckEnabled() {
        return false; // This field doesn't exist in database schema
    }

    public void setAutoCheckEnabled(Boolean autoCheckEnabled) {
        // This field doesn't exist in database schema
    }

    public String getCheckQuery() {
        return null; // This field doesn't exist in database schema
    }

    public void setCheckQuery(String checkQuery) {
        // This field doesn't exist in database schema
    }

    public String getReferenceUrl() {
        return sourceUrl;
    }

    public void setReferenceUrl(String referenceUrl) {
        this.sourceUrl = referenceUrl;
    }

    public String getLegalReference() {
        return null; // This field doesn't exist in database schema
    }

    public void setLegalReference(String legalReference) {
        // This field doesn't exist in database schema
    }

    public String getNotes() {
        return description;
    }

    public void setNotes(String notes) {
        this.description = notes;
    }

    // Additional backward compatibility methods
    public Boolean getIsSystemRule() {
        return false; // This field doesn't exist in database schema
    }

    public boolean needsPeriodicCheck() {
        return false; // This functionality doesn't exist in database schema
    }

    public Organization getOrganization() {
        return null; // This field doesn't exist in database schema
    }

    public void setOrganization(Organization organization) {
        // This field doesn't exist in database schema
    }

    public enum RuleCategory {
        WORKING_HOURS,
        OVERTIME,
        MINIMUM_WAGE,
        LEAVE_ENTITLEMENT,
        SAFETY,
        DATA_PRIVACY,
        DISCRIMINATION,
        OTHER
    }
}

