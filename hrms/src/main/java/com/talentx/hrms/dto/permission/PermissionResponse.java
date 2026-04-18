package com.talentx.hrms.dto.permission;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class PermissionResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String resource;
    private String action;
    @JsonProperty("isSystemPermission")
    private Boolean isSystemPermission;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public PermissionResponse() {}

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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public Boolean getIsSystemPermission() {
        return isSystemPermission;
    }

    public void setIsSystemPermission(Boolean isSystemPermission) {
        this.isSystemPermission = isSystemPermission;
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
}

