package com.talentx.hrms.service.recruitment;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.entity.enums.Gender;
import com.talentx.hrms.entity.recruitment.*;
import com.talentx.hrms.repository.*;
import com.talentx.hrms.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class RecruitmentService {

    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    @Autowired
    public RecruitmentService(JobPostingRepository jobPostingRepository,
                             CandidateRepository candidateRepository,
                             ApplicationRepository applicationRepository,
                             InterviewRepository interviewRepository,
                             OrganizationRepository organizationRepository,
                             DepartmentRepository departmentRepository,
                             LocationRepository locationRepository,
                             EmployeeRepository employeeRepository,
                             AuthService authService) {
        this.jobPostingRepository = jobPostingRepository;
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
    }

    // Job Posting Management
    public JobPosting createJobPosting(JobPosting jobPosting) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        jobPosting.setOrganization(currentOrg);
        return jobPostingRepository.save(jobPosting);
    }

    public JobPosting updateJobPosting(Long id, JobPosting updatedJobPosting) {
        JobPosting existingJobPosting = getJobPostingById(id);
        
        // Update fields using correct entity field names
        existingJobPosting.setTitle(updatedJobPosting.getTitle());
        existingJobPosting.setDescription(updatedJobPosting.getDescription());
        existingJobPosting.setRequirements(updatedJobPosting.getRequirements());
        existingJobPosting.setResponsibilities(updatedJobPosting.getResponsibilities());
        existingJobPosting.setEmploymentType(updatedJobPosting.getEmploymentType());
        existingJobPosting.setSalaryMin(updatedJobPosting.getSalaryMin());
        existingJobPosting.setSalaryMax(updatedJobPosting.getSalaryMax());
        existingJobPosting.setSalaryCurrency(updatedJobPosting.getSalaryCurrency());
        existingJobPosting.setOpenings(updatedJobPosting.getOpenings());
        existingJobPosting.setClosingDate(updatedJobPosting.getClosingDate());
        existingJobPosting.setStatus(updatedJobPosting.getStatus());
        existingJobPosting.setDepartment(updatedJobPosting.getDepartment());
        existingJobPosting.setLocation(updatedJobPosting.getLocation());
        existingJobPosting.setHiringManager(updatedJobPosting.getHiringManager());
        existingJobPosting.setRecruiter(updatedJobPosting.getRecruiter());
        existingJobPosting.setJobLevel(updatedJobPosting.getJobLevel());
        
        return jobPostingRepository.save(existingJobPosting);
    }

    public JobPosting getJobPostingById(Long id) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return jobPostingRepository.findById(id)
                .filter(jp -> jp.getOrganization().equals(currentOrg))
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
    }

    public Page<JobPosting> getJobPostings(PaginationRequest request) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        Pageable pageable = createPageable(request);
        return jobPostingRepository.findByOrganization(currentOrg, pageable);
    }

    public Page<JobPosting> searchJobPostings(String title, String status, Long departmentId, 
                                            Long locationId, EmploymentType employmentType, 
                                            PaginationRequest request) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        Department department = departmentId != null ? 
                departmentRepository.findById(departmentId).orElse(null) : null;
        Location location = locationId != null ? 
                locationRepository.findById(locationId).orElse(null) : null;
        
        JobPosting.JobPostingStatus jobStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                jobStatus = JobPosting.JobPostingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore
            }
        }
        
        Pageable pageable = createPageable(request);
        
        return jobPostingRepository.findBySearchCriteria(currentOrg, title, jobStatus, 
                department, location, employmentType, pageable);
    }

    public void deleteJobPosting(Long id) {
        JobPosting jobPosting = getJobPostingById(id);
        if (!jobPosting.getApplications().isEmpty()) {
            throw new RuntimeException("Cannot delete job posting with existing applications");
        }
        jobPostingRepository.delete(jobPosting);
    }

    public JobPosting closeJobPosting(Long id) {
        JobPosting jobPosting = getJobPostingById(id);
        jobPosting.setStatus(JobPosting.JobPostingStatus.CLOSED);
        return jobPostingRepository.save(jobPosting);
    }

    public JobPosting publishJobPosting(Long id) {
        JobPosting jobPosting = getJobPostingById(id);
        jobPosting.setStatus(JobPosting.JobPostingStatus.OPEN);
        if (jobPosting.getPostedDate() == null) {
            jobPosting.setPostedDate(LocalDate.now());
        }
        return jobPostingRepository.save(jobPosting);
    }

    public JobPosting pauseJobPosting(Long id) {
        JobPosting jobPosting = getJobPostingById(id);
        jobPosting.setStatus(JobPosting.JobPostingStatus.ON_HOLD);
        return jobPostingRepository.save(jobPosting);
    }


    // Candidate Management
    public Candidate createCandidate(Candidate candidate) {
        if (candidateRepository.existsByEmail(candidate.getEmail())) {
            throw new RuntimeException("Candidate with this email already exists");
        }
        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidate(Long id, Candidate updatedCandidate) {
        Candidate existingCandidate = getCandidateById(id);
        
        existingCandidate.setFirstName(updatedCandidate.getFirstName());
        existingCandidate.setMiddleName(updatedCandidate.getMiddleName());
        existingCandidate.setLastName(updatedCandidate.getLastName());
        existingCandidate.setEmail(updatedCandidate.getEmail());
        existingCandidate.setPhone(updatedCandidate.getPhone());
        existingCandidate.setMobile(updatedCandidate.getMobile());
        existingCandidate.setDateOfBirth(updatedCandidate.getDateOfBirth());
        existingCandidate.setGender(updatedCandidate.getGender());
        existingCandidate.setNationality(updatedCandidate.getNationality());
        existingCandidate.setAddress(updatedCandidate.getAddress());
        existingCandidate.setCity(updatedCandidate.getCity());
        existingCandidate.setStateProvince(updatedCandidate.getStateProvince());
        existingCandidate.setPostalCode(updatedCandidate.getPostalCode());
        existingCandidate.setCountry(updatedCandidate.getCountry());
        existingCandidate.setLinkedinProfile(updatedCandidate.getLinkedinProfile());
        existingCandidate.setPortfolioUrl(updatedCandidate.getPortfolioUrl());
        existingCandidate.setCurrentJobTitle(updatedCandidate.getCurrentJobTitle());
        existingCandidate.setCurrentEmployer(updatedCandidate.getCurrentEmployer());
        existingCandidate.setTotalExperienceYears(updatedCandidate.getTotalExperienceYears());
        existingCandidate.setHighestEducation(updatedCandidate.getHighestEducation());
        existingCandidate.setUniversity(updatedCandidate.getUniversity());
        existingCandidate.setFieldOfStudy(updatedCandidate.getFieldOfStudy());
        existingCandidate.setGraduationYear(updatedCandidate.getGraduationYear());
        existingCandidate.setSkills(updatedCandidate.getSkills());
        existingCandidate.setCertifications(updatedCandidate.getCertifications());
        existingCandidate.setSummary(updatedCandidate.getSummary());
        existingCandidate.setCurrentSalary(updatedCandidate.getCurrentSalary());
        existingCandidate.setExpectedSalary(updatedCandidate.getExpectedSalary());
        existingCandidate.setSalaryCurrency(updatedCandidate.getSalaryCurrency());
        existingCandidate.setNoticePeriodDays(updatedCandidate.getNoticePeriodDays());
        existingCandidate.setIsAvailableImmediately(updatedCandidate.getIsAvailableImmediately());
        existingCandidate.setIsWillingToRelocate(updatedCandidate.getIsWillingToRelocate());
        existingCandidate.setIsOpenToRemote(updatedCandidate.getIsOpenToRemote());
        existingCandidate.setSource(updatedCandidate.getSource());
        existingCandidate.setReferredBy(updatedCandidate.getReferredBy());
        existingCandidate.setResumePath(updatedCandidate.getResumePath());
        existingCandidate.setCoverLetterPath(updatedCandidate.getCoverLetterPath());
        existingCandidate.setNotes(updatedCandidate.getNotes());
        
        return candidateRepository.save(existingCandidate);
    }

    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }

    public Page<Candidate> getCandidates(PaginationRequest request) {
        Pageable pageable = createPageable(request);
        return candidateRepository.findAll(pageable);
    }

    public Page<Candidate> searchCandidates(String name, String email, String jobTitle, String skills,
                                          Integer minExperience, Integer maxExperience, String education,
                                          String city, Boolean isAvailableImmediately, Boolean isWillingToRelocate,
                                          Boolean isOpenToRemote, PaginationRequest request) {
        Pageable pageable = createPageable(request);
        
        // Use the repository method with matching signature
        Candidate.CandidateSource source = null; // No source filter in this method
        return candidateRepository.findBySearchCriteria(name, email, jobTitle, 
                minExperience, maxExperience, source, pageable);
    }

    public void blacklistCandidate(Long id, String reason) {
        Candidate candidate = getCandidateById(id);
        candidate.blacklist(reason);
        candidateRepository.save(candidate);
    }

    public void removeFromBlacklist(Long id) {
        Candidate candidate = getCandidateById(id);
        candidate.removeFromBlacklist();
        candidateRepository.save(candidate);
    }

    // Application Management
    public Application createApplication(Long candidateId, Long jobPostingId, Application application) {
        Candidate candidate = getCandidateById(candidateId);
        JobPosting jobPosting = getJobPostingById(jobPostingId);
        
        if (applicationRepository.existsByCandidateAndJobPosting(candidate, jobPosting)) {
            throw new RuntimeException("Candidate has already applied for this job");
        }
        
        if (!jobPosting.isActive()) {
            throw new RuntimeException("Job posting is not active");
        }
        
        if (jobPosting.isExpired()) {
            throw new RuntimeException("Job posting application deadline has passed");
        }
        
        application.setCandidate(candidate);
        application.setJobPosting(jobPosting);
        application.setApplicationDate(LocalDate.now());
        application.setStatus("APPLIED");
        
        return applicationRepository.save(application);
    }

    public Application updateApplication(Long id, Application updatedApplication) {
        Application existingApplication = getApplicationById(id);
        
        existingApplication.setCoverLetter(updatedApplication.getCoverLetter());
        // Store notes/internal notes in rejection_reason column when not rejected
        if (updatedApplication.getRejectionReason() != null) {
            existingApplication.setRejectionReason(updatedApplication.getRejectionReason());
        }
        
        return applicationRepository.save(existingApplication);
    }

    public Application getApplicationById(Long id) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return applicationRepository.findById(id)
                .filter(app -> app.getJobPosting().getOrganization().equals(currentOrg))
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public Page<Application> getApplications(PaginationRequest request) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        Pageable pageable = createPageable(request);
        return applicationRepository.findByOrganization(currentOrg, pageable);
    }

    public Page<Application> getApplicationsByJobPosting(Long jobPostingId, PaginationRequest request) {
        JobPosting jobPosting = getJobPostingById(jobPostingId);
        Pageable pageable = createPageable(request);
        return applicationRepository.findByJobPosting(jobPosting, pageable);
    }

    public Page<Application> getApplicationsByCandidate(Long candidateId, PaginationRequest request) {
        Candidate candidate = getCandidateById(candidateId);
        Pageable pageable = createPageable(request);
        return applicationRepository.findByCandidate(candidate, pageable);
    }

    public Page<Application> searchApplications(Long jobPostingId, String status, PaginationRequest request) {
        if (jobPostingId != null) {
            JobPosting jobPosting = getJobPostingById(jobPostingId);
            Page<Application> page = applicationRepository.findByJobPosting(jobPosting, createPageable(request));
            if (status == null || status.isBlank()) {
                return page;
            }

            Application.ApplicationStatus desiredStatus = mapApplicationStatus(status);
            List<Application> filtered = page.getContent().stream()
                .filter(application -> application.getStatus() != null && application.getStatus().equals(desiredStatus.name()))
                .toList();

            return new org.springframework.data.domain.PageImpl<>(filtered, page.getPageable(), filtered.size());
        }

        if (status != null && !status.isBlank()) {
            User currentUser = authService.getCurrentUser();
            Organization currentOrg = currentUser.getOrganization();
            return applicationRepository.findByOrganizationAndStatus(
                currentOrg,
                mapApplicationStatus(status),
                createPageable(request)
            );
        }

        return getApplications(request);
    }

    public Application screenApplication(Long id, String screenedBy, Integer score, String notes) {
        Application application = getApplicationById(id);
        application.moveToScreening(screenedBy, score, notes);
        return applicationRepository.save(application);
    }

    public Application rejectApplication(Long id, String reason) {
        Application application = getApplicationById(id);
        application.reject(reason);
        return applicationRepository.save(application);
    }

    public Application withdrawApplication(Long id, String reason) {
        Application application = getApplicationById(id);
        application.withdraw(reason);
        return applicationRepository.save(application);
    }

    public Application updateApplicationStatus(Long id, String status, String notes) {
        Application application = getApplicationById(id);
        Application.ApplicationStatus targetStatus = mapApplicationStatus(status);

        switch (targetStatus) {
            case APPLIED -> application.setStatus(Application.ApplicationStatus.APPLIED.name());
            case SCREENING -> application.moveToScreening(authService.getCurrentUser().getUsername(), application.getScreeningScore(), notes);
            case INTERVIEW, ASSESSMENT -> {
                application.setStatus(targetStatus.name());
                application.setCurrentStage(targetStatus.name());
            }
            case OFFER -> {
                application.setStatus(Application.ApplicationStatus.OFFER.name());
                if (notes != null && !notes.isBlank()) {
                    application.setRejectionReason(notes); // reuse column for notes
                }
                if (Boolean.TRUE.equals(application.getOfferAccepted())) {
                    application.setOfferAccepted(false);
                }
            }
            case REJECTED -> application.reject(notes != null && !notes.isBlank() ? notes : "Rejected");
            case WITHDRAWN -> application.withdraw(notes != null && !notes.isBlank() ? notes : "Withdrawn");
            case HIRED -> application.hire();
        }

        if ("OFFER_ACCEPTED".equalsIgnoreCase(status)) {
            application.setStatus(Application.ApplicationStatus.OFFER.name());
            application.acceptOffer();
        }

        return applicationRepository.save(application);
    }

    public Application saveApplication(Application application) {
        return applicationRepository.save(application);
    }

    public Application rateApplication(Long id, Integer rating, String feedback) {
        Application application = getApplicationById(id);
        application.setScreeningScore(rating);   // stored in stage column
        if (feedback != null) {
            application.setRejectionReason(feedback); // stored in rejection_reason column (reused for notes)
        }
        return applicationRepository.save(application);
    }


    // Interview Management
    public Interview scheduleInterview(Long applicationId, Interview interview) {
        Application application = getApplicationById(applicationId);
        
        interview.setApplication(application);
        interview.setCandidate(application.getCandidate());
        interview.setStatus("SCHEDULED");
        
        Interview savedInterview = interviewRepository.save(interview);
        
        application.scheduleInterview();
        applicationRepository.save(application);
        
        return savedInterview;
    }

    public Interview updateInterview(Long id, Interview updatedInterview) {
        Interview existingInterview = getInterviewById(id);
        
        existingInterview.setInterviewType(updatedInterview.getInterviewType());
        existingInterview.setScheduledDateTime(updatedInterview.getScheduledDateTime());
        existingInterview.setDurationMinutes(updatedInterview.getDurationMinutes());
        existingInterview.setLocation(updatedInterview.getLocation());
        existingInterview.setMeetingLink(updatedInterview.getMeetingLink());
        existingInterview.setFeedback(updatedInterview.getFeedback());
        existingInterview.setRating(updatedInterview.getRating());
        existingInterview.setRecommendation(updatedInterview.getRecommendation());
        
        return interviewRepository.save(existingInterview);
    }

    public Interview getInterviewById(Long id) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return interviewRepository.findById(id)
                .filter(interview -> interview.getApplication().getJobPosting().getOrganization().equals(currentOrg))
                .orElseThrow(() -> new RuntimeException("Interview not found"));
    }

    public Page<Interview> getInterviews(PaginationRequest request) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        Pageable pageable = createPageable(request);
        return interviewRepository.findByOrganization(currentOrg, pageable);
    }

    public Page<Interview> searchInterviews(String status, String interviewType, PaginationRequest request) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();

        Interview.InterviewStatus targetStatus = null;
        if (status != null && !status.isBlank()) {
            targetStatus = mapInterviewStatus(status);
        }

        Interview.InterviewType targetType = null;
        if (interviewType != null && !interviewType.isBlank()) {
            targetType = mapInterviewType(interviewType);
        }

        return interviewRepository.findBySearchCriteria(
            currentOrg,
            targetStatus,
            targetType,
            null,
            null,
            createPageable(request)
        );
    }

    public List<Interview> getTodaysInterviews() {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return interviewRepository.findTodaysInterviewsByOrganization(currentOrg);
    }

    public List<Interview> getUpcomingInterviews(int days) {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        java.time.LocalDateTime endDate = java.time.LocalDateTime.now().plusDays(days);
        return interviewRepository.findUpcomingByOrganizationWithLocalDateTime(currentOrg, endDate);
    }

    public Interview startInterview(Long id) {
        Interview interview = getInterviewById(id);
        interview.start();
        return interviewRepository.save(interview);
    }

    public Interview completeInterview(Long id, Integer overallRating, Integer technicalRating,
                                     Integer communicationRating, Integer culturalFitRating,
                                     String feedback, String strengths, String areasForImprovement,
                                     String recommendation, String notes) {
        Interview interview = getInterviewById(id);
        
        // Store rating in DB column (convert int to BigDecimal)
        if (overallRating != null) {
            interview.setRating(java.math.BigDecimal.valueOf(overallRating));
        }
        
        // Build feedback string combining all feedback fields into the single DB feedback column
        StringBuilder feedbackBuilder = new StringBuilder();
        if (feedback != null && !feedback.isBlank()) feedbackBuilder.append(feedback);
        if (strengths != null && !strengths.isBlank()) feedbackBuilder.append("\nStrengths: ").append(strengths);
        if (areasForImprovement != null && !areasForImprovement.isBlank()) feedbackBuilder.append("\nAreas for Improvement: ").append(areasForImprovement);
        if (notes != null && !notes.isBlank()) feedbackBuilder.append("\nNotes: ").append(notes);
        if (feedbackBuilder.length() > 0) {
            interview.setFeedback(feedbackBuilder.toString());
        }
        
        if (recommendation != null) {
            try {
                interview.setRecommendation(Interview.InterviewRecommendation.valueOf(recommendation));
            } catch (IllegalArgumentException ignored) {}
        }
        
        // Store transient fields for in-memory use
        interview.setOverallRating(overallRating);
        interview.setTechnicalRating(technicalRating);
        interview.setCommunicationRating(communicationRating);
        interview.setCulturalFitRating(culturalFitRating);
        interview.setStrengths(strengths);
        interview.setAreasForImprovement(areasForImprovement);
        
        interview.complete();
        return interviewRepository.save(interview);
    }

    public Interview cancelInterview(Long id, String reason, String cancelledBy) {
        Interview interview = getInterviewById(id);
        interview.cancel(reason, cancelledBy);
        return interviewRepository.save(interview);
    }

    public Interview rescheduleInterview(Long id, Instant newDateTime, String reason) {
        Interview interview = getInterviewById(id);
        interview.reschedule(newDateTime, reason);
        return interviewRepository.save(interview);
    }

    public Interview scheduleInterview(Long applicationId,
                                       String interviewType,
                                       LocalDateTime scheduledDate,
                                       Integer durationMinutes,
                                       String location,
                                       String meetingLink,
                                       String notes) {
        Interview interview = new Interview();
        interview.setInterviewType(mapInterviewType(interviewType));
        interview.setScheduledDate(scheduledDate);
        interview.setDurationMinutes(durationMinutes != null ? durationMinutes : 60);
        interview.setLocation(location);
        interview.setMeetingLink(meetingLink);
        interview.setNotes(notes);
        return scheduleInterview(applicationId, interview);
    }

    // Hiring Workflow
    public Application extendOffer(Long applicationId, BigDecimal offerAmount) {
        Application application = getApplicationById(applicationId);
        application.extendOffer(offerAmount);
        return applicationRepository.save(application);
    }

    public Application acceptOffer(Long applicationId) {
        Application application = getApplicationById(applicationId);
        application.acceptOffer();
        return applicationRepository.save(application);
    }

    public Application rejectOffer(Long applicationId, String reason) {
        Application application = getApplicationById(applicationId);
        application.rejectOffer(reason);
        return applicationRepository.save(application);
    }

    public Employee hireCandidate(Long applicationId) {
        Application application = getApplicationById(applicationId);
        
        // Check offer accepted: offerAccepted flag must be true (offer_accepted column in DB)
        if (!Boolean.TRUE.equals(application.getOfferAccepted())) {
            throw new RuntimeException("Cannot hire candidate without accepted offer");
        }
        
        Candidate candidate = application.getCandidate();
        JobPosting jobPosting = application.getJobPosting();
        
        Employee employee = new Employee();
        employee.setFirstName(candidate.getFirstName());
        employee.setMiddleName(candidate.getMiddleName());
        employee.setLastName(candidate.getLastName());
        employee.setWorkEmail(candidate.getEmail());
        employee.setPhoneNumber(candidate.getPhone());
        employee.setMobile(candidate.getMobile());
        employee.setDateOfBirth(candidate.getDateOfBirth() != null ? java.sql.Date.valueOf(candidate.getDateOfBirth()) : null);
        employee.setGender(candidate.getGender() != null ? Gender.valueOf(candidate.getGender()) : null);
        employee.setNationality(candidate.getNationality());
        employee.setOrganization(jobPosting.getOrganization());
        employee.setDepartment(jobPosting.getDepartment());
        employee.setLocation(jobPosting.getLocation());
        employee.setJobTitle(jobPosting.getTitle());
        employee.setEmploymentType(jobPosting.getEmploymentType());
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setHireDate(java.sql.Date.valueOf(LocalDate.now()));
        employee.setManager(jobPosting.getHiringManager());
        
        if (application.getOfferAmount() != null) {
            employee.setSalaryAmount(application.getOfferAmount());
        }
        
        Employee savedEmployee = employeeRepository.save(employee);
        
        application.hire();
        applicationRepository.save(application);
        
        Integer currentFilled = jobPosting.getPositionsFilled() != null ? jobPosting.getPositionsFilled() : 0;
        jobPosting.setPositionsFilled(currentFilled + 1);
        if (!jobPosting.hasOpenPositions()) {
            jobPosting.setStatus(JobPosting.JobPostingStatus.CLOSED);
        }
        jobPostingRepository.save(jobPosting);
        
        return savedEmployee;
    }


    // Analytics and Reporting
    public List<Object[]> getJobPostingStatistics() {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return jobPostingRepository.getJobPostingStatsByOrganization(currentOrg);
    }

    public List<Object[]> getApplicationStatistics() {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return applicationRepository.getApplicationStatsByOrganization(currentOrg);
    }

    public List<Object[]> getInterviewStatistics() {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return interviewRepository.getInterviewStatsByOrganization(currentOrg);
    }

    public List<Object[]> getCandidateSourceStatistics() {
        return candidateRepository.countCandidatesBySource();
    }

    public long getActiveJobPostingsCount() {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return jobPostingRepository.countByOrganizationAndStatus(currentOrg, JobPosting.JobPostingStatus.OPEN);
    }

    public long getPendingApplicationsCount() {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return applicationRepository.countByOrganizationAndStatus(currentOrg, Application.ApplicationStatus.APPLIED);
    }

    public long getScheduledInterviewsCount() {
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        return interviewRepository.countByOrganizationAndStatus(currentOrg, Interview.InterviewStatus.SCHEDULED);
    }

    private Application.ApplicationStatus mapApplicationStatus(String status) {
        if (status == null || status.isBlank()) {
            return Application.ApplicationStatus.APPLIED;
        }

        return switch (status.trim().toUpperCase()) {
            case "APPLIED" -> Application.ApplicationStatus.APPLIED;
            case "SCREENING" -> Application.ApplicationStatus.SCREENING;
            case "INTERVIEW_SCHEDULED", "INTERVIEWED", "INTERVIEW" -> Application.ApplicationStatus.INTERVIEW;
            case "UNDER_REVIEW", "SHORTLISTED", "ASSESSMENT" -> Application.ApplicationStatus.ASSESSMENT;
            case "OFFER_EXTENDED", "OFFER_ACCEPTED", "OFFER" -> Application.ApplicationStatus.OFFER;
            case "REJECTED", "OFFER_DECLINED" -> Application.ApplicationStatus.REJECTED;
            case "WITHDRAWN" -> Application.ApplicationStatus.WITHDRAWN;
            case "HIRED" -> Application.ApplicationStatus.HIRED;
            default -> Application.ApplicationStatus.APPLIED;
        };
    }

    private Interview.InterviewStatus mapInterviewStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        return switch (status.trim().toUpperCase()) {
            case "SCHEDULED", "CONFIRMED", "IN_PROGRESS", "RESCHEDULED" -> Interview.InterviewStatus.SCHEDULED;
            case "COMPLETED" -> Interview.InterviewStatus.COMPLETED;
            case "CANCELLED" -> Interview.InterviewStatus.CANCELLED;
            case "NO_SHOW" -> Interview.InterviewStatus.NO_SHOW;
            default -> null;
        };
    }

    private Interview.InterviewType mapInterviewType(String interviewType) {
        if (interviewType == null || interviewType.isBlank()) {
            return Interview.InterviewType.PHONE_SCREEN;
        }

        return switch (interviewType.trim().toUpperCase()) {
            case "PHONE_SCREENING", "PHONE_SCREEN" -> Interview.InterviewType.PHONE_SCREEN;
            case "VIDEO_INTERVIEW", "VIDEO" -> Interview.InterviewType.VIDEO;
            case "IN_PERSON", "ONSITE" -> Interview.InterviewType.ONSITE;
            case "TECHNICAL_INTERVIEW", "TECHNICAL" -> Interview.InterviewType.TECHNICAL;
            case "PANEL_INTERVIEW", "PANEL" -> Interview.InterviewType.PANEL;
            case "FINAL_INTERVIEW", "FINAL" -> Interview.InterviewType.FINAL;
            case "HR" -> Interview.InterviewType.HR;
            default -> Interview.InterviewType.PHONE_SCREEN;
        };
    }

    // Helper method for pagination
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    // Additional methods required by RecruitmentController
    
    @Transactional(readOnly = true)
    public Page<com.talentx.hrms.dto.recruitment.JobPostingDTO> getAllJobPostings(
            Boolean isActive, Boolean isPublished, Long departmentId, 
            EmploymentType employmentType, String location, PaginationRequest paginationRequest) {
        
        User currentUser = authService.getCurrentUser();
        Organization currentOrg = currentUser.getOrganization();
        
        Department department = departmentId != null ? 
                departmentRepository.findById(departmentId).orElse(null) : null;
        Location loc = location != null && !location.isEmpty() ? 
                locationRepository.findByName(location).orElse(null) : null;
        
        JobPosting.JobPostingStatus status = isActive != null && isActive ? JobPosting.JobPostingStatus.OPEN : null;
        
        Pageable pageable = createPageable(paginationRequest);
        Page<JobPosting> jobPostings = jobPostingRepository.findBySearchCriteria(
            currentOrg, null, status, department, loc, employmentType, pageable);
        
        return jobPostings.map(this::convertJobPostingToDTO);
    }
    
    @Transactional(readOnly = true, noRollbackFor = Exception.class)
    public Page<com.talentx.hrms.dto.recruitment.JobPostingDTO> getPublicJobPostings(
            Long departmentId, EmploymentType employmentType, String location, 
            String keyword, PaginationRequest paginationRequest) {
        
        // For public jobs — use org 1 as default, no auth required
        Organization currentOrg = organizationRepository.findById(1L).orElse(null);
        // Try to get current user's org if authenticated
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser != null && currentUser.getOrganization() != null) {
                currentOrg = currentUser.getOrganization();
            }
        } catch (Exception ignored) { /* anonymous user — use default org */ }
        
        if (currentOrg == null) {
            return new org.springframework.data.domain.PageImpl<>(
                new java.util.ArrayList<>(),
                org.springframework.data.domain.PageRequest.of(0, 10),
                0L
            );
        }
        
        Department department = departmentId != null ? 
                departmentRepository.findById(departmentId).orElse(null) : null;
        Location loc = location != null && !location.isEmpty() ? 
                locationRepository.findByName(location).orElse(null) : null;
        
        Pageable pageable = createPageable(paginationRequest);
        Page<JobPosting> jobPostings = jobPostingRepository.findBySearchCriteria(
            currentOrg, keyword, JobPosting.JobPostingStatus.OPEN, department, loc, employmentType, pageable);
        
        return jobPostings.map(this::convertJobPostingToDTO);
    }
    
    private com.talentx.hrms.dto.recruitment.JobPostingDTO convertJobPostingToDTO(JobPosting jobPosting) {
        com.talentx.hrms.dto.recruitment.JobPostingDTO dto = new com.talentx.hrms.dto.recruitment.JobPostingDTO();
        dto.setId(jobPosting.getId());
        dto.setTitle(jobPosting.getTitle());
        dto.setDescription(jobPosting.getDescription());
        dto.setRequirements(jobPosting.getRequirements());
        dto.setResponsibilities(jobPosting.getResponsibilities());
        dto.setEmploymentType(jobPosting.getEmploymentType());
        dto.setSalaryMin(jobPosting.getSalaryMin());
        dto.setSalaryMax(jobPosting.getSalaryMax());
        dto.setSalaryCurrency(jobPosting.getSalaryCurrency());
        dto.setNumberOfPositions(jobPosting.getOpenings());
        dto.setPostingDate(jobPosting.getPostedDate());
        dto.setClosingDate(jobPosting.getClosingDate());
        dto.setIsActive(JobPosting.JobPostingStatus.OPEN.equals(jobPosting.getStatus()));
        dto.setIsPublished(JobPosting.JobPostingStatus.OPEN.equals(jobPosting.getStatus()));
        
        if (jobPosting.getDepartment() != null) {
            dto.setDepartmentId(jobPosting.getDepartment().getId());
            dto.setDepartmentName(jobPosting.getDepartment().getName());
        }
        if (jobPosting.getLocation() != null) {
            dto.setLocationId(jobPosting.getLocation().getId());
            dto.setLocationName(jobPosting.getLocation().getName());
        }
        if (jobPosting.getHiringManager() != null) {
            try {
                dto.setHiringManagerId(jobPosting.getHiringManager().getId());
                dto.setHiringManagerName(jobPosting.getHiringManager().getFullName());
            } catch (Exception e) {
                // Lazy proxy not initialized — skip
            }
        }
        
        return dto;
    }
}
