package com.talentx.hrms.dto.recruitment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

public class ApplicationDTO {
    
    private Long id;
    
    @NotNull(message = "Job posting ID is required")
    private Long jobPostingId;
    
    @NotNull(message = "Candidate ID is required")
    private Long candidateId;
    
    private String applicationStatus;
    private String currentStage;
    
    @Size(max = 1000, message = "Cover letter must not exceed 1000 characters")
    private String coverLetter;
    
    private String resumePath;
    private String portfolioPath;
    
    private Instant appliedAt;
    private Instant lastUpdatedAt;
    
    private String notes;
    private Integer rating;
    
    // Job posting details
    private String jobTitle;
    private String jobCode;
    private String jobLocation;
    
    // Candidate details
    private String candidateFirstName;
    private String candidateLastName;
    private String candidateEmail;
    private String candidatePhone;
    private LocalDate candidateDateOfBirth;
    private String candidateAddress;
    private String candidateCity;
    private String candidateState;
    private String candidateCountry;
    private String candidateLinkedInProfile;
    private String candidatePortfolioUrl;
    
    // Interview details
    private Integer totalInterviews;
    private Instant lastInterviewDate;
    private String lastInterviewFeedback;
    
    // Hiring manager details
    private Long hiringManagerId;
    private String hiringManagerName;
    
    // Reviewed by details
    private Long reviewedById;
    private String reviewedByName;
    private Instant reviewedAt;
    
    // Constructors
    public ApplicationDTO() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getJobPostingId() {
        return jobPostingId;
    }
    
    public void setJobPostingId(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }
    
    public Long getCandidateId() {
        return candidateId;
    }
    
    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }
    
    public String getApplicationStatus() {
        return applicationStatus;
    }
    
    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
    }
    
    public String getCurrentStage() {
        return currentStage;
    }
    
    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }
    
    public String getCoverLetter() {
        return coverLetter;
    }
    
    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }
    
    public String getResumePath() {
        return resumePath;
    }
    
    public void setResumePath(String resumePath) {
        this.resumePath = resumePath;
    }
    
    public String getPortfolioPath() {
        return portfolioPath;
    }
    
    public void setPortfolioPath(String portfolioPath) {
        this.portfolioPath = portfolioPath;
    }
    
    public Instant getAppliedAt() {
        return appliedAt;
    }
    
    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }
    
    public Instant getLastUpdatedAt() {
        return lastUpdatedAt;
    }
    
    public void setLastUpdatedAt(Instant lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getJobTitle() {
        return jobTitle;
    }
    
    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
    
    public String getJobCode() {
        return jobCode;
    }
    
    public void setJobCode(String jobCode) {
        this.jobCode = jobCode;
    }
    
    public String getJobLocation() {
        return jobLocation;
    }
    
    public void setJobLocation(String jobLocation) {
        this.jobLocation = jobLocation;
    }
    
    public String getCandidateFirstName() {
        return candidateFirstName;
    }
    
    public void setCandidateFirstName(String candidateFirstName) {
        this.candidateFirstName = candidateFirstName;
    }
    
    public String getCandidateLastName() {
        return candidateLastName;
    }
    
    public void setCandidateLastName(String candidateLastName) {
        this.candidateLastName = candidateLastName;
    }
    
    public String getCandidateEmail() {
        return candidateEmail;
    }
    
    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }
    
    public String getCandidatePhone() {
        return candidatePhone;
    }
    
    public void setCandidatePhone(String candidatePhone) {
        this.candidatePhone = candidatePhone;
    }
    
    public LocalDate getCandidateDateOfBirth() {
        return candidateDateOfBirth;
    }
    
    public void setCandidateDateOfBirth(LocalDate candidateDateOfBirth) {
        this.candidateDateOfBirth = candidateDateOfBirth;
    }
    
    public String getCandidateAddress() {
        return candidateAddress;
    }
    
    public void setCandidateAddress(String candidateAddress) {
        this.candidateAddress = candidateAddress;
    }
    
    public String getCandidateCity() {
        return candidateCity;
    }
    
    public void setCandidateCity(String candidateCity) {
        this.candidateCity = candidateCity;
    }
    
    public String getCandidateState() {
        return candidateState;
    }
    
    public void setCandidateState(String candidateState) {
        this.candidateState = candidateState;
    }
    
    public String getCandidateCountry() {
        return candidateCountry;
    }
    
    public void setCandidateCountry(String candidateCountry) {
        this.candidateCountry = candidateCountry;
    }
    
    public String getCandidateLinkedInProfile() {
        return candidateLinkedInProfile;
    }
    
    public void setCandidateLinkedInProfile(String candidateLinkedInProfile) {
        this.candidateLinkedInProfile = candidateLinkedInProfile;
    }
    
    public String getCandidatePortfolioUrl() {
        return candidatePortfolioUrl;
    }
    
    public void setCandidatePortfolioUrl(String candidatePortfolioUrl) {
        this.candidatePortfolioUrl = candidatePortfolioUrl;
    }
    
    public Integer getTotalInterviews() {
        return totalInterviews;
    }
    
    public void setTotalInterviews(Integer totalInterviews) {
        this.totalInterviews = totalInterviews;
    }
    
    public Instant getLastInterviewDate() {
        return lastInterviewDate;
    }
    
    public void setLastInterviewDate(Instant lastInterviewDate) {
        this.lastInterviewDate = lastInterviewDate;
    }
    
    public String getLastInterviewFeedback() {
        return lastInterviewFeedback;
    }
    
    public void setLastInterviewFeedback(String lastInterviewFeedback) {
        this.lastInterviewFeedback = lastInterviewFeedback;
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
    
    public Long getReviewedById() {
        return reviewedById;
    }
    
    public void setReviewedById(Long reviewedById) {
        this.reviewedById = reviewedById;
    }
    
    public String getReviewedByName() {
        return reviewedByName;
    }
    
    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }
    
    public Instant getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    // Additional fields for service compatibility
    private LocalDate applicationDate;
    private String status;
    private java.math.BigDecimal expectedSalary;
    private String salaryCurrency;
    
    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }
    
    public String getStatus() { return status != null ? status : applicationStatus; }
    public void setStatus(String status) { this.status = status; this.applicationStatus = status; }
    
    public java.math.BigDecimal getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(java.math.BigDecimal expectedSalary) { this.expectedSalary = expectedSalary; }
    
    public String getSalaryCurrency() { return salaryCurrency; }
    public void setSalaryCurrency(String salaryCurrency) { this.salaryCurrency = salaryCurrency; }
}

    // Additional fields for service compatibility

