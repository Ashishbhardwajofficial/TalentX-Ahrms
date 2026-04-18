package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.compliance.*;
import com.talentx.hrms.entity.compliance.ComplianceCheck;
import com.talentx.hrms.entity.compliance.ComplianceJurisdiction;
import com.talentx.hrms.entity.compliance.ComplianceRule;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class ComplianceMapper {

    // =====================================================
    // JURISDICTION MAPPINGS
    // =====================================================

    public ComplianceJurisdiction toEntity(ComplianceJurisdictionRequest request) {
        if (request == null) {
            return null;
        }

        ComplianceJurisdiction jurisdiction = new ComplianceJurisdiction();
        jurisdiction.setName(request.getName());
        applyJurisdictionFields(jurisdiction, request);
        jurisdiction.setIsActive(true);

        return jurisdiction;
    }

    public void updateEntity(ComplianceJurisdiction jurisdiction,
                             ComplianceJurisdictionRequest request) {
        if (jurisdiction == null || request == null) {
            return;
        }

        jurisdiction.setName(request.getName());
        applyJurisdictionFields(jurisdiction, request);
    }

    private void applyJurisdictionFields(ComplianceJurisdiction jurisdiction,
                                         ComplianceJurisdictionRequest request) {

        if (request.getCode() != null) {
            jurisdiction.setCode(request.getCode());
        } else {
            jurisdiction.setCountryCode(request.getCountry());
            jurisdiction.setStateProvinceCode(request.getStateProvince());
        }

        if (request.getJurisdictionType() != null) {
            jurisdiction.setJurisdictionType(parseJurisdictionType(request.getJurisdictionType()));
        }
    }

    private ComplianceJurisdiction.JurisdictionType parseJurisdictionType(String type) {
        try {
            return ComplianceJurisdiction.JurisdictionType.valueOf(type.toUpperCase());
        } catch (Exception ex) {
            return null;
        }
    }

    public ComplianceJurisdictionResponse toResponse(ComplianceJurisdiction jurisdiction) {
        if (jurisdiction == null) {
            return null;
        }

        ComplianceJurisdictionResponse response = new ComplianceJurisdictionResponse();
        response.setId(jurisdiction.getId());
        response.setName(jurisdiction.getName());
        response.setCode(jurisdiction.getCode());
        response.setCountry(jurisdiction.getCountryCode());
        response.setStateProvince(jurisdiction.getStateProvinceCode());
        response.setJurisdictionType(
                jurisdiction.getJurisdictionType() != null
                        ? jurisdiction.getJurisdictionType().name()
                        : null
        );

        response.setCreatedAt(toLocalDateTime(jurisdiction.getCreatedAt()));
        response.setUpdatedAt(toLocalDateTime(jurisdiction.getUpdatedAt()));

        return response;
    }

    // =====================================================
    // RULE MAPPINGS
    // =====================================================

    public ComplianceRule toEntity(ComplianceRuleRequest request,
                                   ComplianceJurisdiction jurisdiction) {

        if (request == null) {
            return null;
        }

        ComplianceRule rule = new ComplianceRule();
        rule.setRuleName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setJurisdiction(jurisdiction);
        rule.setEffectiveDate(request.getEffectiveDate());
        rule.setExpiryDate(request.getExpirationDate());
        rule.setSourceUrl(request.getReferenceUrl());
        rule.setRuleCategory(parseRuleCategory(request.getCategory()));
        rule.setIsActive(true);

        return rule;
    }

    public void updateEntity(ComplianceRule rule,
                             ComplianceRuleRequest request,
                             ComplianceJurisdiction jurisdiction) {

        if (rule == null || request == null) {
            return;
        }

        rule.setRuleName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setJurisdiction(jurisdiction);
        rule.setEffectiveDate(request.getEffectiveDate());
        rule.setExpiryDate(request.getExpirationDate());
        rule.setSourceUrl(request.getReferenceUrl());
        rule.setRuleCategory(parseRuleCategory(request.getCategory()));
    }

    private ComplianceRule.RuleCategory parseRuleCategory(String category) {
        if (category == null) {
            return ComplianceRule.RuleCategory.OTHER;
        }
        try {
            return ComplianceRule.RuleCategory.valueOf(category.toUpperCase());
        } catch (Exception ex) {
            return ComplianceRule.RuleCategory.OTHER;
        }
    }

    public ComplianceRuleResponse toResponse(ComplianceRule rule) {
        if (rule == null) {
            return null;
        }

        ComplianceRuleResponse response = new ComplianceRuleResponse();
        response.setId(rule.getId());
        response.setName(rule.getRuleName());
        response.setDescription(rule.getDescription());
        response.setCategory(
                rule.getRuleCategory() != null ? rule.getRuleCategory().name() : null
        );
        response.setJurisdiction(toResponse(rule.getJurisdiction()));
        response.setEffectiveDate(rule.getEffectiveDate());
        response.setExpirationDate(rule.getExpiryDate());
        response.setReferenceUrl(rule.getSourceUrl());
        response.setIsActive(rule.getIsActive());
        response.setCreatedAt(toLocalDateTime(rule.getCreatedAt()));
        response.setUpdatedAt(toLocalDateTime(rule.getUpdatedAt()));

        return response;
    }

    // =====================================================
    // COMPLIANCE CHECK MAPPINGS
    // =====================================================

    public ComplianceCheckResponse toResponse(ComplianceCheck check) {
        if (check == null) return null;

        ComplianceCheckResponse response = new ComplianceCheckResponse();
        response.setId(check.getId());
        try { response.setComplianceRule(toResponse(check.getComplianceRule())); } catch (Exception e) {}

        if (check.getOrganization() != null) {
            try {
                response.setOrganizationId(check.getOrganization().getId());
                response.setOrganizationName(check.getOrganization().getName());
            } catch (Exception e) { /* lazy org */ }
        }

        if (check.getEmployee() != null) {
            try {
                response.setEmployeeId(check.getEmployee().getId());
                response.setEmployeeName(check.getEmployee().getFirstName() + " " + check.getEmployee().getLastName());
            } catch (Exception e) { /* lazy employee */ }
        }

        response.setCheckDate(check.getCheckDate());
        response.setCheckedAt(toInstant(check.getCheckedAt()));
        response.setCheckedBy(check.getCheckedBy());
        response.setCheckType(check.getCheckType());
        response.setStatus(check.getStatus());
        response.setComplianceScore(check.getComplianceScore());
        response.setCheckResults(check.getCheckResults());
        response.setFindings(check.getFindings());
        response.setViolations(check.getViolations());
        response.setRecommendations(check.getRecommendations());
        response.setRemediationActions(check.getRemediationActions());
        response.setRemediationDueDate(check.getRemediationDueDate());
        response.setRemediationCompletedAt(toInstant(check.getRemediationCompletedAt()));
        response.setRemediatedBy(check.getRemediatedBy());
        response.setIsResolved(check.getIsResolved());
        response.setResolvedAt(toInstant(check.getResolvedAt()));
        try {
            response.setResolvedBy(check.getResolvedBy() != null ? check.getResolvedBy().getFullName() : null);
        } catch (Exception e) { /* lazy resolvedBy */ }
        response.setResolutionNotes(check.getResolutionNotes());
        response.setNextCheckDate(check.getNextCheckDate());
        response.setNotes(check.getNotes());
        response.setAlertSent(check.getAlertSent());
        response.setAlertSentAt(toInstant(check.getAlertSentAt()));
        response.setEvidencePath(check.getEvidencePath());
        response.setIsOverdue(check.isOverdue());
        response.setCreatedAt(toLocalDateTime(check.getCreatedAt()));
        response.setUpdatedAt(toLocalDateTime(check.getUpdatedAt()));

        return response;
    }

    // =====================================================
    // TIME CONVERSION HELPERS
    // =====================================================

    private LocalDateTime toLocalDateTime(java.time.Instant instant) {
        return instant != null
                ? LocalDateTime.ofInstant(instant, ZoneId.systemDefault())
                : null;
    }

    private java.time.Instant toInstant(LocalDateTime dateTime) {
        return dateTime != null
                ? dateTime.atZone(ZoneId.systemDefault()).toInstant()
                : null;
    }
}
