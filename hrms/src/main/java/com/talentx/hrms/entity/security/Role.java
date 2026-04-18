package com.talentx.hrms.entity.security;

import com.talentx.hrms.entity.core.Organization;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "code"})
})
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @NotBlank(message = "Role name is required")
    @Size(max = 100, message = "Role name must not exceed 100 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 50, message = "Role code must not exceed 50 characters")
    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "description")
    private String description;

    @Column(name = "is_system_role")
    private Boolean isSystemRole = false;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserRole> userRoles = new ArrayList<>();

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RolePermission> rolePermissions = new ArrayList<>();

    // Constructors
    public Role() {}

    public Role(String name, String code, Organization organization) {
        this.name = name;
        this.code = code;
        this.organization = organization;
    }

    public Role(String name, String code, String description, Organization organization) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.organization = organization;
    }

    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
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

    public Boolean getIsSystemRole() {
        return isSystemRole;
    }

    public void setIsSystemRole(Boolean isSystemRole) {
        this.isSystemRole = isSystemRole;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<UserRole> getUserRoles() {
        return userRoles;
    }

    public void setUserRoles(List<UserRole> userRoles) {
        this.userRoles = userRoles;
    }

    public List<RolePermission> getRolePermissions() {
        return rolePermissions;
    }

    public void setRolePermissions(List<RolePermission> rolePermissions) {
        this.rolePermissions = rolePermissions;
    }

    // Helper methods
    public void addUserRole(UserRole userRole) {
        userRoles.add(userRole);
        userRole.setRole(this);
    }

    public void removeUserRole(UserRole userRole) {
        userRoles.remove(userRole);
        userRole.setRole(null);
    }

    public void addRolePermission(RolePermission rolePermission) {
        rolePermissions.add(rolePermission);
        rolePermission.setRole(this);
    }

    public void removeRolePermission(RolePermission rolePermission) {
        rolePermissions.remove(rolePermission);
        rolePermission.setRole(null);
    }
}

