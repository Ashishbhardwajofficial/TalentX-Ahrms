package com.talentx.hrms.entity.analytics;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

@Entity
@Table(name = "system_notifications", indexes = {
    @Index(name = "idx_notification_user", columnList = "user_id"),
    @Index(name = "idx_notification_read", columnList = "is_read"),
    @Index(name = "idx_notification_created", columnList = "created_at"),
    @Index(name = "idx_notification_type", columnList = "notification_type")
})
@AttributeOverride(name = "id", column = @Column(name = "notification_id"))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SystemNotification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "departments", "locations",
                           "employees", "userRoles", "roles"})
    @NotNull(message = "Organization is required")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userRoles", "passwordHash",
                           "password", "twoFactorSecret", "passwordResetToken", "emailVerificationToken"})
    private User user;

    @NotBlank(message = "Notification type is required")
    @Size(max = 50, message = "Notification type must not exceed 50 characters")
    @Column(name = "notification_type", nullable = false)
    private String notificationType; // INFO, WARNING, ERROR, SUCCESS, COMPLIANCE_ALERT, APPROVAL_REQUEST

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Size(max = 500, message = "Action URL must not exceed 500 characters")
    @Column(name = "action_url")
    private String actionUrl;

    @NotNull(message = "Read status is required")
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    // Constructors
    public SystemNotification() {}

    public SystemNotification(Organization organization, User user, String notificationType, 
                            String title, String message) {
        this.organization = organization;
        this.user = user;
        this.notificationType = notificationType;
        this.title = title;
        this.message = message;
        this.isRead = false;
    }

    // Getters and Setters
    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
        if (isRead && this.readAt == null) {
            this.readAt = Instant.now();
        }
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isUnread() {
        return !isRead;
    }

    public void markAsRead() {
        this.isRead = true;
        this.readAt = Instant.now();
    }

    public boolean isHighPriority() {
        return "ERROR".equalsIgnoreCase(notificationType) || 
               "COMPLIANCE_ALERT".equalsIgnoreCase(notificationType) ||
               "APPROVAL_REQUEST".equalsIgnoreCase(notificationType);
    }
}

