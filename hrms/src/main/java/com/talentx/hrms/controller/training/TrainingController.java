package com.talentx.hrms.controller.training;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.common.SecurityUtils;
import com.talentx.hrms.entity.training.TrainingEnrollment;
import com.talentx.hrms.entity.training.TrainingProgram;
import com.talentx.hrms.service.training.TrainingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/training")
@Tag(name = "Training Management", description = "Training programs and employee enrollment management")
public class TrainingController {

    private final TrainingService trainingService;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    // ===== TRAINING PROGRAM ENDPOINTS =====

    /**
     * Create training program
     */
    @PostMapping("/programs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create training program", description = "Create a new training program")
    public ResponseEntity<ApiResponse<TrainingProgram>> createTrainingProgram(@Valid @RequestBody CreateTrainingProgramRequest request) {
        try {
            TrainingProgram program = trainingService.createTrainingProgram(
                request.getOrganizationId(),
                request.getTitle(),
                request.getDescription(),
                request.getTrainingType(),
                request.getDeliveryMethod(),
                request.getDurationHours(),
                request.getCostPerParticipant(),
                request.getMaxParticipants(),
                request.getProvider(),
                request.getExternalUrl(),
                request.getIsMandatory()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Training program created successfully", program));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all training programs
     */
    @GetMapping("/programs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "List training programs", description = "Get all training programs with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<TrainingProgram>>> getTrainingPrograms(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Program title filter") @RequestParam(required = false) String title,
            @Parameter(description = "Training type filter") @RequestParam(required = false) TrainingProgram.TrainingType trainingType,
            @Parameter(description = "Delivery method filter") @RequestParam(required = false) TrainingProgram.DeliveryMethod deliveryMethod,
            @Parameter(description = "Mandatory filter") @RequestParam(required = false) Boolean isMandatory,
            @Parameter(description = "Provider filter") @RequestParam(required = false) String provider,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        
        Page<TrainingProgram> programs;
        if (title != null || trainingType != null || deliveryMethod != null || isMandatory != null || provider != null) {
            programs = trainingService.searchTrainingPrograms(organizationId, title, trainingType, 
                                                            deliveryMethod, isMandatory, provider, paginationRequest);
        } else {
            programs = trainingService.getTrainingPrograms(organizationId, paginationRequest);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Training programs retrieved successfully", programs));
    }

    /**
     * Get training program by ID
     */
    @GetMapping("/programs/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get training program by ID", description = "Retrieve a specific training program by its ID")
    public ResponseEntity<ApiResponse<TrainingProgram>> getTrainingProgram(@PathVariable Long id) {
        try {
            TrainingProgram program = trainingService.getTrainingProgram(id);
            return ResponseEntity.ok(ApiResponse.success("Training program retrieved successfully", program));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update training program
     */
    @PutMapping("/programs/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update training program", description = "Update an existing training program")
    public ResponseEntity<ApiResponse<TrainingProgram>> updateTrainingProgram(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateTrainingProgramRequest request) {
        try {
            TrainingProgram program = trainingService.updateTrainingProgram(
                id,
                request.getTitle(),
                request.getDescription(),
                request.getTrainingType(),
                request.getDeliveryMethod(),
                request.getDurationHours(),
                request.getCostPerParticipant(),
                request.getMaxParticipants(),
                request.getProvider(),
                request.getExternalUrl(),
                request.getIsMandatory()
            );
            return ResponseEntity.ok(ApiResponse.success("Training program updated successfully", program));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete training program
     */
    @DeleteMapping("/programs/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete training program", description = "Delete a training program")
    public ResponseEntity<ApiResponse<Void>> deleteTrainingProgram(@PathVariable Long id) {
        try {
            trainingService.deleteTrainingProgram(id);
            return ResponseEntity.ok(ApiResponse.success("Training program deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get mandatory training programs
     */
    @GetMapping("/programs/mandatory")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get mandatory training programs", description = "Get all mandatory training programs for an organization")
    public ResponseEntity<ApiResponse<Page<TrainingProgram>>> getMandatoryTrainingPrograms(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<TrainingProgram> programs = trainingService.getMandatoryTrainingPrograms(organizationId, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Mandatory training programs retrieved successfully", programs));
    }

    /**
     * Get most popular training programs
     */
    @GetMapping("/programs/popular")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get popular training programs", description = "Get most popular training programs by enrollment count")
    public ResponseEntity<ApiResponse<List<TrainingProgram>>> getMostPopularPrograms(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Number of programs to return") @RequestParam(defaultValue = "10") int limit) {
        List<TrainingProgram> programs = trainingService.getMostPopularPrograms(organizationId, limit);
        return ResponseEntity.ok(ApiResponse.success("Popular training programs retrieved successfully", programs));
    }

    // ===== TRAINING ENROLLMENT ENDPOINTS =====

    /**
     * Enroll employee in training
     */
    @PostMapping("/enrollments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Enroll employee in training", description = "Enroll an employee in a training program")
    public ResponseEntity<ApiResponse<TrainingEnrollment>> enrollEmployee(@Valid @RequestBody EnrollEmployeeRequest request) {
        try {
            TrainingEnrollment enrollment = trainingService.enrollEmployee(
                request.getTrainingProgramId(),
                request.getEmployeeId(),
                request.getDueDate(),
                request.getAssignedBy()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee enrolled successfully", enrollment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Complete training
     */
    @PutMapping("/enrollments/{id:\\d+}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @trainingService.isCurrentUserEnrolled(#id)")
    @Operation(summary = "Complete training", description = "Mark training as completed with score and certificate")
    public ResponseEntity<ApiResponse<TrainingEnrollment>> completeTraining(
            @PathVariable Long id,
            @Valid @RequestBody CompleteTrainingRequest request) {
        try {
            TrainingEnrollment enrollment = trainingService.completeTraining(
                id,
                request.getScore(),
                request.getPassingScore(),
                request.getCertificateUrl()
            );
            return ResponseEntity.ok(ApiResponse.success("Training completed successfully", enrollment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Start training
     */
    @PutMapping("/enrollments/{id:\\d+}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @trainingService.isCurrentUserEnrolled(#id)")
    @Operation(summary = "Start training", description = "Mark training as in progress")
    public ResponseEntity<ApiResponse<TrainingEnrollment>> startTraining(@PathVariable Long id) {
        try {
            TrainingEnrollment enrollment = trainingService.startTraining(id);
            return ResponseEntity.ok(ApiResponse.success("Training started successfully", enrollment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cancel enrollment
     */
    @PutMapping("/enrollments/{id:\\d+}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Cancel enrollment", description = "Cancel a training enrollment")
    public ResponseEntity<ApiResponse<TrainingEnrollment>> cancelEnrollment(@PathVariable Long id) {
        try {
            TrainingEnrollment enrollment = trainingService.cancelEnrollment(id);
            return ResponseEntity.ok(ApiResponse.success("Enrollment cancelled successfully", enrollment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee enrollments
     */
    @GetMapping("/enrollments/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @trainingService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee enrollments", description = "Get all training enrollments for a specific employee")
    public ResponseEntity<ApiResponse<Page<TrainingEnrollment>>> getEmployeeEnrollments(
            @PathVariable Long employeeId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<TrainingEnrollment> enrollments = trainingService.getEmployeeEnrollments(employeeId, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Employee enrollments retrieved successfully", enrollments));
    }

    /**
     * Get program enrollments
     */
    @GetMapping("/enrollments/program/{programId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get program enrollments", description = "Get all enrollments for a specific training program")
    public ResponseEntity<ApiResponse<Page<TrainingEnrollment>>> getProgramEnrollments(
            @PathVariable Long programId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<TrainingEnrollment> enrollments = trainingService.getProgramEnrollments(programId, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Program enrollments retrieved successfully", enrollments));
    }

    /**
     * Search enrollments
     */
    @GetMapping("/enrollments/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Search enrollments", description = "Search training enrollments with various criteria")
    public ResponseEntity<ApiResponse<Page<TrainingEnrollment>>> searchEnrollments(
            @Parameter(description = "Employee ID filter") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Training program ID filter") @RequestParam(required = false) Long trainingProgramId,
            @Parameter(description = "Status filter") @RequestParam(required = false) TrainingEnrollment.EnrollmentStatus status,
            @Parameter(description = "Start date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Assigned by filter") @RequestParam(required = false) Long assignedBy,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<TrainingEnrollment> enrollments = trainingService.searchEnrollments(
            employeeId, trainingProgramId, status, startDate, endDate, assignedBy, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Enrollment search completed", enrollments));
    }

    /**
     * Get overdue enrollments
     */
    @GetMapping("/enrollments/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get overdue enrollments", description = "Get all overdue training enrollments")
    public ResponseEntity<ApiResponse<Page<TrainingEnrollment>>> getOverdueEnrollments(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<TrainingEnrollment> enrollments = trainingService.getOverdueEnrollments(paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Overdue enrollments retrieved successfully", enrollments));
    }

    /**
     * Get enrollments due soon
     */
    @GetMapping("/enrollments/due-soon")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get enrollments due soon", description = "Get training enrollments due within specified days")
    public ResponseEntity<ApiResponse<List<TrainingEnrollment>>> getEnrollmentsDueSoon(
            @Parameter(description = "Number of days ahead to check") @RequestParam(defaultValue = "7") int daysAhead) {
        
        List<TrainingEnrollment> enrollments = trainingService.getEnrollmentsDueSoon(daysAhead);
        return ResponseEntity.ok(ApiResponse.success("Enrollments due soon retrieved successfully", enrollments));
    }

    // ===== STATISTICS ENDPOINTS =====

    /**
     * Get training statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get training statistics", description = "Get training statistics for an organization")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTrainingStatistics(
            @Parameter(description = "Organization ID") @RequestParam(required = false) Long organizationId) {
        try {
            long orgId = organizationId != null ? organizationId : securityUtils.getCurrentUserOrgId();
            TrainingService.TrainingStatistics stats = trainingService.getTrainingStatistics(orgId);
            Map<String, Object> statisticsMap = Map.of(
                "totalPrograms", stats.getTotalPrograms(),
                "mandatoryPrograms", stats.getMandatoryPrograms(),
                "totalEnrollments", stats.getTotalEnrollments(),
                "completedEnrollments", stats.getCompletedEnrollments(),
                "inProgressEnrollments", stats.getInProgressEnrollments(),
                "overdueEnrollments", stats.getOverdueEnrollments(),
                "completionRate", stats.getCompletionRate()
            );
            return ResponseEntity.ok(ApiResponse.success("Training statistics retrieved successfully", statisticsMap));
        } catch (RuntimeException e) {
            Map<String, Object> empty = new java.util.HashMap<>();
            empty.put("totalPrograms", 0); empty.put("mandatoryPrograms", 0);
            empty.put("totalEnrollments", 0); empty.put("completedEnrollments", 0);
            empty.put("inProgressEnrollments", 0); empty.put("overdueEnrollments", 0);
            empty.put("completionRate", 0.0);
            return ResponseEntity.ok(ApiResponse.success("Training statistics retrieved", empty));
        }
    }

    /**
     * Get program completion rate
     */
    @GetMapping("/programs/{programId:\\d+}/completion-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get program completion rate", description = "Get completion rate for a specific training program")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProgramCompletionRate(@PathVariable Long programId) {
        Double completionRate = trainingService.getCompletionRate(programId);
        Double averageScore = trainingService.getAverageScore(programId);
        
        Map<String, Object> result = Map.of(
            "completionRate", completionRate != null ? completionRate : 0.0,
            "averageScore", averageScore != null ? averageScore : 0.0
        );
        
        return ResponseEntity.ok(ApiResponse.success("Program statistics retrieved successfully", result));
    }

    /**
     * Get employee training statistics
     */
    @GetMapping("/statistics/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @trainingService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee training statistics", description = "Get training statistics for an employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeTrainingStatistics(@PathVariable Long employeeId) {
        TrainingService.EmployeeTrainingStatistics stats = trainingService.getEmployeeTrainingStatistics(employeeId);
        
        Map<String, Object> statisticsMap = Map.of(
            "totalEnrollments", stats.getTotalEnrollments(),
            "completedTrainings", stats.getCompletedTrainings(),
            "inProgressTrainings", stats.getInProgressTrainings(),
            "failedTrainings", stats.getFailedTrainings(),
            "completionRate", stats.getCompletionRate(),
            "failureRate", stats.getFailureRate()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Employee training statistics retrieved successfully", statisticsMap));
    }

    // ===== REQUEST DTOs =====

    public static class CreateTrainingProgramRequest {
        @NotNull(message = "Organization ID is required")
        private Long organizationId;
        
        @NotBlank(message = "Title is required")
        private String title;
        
        private String description;
        private TrainingProgram.TrainingType trainingType;
        private TrainingProgram.DeliveryMethod deliveryMethod;
        
        @PositiveOrZero(message = "Duration hours must be positive or zero")
        private Integer durationHours;
        
        @PositiveOrZero(message = "Cost per participant must be positive or zero")
        private BigDecimal costPerParticipant;
        
        @PositiveOrZero(message = "Max participants must be positive or zero")
        private Integer maxParticipants;
        
        private String provider;
        private String externalUrl;
        
        // Default false so frontend doesn't need to send it explicitly
        private Boolean isMandatory = false;

        // Getters and setters
        public Long getOrganizationId() { return organizationId; }
        public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TrainingProgram.TrainingType getTrainingType() { return trainingType; }
        public void setTrainingType(TrainingProgram.TrainingType trainingType) { this.trainingType = trainingType; }
        public TrainingProgram.DeliveryMethod getDeliveryMethod() { return deliveryMethod; }
        public void setDeliveryMethod(TrainingProgram.DeliveryMethod deliveryMethod) { this.deliveryMethod = deliveryMethod; }
        public Integer getDurationHours() { return durationHours; }
        public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }
        public BigDecimal getCostPerParticipant() { return costPerParticipant; }
        public void setCostPerParticipant(BigDecimal costPerParticipant) { this.costPerParticipant = costPerParticipant; }
        public Integer getMaxParticipants() { return maxParticipants; }
        public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }
        public String getExternalUrl() { return externalUrl; }
        public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
        public Boolean getIsMandatory() { return isMandatory; }
        public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }
    }

    public static class UpdateTrainingProgramRequest {
        @NotBlank(message = "Title is required")
        private String title;
        
        private String description;
        private TrainingProgram.TrainingType trainingType;
        private TrainingProgram.DeliveryMethod deliveryMethod;
        
        @PositiveOrZero(message = "Duration hours must be positive or zero")
        private Integer durationHours;
        
        @PositiveOrZero(message = "Cost per participant must be positive or zero")
        private BigDecimal costPerParticipant;
        
        @PositiveOrZero(message = "Max participants must be positive or zero")
        private Integer maxParticipants;
        
        private String provider;
        private String externalUrl;
        
        @NotNull(message = "Mandatory flag is required")
        private Boolean isMandatory;

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TrainingProgram.TrainingType getTrainingType() { return trainingType; }
        public void setTrainingType(TrainingProgram.TrainingType trainingType) { this.trainingType = trainingType; }
        public TrainingProgram.DeliveryMethod getDeliveryMethod() { return deliveryMethod; }
        public void setDeliveryMethod(TrainingProgram.DeliveryMethod deliveryMethod) { this.deliveryMethod = deliveryMethod; }
        public Integer getDurationHours() { return durationHours; }
        public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }
        public BigDecimal getCostPerParticipant() { return costPerParticipant; }
        public void setCostPerParticipant(BigDecimal costPerParticipant) { this.costPerParticipant = costPerParticipant; }
        public Integer getMaxParticipants() { return maxParticipants; }
        public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }
        public String getExternalUrl() { return externalUrl; }
        public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }
        public Boolean getIsMandatory() { return isMandatory; }
        public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }
    }

    public static class EnrollEmployeeRequest {
        @NotNull(message = "Training program ID is required")
        private Long trainingProgramId;
        
        @NotNull(message = "Employee ID is required")
        private Long employeeId;
        
        private LocalDate dueDate;
        private Long assignedBy;

        // Getters and setters
        public Long getTrainingProgramId() { return trainingProgramId; }
        public void setTrainingProgramId(Long trainingProgramId) { this.trainingProgramId = trainingProgramId; }
        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public Long getAssignedBy() { return assignedBy; }
        public void setAssignedBy(Long assignedBy) { this.assignedBy = assignedBy; }
    }

    public static class CompleteTrainingRequest {
        @PositiveOrZero(message = "Score must be positive or zero")
        private BigDecimal score;
        
        @PositiveOrZero(message = "Passing score must be positive or zero")
        private BigDecimal passingScore;
        
        private String certificateUrl;

        // Getters and setters
        public BigDecimal getScore() { return score; }
        public void setScore(BigDecimal score) { this.score = score; }
        public BigDecimal getPassingScore() { return passingScore; }
        public void setPassingScore(BigDecimal passingScore) { this.passingScore = passingScore; }
        public String getCertificateUrl() { return certificateUrl; }
        public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
    }
}

