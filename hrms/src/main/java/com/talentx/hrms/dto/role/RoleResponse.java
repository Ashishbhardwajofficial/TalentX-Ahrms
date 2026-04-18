package com.talentx.hrms.dto.role;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

public class RoleResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    @JsonProperty("isSystemRole")
    private Boolean isSystemRole;
    private Long organizationId;
    private String organizationName;
    private List<PermissionSummary> permissions;
    private Integer userCount;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public RoleResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsSystemRole() {
        return isSystemRole;
    }

    public void setIsSystemRole(Boolean isSystemRole) {
        this.isSystemRole = isSystemRole;
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

    public List<PermissionSummary> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<PermissionSummary> permissions) {
        this.permissions = permissions;
    }

    public Integer getUserCount() {
        return userCount;
    }

    public void setUserCount(Integer userCount) {
        this.userCount = userCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Inner class for permission summary
    public static class PermissionSummary {
        private Long id;
        private String name;
        private String description;
        private String resource;
        private String action;

        public PermissionSummary() {}

        public PermissionSummary(Long id, String name, String description, String resource, String action) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.resource = resource;
            this.action = action;
        }

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

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getResource() {
            return resource;
        }

        public void setResource(String resource) {
            this.resource = resource;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }
    }
}

