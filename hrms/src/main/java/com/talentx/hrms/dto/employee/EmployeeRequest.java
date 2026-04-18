package com.talentx.hrms.dto.employee;

import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.entity.enums.Gender;
import com.talentx.hrms.entity.enums.MaritalStatus;
import com.talentx.hrms.entity.enums.PayFrequency;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EmployeeRequest {

    @NotBlank(message = "Employee number is required")
    @Size(max = 50, message = "Employee number must not exceed 50 characters")
    private String employeeNumber;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Middle name must not exceed 100 characters")
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Size(max = 100, message = "Preferred name must not exceed 100 characters")
    private String preferredName;

    private LocalDate dateOfBirth;

    private Gender gender;

    @Size(max = 2, message = "Nationality must be 2 characters")
    private String nationality;

    private MaritalStatus maritalStatus;

    @Email(message = "Personal email should be valid")
    @Size(max = 255, message = "Personal email must not exceed 255 characters")
    private String personalEmail;

    @Email(message = "Work email should be valid")
    @Size(max = 255, message = "Work email must not exceed 255 characters")
    private String workEmail;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @Size(max = 20, message = "Mobile number must not exceed 20 characters")
    private String mobileNumber;

    @Size(max = 10, message = "PAN number must be 10 characters")
    private String panNumber;

    @Size(max = 12, message = "Aadhaar number must be 12 characters")
    private String aadhaarNumber;

    @Size(max = 12, message = "UAN number must be 12 characters")
    private String uanNumber;

    @Size(max = 17, message = "ESIC number must not exceed 17 characters")
    private String esicNumber;

    @Size(max = 50, message = "PF number must not exceed 50 characters")
    private String pfNumber;

    @NotNull(message = "Employment status is required")
    private EmploymentStatus employmentStatus;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    private LocalDate terminationDate;

    private LocalDate probationEndDate;

    @Size(max = 255, message = "Job title must not exceed 255 characters")
    private String jobTitle;

    @Size(max = 50, message = "Job level must not exceed 50 characters")
    private String jobLevel;

    private BigDecimal salaryAmount;

    @Size(max = 3, message = "Salary currency must not exceed 3 characters")
    private String salaryCurrency;

    private PayFrequency payFrequency;

    @Size(max = 500, message = "Profile picture URL must not exceed 500 characters")
    private String profilePictureUrl;

    private String bio;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private Long departmentId;

    private Long locationId;

    private Long managerId;

    private Long userId;

    // Constructors
    public EmployeeRequest() {
    }

    // Getters and Setters
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

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
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

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }


    public LocalDate getTerminationDate() {
        return terminationDate;
    }

    public void setTerminationDate(LocalDate terminationDate) {
        this.terminationDate = terminationDate;
    }


    public LocalDate getProbationEndDate() {
        return probationEndDate;
    }

    public void setProbationEndDate(LocalDate probationEndDate) {
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

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Compatibility methods for backward compatibility with existing code
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
