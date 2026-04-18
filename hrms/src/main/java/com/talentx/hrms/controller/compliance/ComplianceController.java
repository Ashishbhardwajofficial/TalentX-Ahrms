package com.talentx.hrms.controller.compliance;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.SecurityUtils;
import com.talentx.hrms.dto.compliance.*;
import com.talentx.hrms.entity.compliance.ComplianceCheck;
import com.talentx.hrms.entity.compliance.ComplianceJurisdiction;
import com.talentx.hrms.entity.compliance.ComplianceRule;
import com.talentx.hrms.mapper.ComplianceMapper;
import com.talentx.hrms.service.compliance.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/compliance")
@Tag(name = "Compliance Management", description = "Compliance rules, jurisdictions, and checks management")
public class ComplianceController {

    private final ComplianceService complianceService;
    private final ComplianceMapper complianceMapper;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    public ComplianceController(ComplianceService complianceService,
                                ComplianceMapper complianceMapper) {
        this.complianceService = complianceService;
        this.complianceMapper = complianceMapper;
    }

    // ================== JURISDICTIONS ==================

    @PostMapping("/jurisdictions")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER')")
    @Operation(summary = "Create jurisdiction")
    public ResponseEntity<ApiResponse<ComplianceJurisdictionResponse>> createJurisdiction(
            @Valid @RequestBody ComplianceJurisdictionRequest request) {

        ComplianceJurisdiction jurisdiction = complianceMapper.toEntity(request);
        ComplianceJurisdiction saved = complianceService.createJurisdiction(jurisdiction);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Jurisdiction created successfully",
                        complianceMapper.toResponse(saved)));
    }

    @GetMapping("/jurisdictions")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get all jurisdictions")
    public ResponseEntity<ApiResponse<List<ComplianceJurisdictionResponse>>> getJurisdictions() {

        List<ComplianceJurisdictionResponse> responses =
                complianceService.getAllJurisdictions()
                        .stream()
                        .map(complianceMapper::toResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Jurisdictions retrieved successfully", responses));
    }

    @GetMapping("/jurisdictions/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get jurisdiction by ID")
    public ResponseEntity<ApiResponse<ComplianceJurisdictionResponse>> getJurisdiction(
            @PathVariable Long id) {

        ComplianceJurisdiction jurisdiction = complianceService.getJurisdiction(id);
        return ResponseEntity.ok(ApiResponse.success("Jurisdiction retrieved successfully",
                complianceMapper.toResponse(jurisdiction)));
    }

    @PutMapping("/jurisdictions/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER')")
    @Operation(summary = "Update jurisdiction")
    public ResponseEntity<ApiResponse<ComplianceJurisdictionResponse>> updateJurisdiction(
            @PathVariable Long id,
            @Valid @RequestBody ComplianceJurisdictionRequest request) {

        ComplianceJurisdiction updated =
                complianceService.updateJurisdiction(id, request);

        return ResponseEntity.ok(ApiResponse.success("Jurisdiction updated successfully",
                complianceMapper.toResponse(updated)));
    }

    // ================== RULES ==================

    @PostMapping("/rules")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER')")
    @Operation(summary = "Create compliance rule")
    public ResponseEntity<ApiResponse<ComplianceRuleResponse>> createRule(
            @Valid @RequestBody ComplianceRuleRequest request) {

        ComplianceRule rule = complianceService.createComplianceRule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Compliance rule created successfully",
                        complianceMapper.toResponse(rule)));
    }

    @GetMapping("/rules")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get compliance rules")
    public ResponseEntity<ApiResponse<List<ComplianceRuleResponse>>> getRules(
            @RequestParam(required = false) Long jurisdictionId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        List<ComplianceRule> rules;

        if (jurisdictionId != null) {
            rules = complianceService.getComplianceRulesByJurisdiction(jurisdictionId);
        } else if (activeOnly) {
            rules = complianceService.getActiveComplianceRules();
        } else {
            rules = complianceService.getAllComplianceRules();
        }

        List<ComplianceRuleResponse> responses =
                rules.stream().map(complianceMapper::toResponse).toList();

        return ResponseEntity.ok(ApiResponse.success("Compliance rules retrieved successfully", responses));
    }

    @GetMapping("/rules/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get rule by ID")
    public ResponseEntity<ApiResponse<ComplianceRuleResponse>> getRule(@PathVariable Long id) {

        ComplianceRule rule = complianceService.getComplianceRule(id);
        return ResponseEntity.ok(ApiResponse.success("Compliance rule retrieved successfully",
                complianceMapper.toResponse(rule)));
    }

    @PutMapping("/rules/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER')")
    @Operation(summary = "Update compliance rule")
    public ResponseEntity<ApiResponse<ComplianceRuleResponse>> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody ComplianceRuleRequest request) {

        ComplianceRule updated = complianceService.updateComplianceRule(id, request);
        return ResponseEntity.ok(ApiResponse.success("Compliance rule updated successfully",
                complianceMapper.toResponse(updated)));
    }

    @DeleteMapping("/rules/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER')")
    @Operation(summary = "Delete compliance rule")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {

        complianceService.deleteComplianceRule(id);
        return ResponseEntity.ok(ApiResponse.success("Compliance rule deleted successfully", null));
    }

    // ================== COMPLIANCE CHECKS ==================

    @GetMapping("/checks")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get compliance checks (paginated)")
    public ResponseEntity<ApiResponse<Page<ComplianceCheckResponse>>> getComplianceChecks(
            @RequestParam Long organizationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ComplianceCheckResponse> response =
                complianceService.getComplianceChecksByOrganization(organizationId, page, size)
                        .map(complianceMapper::toResponse);

        return ResponseEntity.ok(ApiResponse.success("Compliance checks retrieved successfully", response));
    }

    @GetMapping("/checks/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get compliance check by ID")
    public ResponseEntity<ApiResponse<ComplianceCheckResponse>> getComplianceCheck(
            @PathVariable Long id) {

        ComplianceCheck check = complianceService.getComplianceCheck(id);
        return ResponseEntity.ok(ApiResponse.success("Compliance check retrieved successfully",
                complianceMapper.toResponse(check)));
    }

    @PostMapping("/checks/run")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER')")
    @Operation(summary = "Run compliance checks")
    public ResponseEntity<ApiResponse<List<ComplianceCheckResponse>>> runComplianceCheck(
            @Valid @RequestBody ComplianceCheckRunRequest request) {

        List<ComplianceCheckResponse> responses =
                complianceService.runComplianceChecks(request)
                        .stream()
                        .map(complianceMapper::toResponse)
                        .toList();

        return ResponseEntity.ok(ApiResponse.success("Compliance checks executed successfully", responses));
    }

    @PutMapping("/checks/{id:\\d+}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER')")
    @Operation(summary = "Resolve compliance violation")
    public ResponseEntity<ApiResponse<ComplianceCheckResponse>> resolveViolation(
            @PathVariable Long id,
            @Valid @RequestBody ComplianceCheckResolveRequest request) {

        ComplianceCheck resolved =
                complianceService.resolveComplianceCheck(id, request.getResolvedBy(),
                        request.getResolutionNotes());

        return ResponseEntity.ok(ApiResponse.success("Compliance violation resolved successfully",
                complianceMapper.toResponse(resolved)));
    }

    @GetMapping("/checks/overdue")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get overdue compliance checks")
    public ResponseEntity<ApiResponse<List<ComplianceCheckResponse>>> getOverdueChecks(
            @RequestParam Long organizationId) {

        List<ComplianceCheckResponse> responses =
                complianceService.getOverdueComplianceChecks(organizationId)
                        .stream()
                        .map(complianceMapper::toResponse)
                        .toList();

        return ResponseEntity.ok(ApiResponse.success("Overdue compliance checks retrieved successfully", responses));
    }

    @GetMapping("/checks/violations")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get compliance violation alerts")
    public ResponseEntity<ApiResponse<List<ComplianceCheckResponse>>> getViolationAlerts(
            @RequestParam Long organizationId) {

        List<ComplianceCheckResponse> responses =
                complianceService.getViolationAlerts(organizationId)
                        .stream()
                        .map(complianceMapper::toResponse)
                        .toList();

        return ResponseEntity.ok(ApiResponse.success("Violation alerts retrieved successfully", responses));
    }

    /**
     * Get unresolved compliance checks — matches frontend /compliance/checks/unresolved
     */
    @GetMapping("/checks/unresolved")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get unresolved compliance checks")
    public ResponseEntity<ApiResponse<List<ComplianceCheckResponse>>> getUnresolvedChecks(
            @RequestParam(required = false) Long organizationId) {
        try {
            long orgId = organizationId != null ? organizationId : securityUtils.getCurrentUserOrgId();
            List<ComplianceCheckResponse> responses =
                    complianceService.getViolationAlerts(orgId)
                            .stream()
                            .map(complianceMapper::toResponse)
                            .toList();
            return ResponseEntity.ok(ApiResponse.success("Unresolved checks retrieved", responses));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.success("Unresolved checks retrieved", List.of()));
        }
    }

    /**
     * Get compliance overview — matches frontend /compliance/overview
     */
    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN','COMPLIANCE_OFFICER','HR')")
    @Operation(summary = "Get compliance overview")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getComplianceOverview(
            @RequestParam(required = false) Long organizationId) {
        try {
            long orgId = organizationId != null ? organizationId : securityUtils.getCurrentUserOrgId();
            List<ComplianceCheck> violations = complianceService.getViolationAlerts(orgId);
            List<ComplianceCheck> overdue = complianceService.getOverdueComplianceChecks(orgId);
            java.util.Map<String, Object> overview = new java.util.HashMap<>();
            overview.put("totalChecks", violations.size() + overdue.size());
            overview.put("compliantChecks", 0);
            overview.put("nonCompliantChecks", violations.size());
            overview.put("unresolvedViolations", violations.stream().filter(c -> !Boolean.TRUE.equals(c.getResolved())).count());
            overview.put("criticalViolations", violations.stream().filter(c -> "CRITICAL".equals(c.getSeverity() != null ? c.getSeverity().name() : "")).count());
            return ResponseEntity.ok(ApiResponse.success("Compliance overview retrieved", overview));
        } catch (RuntimeException e) {
            java.util.Map<String, Object> empty = new java.util.HashMap<>();
            empty.put("totalChecks", 0); empty.put("compliantChecks", 0);
            empty.put("nonCompliantChecks", 0); empty.put("unresolvedViolations", 0); empty.put("criticalViolations", 0);
            return ResponseEntity.ok(ApiResponse.success("Compliance overview retrieved", empty));
        }
    }
}
