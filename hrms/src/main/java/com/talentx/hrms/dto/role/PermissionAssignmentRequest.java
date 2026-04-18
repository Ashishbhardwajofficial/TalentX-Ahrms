package com.talentx.hrms.dto.role;

import jakarta.validation.constraints.NotNull;

public class PermissionAssignmentRequest {

    @NotNull(message = "Permission ID is required")
    private Long permissionId;

    // Constructors
    public PermissionAssignmentRequest() {}

    public PermissionAssignmentRequest(Long permissionId) {
        this.permissionId = permissionId;
    }

    // Getters and Setters
    public Long getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }
}

