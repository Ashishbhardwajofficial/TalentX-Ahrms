package com.talentx.hrms.entity.recruitment;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidates")
@AttributeOverride(name = "id", column = @Column(name = "candidate_id"))
@Getter
@Setter
public class Candidate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "current_title")
    private String currentTitle;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "expected_salary", precision = 15, scale = 2)
    private BigDecimal expectedSalary;

    @Column(name = "salary_currency", length = 3)
    private String salaryCurrency;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    private CandidateSource source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by")
    private Employee referredBy;

    @Column(name = "ai_match_score", precision = 5, scale = 2)
    private BigDecimal aiMatchScore;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    // Additional fields expected by RecruitmentService (transient - not in database yet)
    @Transient
    private String middleName;

    @Transient
    private String phone;

    @Transient
    private String mobile;

    @Transient
    private java.time.LocalDate dateOfBirth;

    @Transient
    private String gender;

    @Transient
    private String nationality;

    @Transient
    private String address;

    @Transient
    private String city;

    @Transient
    private String stateProvince;

    @Transient
    private String postalCode;

    @Transient
    private String country;

    @Transient
    private String linkedinProfile;

    @Transient
    private String currentJobTitle;

    @Transient
    private String currentEmployer;

    @Transient
    private Integer totalExperienceYears;

    @Transient
    private String highestEducation;

    @Transient
    private String university;

    @Transient
    private String fieldOfStudy;

    @Transient
    private Integer graduationYear;

    @Transient
    private String skills;

    @Transient
    private String certifications;

    @Transient
    private String summary;

    @Transient
    private BigDecimal currentSalary;

    @Transient
    private Integer noticePeriodDays;

    @Transient
    private Boolean isAvailableImmediately;

    @Transient
    private Boolean isWillingToRelocate;

    @Transient
    private Boolean isOpenToRemote;

    @Transient
    private String resumePath;

    @Transient
    private String coverLetterPath;

    @Transient
    private String notes;

    @Transient
    private Boolean isBlacklisted;

    @Transient
    private String blacklistReason;

    @Transient
    private java.time.Instant blacklistedAt;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Application> applications = new ArrayList<>();

    public enum CandidateSource {
        WEBSITE, REFERRAL, LINKEDIN, JOB_BOARD, AGENCY, OTHER
    }

    // Constructors
    public Candidate() {}

    public Candidate(String firstName, String lastName, String email, Organization organization) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.organization = organization;
    }

    // Business methods
    public void blacklist(String reason) {
        this.isBlacklisted = true;
        this.blacklistReason = reason;
        this.blacklistedAt = java.time.Instant.now();
    }

    public void removeFromBlacklist() {
        this.isBlacklisted = false;
        this.blacklistReason = null;
        this.blacklistedAt = null;
    }

    // Convenience getters for compatibility with database fields
    public String getPhone() {
        return phone != null ? phone : phoneNumber;
    }

    public void setPhone(String phone) {
        this.phone = phone;
        if (this.phoneNumber == null) {
            this.phoneNumber = phone;
        }
    }

    public String getLinkedinProfile() {
        return linkedinProfile != null ? linkedinProfile : linkedinUrl;
    }

    public void setLinkedinProfile(String linkedinProfile) {
        this.linkedinProfile = linkedinProfile;
        if (this.linkedinUrl == null) {
            this.linkedinUrl = linkedinProfile;
        }
    }

    public String getCurrentJobTitle() {
        return currentJobTitle != null ? currentJobTitle : currentTitle;
    }

    public void setCurrentJobTitle(String currentJobTitle) {
        this.currentJobTitle = currentJobTitle;
        if (this.currentTitle == null) {
            this.currentTitle = currentJobTitle;
        }
    }

    public String getCurrentEmployer() {
        return currentEmployer != null ? currentEmployer : currentCompany;
    }

    public void setCurrentEmployer(String currentEmployer) {
        this.currentEmployer = currentEmployer;
        if (this.currentCompany == null) {
            this.currentCompany = currentEmployer;
        }
    }

    public Integer getTotalExperienceYears() {
        return totalExperienceYears != null ? totalExperienceYears : yearsOfExperience;
    }

    public void setTotalExperienceYears(Integer totalExperienceYears) {
        this.totalExperienceYears = totalExperienceYears;
        if (this.yearsOfExperience == null) {
            this.yearsOfExperience = totalExperienceYears;
        }
    }

    public String getResumePath() {
        return resumePath != null ? resumePath : resumeUrl;
    }

    public void setResumePath(String resumePath) {
        this.resumePath = resumePath;
        if (this.resumeUrl == null) {
            this.resumeUrl = resumePath;
        }
    }
}

