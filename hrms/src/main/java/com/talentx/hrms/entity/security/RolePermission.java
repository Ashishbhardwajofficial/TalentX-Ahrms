package com.talentx.hrms.entity.security;

import com.talentx.hrms.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "role_permissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"role_id", "permission_id"})
})
@AttributeOverride(name = "id", column = @Column(name = "role_permission_id"))
public class RolePermission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Permission permission;

    @Column(name = "granted_at")
    private Instant grantedAt;

    @Column(name = "granted_by")
    private String grantedBy;

    @Column(name = "expires_at")
    private Instant expiresAt;

    // Constructors
    public RolePermission() {}

    public RolePermission(Role role, Permission permission) {
        this.role = role;
        this.permission = permission;
        this.grantedAt = Instant.now();
    }

    public RolePermission(Role role, Permission permission, String grantedBy) {
        this.role = role;
        this.permission = permission;
        this.grantedBy = grantedBy;
        this.grantedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (this.grantedAt == null) {
            this.grantedAt = Instant.now();
        }
    }

    // Getters and Setters
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Permission getPermission() {
        return permission;
    }

    public void setPermission(Permission permission) {
        this.permission = permission;
    }

    public Instant getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(Instant grantedAt) {
        this.grantedAt = grantedAt;
    }

    public String getGrantedBy() {
        return grantedBy;
    }

    public void setGrantedBy(String grantedBy) {
        this.grantedBy = grantedBy;
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

    public boolean isActive() {
        return Boolean.TRUE.equals(getActive()) && !isExpired();
    }
}

