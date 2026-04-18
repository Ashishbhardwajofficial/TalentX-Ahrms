package com.talentx.hrms.dto.user;

import jakarta.validation.constraints.NotNull;

public class RoleAssignmentRequest {

    @NotNull(message = "Role ID is required")
    private Long roleId;

    // Constructors
    public RoleAssignmentRequest() {}

    public RoleAssignmentRequest(Long roleId) {
        this.roleId = roleId;
    }

    // Getters and Setters
    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
}

