package com.talentx.hrms.dto.employee;

import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.entity.enums.Gender;
import com.talentx.hrms.entity.enums.MaritalStatus;
import com.talentx.hrms.entity.enums.PayFrequency;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

public class EmployeeResponse {
    
    private Long id;
    private String employeeNumber;
    private String firstName;
    private String middleName;
    private String lastName;
    private String preferredName;
    private String fullName;
    private Date dateOfBirth;
    private Gender gender;
    private String nationality;
    private MaritalStatus maritalStatus;
    private String personalEmail;
    private String workEmail;
    private String phoneNumber;
    private String mobileNumber;
    private String panNumber;
    private String aadhaarNumber;
    private String uanNumber;
    private String esicNumber;
    private String pfNumber;
    private EmploymentStatus employmentStatus;
    private EmploymentType employmentType;
    private Date hireDate;
    private Date terminationDate;
    private Date probationEndDate;
    private String jobTitle;
    private String jobLevel;
    private BigDecimal salaryAmount;
    private String salaryCurrency;
    private PayFrequency payFrequency;
    private String profilePictureUrl;
    private String bio;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private Long createdBy;
    
    // Organization details
    private Long organizationId;
    private String organizationName;
    
    // Department details
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    
    // Location details
    private Long locationId;
    private String locationName;
    
    // Manager details
    private Long managerId;
    private String managerName;
    private String managerEmployeeNumber;
    
    // User account details
    private Long userId;
    private String username;
    
    // Constructors
    public EmployeeResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmployeeNumber() {
        return employeeNumber;
    }
    
    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getMiddleName() {
        return middleName;
    }
    
    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getPreferredName() {
        return preferredName;
    }
    
    public void setPreferredName(String preferredName) {
        this.preferredName = preferredName;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public Date getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(Date dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public Gender getGender() {
        return gender;
    }
    
    public void setGender(Gender gender) {
        this.gender = gender;
    }
    
    public String getNationality() {
        return nationality;
    }
    
    public void setNationality(String nationality) {
        this.nationality = nationality;
    }
    
    public MaritalStatus getMaritalStatus() {
        return maritalStatus;
    }
    
    public void setMaritalStatus(MaritalStatus maritalStatus) {
        this.maritalStatus = maritalStatus;
    }
    
    public String getPersonalEmail() {
        return personalEmail;
    }
    
    public void setPersonalEmail(String personalEmail) {
        this.personalEmail = personalEmail;
    }
    
    public String getWorkEmail() {
        return workEmail;
    }
    
    public void setWorkEmail(String workEmail) {
        this.workEmail = workEmail;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getMobileNumber() {
        return mobileNumber;
    }
    
    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
    
    public String getPanNumber() {
        return panNumber;
    }
    
    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }
    
    public String getAadhaarNumber() {
        return aadhaarNumber;
    }
    
    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }
    
    public String getUanNumber() {
        return uanNumber;
    }
    
    public void setUanNumber(String uanNumber) {
        this.uanNumber = uanNumber;
    }
    
    public String getEsicNumber() {
        return esicNumber;
    }
    
    public void setEsicNumber(String esicNumber) {
        this.esicNumber = esicNumber;
    }
    
    public String getPfNumber() {
        return pfNumber;
    }
    
    public void setPfNumber(String pfNumber) {
        this.pfNumber = pfNumber;
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
    
    public Date getHireDate() {
        return hireDate;
    }
    
    public void setHireDate(Date hireDate) {
        this.hireDate = hireDate;
    }
    
    public Date getTerminationDate() {
        return terminationDate;
    }
    
    public void setTerminationDate(Date terminationDate) {
        this.terminationDate = terminationDate;
    }
    
    public Date getProbationEndDate() {
        return probationEndDate;
    }
    
    public void setProbationEndDate(Date probationEndDate) {
        this.probationEndDate = probationEndDate;
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
    
    public BigDecimal getSalaryAmount() {
        return salaryAmount;
    }
    
    public void setSalaryAmount(BigDecimal salaryAmount) {
        this.salaryAmount = salaryAmount;
    }
    
    public String getSalaryCurrency() {
        return salaryCurrency;
    }
    
    public void setSalaryCurrency(String salaryCurrency) {
        this.salaryCurrency = salaryCurrency;
    }
    
    public PayFrequency getPayFrequency() {
        return payFrequency;
    }
    
    public void setPayFrequency(PayFrequency payFrequency) {
        this.payFrequency = payFrequency;
    }
    
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
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
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
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
    
    public String getDepartmentCode() {
        return departmentCode;
    }
    
    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
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
    
    public String getManagerEmployeeNumber() {
        return managerEmployeeNumber;
    }
    
    public void setManagerEmployeeNumber(String managerEmployeeNumber) {
        this.managerEmployeeNumber = managerEmployeeNumber;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    // Helper methods
    public boolean isActive() {
        return employmentStatus == EmploymentStatus.ACTIVE;
    }

    public void setActive(boolean active) {
        // This is a convenience setter, actual status is determined by employmentStatus
        if (active) {
            this.employmentStatus = EmploymentStatus.ACTIVE;
        }
    }

    // Convenience methods for backward compatibility
    public String getEmail() {
        return workEmail != null ? workEmail : personalEmail;
    }

    public void setEmail(String email) {
        this.workEmail = email;
    }

    public String getPhone() {
        return phoneNumber;
    }

    public void setPhone(String phone) {
        this.phoneNumber = phone;
    }

    public String getMobile() {
        return mobileNumber;
    }

    public void setMobile(String mobile) {
        this.mobileNumber = mobile;
    }

    public BigDecimal getSalary() {
        return salaryAmount;
    }

    public void setSalary(BigDecimal salary) {
        this.salaryAmount = salary;
    }
}

