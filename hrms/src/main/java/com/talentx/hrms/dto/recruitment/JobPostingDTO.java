package com.talentx.hrms.dto.recruitment;

import com.talentx.hrms.entity.enums.EmploymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class JobPostingDTO {
    
    private Long id;
    
    @NotBlank(message = "Job title is required")
    @Size(max = 255, message = "Job title must not exceed 255 characters")
    private String title;
    
    @NotBlank(message = "Job code is required")
    @Size(max = 50, message = "Job code must not exceed 50 characters")
    private String jobCode;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String requirements;
    private String responsibilities;
    private String qualifications;
    private String benefits;
    
    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;
    
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;
    
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    
    @Size(max = 10, message = "Salary currency must not exceed 10 characters")
    private String salaryCurrency;
    
    private Integer numberOfPositions;
    
    @NotNull(message = "Posting date is required")
    private LocalDate postingDate;
    
    private LocalDate closingDate;
    
    private Boolean isActive;
    private Boolean isPublished;
    private Boolean isInternal;
    
    private Integer applicationCount;
    private Instant createdAt;
    private Instant publishedAt;
    
    // Organization details
    private Long organizationId;
    private String organizationName;
    
    // Department details
    private Long departmentId;
    private String departmentName;
    
    // Location details
    private Long locationId;
    private String locationName;
    
    // Hiring manager details
    private Long hiringManagerId;
    private String hiringManagerName;
    
    // Created by details
    private Long createdById;
    private String createdByName;
    
    // Constructors
    public JobPostingDTO() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getJobCode() {
        return jobCode;
    }
    
    public void setJobCode(String jobCode) {
        this.jobCode = jobCode;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getRequirements() {
        return requirements;
    }
    
    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }
    
    public String getResponsibilities() {
        return responsibilities;
    }
    
    public void setResponsibilities(String responsibilities) {
        this.responsibilities = responsibilities;
    }
    
    public String getQualifications() {
        return qualifications;
    }
    
    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }
    
    public String getBenefits() {
        return benefits;
    }
    
    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }
    
    public EmploymentType getEmploymentType() {
        return employmentType;
    }
    
    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public BigDecimal getSalaryMin() {
        return salaryMin;
    }
    
    public void setSalaryMin(BigDecimal salaryMin) {
        this.salaryMin = salaryMin;
    }
    
    public BigDecimal getSalaryMax() {
        return salaryMax;
    }
    
    public void setSalaryMax(BigDecimal salaryMax) {
        this.salaryMax = salaryMax;
    }
    
    public String getSalaryCurrency() {
        return salaryCurrency;
    }
    
    public void setSalaryCurrency(String salaryCurrency) {
        this.salaryCurrency = salaryCurrency;
    }
    
    public Integer getNumberOfPositions() {
        return numberOfPositions;
    }
    
    public void setNumberOfPositions(Integer numberOfPositions) {
        this.numberOfPositions = numberOfPositions;
    }
    
    public LocalDate getPostingDate() {
        return postingDate;
    }
    
    public void setPostingDate(LocalDate postingDate) {
        this.postingDate = postingDate;
    }
    
    public LocalDate getClosingDate() {
        return closingDate;
    }
    
    public void setClosingDate(LocalDate closingDate) {
        this.closingDate = closingDate;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIsPublished() {
        return isPublished;
    }
    
    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }
    
    public Boolean getIsInternal() {
        return isInternal;
    }
    
    public void setIsInternal(Boolean isInternal) {
        this.isInternal = isInternal;
    }
    
    public Integer getApplicationCount() {
        return applicationCount;
    }
    
    public void setApplicationCount(Integer applicationCount) {
        this.applicationCount = applicationCount;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public Instant getPublishedAt() {
        return publishedAt;
    }
    
    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }
    
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    
    public String getOrganizationName() {
        return organizationName;
    }
    
    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }
    
    public Long getDepartmentId() {
        return departmentId;
    }
    
    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }
    
    public String getDepartmentName() {
        return departmentName;
    }
    
    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
    
    public Long getLocationId() {
        return locationId;
    }
    
    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }
    
    public String getLocationName() {
        return locationName;
    }
    
    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }
    
    public Long getHiringManagerId() {
        return hiringManagerId;
    }
    
    public void setHiringManagerId(Long hiringManagerId) {
        this.hiringManagerId = hiringManagerId;
    }
    
    public String getHiringManagerName() {
        return hiringManagerName;
    }
    
    public void setHiringManagerName(String hiringManagerName) {
        this.hiringManagerName = hiringManagerName;
    }
    
    public Long getCreatedById() {
        return createdById;
    }
    
    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }
    
    public String getCreatedByName() {
        return createdByName;
    }
    
    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
}

    // Additional fields and methods for service compatibility

