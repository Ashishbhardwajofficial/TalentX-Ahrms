package com.talentx.hrms.entity.analytics;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_log_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_log_user", columnList = "user_id"),
    @Index(name = "idx_audit_log_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_log_action", columnList = "action")
})
@AttributeOverride(name = "id", column = @Column(name = "audit_log_id"))
public class AuditLog extends BaseEntity {

    @NotNull(message = "Timestamp is required")
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Size(max = 255, message = "Username must not exceed 255 characters")
    @Column(name = "username")
    private String username;

    @Size(max = 100, message = "User role must not exceed 100 characters")
    @Column(name = "user_role")
    private String userRole;

    @NotBlank(message = "Action is required")
    @Size(max = 100, message = "Action must not exceed 100 characters")
    @Column(name = "action", nullable = false)
    private String action; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, EXPORT, etc.

    @Size(max = 100, message = "Entity type must not exceed 100 characters")
    @Column(name = "entity_type")
    private String entityType; // Employee, User, PayrollRun, etc.

    @Size(max = 100, message = "Entity ID must not exceed 100 characters")
    @Column(name = "entity_id")
    private String entityId;

    @Size(max = 255, message = "Entity name must not exceed 255 characters")
    @Column(name = "entity_name")
    private String entityName;

    @Size(max = 2000, message = "Old values must not exceed 2000 characters")
    @Column(name = "old_values", length = 2000)
    private String oldValues; // JSON format

    @Size(max = 2000, message = "New values must not exceed 2000 characters")
    @Column(name = "new_values", length = 2000)
    private String newValues; // JSON format

    @Size(max = 1000, message = "Changes must not exceed 1000 characters")
    @Column(name = "changes")
    private String changes; // Summary of what changed

    @Size(max = 100, message = "IP address must not exceed 100 characters")
    @Column(name = "ip_address")
    private String ipAddress;

    @Size(max = 500, message = "User agent must not exceed 500 characters")
    @Column(name = "user_agent")
    private String userAgent;

    @Size(max = 255, message = "Session ID must not exceed 255 characters")
    @Column(name = "session_id")
    private String sessionId;

    @Size(max = 100, message = "Module must not exceed 100 characters")
    @Column(name = "module")
    private String module; // EMPLOYEE, PAYROLL, RECRUITMENT, etc.

    @Size(max = 100, message = "Sub module must not exceed 100 characters")
    @Column(name = "sub_module")
    private String subModule;

    @Size(max = 50, message = "Severity must not exceed 50 characters")
    @Column(name = "severity")
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Size(max = 50, message = "Status must not exceed 50 characters")
    @Column(name = "status")
    private String status; // SUCCESS, FAILURE, ERROR

    @Size(max = 1000, message = "Error message must not exceed 1000 characters")
    @Column(name = "error_message")
    private String errorMessage;

    @Size(max = 2000, message = "Additional data must not exceed 2000 characters")
    @Column(name = "additional_data", length = 2000)
    private String additionalData; // JSON format for extra context

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description")
    private String description;

    @Column(name = "is_sensitive")
    private Boolean isSensitive = false;

    @Column(name = "retention_days")
    private Integer retentionDays;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    // Constructors
    public AuditLog() {}

    public AuditLog(String action, String entityType, String entityId) {
        this.timestamp = Instant.now();
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public AuditLog(User user, String action, String entityType, String entityId) {
        this.timestamp = Instant.now();
        this.user = user;
        this.username = user != null ? user.getUsername() : null;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.organization = user != null ? user.getOrganization() : null;
    }

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
    }

    // Getters and Setters
    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getOldValues() {
        return oldValues;
    }

    public void setOldValues(String oldValues) {
        this.oldValues = oldValues;
    }

    public String getNewValues() {
        return newValues;
    }

    public void setNewValues(String newValues) {
        this.newValues = newValues;
    }

    public String getChanges() {
        return changes;
    }

    public void setChanges(String changes) {
        this.changes = changes;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String getSubModule() {
        return subModule;
    }

    public void setSubModule(String subModule) {
        this.subModule = subModule;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getAdditionalData() {
        return additionalData;
    }

    public void setAdditionalData(String additionalData) {
        this.additionalData = additionalData;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsSensitive() {
        return isSensitive;
    }

    public void setIsSensitive(Boolean isSensitive) {
        this.isSensitive = isSensitive;
    }

    public Integer getRetentionDays() {
        return retentionDays;
    }

    public void setRetentionDays(Integer retentionDays) {
        this.retentionDays = retentionDays;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    // Helper methods
    public boolean isSuccess() {
        return "SUCCESS".equalsIgnoreCase(status);
    }

    public boolean isFailure() {
        return "FAILURE".equalsIgnoreCase(status) || "ERROR".equalsIgnoreCase(status);
    }

    public boolean isCritical() {
        return "CRITICAL".equalsIgnoreCase(severity);
    }

    public boolean isHighSeverity() {
        return "HIGH".equalsIgnoreCase(severity) || "CRITICAL".equalsIgnoreCase(severity);
    }

    public boolean isDataModification() {
        return "CREATE".equalsIgnoreCase(action) || 
               "UPDATE".equalsIgnoreCase(action) || 
               "DELETE".equalsIgnoreCase(action);
    }

    public boolean isSecurityEvent() {
        return "LOGIN".equalsIgnoreCase(action) || 
               "LOGOUT".equalsIgnoreCase(action) || 
               "FAILED_LOGIN".equalsIgnoreCase(action) ||
               "PASSWORD_CHANGE".equalsIgnoreCase(action) ||
               "PERMISSION_DENIED".equalsIgnoreCase(action);
    }

    public static AuditLog createLoginLog(User user, String ipAddress, String userAgent, boolean success) {
        AuditLog log = new AuditLog(user, success ? "LOGIN" : "FAILED_LOGIN", "User", user.getId().toString());
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setStatus(success ? "SUCCESS" : "FAILURE");
        log.setSeverity(success ? "LOW" : "MEDIUM");
        log.setModule("AUTHENTICATION");
        return log;
    }

    public static AuditLog createDataChangeLog(User user, String action, String entityType, String entityId, 
                                             String entityName, String oldValues, String newValues) {
        AuditLog log = new AuditLog(user, action, entityType, entityId);
        log.setEntityName(entityName);
        log.setOldValues(oldValues);
        log.setNewValues(newValues);
        log.setStatus("SUCCESS");
        log.setSeverity("MEDIUM");
        return log;
    }
}

