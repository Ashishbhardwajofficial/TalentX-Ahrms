package com.talentx.hrms.dto.compliance;

import jakarta.validation.constraints.NotNull;

public class ComplianceCheckRunRequest {

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private Long ruleId;

    private Long employeeId;

    private String checkedBy;

    // Constructors
    public ComplianceCheckRunRequest() {}

    public ComplianceCheckRunRequest(Long organizationId, String checkedBy) {
        this.organizationId = organizationId;
        this.checkedBy = checkedBy;
    }

    // Getters and Setters
    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getRuleId() {
        return ruleId;
    }

    public void setRuleId(Long ruleId) {
        this.ruleId = ruleId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getCheckedBy() {
        return checkedBy;
    }

    public void setCheckedBy(String checkedBy) {
        this.checkedBy = checkedBy;
    }
}

