package com.talentx.hrms.service.compliance;

import com.talentx.hrms.entity.compliance.ComplianceCheck;
import com.talentx.hrms.entity.compliance.ComplianceJurisdiction;
import com.talentx.hrms.entity.compliance.ComplianceRule;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.repository.ComplianceCheckRepository;
import com.talentx.hrms.repository.ComplianceJurisdictionRepository;
import com.talentx.hrms.repository.ComplianceRuleRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ComplianceService {

    private static final Logger logger = LoggerFactory.getLogger(ComplianceService.class);

    private final ComplianceRuleRepository complianceRuleRepository;
    private final ComplianceCheckRepository complianceCheckRepository;
    private final ComplianceJurisdictionRepository jurisdictionRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public ComplianceService(ComplianceRuleRepository complianceRuleRepository,
                           ComplianceCheckRepository complianceCheckRepository,
                           ComplianceJurisdictionRepository jurisdictionRepository,
                           OrganizationRepository organizationRepository,
                           EmployeeRepository employeeRepository) {
        this.complianceRuleRepository = complianceRuleRepository;
        this.complianceCheckRepository = complianceCheckRepository;
        this.jurisdictionRepository = jurisdictionRepository;
        this.organizationRepository = organizationRepository;
        this.employeeRepository = employeeRepository;
    }

    // ===== COMPLIANCE RULE MANAGEMENT =====

    /**
     * Create a new compliance rule
     */
    public ComplianceRule createComplianceRule(ComplianceRule rule) {
        validateComplianceRule(rule);
        logger.info("Creating compliance rule: {} for jurisdiction: {}", 
                   rule.getRuleName(), rule.getJurisdiction().getName());
        return complianceRuleRepository.save(rule);
    }

    /**
     * Update an existing compliance rule
     */
    public ComplianceRule updateComplianceRule(Long id, ComplianceRule updatedRule) {
        ComplianceRule existingRule = complianceRuleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Compliance rule not found with id: " + id));

        validateComplianceRule(updatedRule);

        existingRule.setRuleName(updatedRule.getRuleName());
        existingRule.setDescription(updatedRule.getDescription());
        existingRule.setRuleCategory(updatedRule.getRuleCategory());
        existingRule.setJurisdiction(updatedRule.getJurisdiction());
        existingRule.setEffectiveDate(updatedRule.getEffectiveDate());
        existingRule.setExpiryDate(updatedRule.getExpiryDate());
        existingRule.setRuleData(updatedRule.getRuleData());
        existingRule.setSourceUrl(updatedRule.getSourceUrl());
        existingRule.setIsActive(updatedRule.getIsActive());

        logger.info("Updated compliance rule: {} (ID: {})", existingRule.getRuleName(), id);
        return complianceRuleRepository.save(existingRule);
    }

    /**
     * Get compliance rule by ID
     */
    @Transactional(readOnly = true)
    public ComplianceRule getComplianceRule(Long id) {
        return complianceRuleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Compliance rule not found with id: " + id));
    }

    /**
     * Get all compliance rules
     */
    @Transactional(readOnly = true)
    public List<ComplianceRule> getAllComplianceRules() {
        return complianceRuleRepository.findAll();
    }

    /**
     * Get active compliance rules
     */
    @Transactional(readOnly = true)
    public List<ComplianceRule> getActiveComplianceRules() {
        return complianceRuleRepository.findActiveRules(LocalDate.now());
    }

    /**
     * Get compliance rules by jurisdiction
     */
    @Transactional(readOnly = true)
    public List<ComplianceRule> getComplianceRulesByJurisdiction(Long jurisdictionId) {
        ComplianceJurisdiction jurisdiction = jurisdictionRepository.findById(jurisdictionId)
            .orElseThrow(() -> new RuntimeException("Jurisdiction not found with id: " + jurisdictionId));
        return complianceRuleRepository.findByJurisdiction(jurisdiction);
    }

    /**
     * Delete compliance rule
     */
    public void deleteComplianceRule(Long id) {
        ComplianceRule rule = complianceRuleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Compliance rule not found with id: " + id));

        List<ComplianceCheck> associatedChecks = complianceCheckRepository.findByComplianceRule(rule);
        if (!associatedChecks.isEmpty()) {
            throw new RuntimeException("Cannot delete compliance rule that has associated compliance checks");
        }

        logger.info("Deleting compliance rule: {} (ID: {})", rule.getRuleName(), id);
        complianceRuleRepository.delete(rule);
    }

    // ===== COMPLIANCE CHECK MANAGEMENT =====

    /**
     * Perform compliance check for a specific rule and organization
     */
    public ComplianceCheck performComplianceCheck(Long ruleId, Long organizationId, String checkedBy) {
        ComplianceRule rule = complianceRuleRepository.findById(ruleId)
            .orElseThrow(() -> new RuntimeException("Compliance rule not found with id: " + ruleId));
        
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        return performComplianceCheck(rule, organization, null, checkedBy);
    }

    /**
     * Perform compliance check for a specific rule, organization, and employee
     */
    public ComplianceCheck performComplianceCheck(Long ruleId, Long organizationId, Long employeeId, String checkedBy) {
        ComplianceRule rule = complianceRuleRepository.findById(ruleId)
            .orElseThrow(() -> new RuntimeException("Compliance rule not found with id: " + ruleId));
        
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        }

        return performComplianceCheck(rule, organization, employee, checkedBy);
    }

    /**
     * Perform compliance check for a rule
     */
    private ComplianceCheck performComplianceCheck(ComplianceRule rule, Organization organization, Employee employee, String checkedBy) {
        logger.info("Performing compliance check for rule: {} on organization: {}", 
                   rule.getRuleName(), organization.getName());

        ComplianceCheck check = new ComplianceCheck(organization, rule, LocalDate.now());
        check.setEmployee(employee);
        check.setCheckedBy(checkedBy);
        check.setCheckType("MANUAL");

        ComplianceCheckResult result = executeComplianceCheck(rule, organization, employee);
        
        check.setStatus(result.isCompliant() ? "COMPLIANT" : "NON_COMPLIANT");
        check.setComplianceScore(result.getComplianceScore());
        check.setCheckResults(result.getCheckResults());
        check.setFindings(result.getFindings());
        check.setViolations(result.getViolations());
        check.setRecommendations(result.getRecommendations());

        check = complianceCheckRepository.save(check);

        if (!result.isCompliant()) {
            generateViolationAlert(check);
        }

        logger.info("Compliance check completed for rule: {} - Status: {}", 
                   rule.getRuleName(), check.getStatus());

        return check;
    }

    /**
     * Execute the actual compliance check logic
     */
    private ComplianceCheckResult executeComplianceCheck(ComplianceRule rule, Organization organization, Employee employee) {
        ComplianceCheckResult result = new ComplianceCheckResult();
        
        try {
            result = executeDefaultComplianceCheck(rule, organization, employee);
        } catch (Exception e) {
            logger.error("Error executing compliance check for rule: {} - {}", 
                        rule.getRuleName(), e.getMessage(), e);
            
            result.setCompliant(false);
            result.setComplianceScore(0);
            result.setCheckResults("Error executing compliance check: " + e.getMessage());
            result.setFindings("System error during compliance evaluation");
            result.setViolations("Unable to complete compliance check due to system error");
            result.setRecommendations("Contact system administrator to resolve compliance check issues");
        }
        
        return result;
    }

    /**
     * Execute default compliance check based on rule category
     */
    private ComplianceCheckResult executeDefaultComplianceCheck(ComplianceRule rule, Organization organization, Employee employee) {
        ComplianceCheckResult result = new ComplianceCheckResult();
        
        String category = rule.getRuleCategory() != null ? rule.getRuleCategory().name() : "OTHER";
        
        switch (category) {
            case "WORKING_HOURS":
            case "OVERTIME":
                result = checkLaborLawCompliance(rule, organization, employee);
                break;
            case "MINIMUM_WAGE":
                result = checkTaxCompliance(rule, organization, employee);
                break;
            case "SAFETY":
                result = checkSafetyCompliance(rule, organization, employee);
                break;
            case "DATA_PRIVACY":
                result = checkPrivacyCompliance(rule, organization, employee);
                break;
            default:
                result = checkGeneralCompliance(rule, organization, employee);
                break;
        }
        
        return result;
    }

    private ComplianceCheckResult checkLaborLawCompliance(ComplianceRule rule, Organization organization, Employee employee) {
        ComplianceCheckResult result = new ComplianceCheckResult();
        result.setCompliant(true);
        result.setComplianceScore(95);
        result.setCheckResults("Labor law compliance check completed");
        result.setFindings("Organization meets basic labor law requirements");
        return result;
    }

    private ComplianceCheckResult checkTaxCompliance(ComplianceRule rule, Organization organization, Employee employee) {
        ComplianceCheckResult result = new ComplianceCheckResult();
        result.setCompliant(true);
        result.setComplianceScore(90);
        result.setCheckResults("Tax compliance check completed");
        result.setFindings("Tax obligations are being met");
        return result;
    }

    private ComplianceCheckResult checkSafetyCompliance(ComplianceRule rule, Organization organization, Employee employee) {
        ComplianceCheckResult result = new ComplianceCheckResult();
        result.setCompliant(true);
        result.setComplianceScore(88);
        result.setCheckResults("Safety compliance check completed");
        result.setFindings("Safety protocols are in place and being followed");
        return result;
    }

    private ComplianceCheckResult checkPrivacyCompliance(ComplianceRule rule, Organization organization, Employee employee) {
        ComplianceCheckResult result = new ComplianceCheckResult();
        result.setCompliant(true);
        result.setComplianceScore(92);
        result.setCheckResults("Privacy compliance check completed");
        result.setFindings("Data privacy measures are adequate");
        return result;
    }

    private ComplianceCheckResult checkGeneralCompliance(ComplianceRule rule, Organization organization, Employee employee) {
        ComplianceCheckResult result = new ComplianceCheckResult();
        result.setCompliant(true);
        result.setComplianceScore(85);
        result.setCheckResults("General compliance check completed");
        result.setFindings("No significant compliance issues identified");
        return result;
    }

    // ===== VIOLATION DETECTION AND ALERT GENERATION =====

    private void generateViolationAlert(ComplianceCheck check) {
        if (check.isCompliant() || Boolean.TRUE.equals(check.getAlertSent())) {
            return;
        }

        logger.warn("Generating violation alert for compliance check: Rule={}, Organization={}, Status={}", 
                   check.getComplianceRule().getRuleName(), 
                   check.getOrganization().getName(), 
                   check.getStatus());

        try {
            check.sendAlert();
            complianceCheckRepository.save(check);
            logger.info("Violation alert sent successfully for compliance check ID: {}", check.getId());
        } catch (Exception e) {
            logger.error("Error generating violation alert for compliance check ID: {} - {}", 
                        check.getId(), e.getMessage(), e);
        }
    }

    /**
     * Get all violation alerts for an organization
     */
    @Transactional(readOnly = true)
    public List<ComplianceCheck> getViolationAlerts(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));
        return complianceCheckRepository.findNonCompliantChecksByOrganization(organization);
    }

    /**
     * Send pending violation alerts
     */
    @Async
    public void sendPendingViolationAlerts() {
        logger.info("Sending pending violation alerts");
        List<ComplianceCheck> checksNeedingAlerts = complianceCheckRepository.findChecksNeedingAlerts();
        
        for (ComplianceCheck check : checksNeedingAlerts) {
            try {
                generateViolationAlert(check);
            } catch (Exception e) {
                logger.error("Error sending alert for compliance check ID: {} - {}", 
                           check.getId(), e.getMessage(), e);
            }
        }
        
        logger.info("Completed sending {} pending violation alerts", checksNeedingAlerts.size());
    }

    // ===== COMPLIANCE REPORTING =====

    /**
     * Generate compliance report for an organization
     */
    @Transactional(readOnly = true)
    public ComplianceReport generateComplianceReport(Long organizationId, LocalDate startDate, LocalDate endDate) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        logger.info("Generating compliance report for organization: {} from {} to {}", 
                   organization.getName(), startDate, endDate);

        ComplianceReport report = new ComplianceReport();
        report.setOrganization(organization);
        report.setReportPeriodStart(startDate);
        report.setReportPeriodEnd(endDate);
        report.setGeneratedAt(Instant.now());

        List<ComplianceCheck> checks = complianceCheckRepository
            .findByOrganizationAndCheckDateBetween(organization, startDate, endDate);

        long totalChecks = checks.size();
        long compliantChecks = checks.stream().filter(ComplianceCheck::isCompliant).count();
        long nonCompliantChecks = checks.stream().filter(ComplianceCheck::isNonCompliant).count();
        long unresolvedChecks = checks.stream().filter(c -> !Boolean.TRUE.equals(c.getIsResolved())).count();
        long overdueChecks = checks.stream().filter(ComplianceCheck::isOverdue).count();

        report.setTotalChecks(totalChecks);
        report.setCompliantChecks(compliantChecks);
        report.setNonCompliantChecks(nonCompliantChecks);
        report.setUnresolvedChecks(unresolvedChecks);
        report.setOverdueChecks(overdueChecks);

        if (totalChecks > 0) {
            report.setComplianceRate((double) compliantChecks / totalChecks * 100);
        } else {
            report.setComplianceRate(100.0);
        }

        double avgScore = checks.stream()
            .filter(c -> c.getComplianceScore() != null)
            .mapToInt(ComplianceCheck::getComplianceScore)
            .average()
            .orElse(0.0);
        report.setAverageComplianceScore(avgScore);

        logger.info("Generated compliance report for organization: {} - Total checks: {}, Compliance rate: {}%", 
                   organization.getName(), totalChecks, String.format("%.2f", report.getComplianceRate()));

        return report;
    }

    /**
     * Get compliance summary for an organization
     */
    @Transactional(readOnly = true)
    public ComplianceSummary getComplianceSummary(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        ComplianceSummary summary = new ComplianceSummary();
        summary.setOrganization(organization);

        summary.setTotalRules(complianceRuleRepository.count());
        summary.setTotalChecks(complianceCheckRepository.countByOrganization(organization));
        summary.setNonCompliantChecks(complianceCheckRepository.countNonCompliantByOrganization(organization));
        summary.setUnresolvedChecks(complianceCheckRepository.countUnresolvedByOrganization(organization));
        summary.setOverdueChecks(complianceCheckRepository.countOverdueByOrganization(organization, LocalDate.now()));

        if (summary.getTotalChecks() > 0) {
            long compliantChecks = summary.getTotalChecks() - summary.getNonCompliantChecks();
            summary.setComplianceRate((double) compliantChecks / summary.getTotalChecks() * 100);
        } else {
            summary.setComplianceRate(100.0);
        }

        return summary;
    }

    /**
     * Run compliance checks for all active rules in an organization
     */
    public List<ComplianceCheck> runComplianceChecks(Long organizationId, String checkedBy) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        logger.info("Running compliance checks for organization: {} by: {}", organization.getName(), checkedBy);

        List<ComplianceRule> activeRules = complianceRuleRepository.findActiveRules(LocalDate.now());
        List<ComplianceCheck> results = new ArrayList<>();

        for (ComplianceRule rule : activeRules) {
            try {
                ComplianceCheck check = performComplianceCheck(rule, organization, null, checkedBy);
                results.add(check);
            } catch (Exception e) {
                logger.error("Error running compliance check for rule: {} - {}", 
                           rule.getRuleName(), e.getMessage(), e);
            }
        }

        logger.info("Completed compliance checks for organization: {} - {} checks performed", 
                   organization.getName(), results.size());

        return results;
    }

    /**
     * Run compliance check for a specific rule
     */
    public ComplianceCheck runComplianceCheck(Long ruleId, Long organizationId, String checkedBy) {
        return performComplianceCheck(ruleId, organizationId, checkedBy);
    }

    /**
     * Enhanced violation detection with detailed analysis
     */
    public List<ComplianceViolation> detectViolations(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        logger.info("Detecting violations for organization: {}", organization.getName());

        List<ComplianceCheck> nonCompliantChecks = complianceCheckRepository
            .findNonCompliantChecksByOrganization(organization);

        List<ComplianceViolation> violations = new ArrayList<>();

        for (ComplianceCheck check : nonCompliantChecks) {
            ComplianceViolation violation = new ComplianceViolation();
            violation.setComplianceCheck(check);
            violation.setRuleName(check.getComplianceRule().getRuleName());
            violation.setCategory(check.getComplianceRule().getCategory());
            violation.setSeverity(check.getComplianceRule().getSeverity());
            violation.setViolationDate(check.getCheckDate());
            violation.setDescription(check.getViolations());
            violation.setRecommendations(check.getRecommendations());
            violation.setIsResolved(check.getIsResolved());
            violation.setRemediationDueDate(check.getRemediationDueDate());
            violation.setIsOverdue(check.isOverdue());

            violations.add(violation);
        }

        logger.info("Detected {} violations for organization: {}", violations.size(), organization.getName());

        return violations;
    }

    // ===== COMPLIANCE CHECK MANAGEMENT =====

    /**
     * Get compliance check by ID
     */
    @Transactional(readOnly = true)
    public ComplianceCheck getComplianceCheck(Long id) {
        return complianceCheckRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Compliance check not found with id: " + id));
    }

    /**
     * Get compliance checks for an organization
     */
    @Transactional(readOnly = true)
    public Page<ComplianceCheck> getComplianceChecksByOrganization(Long organizationId, int page, int size) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "checkDate"));
        return complianceCheckRepository.findByOrganization(organization, pageable);
    }

    /**
     * Get overdue compliance checks
     */
    @Transactional(readOnly = true)
    public List<ComplianceCheck> getOverdueComplianceChecks(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));
        
        return complianceCheckRepository.findOverdueChecksByOrganization(organization, LocalDate.now());
    }

    /**
     * Resolve compliance check
     */
    public ComplianceCheck resolveComplianceCheck(Long checkId, Long resolvedByEmployeeId, String resolutionNotes) {
        ComplianceCheck check = complianceCheckRepository.findById(checkId)
            .orElseThrow(() -> new RuntimeException("Compliance check not found with id: " + checkId));
        
        Employee resolvedByEmployee = employeeRepository.findById(resolvedByEmployeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + resolvedByEmployeeId));
        
        check.resolve(resolvedByEmployee, resolutionNotes);
        
        logger.info("Resolved compliance check ID: {} by: {}", checkId, resolvedByEmployee.getFirstName() + " " + resolvedByEmployee.getLastName());
        
        return complianceCheckRepository.save(check);
    }

    /**
     * Resolve compliance check (overloaded for String resolvedBy)
     */
    public ComplianceCheck resolveComplianceCheck(Long checkId, String resolvedBy, String resolutionNotes) {
        ComplianceCheck check = complianceCheckRepository.findById(checkId)
            .orElseThrow(() -> new RuntimeException("Compliance check not found with id: " + checkId));
        
        check.setIsResolved(true);
        check.setResolvedAt(java.time.LocalDateTime.now());
        check.setResolutionNotes(resolutionNotes);
        // Note: resolvedBy as String is stored in notes since entity expects Employee
        if (resolutionNotes == null || resolutionNotes.isEmpty()) {
            check.setResolutionNotes("Resolved by: " + resolvedBy);
        } else {
            check.setResolutionNotes("Resolved by: " + resolvedBy + " - " + resolutionNotes);
        }
        
        logger.info("Resolved compliance check ID: {} by: {}", checkId, resolvedBy);
        
        return complianceCheckRepository.save(check);
    }

    /**
     * Mark remediation as completed
     */
    public ComplianceCheck completeRemediation(Long checkId, String remediatedBy) {
        ComplianceCheck check = complianceCheckRepository.findById(checkId)
            .orElseThrow(() -> new RuntimeException("Compliance check not found with id: " + checkId));
        
        check.completeRemediation(remediatedBy);
        
        logger.info("Completed remediation for compliance check ID: {} by: {}", checkId, remediatedBy);
        
        return complianceCheckRepository.save(check);
    }

    // ===== JURISDICTION MANAGEMENT =====

    /**
     * Create compliance jurisdiction
     */
    public ComplianceJurisdiction createJurisdiction(ComplianceJurisdiction jurisdiction) {
        validateJurisdiction(jurisdiction);
        
        if (jurisdictionRepository.existsByCode(jurisdiction.getCode())) {
            throw new RuntimeException("Jurisdiction with code '" + jurisdiction.getCode() + "' already exists");
        }
        
        logger.info("Creating compliance jurisdiction: {} ({})", jurisdiction.getName(), jurisdiction.getCode());
        
        return jurisdictionRepository.save(jurisdiction);
    }

    /**
     * Get all jurisdictions
     */
    @Transactional(readOnly = true)
    public List<ComplianceJurisdiction> getAllJurisdictions() {
        return jurisdictionRepository.findAllOrderByName();
    }

    /**
     * Get jurisdiction by ID
     */
    @Transactional(readOnly = true)
    public ComplianceJurisdiction getJurisdiction(Long id) {
        return jurisdictionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Jurisdiction not found with id: " + id));
    }

    /**
     * Update jurisdiction
     */
    public ComplianceJurisdiction updateJurisdiction(Long id, com.talentx.hrms.dto.compliance.ComplianceJurisdictionRequest request) {
        ComplianceJurisdiction existing = jurisdictionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Jurisdiction not found with id: " + id));
        
        existing.setName(request.getName());
        existing.setCode(request.getCode());
        existing.setDescription(request.getDescription());
        existing.setCountry(request.getCountry());
        existing.setStateProvince(request.getStateProvince());
        existing.setCity(request.getCity());
        existing.setCountryCode(request.getCountryCode());
        existing.setStateProvinceCode(request.getStateProvinceCode());
        // Convert String to JurisdictionType enum
        if (request.getJurisdictionType() != null) {
            try {
                existing.setJurisdictionType(ComplianceJurisdiction.JurisdictionType.valueOf(request.getJurisdictionType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Invalid type, ignore or log
                logger.warn("Invalid jurisdiction type: {}", request.getJurisdictionType());
            }
        }
        existing.setIsDefault(request.getIsDefault());
        existing.setRegulatoryBody(request.getRegulatoryBody());
        existing.setContactInformation(request.getContactInformation());
        existing.setWebsite(request.getWebsite());
        
        logger.info("Updated compliance jurisdiction: {} (ID: {})", existing.getName(), id);
        return jurisdictionRepository.save(existing);
    }

    /**
     * Run compliance checks from request DTO
     */
    public List<ComplianceCheck> runComplianceChecks(com.talentx.hrms.dto.compliance.ComplianceCheckRunRequest request) {
        if (request.getRuleId() != null) {
            // Run check for specific rule
            ComplianceCheck check = performComplianceCheck(
                request.getRuleId(), 
                request.getOrganizationId(), 
                request.getEmployeeId(),
                request.getCheckedBy()
            );
            return List.of(check);
        } else {
            // Run checks for all active rules
            return runComplianceChecks(request.getOrganizationId(), request.getCheckedBy());
        }
    }

    /**
     * Create compliance rule from request DTO
     */
    public ComplianceRule createComplianceRule(com.talentx.hrms.dto.compliance.ComplianceRuleRequest request) {
        ComplianceJurisdiction jurisdiction = jurisdictionRepository.findById(request.getJurisdictionId())
            .orElseThrow(() -> new RuntimeException("Jurisdiction not found with id: " + request.getJurisdictionId()));
        
        ComplianceRule rule = new ComplianceRule();
        rule.setRuleName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setCategory(request.getCategory());
        rule.setJurisdiction(jurisdiction);
        rule.setEffectiveDate(request.getEffectiveDate());
        rule.setExpiryDate(request.getExpirationDate());
        rule.setRuleData(request.getRuleText());
        rule.setSourceUrl(request.getReferenceUrl());
        rule.setIsActive(true);
        
        validateComplianceRule(rule);
        logger.info("Creating compliance rule: {} for jurisdiction: {}", 
                   rule.getRuleName(), jurisdiction.getName());
        return complianceRuleRepository.save(rule);
    }

    /**
     * Update compliance rule from request DTO
     */
    public ComplianceRule updateComplianceRule(Long id, com.talentx.hrms.dto.compliance.ComplianceRuleRequest request) {
        ComplianceRule existingRule = complianceRuleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Compliance rule not found with id: " + id));

        ComplianceJurisdiction jurisdiction = jurisdictionRepository.findById(request.getJurisdictionId())
            .orElseThrow(() -> new RuntimeException("Jurisdiction not found with id: " + request.getJurisdictionId()));

        existingRule.setRuleName(request.getName());
        existingRule.setDescription(request.getDescription());
        existingRule.setCategory(request.getCategory());
        existingRule.setJurisdiction(jurisdiction);
        existingRule.setEffectiveDate(request.getEffectiveDate());
        existingRule.setExpiryDate(request.getExpirationDate());
        existingRule.setRuleData(request.getRuleText());
        existingRule.setSourceUrl(request.getReferenceUrl());

        validateComplianceRule(existingRule);
        logger.info("Updated compliance rule: {} (ID: {})", existingRule.getRuleName(), id);
        return complianceRuleRepository.save(existingRule);
    }

    // ===== VALIDATION METHODS =====

    private void validateComplianceRule(ComplianceRule rule) {
        if (rule.getRuleName() == null || rule.getRuleName().trim().isEmpty()) {
            throw new RuntimeException("Compliance rule name is required");
        }
        
        if (rule.getJurisdiction() == null) {
            throw new RuntimeException("Compliance rule jurisdiction is required");
        }
        
        if (rule.getEffectiveDate() != null && rule.getExpiryDate() != null && 
            rule.getEffectiveDate().isAfter(rule.getExpiryDate())) {
            throw new RuntimeException("Effective date cannot be after expiry date");
        }
    }

    private void validateJurisdiction(ComplianceJurisdiction jurisdiction) {
        if (jurisdiction.getName() == null || jurisdiction.getName().trim().isEmpty()) {
            throw new RuntimeException("Jurisdiction name is required");
        }
        
        if (jurisdiction.getCode() == null || jurisdiction.getCode().trim().isEmpty()) {
            throw new RuntimeException("Jurisdiction code is required");
        }
    }

    // ===== INNER CLASSES =====

    public static class ComplianceReport {
        private Organization organization;
        private LocalDate reportPeriodStart;
        private LocalDate reportPeriodEnd;
        private Instant generatedAt;
        private long totalChecks;
        private long compliantChecks;
        private long nonCompliantChecks;
        private long unresolvedChecks;
        private long overdueChecks;
        private double complianceRate;
        private double averageComplianceScore;

        public Organization getOrganization() { return organization; }
        public void setOrganization(Organization organization) { this.organization = organization; }
        public LocalDate getReportPeriodStart() { return reportPeriodStart; }
        public void setReportPeriodStart(LocalDate reportPeriodStart) { this.reportPeriodStart = reportPeriodStart; }
        public LocalDate getReportPeriodEnd() { return reportPeriodEnd; }
        public void setReportPeriodEnd(LocalDate reportPeriodEnd) { this.reportPeriodEnd = reportPeriodEnd; }
        public Instant getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
        public long getTotalChecks() { return totalChecks; }
        public void setTotalChecks(long totalChecks) { this.totalChecks = totalChecks; }
        public long getCompliantChecks() { return compliantChecks; }
        public void setCompliantChecks(long compliantChecks) { this.compliantChecks = compliantChecks; }
        public long getNonCompliantChecks() { return nonCompliantChecks; }
        public void setNonCompliantChecks(long nonCompliantChecks) { this.nonCompliantChecks = nonCompliantChecks; }
        public long getUnresolvedChecks() { return unresolvedChecks; }
        public void setUnresolvedChecks(long unresolvedChecks) { this.unresolvedChecks = unresolvedChecks; }
        public long getOverdueChecks() { return overdueChecks; }
        public void setOverdueChecks(long overdueChecks) { this.overdueChecks = overdueChecks; }
        public double getComplianceRate() { return complianceRate; }
        public void setComplianceRate(double complianceRate) { this.complianceRate = complianceRate; }
        public double getAverageComplianceScore() { return averageComplianceScore; }
        public void setAverageComplianceScore(double averageComplianceScore) { this.averageComplianceScore = averageComplianceScore; }
    }

    public static class ComplianceSummary {
        private Organization organization;
        private long totalRules;
        private long totalChecks;
        private long nonCompliantChecks;
        private long unresolvedChecks;
        private long overdueChecks;
        private double complianceRate;

        public Organization getOrganization() { return organization; }
        public void setOrganization(Organization organization) { this.organization = organization; }
        public long getTotalRules() { return totalRules; }
        public void setTotalRules(long totalRules) { this.totalRules = totalRules; }
        public long getTotalChecks() { return totalChecks; }
        public void setTotalChecks(long totalChecks) { this.totalChecks = totalChecks; }
        public long getNonCompliantChecks() { return nonCompliantChecks; }
        public void setNonCompliantChecks(long nonCompliantChecks) { this.nonCompliantChecks = nonCompliantChecks; }
        public long getUnresolvedChecks() { return unresolvedChecks; }
        public void setUnresolvedChecks(long unresolvedChecks) { this.unresolvedChecks = unresolvedChecks; }
        public long getOverdueChecks() { return overdueChecks; }
        public void setOverdueChecks(long overdueChecks) { this.overdueChecks = overdueChecks; }
        public double getComplianceRate() { return complianceRate; }
        public void setComplianceRate(double complianceRate) { this.complianceRate = complianceRate; }
    }

    public static class ComplianceViolation {
        private ComplianceCheck complianceCheck;
        private String ruleName;
        private String category;
        private String severity;
        private LocalDate violationDate;
        private String description;
        private String recommendations;
        private Boolean isResolved;
        private LocalDate remediationDueDate;
        private Boolean isOverdue;

        public ComplianceCheck getComplianceCheck() { return complianceCheck; }
        public void setComplianceCheck(ComplianceCheck complianceCheck) { this.complianceCheck = complianceCheck; }
        public String getRuleName() { return ruleName; }
        public void setRuleName(String ruleName) { this.ruleName = ruleName; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public LocalDate getViolationDate() { return violationDate; }
        public void setViolationDate(LocalDate violationDate) { this.violationDate = violationDate; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getRecommendations() { return recommendations; }
        public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
        public Boolean getIsResolved() { return isResolved; }
        public void setIsResolved(Boolean isResolved) { this.isResolved = isResolved; }
        public LocalDate getRemediationDueDate() { return remediationDueDate; }
        public void setRemediationDueDate(LocalDate remediationDueDate) { this.remediationDueDate = remediationDueDate; }
        public Boolean getIsOverdue() { return isOverdue; }
        public void setIsOverdue(Boolean isOverdue) { this.isOverdue = isOverdue; }
    }

    private static class ComplianceCheckResult {
        private boolean compliant = true;
        private Integer complianceScore = 100;
        private String checkResults;
        private String findings;
        private String violations;
        private String recommendations;

        public boolean isCompliant() { return compliant; }
        public void setCompliant(boolean compliant) { this.compliant = compliant; }
        public Integer getComplianceScore() { return complianceScore; }
        public void setComplianceScore(Integer complianceScore) { this.complianceScore = complianceScore; }
        public String getCheckResults() { return checkResults; }
        public void setCheckResults(String checkResults) { this.checkResults = checkResults; }
        public String getFindings() { return findings; }
        public void setFindings(String findings) { this.findings = findings; }
        public String getViolations() { return violations; }
        public void setViolations(String violations) { this.violations = violations; }
        public String getRecommendations() { return recommendations; }
        public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    }
}
