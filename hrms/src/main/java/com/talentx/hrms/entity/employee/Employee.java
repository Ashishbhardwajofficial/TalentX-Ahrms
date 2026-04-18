package com.talentx.hrms.entity.employee;

import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.entity.enums.Gender;
import com.talentx.hrms.entity.enums.MaritalStatus;
import com.talentx.hrms.entity.enums.PayFrequency;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "employee_number" })
})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @NotNull(message = "Organization is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @NotBlank(message = "Employee number is required")
    @Size(max = 50, message = "Employee number must not exceed 50 characters")
    @Column(name = "employee_number", nullable = false, unique = true)
    private String employeeNumber;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Size(max = 100, message = "Middle name must not exceed 100 characters")
    @Column(name = "middle_name")
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Size(max = 100, message = "Preferred name must not exceed 100 characters")
    @Column(name = "preferred_name")
    private String preferredName;

    @Column(name = "date_of_birth")
    private Date dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Size(max = 2, message = "Nationality must be 2 characters")
    @Column(name = "nationality")
    private String nationality;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status")
    private MaritalStatus maritalStatus;

    @Email(message = "Personal email should be valid")
    @Size(max = 255, message = "Personal email must not exceed 255 characters")
    @Column(name = "personal_email")
    private String personalEmail;

    @Email(message = "Work email should be valid")
    @Size(max = 255, message = "Work email must not exceed 255 characters")
    @Column(name = "work_email")
    private String workEmail;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Column(name = "phone_number")
    private String phoneNumber;

    @Size(max = 20, message = "Mobile number must not exceed 20 characters")
    @Column(name = "mobile_number")
    private String mobileNumber;

    @Size(max = 10, message = "PAN number must be 10 characters")
    @Column(name = "pan_number")
    private String panNumber;

    @Size(max = 12, message = "Aadhaar number must be 12 characters")
    @Column(name = "aadhaar_number")
    private String aadhaarNumber;

    @Size(max = 12, message = "UAN number must be 12 characters")
    @Column(name = "uan_number")
    private String uanNumber;

    @Size(max = 17, message = "ESIC number must not exceed 17 characters")
    @Column(name = "esic_number")
    private String esicNumber;

    @Size(max = 50, message = "PF number must not exceed 50 characters")
    @Column(name = "pf_number")
    private String pfNumber;

    @NotNull(message = "Employment status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false)
    private EmploymentStatus employmentStatus;

    @NotNull(message = "Employment type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    private EmploymentType employmentType;

    @NotNull(message = "Hire date is required")
    @Column(name = "hire_date", nullable = false)
    private Date hireDate;

    @Column(name = "termination_date")
    private Date terminationDate;

    @Column(name = "probation_end_date")
    private Date probationEndDate;

    @Column(name = "confirmation_date")
    private Date confirmationDate;

    @Column(name = "termination_reason")
    private String terminationReason;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Size(max = 255, message = "Job title must not exceed 255 characters")
    @Column(name = "job_title")
    private String jobTitle;

    @Size(max = 50, message = "Job level must not exceed 50 characters")
    @Column(name = "job_level")
    private String jobLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "salary_amount", precision = 15, scale = 2)
    private BigDecimal salaryAmount;

    @Size(max = 3, message = "Salary currency must not exceed 3 characters")
    @Column(name = "salary_currency")
    private String salaryCurrency;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_frequency")
    private PayFrequency payFrequency;

    @Size(max = 500, message = "Profile picture URL must not exceed 500 characters")
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "bio")
    private String bio;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @OneToMany(mappedBy = "manager", fetch = FetchType.LAZY)
    private List<Employee> directReports = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EmployeeAddress> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EmergencyContact> emergencyContacts = new ArrayList<>();

    // Constructors
    public Employee() {
    }

    public Employee(String employeeNumber, String firstName, String lastName,
            Date hireDate, EmploymentStatus employmentStatus,
            EmploymentType employmentType, Organization organization) {
        this.employeeNumber = employeeNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.hireDate = hireDate;
        this.employmentStatus = employmentStatus;
        this.employmentType = employmentType;
        this.organization = organization;
    }

    public Employee(String employeeNumber, String firstName, String lastName,
            LocalDate hireDate, EmploymentStatus employmentStatus,
            EmploymentType employmentType, Organization organization) {
        this.employeeNumber = employeeNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.hireDate = hireDate != null ? Date.valueOf(hireDate) : null;
        this.employmentStatus = employmentStatus;
        this.employmentType = employmentType;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
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

    public Date getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(Date dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth != null ? Date.valueOf(dateOfBirth) : null;
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

    public void setEmail(String email) {
        this.workEmail = email;
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

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate != null ? Date.valueOf(hireDate) : null;
    }

    public Date getTerminationDate() {
        return terminationDate;
    }

    public void setTerminationDate(Date terminationDate) {
        this.terminationDate = terminationDate;
    }

    public void setTerminationDate(LocalDate terminationDate) {
        this.terminationDate = terminationDate != null ? Date.valueOf(terminationDate) : null;
    }

    public Date getProbationEndDate() {
        return probationEndDate;
    }

    public void setProbationEndDate(Date probationEndDate) {
        this.probationEndDate = probationEndDate;
    }

    public void setProbationEndDate(LocalDate probationEndDate) {
        this.probationEndDate = probationEndDate != null ? Date.valueOf(probationEndDate) : null;
    }

    public Date getConfirmationDate() {
        return confirmationDate;
    }

    public void setConfirmationDate(Date confirmationDate) {
        this.confirmationDate = confirmationDate;
    }

    public void setConfirmationDate(LocalDate confirmationDate) {
        this.confirmationDate = confirmationDate != null ? Date.valueOf(confirmationDate) : null;
    }

    public String getTerminationReason() {
        return terminationReason;
    }

    public void setTerminationReason(String terminationReason) {
        this.terminationReason = terminationReason;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
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

    public Employee getManager() {
        return manager;
    }

    public void setManager(Employee manager) {
        this.manager = manager;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public BigDecimal getSalaryAmount() {
        return salaryAmount;
    }

    public void setSalaryAmount(BigDecimal salaryAmount) {
        this.salaryAmount = salaryAmount;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.salaryAmount = baseSalary;
    }

    public BigDecimal getBaseSalary() {
        return salaryAmount;
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

    public List<Employee> getDirectReports() {
        return directReports;
    }

    public void setDirectReports(List<Employee> directReports) {
        this.directReports = directReports;
    }

    public List<EmployeeAddress> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<EmployeeAddress> addresses) {
        this.addresses = addresses;
    }

    public List<EmergencyContact> getEmergencyContacts() {
        return emergencyContacts;
    }

    public void setEmergencyContacts(List<EmergencyContact> emergencyContacts) {
        this.emergencyContacts = emergencyContacts;
    }

    // Helper methods
    public String getFullName() {
        StringBuilder fullName = new StringBuilder();
        fullName.append(firstName);
        if (middleName != null && !middleName.trim().isEmpty()) {
            fullName.append(" ").append(middleName);
        }
        fullName.append(" ").append(lastName);
        return fullName.toString();
    }

    public boolean isActive() {
        return employmentStatus == EmploymentStatus.ACTIVE;
    }

    public boolean isTerminated() {
        return employmentStatus == EmploymentStatus.TERMINATED;
    }

    public void addDirectReport(Employee employee) {
        directReports.add(employee);
        employee.setManager(this);
    }

    public void removeDirectReport(Employee employee) {
        directReports.remove(employee);
        employee.setManager(null);
    }

    public void addAddress(EmployeeAddress address) {
        addresses.add(address);
        address.setEmployee(this);
    }

    public void removeAddress(EmployeeAddress address) {
        addresses.remove(address);
        address.setEmployee(null);
    }

    public void addEmergencyContact(EmergencyContact contact) {
        emergencyContacts.add(contact);
        contact.setEmployee(this);
    }

    public void removeEmergencyContact(EmergencyContact contact) {
        emergencyContacts.remove(contact);
        contact.setEmployee(null);
    }

    public boolean isOnProbation() {
        if (probationEndDate == null)
            return false;
        return probationEndDate.after(new Date(System.currentTimeMillis()));
    }

    // Convenience methods for backward compatibility
    public String getEmail() {
        return workEmail != null ? workEmail : personalEmail;
    }

    public String getPhone() {
        return phoneNumber;
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

    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }
}
