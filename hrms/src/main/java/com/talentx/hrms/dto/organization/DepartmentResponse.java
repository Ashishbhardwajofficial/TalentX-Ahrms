package com.talentx.hrms.dto.organization;

import java.sql.Timestamp;

public class DepartmentResponse {
    
    private Long id;
    private Long organizationId;
    private String name;
    private String code;
    private String description;
    private Long parentDepartmentId;
    private String parentDepartmentName;
    private Long managerId;
    private String managerName;
    private String costCenter;
    private String location;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    public DepartmentResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
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
    
    public Long getParentDepartmentId() {
        return parentDepartmentId;
    }
    
    public void setParentDepartmentId(Long parentDepartmentId) {
        this.parentDepartmentId = parentDepartmentId;
    }
    
    public String getParentDepartmentName() {
        return parentDepartmentName;
    }
    
    public void setParentDepartmentName(String parentDepartmentName) {
        this.parentDepartmentName = parentDepartmentName;
    }
    
    public Long getManagerId() {
        return managerId;
    }
    
    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }
    
    public String getManagerName() {
        return managerName;
    }
    
    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }
    
    public String getCostCenter() {
        return costCenter;
    }
    
    public void setCostCenter(String costCenter) {
        this.costCenter = costCenter;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
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
}

