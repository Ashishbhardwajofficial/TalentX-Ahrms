package com.talentx.hrms.dto.organization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class DepartmentRequest {
    
    @NotNull(message = "Organization ID is required")
    private Long organizationId;
    
    @NotBlank(message = "Department name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Department code is required")
    @Size(max = 50, message = "Code must not exceed 50 characters")
    private String code;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Long parentDepartmentId;
    
    private Long managerId;
    
    @Size(max = 50, message = "Cost center must not exceed 50 characters")
    private String costCenter;
    
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;
    
    public DepartmentRequest() {}
    
    // Getters and Setters
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
    
    public Long getManagerId() {
        return managerId;
    }
    
    public void setManagerId(Long managerId) {
        this.managerId = managerId;
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
}

