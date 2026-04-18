package com.talentx.hrms.entity.security;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "permissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name"),
    @UniqueConstraint(columnNames = "code")
})
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Long id;

    @NotBlank(message = "Permission name is required")
    @Size(max = 100, message = "Permission name must not exceed 100 characters")
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @NotBlank(message = "Permission code is required")
    @Size(max = 50, message = "Permission code must not exceed 50 characters")
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    @Column(name = "category")
    private String category;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    // Additional fields expected by service layer (transient - not in database yet)
    @Transient
    private String resource;

    @Transient
    private String action;

    @Transient
    private Boolean isSystemPermission;

    @Transient
    private Timestamp updatedAt;

    @OneToMany(mappedBy = "permission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RolePermission> rolePermissions = new ArrayList<>();

    // Constructors
    public Permission() {}

    public Permission(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public Permission(String name, String code, String category, String description) {
        this.name = name;
        this.code = code;
        this.category = category;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
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

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<RolePermission> getRolePermissions() {
        return rolePermissions;
    }

    public void setRolePermissions(List<RolePermission> rolePermissions) {
        this.rolePermissions = rolePermissions;
    }

    // Helper methods
    public void addRolePermission(RolePermission rolePermission) {
        rolePermissions.add(rolePermission);
        rolePermission.setPermission(this);
    }

    public void removeRolePermission(RolePermission rolePermission) {
        rolePermissions.remove(rolePermission);
        rolePermission.setPermission(null);
    }
}

