package com.talentx.hrms.entity.security;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_roles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "role_id"})
})
@AttributeOverride(name = "id", column = @Column(name = "user_role_id"))
public class UserRole extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Role role;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column(name = "assigned_by")
    private String assignedBy;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "is_primary_role")
    private Boolean isPrimaryRole = false;

    // Constructors
    public UserRole() {}

    public UserRole(User user, Role role) {
        this.user = user;
        this.role = role;
        this.assignedAt = Instant.now();
    }

    public UserRole(User user, Role role, String assignedBy) {
        this.user = user;
        this.role = role;
        this.assignedBy = assignedBy;
        this.assignedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (this.assignedAt == null) {
            this.assignedAt = Instant.now();
        }
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getIsPrimaryRole() {
        return isPrimaryRole;
    }

    public void setIsPrimaryRole(Boolean isPrimaryRole) {
        this.isPrimaryRole = isPrimaryRole;
    }

    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(getActive()) && !isExpired();
    }
}

