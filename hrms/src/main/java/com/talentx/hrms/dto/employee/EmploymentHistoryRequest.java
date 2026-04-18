package com.talentx.hrms.dto.employee;

import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EmploymentHistoryRequest {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;
    
    private LocalDate endDate;
    
    @Size(max = 255, message = "Job title must not exceed 255 characters")
    private String jobTitle;
    
    @Size(max = 100, message = "Job level must not exceed 100 characters")
    private String jobLevel;
    
    private Long departmentId;
    
    private Long managerId;
    
    private EmploymentStatus employmentStatus;
    
    private EmploymentType employmentType;
    
    private BigDecimal salary;
    
    @Size(max = 10, message = "Salary currency must not exceed 10 characters")
    private String salaryCurrency;
    
    private BigDecimal hourlyRate;
    
    @NotNull(message = "Change type is required")
    @Size(max = 50, message = "Change type must not exceed 50 characters")
    private String changeType;
    
    @Size(max = 500, message = "Change reason must not exceed 500 characters")
    private String changeReason;
    
    @Size(max = 255, message = "Changed by must not exceed 255 characters")
    private String changedBy;
    
    private Boolean isCurrent = false;

    // Constructors
    public EmploymentHistoryRequest() {}

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getJobLevel() {
        return jobLevel;
    }

    public void setJobLevel(String jobLevel) {
        this.jobLevel = jobLevel;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public EmploymentStatus getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(EmploymentStatus employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public String getSalaryCurrency() {
        return salaryCurrency;
    }

    public void setSalaryCurrency(String salaryCurrency) {
        this.salaryCurrency = salaryCurrency;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public String getChangeReason() {
        return changeReason;
    }

    public void setChangeReason(String changeReason) {
        this.changeReason = changeReason;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public Boolean getIsCurrent() {
        return isCurrent;
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.isCurrent = isCurrent;
    }
}

