package com.talentx.hrms.controller.recruitment;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.recruitment.JobPostingDTO;
import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.entity.recruitment.Application;
import com.talentx.hrms.entity.recruitment.Candidate;
import com.talentx.hrms.entity.recruitment.Interview;
import com.talentx.hrms.entity.recruitment.JobPosting;
import com.talentx.hrms.repository.DepartmentRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.LocationRepository;
import com.talentx.hrms.service.recruitment.RecruitmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recruitment")
@Tag(name = "Recruitment Management", description = "Job posting and application management operations")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final EmployeeRepository employeeRepository;
    private final com.talentx.hrms.repository.OrganizationRepository organizationRepository;

    @Autowired
    public RecruitmentController(RecruitmentService recruitmentService,
                                 DepartmentRepository departmentRepository,
                                 LocationRepository locationRepository,
                                 EmployeeRepository employeeRepository,
                                 com.talentx.hrms.repository.OrganizationRepository organizationRepository) {
        this.recruitmentService = recruitmentService;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
    }

    // ========== JOB POSTING ENDPOINTS ==========

    @GetMapping("/jobs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Get all job postings", description = "Retrieve all job postings with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<JobPostingDTO>>> getAllJobPostings(
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Published status filter") @RequestParam(required = false) Boolean isPublished,
            @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "Employment type filter") @RequestParam(required = false) EmploymentType employmentType,
            @Parameter(description = "Location filter") @RequestParam(required = false) String location,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<JobPostingDTO> jobPostings = recruitmentService.getAllJobPostings(
            isActive, isPublished, departmentId, employmentType, location, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Job postings retrieved successfully", jobPostings));
    }

    @GetMapping("/jobs/public")
    @Operation(summary = "Get public job postings", description = "Get published job postings for public career page")
    public ResponseEntity<ApiResponse<Page<JobPostingDTO>>> getPublicJobPostings(
            @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "Employment type filter") @RequestParam(required = false) EmploymentType employmentType,
            @Parameter(description = "Location filter") @RequestParam(required = false) String location,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, "postedDate", "desc");
        try {
            Page<JobPostingDTO> jobPostings = recruitmentService.getPublicJobPostings(
                departmentId, employmentType, location, keyword, paginationRequest);
            return ResponseEntity.ok(ApiResponse.success("Public job postings retrieved successfully", jobPostings));
        } catch (Exception e) {
            // Return empty page on any error for public endpoint
            return ResponseEntity.ok(ApiResponse.success("Public job postings retrieved successfully",
                new org.springframework.data.domain.PageImpl<JobPostingDTO>(
                    new java.util.ArrayList<>(),
                    org.springframework.data.domain.PageRequest.of(0, 10),
                    0L
                )));
        }
    }

    @GetMapping("/jobs/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Get job posting by ID", description = "Retrieve a specific job posting by ID")
    public ResponseEntity<ApiResponse<JobPostingDTO>> getJobPosting(@PathVariable Long id) {
        try {
            JobPosting jobPosting = recruitmentService.getJobPostingById(id);
            JobPostingDTO dto = convertJobPostingToDTO(jobPosting);
            return ResponseEntity.ok(ApiResponse.success("Job posting retrieved successfully", dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Create job posting")
    public ResponseEntity<ApiResponse<JobPostingDTO>> createJobPosting(@RequestBody Map<String, Object> request) {
        JobPosting created = recruitmentService.createJobPosting(buildJobPostingFromRequest(request, new JobPosting()));
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Job posting created successfully", convertJobPostingToDTO(created)));
    }

    @PutMapping("/jobs/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Update job posting")
    public ResponseEntity<ApiResponse<JobPostingDTO>> updateJobPosting(@PathVariable Long id,
                                                                       @RequestBody Map<String, Object> request) {
        JobPosting updated = recruitmentService.updateJobPosting(id, buildJobPostingFromRequest(request, recruitmentService.getJobPostingById(id)));
        return ResponseEntity.ok(ApiResponse.success("Job posting updated successfully", convertJobPostingToDTO(updated)));
    }

    @PostMapping("/jobs/{id:\\d+}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Publish job posting")
    public ResponseEntity<ApiResponse<JobPostingDTO>> publishJobPosting(@PathVariable Long id) {
        JobPosting jobPosting = recruitmentService.publishJobPosting(id);
        return ResponseEntity.ok(ApiResponse.success("Job posting published successfully", convertJobPostingToDTO(jobPosting)));
    }

    @PostMapping("/jobs/{id:\\d+}/pause")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Pause job posting")
    public ResponseEntity<ApiResponse<JobPostingDTO>> pauseJobPosting(@PathVariable Long id) {
        JobPosting jobPosting = recruitmentService.pauseJobPosting(id);
        return ResponseEntity.ok(ApiResponse.success("Job posting paused successfully", convertJobPostingToDTO(jobPosting)));
    }

    @PostMapping("/jobs/{id:\\d+}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Close job posting", description = "Close a job posting to stop accepting applications")
    public ResponseEntity<ApiResponse<JobPostingDTO>> closeJobPosting(@PathVariable Long id) {
        try {
            JobPosting jobPosting = recruitmentService.closeJobPosting(id);
            JobPostingDTO dto = convertJobPostingToDTO(jobPosting);
            return ResponseEntity.ok(ApiResponse.success("Job posting closed successfully", dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    private JobPostingDTO convertJobPostingToDTO(JobPosting jobPosting) {
        JobPostingDTO dto = new JobPostingDTO();
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
        dto.setClosingDate(jobPosting.getClosingDate());
        dto.setPostingDate(jobPosting.getPostedDate());
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
            dto.setHiringManagerId(jobPosting.getHiringManager().getId());
            dto.setHiringManagerName(jobPosting.getHiringManager().getFullName());
        }
        return dto;
    }

    @DeleteMapping("/jobs/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete job posting", description = "Delete a job posting (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteJobPosting(@PathVariable Long id) {
        try {
            recruitmentService.deleteJobPosting(id);
            return ResponseEntity.ok(ApiResponse.success("Job posting deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ========== CANDIDATE ENDPOINTS ==========

    @GetMapping("/candidates")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Get all candidates")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        Page<com.talentx.hrms.entity.recruitment.Candidate> candidates =
            recruitmentService.getCandidates(new PaginationRequest(page, size, sortBy, sortDirection));
        return ResponseEntity.ok(ApiResponse.success("Candidates retrieved successfully",
            candidates.map(this::toCandidateResponse)));
    }

    @GetMapping("/candidates/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Get candidate by ID")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCandidate(@PathVariable Long id) {
        try {
            com.talentx.hrms.entity.recruitment.Candidate candidate = recruitmentService.getCandidateById(id);
            return ResponseEntity.ok(ApiResponse.success("Candidate retrieved successfully", toCandidateResponse(candidate)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/candidates")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Create candidate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCandidate(@RequestBody Map<String, Object> request) {
        try {
            Long orgId = request.get("organizationId") instanceof Number n ? n.longValue() : 1L;
            com.talentx.hrms.entity.core.Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

            com.talentx.hrms.entity.recruitment.Candidate candidate = new com.talentx.hrms.entity.recruitment.Candidate();
            candidate.setOrganization(org);
            candidate.setFirstName(stringValue(request.get("firstName"), "Unknown"));
            candidate.setLastName(stringValue(request.get("lastName"), "Unknown"));
            candidate.setEmail(stringValue(request.get("email"), null));
            candidate.setPhoneNumber(stringValue(request.get("phoneNumber"), null));
            candidate.setCurrentTitle(stringValue(request.get("currentTitle"), null));
            candidate.setCurrentCompany(stringValue(request.get("currentCompany"), null));
            candidate.setLinkedinUrl(stringValue(request.get("linkedInProfile"), null));
            candidate.setResumeUrl(stringValue(request.get("resumeUrl"), null));
            if (request.get("yearsOfExperience") instanceof Number n) candidate.setYearsOfExperience(n.intValue());
            if (request.get("expectedSalary") instanceof Number n) candidate.setExpectedSalary(java.math.BigDecimal.valueOf(n.doubleValue()));

            com.talentx.hrms.entity.recruitment.Candidate saved = recruitmentService.createCandidate(candidate);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Candidate created successfully", toCandidateResponse(saved)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/candidates/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Update candidate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCandidate(@PathVariable Long id,
                                                                             @RequestBody Map<String, Object> request) {
        try {
            com.talentx.hrms.entity.recruitment.Candidate existing = recruitmentService.getCandidateById(id);
            if (request.containsKey("firstName")) existing.setFirstName(stringValue(request.get("firstName"), existing.getFirstName()));
            if (request.containsKey("lastName")) existing.setLastName(stringValue(request.get("lastName"), existing.getLastName()));
            if (request.containsKey("email")) existing.setEmail(stringValue(request.get("email"), existing.getEmail()));
            if (request.containsKey("phoneNumber")) existing.setPhoneNumber(stringValue(request.get("phoneNumber"), existing.getPhoneNumber()));
            if (request.containsKey("currentTitle")) existing.setCurrentTitle(stringValue(request.get("currentTitle"), existing.getCurrentTitle()));
            com.talentx.hrms.entity.recruitment.Candidate updated = recruitmentService.updateCandidate(id, existing);
            return ResponseEntity.ok(ApiResponse.success("Candidate updated successfully", toCandidateResponse(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/candidates/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete candidate")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(@PathVariable Long id) {
        try {
            // Soft delete by blacklisting
            recruitmentService.blacklistCandidate(id, "Deleted by admin");
            return ResponseEntity.ok(ApiResponse.success("Candidate deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private Map<String, Object> toCandidateResponse(com.talentx.hrms.entity.recruitment.Candidate c) {
        Map<String, Object> r = new HashMap<>();
        r.put("id", c.getId());
        r.put("firstName", c.getFirstName());
        r.put("lastName", c.getLastName());
        r.put("fullName", c.getFirstName() + " " + c.getLastName());
        r.put("email", c.getEmail());
        r.put("phoneNumber", c.getPhoneNumber());
        r.put("currentTitle", c.getCurrentTitle());
        r.put("currentCompany", c.getCurrentCompany());
        r.put("yearsOfExperience", c.getYearsOfExperience());
        r.put("expectedSalary", c.getExpectedSalary());
        r.put("resumeUrl", c.getResumeUrl());
        r.put("linkedInProfile", c.getLinkedinUrl());
        r.put("source", c.getSource() != null ? c.getSource().name() : "DIRECT_APPLICATION");
        r.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : java.time.Instant.now().toString());
        r.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : java.time.Instant.now().toString());
        r.put("location", "Unknown");
        r.put("skills", java.util.List.of());
        r.put("education", java.util.List.of());
        r.put("workExperience", java.util.List.of());
        return r;
    }

    @GetMapping("/applications")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Get recruitment applications")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getApplications(
            @RequestParam(required = false) Long jobPostingId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Page<Application> applications = recruitmentService.searchApplications(
            jobPostingId,
            status,
            new PaginationRequest(page, size, sortBy, sortDirection)
        );

        return ResponseEntity.ok(ApiResponse.success("Applications retrieved successfully", applications.map(this::toApplicationResponse)));
    }

    @PostMapping("/applications/{id:\\d+}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Update application status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateApplicationStatus(@PathVariable Long id,
                                                                                    @RequestParam String status,
                                                                                    @RequestParam(required = false) String notes) {
        Application application = recruitmentService.updateApplicationStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.success("Application status updated successfully", toApplicationResponse(application)));
    }

    @PostMapping("/applications/{id:\\d+}/rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Rate application")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rateApplication(@PathVariable Long id,
                                                                            @RequestParam Integer rating,
                                                                            @RequestParam(required = false) String feedback) {
        Application application = recruitmentService.rateApplication(id, rating, feedback);
        return ResponseEntity.ok(ApiResponse.success("Application rated successfully", toApplicationResponse(application)));
    }

    @PutMapping("/applications/{id:\\d+}/tags")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Update application tags")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateApplicationTags(@PathVariable Long id,
                                                                                  @RequestBody(required = false) Map<String, Object> request) {
        Application application = recruitmentService.getApplicationById(id);
        if (request != null && request.get("tags") instanceof List<?> tags) {
            // Store tags as comma-separated in stage column
            application.setCurrentStage(String.join(",", tags.stream().map(String::valueOf).toList()));
            recruitmentService.saveApplication(application);
        }
        return ResponseEntity.ok(ApiResponse.success("Application tags updated successfully", toApplicationResponse(application)));
    }

    @PostMapping("/applications/{id:\\d+}/hire")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Convert application to employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> hireCandidate(@PathVariable Long id) {
        recruitmentService.updateApplicationStatus(id, "OFFER_ACCEPTED", null);
        Employee employee = recruitmentService.hireCandidate(id);
        Map<String, Object> payload = new HashMap<>();
        payload.put("employeeId", employee.getId());
        payload.put("employeeNumber", employee.getEmployeeNumber());
        payload.put("fullName", employee.getFullName());
        payload.put("jobTitle", employee.getJobTitle());
        return ResponseEntity.ok(ApiResponse.success("Candidate converted to employee successfully", payload));
    }

    @GetMapping("/interviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Get recruitment interviews")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getInterviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "scheduledDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        Page<Interview> interviews = recruitmentService.searchInterviews(
            status,
            type,
            new PaginationRequest(page, size, sortBy, sortDirection)
        );

        return ResponseEntity.ok(ApiResponse.success("Interviews retrieved successfully", interviews.map(this::toInterviewResponse)));
    }

    @PostMapping("/interviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Schedule interview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scheduleInterview(@RequestBody Map<String, Object> request) {
        Interview interview = recruitmentService.scheduleInterview(
            longValue(request.get("applicationId")),
            stringValue(request.get("type"), "PHONE_SCREENING"),
            parseDateTime(stringValue(request.get("scheduledAt"), null)),
            intValue(request.get("duration"), 60),
            stringValue(request.get("location"), null),
            stringValue(request.get("meetingLink"), null),
            stringValue(request.get("notes"), null)
        );

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Interview scheduled successfully", toInterviewResponse(interview)));
    }

    @PutMapping("/interviews/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Update interview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateInterview(@PathVariable Long id,
                                                                            @RequestBody Map<String, Object> request) {
        Interview interview = recruitmentService.getInterviewById(id);
        interview.setInterviewType(mapInterviewType(stringValue(request.get("type"), interview.getInterviewType() != null ? interview.getInterviewType().name() : "PHONE_SCREENING")));
        interview.setScheduledDate(parseDateTime(stringValue(request.get("scheduledAt"), interview.getScheduledDate() != null ? interview.getScheduledDate().toString() : null)));
        interview.setDurationMinutes(intValue(request.get("duration"), interview.getDurationMinutes() != null ? interview.getDurationMinutes() : 60));
        interview.setLocation(stringValue(request.get("location"), interview.getLocation()));
        interview.setMeetingLink(stringValue(request.get("meetingLink"), interview.getMeetingLink()));
        interview.setNotes(stringValue(request.get("notes"), interview.getNotes()));

        Interview updated = recruitmentService.updateInterview(id, interview);
        return ResponseEntity.ok(ApiResponse.success("Interview updated successfully", toInterviewResponse(updated)));
    }

    @PostMapping("/interviews/{id:\\d+}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Cancel interview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelInterview(@PathVariable Long id,
                                                                            @RequestBody(required = false) Map<String, Object> request) {
        String reason = request != null ? stringValue(request.get("reason"), "Cancelled") : "Cancelled";
        Interview interview = recruitmentService.cancelInterview(id, reason, "system");
        return ResponseEntity.ok(ApiResponse.success("Interview cancelled successfully", toInterviewResponse(interview)));
    }

    @PostMapping("/interviews/{id:\\d+}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Complete interview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeInterview(@PathVariable Long id,
                                                                              @RequestBody Map<String, Object> request) {
        Integer rating = request.containsKey("rating") ? intValue(request.get("rating"), null) : null;
        Interview interview = recruitmentService.completeInterview(
            id,
            rating,
            null,
            null,
            null,
            stringValue(request.get("feedback"), null),
            null,
            null,
            null,
            stringValue(request.get("notes"), null)
        );
        return ResponseEntity.ok(ApiResponse.success("Interview completed successfully", toInterviewResponse(interview)));
    }

    /**
     * Get recruitment statistics — matches frontend /recruitment/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'RECRUITER')")
    @Operation(summary = "Get recruitment statistics")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getRecruitmentStatistics() {
        try {
            long activeJobs = recruitmentService.getActiveJobPostingsCount();
            long totalApplications = recruitmentService.getPendingApplicationsCount();
            long scheduledInterviews = recruitmentService.getScheduledInterviewsCount();
            long pendingApplications = recruitmentService.getPendingApplicationsCount();
            java.util.Map<String, Object> stats = java.util.Map.of(
                "activeJobPostings", activeJobs,
                "totalApplications", totalApplications,
                "scheduledInterviews", scheduledInterviews,
                "pendingApplications", pendingApplications
            );
            return ResponseEntity.ok(ApiResponse.success("Recruitment statistics retrieved", stats));
        } catch (RuntimeException e) {
            java.util.Map<String, Object> empty = java.util.Map.of(
                "activeJobPostings", 0, "totalApplications", 0,
                "scheduledInterviews", 0, "pendingApplications", 0);
            return ResponseEntity.ok(ApiResponse.success("Recruitment statistics retrieved", empty));
        }
    }

    private JobPosting buildJobPostingFromRequest(Map<String, Object> request, JobPosting target) {
        target.setTitle(stringValue(request.get("title"), target.getTitle()));
        target.setDescription(stringValue(request.get("description"), target.getDescription()));
        target.setRequirements(stringValue(request.get("requirements"), target.getRequirements()));
        target.setResponsibilities(stringValue(request.get("responsibilities"), target.getResponsibilities()));

        String employmentType = stringValue(request.get("employmentType"), target.getEmploymentType() != null ? target.getEmploymentType().name() : "FULL_TIME");
        target.setEmploymentType(EmploymentType.valueOf(employmentType.toUpperCase()));
        target.setSalaryMin(bigDecimalValue(request.get("salaryMin"), target.getSalaryMin()));
        target.setSalaryMax(bigDecimalValue(request.get("salaryMax"), target.getSalaryMax()));
        target.setSalaryCurrency(stringValue(request.get("currency"), stringValue(request.get("salaryCurrency"), target.getSalaryCurrency() != null ? target.getSalaryCurrency() : "USD")));
        target.setOpenings(intValue(request.get("numberOfPositions"), intValue(request.get("openings"), target.getOpenings() != null ? target.getOpenings() : 1)));
        target.setClosingDate(parseDate(stringValue(request.get("applicationDeadline"), stringValue(request.get("closingDate"), target.getClosingDate() != null ? target.getClosingDate().toString() : null))));
        if (target.getPostedDate() == null) {
            target.setPostedDate(LocalDate.now());
        }

        Long departmentId = longValue(request.get("departmentId"));
        if (departmentId != null) {
            Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            target.setDepartment(department);
        }

        Long locationId = longValue(request.get("locationId"));
        if (locationId != null) {
            Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));
            target.setLocation(location);
        }

        Long hiringManagerId = longValue(request.get("hiringManagerId"));
        if (hiringManagerId != null) {
            Employee manager = employeeRepository.findById(hiringManagerId)
                .orElseThrow(() -> new IllegalArgumentException("Hiring manager not found"));
            target.setHiringManager(manager);
        }

        return target;
    }

    private Map<String, Object> toApplicationResponse(Application application) {
        Candidate candidate = application.getCandidate();
        JobPosting jobPosting = application.getJobPosting();

        Map<String, Object> candidateMap = new HashMap<>();
        candidateMap.put("id", candidate.getId());
        candidateMap.put("firstName", candidate.getFirstName());
        candidateMap.put("lastName", candidate.getLastName());
        candidateMap.put("fullName", candidate.getFirstName() + " " + candidate.getLastName());
        candidateMap.put("email", candidate.getEmail());
        candidateMap.put("phoneNumber", candidate.getPhoneNumber());
        candidateMap.put("resumeUrl", candidate.getResumeUrl());
        candidateMap.put("linkedInProfile", candidate.getLinkedinUrl());
        candidateMap.put("portfolioUrl", candidate.getPortfolioUrl());
        candidateMap.put("currentJobTitle", candidate.getCurrentTitle());
        candidateMap.put("currentCompany", candidate.getCurrentCompany());
        candidateMap.put("yearsOfExperience", candidate.getYearsOfExperience());
        candidateMap.put("expectedSalary", candidate.getExpectedSalary());
        candidateMap.put("location", "Unknown");
        candidateMap.put("skills", List.of());
        candidateMap.put("education", List.of());
        candidateMap.put("workExperience", List.of());
        candidateMap.put("createdAt", candidate.getCreatedAt() != null ? candidate.getCreatedAt().toString() : Instant.now().toString());
        candidateMap.put("updatedAt", candidate.getUpdatedAt() != null ? candidate.getUpdatedAt().toString() : Instant.now().toString());

        Map<String, Object> response = new HashMap<>();
        response.put("id", application.getId());
        response.put("jobPosting", Map.of(
            "id", jobPosting.getId(),
            "title", jobPosting.getTitle(),
            "department", jobPosting.getDepartment() != null ? jobPosting.getDepartment().getName() : "Unassigned",
            "location", jobPosting.getLocation() != null ? jobPosting.getLocation().getName() : "Remote"
        ));
        response.put("candidate", candidateMap);
        response.put("status", mapApplicationStatus(application));
        response.put("appliedAt", application.getAppliedDate() != null ? application.getAppliedDate().atStartOfDay().toInstant(ZoneOffset.UTC).toString() : Instant.now().toString());
        response.put("coverLetter", application.getCoverLetter());
        
        // Map screening notes from rejection_reason column (when not rejected)
        String reviewComments = application.getScreeningNotes();
        if (reviewComments == null && application.getRejectionReason() != null) {
            reviewComments = application.getRejectionReason();
        }
        response.put("reviewComments", reviewComments);
        response.put("reviewedAt", application.getUpdatedAt() != null ? application.getUpdatedAt().toString() : null);
        response.put("rating", application.getScreeningScore());
        
        // Parse tags from stage column (comma-separated)
        String stageValue = application.getCurrentStage();
        List<String> tags = (stageValue != null && stageValue.contains(",")) 
            ? List.of(stageValue.split(",")) 
            : List.of();
        response.put("tags", tags);
        
        response.put("source", candidate.getSource() != null ? candidate.getSource().name() : "DIRECT_APPLICATION");
        response.put("updatedAt", application.getUpdatedAt() != null ? application.getUpdatedAt().toString() : Instant.now().toString());
        return response;
    }

    private Map<String, Object> toInterviewResponse(Interview interview) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", interview.getId());
        response.put("application", Map.of(
            "id", interview.getApplication().getId(),
            "candidate", Map.of(
                "id", interview.getApplication().getCandidate().getId(),
                "fullName", interview.getApplication().getCandidate().getFirstName() + " " + interview.getApplication().getCandidate().getLastName(),
                "email", interview.getApplication().getCandidate().getEmail()
            ),
            "jobPosting", Map.of(
                "id", interview.getApplication().getJobPosting().getId(),
                "title", interview.getApplication().getJobPosting().getTitle()
            )
        ));
        response.put("type", mapInterviewType(interview));
        response.put("scheduledAt", interview.getScheduledDate() != null ? interview.getScheduledDate().toInstant(ZoneOffset.UTC).toString() : Instant.now().toString());
        response.put("duration", interview.getDurationMinutes() != null ? interview.getDurationMinutes() : 60);
        response.put("location", interview.getLocation());
        response.put("meetingLink", interview.getMeetingLink());
        response.put("interviewer", Map.of(
            "id", 0L,
            "firstName", "Talent",
            "lastName", "Lead",
            "fullName", "Talent Lead",
            "email", "talent.lead@talentx.local"
        ));
        response.put("additionalInterviewers", Collections.emptyList());
        response.put("status", mapInterviewStatus(interview));
        response.put("feedback", interview.getFeedback());
        response.put("rating", interview.getRating() != null ? interview.getRating().intValue() : null);
        response.put("notes", interview.getNotes());
        response.put("createdAt", interview.getCreatedAt() != null ? interview.getCreatedAt().toString() : Instant.now().toString());
        response.put("updatedAt", interview.getUpdatedAt() != null ? interview.getUpdatedAt().toString() : Instant.now().toString());
        return response;
    }

    private String mapApplicationStatus(Application application) {
        String status = application.getStatus();
        if ("INTERVIEW".equals(status)) {
            boolean completed = application.getInterviews() != null
                && application.getInterviews().stream().anyMatch(interview -> Interview.InterviewStatus.COMPLETED.equals(interview.getStatus()));
            return completed ? "INTERVIEWED" : "INTERVIEW_SCHEDULED";
        }
        if ("ASSESSMENT".equals(status)) {
            return "UNDER_REVIEW";
        }
        if ("OFFER".equals(status)) {
            return Boolean.TRUE.equals(application.getOfferAccepted()) ? "OFFER_ACCEPTED" : "OFFER_EXTENDED";
        }
        if ("HIRED".equals(status)) {
            return "OFFER_ACCEPTED";
        }
        return status;
    }

    private String mapInterviewStatus(Interview interview) {
        return interview.getStatus() != null ? interview.getStatus() : "SCHEDULED";
    }

    private String mapInterviewType(Interview interview) {
        if (interview.getInterviewType() == null) {
            return "PHONE_SCREENING";
        }
        return switch (interview.getInterviewType()) {
            case PHONE_SCREEN -> "PHONE_SCREENING";
            case VIDEO -> "VIDEO_INTERVIEW";
            case ONSITE -> "IN_PERSON";
            case TECHNICAL -> "TECHNICAL_INTERVIEW";
            case PANEL -> "PANEL_INTERVIEW";
            case FINAL -> "FINAL_INTERVIEW";
            case HR -> "PHONE_SCREENING";
        };
    }

    private Interview.InterviewType mapInterviewType(String value) {
        return switch (value != null ? value.toUpperCase() : "PHONE_SCREENING") {
            case "VIDEO_INTERVIEW", "VIDEO" -> Interview.InterviewType.VIDEO;
            case "IN_PERSON", "ONSITE" -> Interview.InterviewType.ONSITE;
            case "TECHNICAL_INTERVIEW", "TECHNICAL" -> Interview.InterviewType.TECHNICAL;
            case "PANEL_INTERVIEW", "PANEL" -> Interview.InterviewType.PANEL;
            case "FINAL_INTERVIEW", "FINAL" -> Interview.InterviewType.FINAL;
            case "HR" -> Interview.InterviewType.HR;
            default -> Interview.InterviewType.PHONE_SCREEN;
        };
    }

    private LocalDate parseDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return LocalDateTime.now().plusDays(1);
        }
        if (value.length() == 10) {
            return LocalDate.parse(value).atTime(10, 0);
        }
        return LocalDateTime.parse(value.replace("Z", ""));
    }

    private Long longValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private Integer intValue(Object value, Integer fallback) {
        if (value == null) {
            return fallback;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private BigDecimal bigDecimalValue(Object value, BigDecimal fallback) {
        if (value == null) {
            return fallback;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return new BigDecimal(String.valueOf(value));
    }

    private String stringValue(Object value, String fallback) {
        return value != null ? String.valueOf(value) : fallback;
    }
}
