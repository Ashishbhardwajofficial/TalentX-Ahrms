package com.talentx.hrms.service.training;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.training.TrainingEnrollment;
import com.talentx.hrms.entity.training.TrainingProgram;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.TrainingEnrollmentRepository;
import com.talentx.hrms.repository.TrainingProgramRepository;
import com.talentx.hrms.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TrainingService {

    private final TrainingProgramRepository trainingProgramRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthService authService;

    @Autowired
    public TrainingService(TrainingProgramRepository trainingProgramRepository,
                          TrainingEnrollmentRepository trainingEnrollmentRepository,
                          EmployeeRepository employeeRepository,
                          OrganizationRepository organizationRepository,
                          AuthService authService) {
        this.trainingProgramRepository = trainingProgramRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.authService = authService;
    }

    // ===== TRAINING PROGRAM MANAGEMENT =====

    /**
     * Create a new training program
     */
    public TrainingProgram createTrainingProgram(Long organizationId, String title, String description,
                                               TrainingProgram.TrainingType trainingType,
                                               TrainingProgram.DeliveryMethod deliveryMethod,
                                               Integer durationHours, BigDecimal costPerParticipant,
                                               Integer maxParticipants, String provider,
                                               String externalUrl, Boolean isMandatory) {
        // Check if program title already exists for organization
        if (trainingProgramRepository.existsByOrganizationIdAndTitleIgnoreCase(organizationId, title)) {
            throw new RuntimeException("Training program with title '" + title + "' already exists for this organization");
        }

        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        TrainingProgram program = new TrainingProgram(organization, title, trainingType, deliveryMethod, isMandatory);
        program.setDescription(description);
        program.setDurationHours(durationHours != null ? BigDecimal.valueOf(durationHours) : null);
        program.setCostPerParticipant(costPerParticipant);
        program.setMaxParticipants(maxParticipants);
        program.setProvider(provider);
        program.setExternalUrl(externalUrl);

        return trainingProgramRepository.save(program);
    }

    /**
     * Update an existing training program
     */
    public TrainingProgram updateTrainingProgram(Long programId, String title, String description,
                                               TrainingProgram.TrainingType trainingType,
                                               TrainingProgram.DeliveryMethod deliveryMethod,
                                               Integer durationHours, BigDecimal costPerParticipant,
                                               Integer maxParticipants, String provider,
                                               String externalUrl, Boolean isMandatory) {
        TrainingProgram program = trainingProgramRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Training program not found"));

        // Check if title already exists (excluding current program)
        if (!program.getTitle().equalsIgnoreCase(title) &&
            trainingProgramRepository.existsByOrganizationIdAndTitleIgnoreCase(program.getOrganizationId(), title)) {
            throw new RuntimeException("Training program with title '" + title + "' already exists for this organization");
        }

        program.setTitle(title);
        program.setDescription(description);
        program.setTrainingType(trainingType);
        program.setDeliveryMethod(deliveryMethod);
        program.setDurationHours(durationHours != null ? BigDecimal.valueOf(durationHours) : null);
        program.setCostPerParticipant(costPerParticipant);
        program.setMaxParticipants(maxParticipants);
        program.setProvider(provider);
        program.setExternalUrl(externalUrl);
        program.setIsMandatory(isMandatory);

        return trainingProgramRepository.save(program);
    }

    /**
     * Get training program by ID
     */
    @Transactional(readOnly = true)
    public TrainingProgram getTrainingProgram(Long programId) {
        return trainingProgramRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Training program not found"));
    }

    /**
     * Get all training programs for organization with pagination
     */
    @Transactional(readOnly = true)
    public Page<TrainingProgram> getTrainingPrograms(Long organizationId, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return trainingProgramRepository.findByOrganizationIdAndActiveTrue(organizationId, pageable);
    }

    /**
     * Search training programs with criteria
     */
    @Transactional(readOnly = true)
    public Page<TrainingProgram> searchTrainingPrograms(Long organizationId, String title,
                                                       TrainingProgram.TrainingType trainingType,
                                                       TrainingProgram.DeliveryMethod deliveryMethod,
                                                       Boolean isMandatory, String provider,
                                                       PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));
        Pageable pageable = createPageable(paginationRequest);
        return trainingProgramRepository.findBySearchCriteria(organization, title, trainingType,
                                                             deliveryMethod, isMandatory, provider, true, pageable);
    }

    /**
     * Get training programs by type
     */
    @Transactional(readOnly = true)
    public Page<TrainingProgram> getTrainingProgramsByType(Long organizationId, TrainingProgram.TrainingType trainingType,
                                                          PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return trainingProgramRepository.findByOrganizationIdAndTrainingType(organizationId, trainingType, pageable);
    }

    /**
     * Get mandatory training programs
     */
    @Transactional(readOnly = true)
    public Page<TrainingProgram> getMandatoryTrainingPrograms(Long organizationId, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return trainingProgramRepository.findByOrganizationIdAndIsMandatoryTrue(organizationId, pageable);
    }

    /**
     * Get most popular training programs
     */
    @Transactional(readOnly = true)
    public List<TrainingProgram> getMostPopularPrograms(Long organizationId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return trainingProgramRepository.findMostPopularPrograms(organizationId, pageable);
    }

    /**
     * Delete training program
     */
    public void deleteTrainingProgram(Long programId) {
        TrainingProgram program = trainingProgramRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Training program not found"));

        // Check if program has enrollments
        long enrollmentCount = trainingEnrollmentRepository.countByTrainingProgramId(programId);
        if (enrollmentCount > 0) {
            throw new RuntimeException("Cannot delete training program that has " + enrollmentCount + " enrollment(s)");
        }

        trainingProgramRepository.delete(program);
    }

    /**
     * Deactivate training program (soft delete)
     */
    public TrainingProgram deactivateTrainingProgram(Long programId) {
        TrainingProgram program = trainingProgramRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Training program not found"));

        program.setIsActive(false);
        return trainingProgramRepository.save(program);
    }

    // ===== ENROLLMENT WORKFLOW =====

    /**
     * Enroll employee in training program
     */
    public TrainingEnrollment enrollEmployee(Long trainingProgramId, Long employeeId, LocalDate dueDate, Long assignedBy) {
        TrainingProgram program = trainingProgramRepository.findById(trainingProgramId)
            .orElseThrow(() -> new RuntimeException("Training program not found"));

        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Check if employee is already enrolled
        if (trainingEnrollmentRepository.existsByEmployeeIdAndTrainingProgramId(employeeId, trainingProgramId)) {
            throw new RuntimeException("Employee is already enrolled in this training program");
        }

        // Check max participants limit
        if (program.getMaxParticipants() != null) {
            long currentEnrollments = trainingEnrollmentRepository.countByTrainingProgramId(trainingProgramId);
            if (currentEnrollments >= program.getMaxParticipants()) {
                throw new RuntimeException("Training program has reached maximum participant limit");
            }
        }

        TrainingEnrollment enrollment = new TrainingEnrollment(program, employee, LocalDate.now());
        enrollment.setDueDate(dueDate);
        if (assignedBy != null) {
            Employee assignedByEmployee = employeeRepository.findById(assignedBy)
                .orElseThrow(() -> new RuntimeException("Assigned by employee not found"));
            enrollment.setAssignedBy(assignedByEmployee);
        }

        return trainingEnrollmentRepository.save(enrollment);
    }

    /**
     * Auto-enroll employees in mandatory training
     */
    public List<TrainingEnrollment> autoEnrollMandatoryTraining(Long trainingProgramId, List<Long> employeeIds, LocalDate dueDate) {
        TrainingProgram program = trainingProgramRepository.findById(trainingProgramId)
            .orElseThrow(() -> new RuntimeException("Training program not found"));

        if (!program.getIsMandatory()) {
            throw new RuntimeException("Training program is not mandatory");
        }

        Employee currentUser = getCurrentEmployee();
        
        return employeeIds.stream()
            .filter(employeeId -> !trainingEnrollmentRepository.existsByEmployeeIdAndTrainingProgramId(employeeId, trainingProgramId))
            .map(employeeId -> {
                Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
                TrainingEnrollment enrollment = new TrainingEnrollment(program, employee, LocalDate.now());
                enrollment.setDueDate(dueDate);
                enrollment.setAssignedBy(currentUser);
                return trainingEnrollmentRepository.save(enrollment);
            })
            .toList();
    }

    /**
     * Start training (mark as in progress)
     */
    public TrainingEnrollment startTraining(Long enrollmentId) {
        TrainingEnrollment enrollment = trainingEnrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Training enrollment not found"));

        if (enrollment.getStatus() != TrainingEnrollment.EnrollmentStatus.ENROLLED) {
            throw new RuntimeException("Training can only be started from ENROLLED status");
        }

        enrollment.setStatus(TrainingEnrollment.EnrollmentStatus.IN_PROGRESS);
        enrollment.setStartDate(LocalDate.now());

        return trainingEnrollmentRepository.save(enrollment);
    }

    /**
     * Cancel training enrollment
     */
    public TrainingEnrollment cancelEnrollment(Long enrollmentId) {
        TrainingEnrollment enrollment = trainingEnrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Training enrollment not found"));

        if (enrollment.getStatus() == TrainingEnrollment.EnrollmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed training");
        }

        enrollment.setStatus(TrainingEnrollment.EnrollmentStatus.CANCELLED);
        return trainingEnrollmentRepository.save(enrollment);
    }

    // ===== COMPLETION TRACKING =====

    /**
     * Complete training with score
     */
    public TrainingEnrollment completeTraining(Long enrollmentId, BigDecimal score, BigDecimal passingScore, String certificateUrl) {
        TrainingEnrollment enrollment = trainingEnrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Training enrollment not found"));

        if (enrollment.getStatus() == TrainingEnrollment.EnrollmentStatus.COMPLETED) {
            throw new RuntimeException("Training is already completed");
        }

        enrollment.setCompletionDate(LocalDate.now());
        enrollment.setScore(score);
        enrollment.setPassingScore(passingScore);

        // Determine status based on score
        if (score != null && passingScore != null) {
            if (score.compareTo(passingScore) >= 0) {
                enrollment.setStatus(TrainingEnrollment.EnrollmentStatus.COMPLETED);
                enrollment.setCertificateUrl(certificateUrl);
            } else {
                enrollment.setStatus(TrainingEnrollment.EnrollmentStatus.FAILED);
            }
        } else {
            enrollment.setStatus(TrainingEnrollment.EnrollmentStatus.COMPLETED);
            enrollment.setCertificateUrl(certificateUrl);
        }

        return trainingEnrollmentRepository.save(enrollment);
    }

    /**
     * Mark training as failed
     */
    public TrainingEnrollment failTraining(Long enrollmentId, BigDecimal score, BigDecimal passingScore) {
        TrainingEnrollment enrollment = trainingEnrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Training enrollment not found"));

        enrollment.setStatus(TrainingEnrollment.EnrollmentStatus.FAILED);
        enrollment.setCompletionDate(LocalDate.now());
        enrollment.setScore(score);
        enrollment.setPassingScore(passingScore);

        return trainingEnrollmentRepository.save(enrollment);
    }

    /**
     * Get employee enrollments
     */
    @Transactional(readOnly = true)
    public Page<TrainingEnrollment> getEmployeeEnrollments(Long employeeId, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return trainingEnrollmentRepository.findByEmployeeId(employeeId, pageable);
    }

    /**
     * Get program enrollments
     */
    @Transactional(readOnly = true)
    public Page<TrainingEnrollment> getProgramEnrollments(Long trainingProgramId, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return trainingEnrollmentRepository.findByTrainingProgramId(trainingProgramId, pageable);
    }

    /**
     * Get overdue enrollments
     */
    @Transactional(readOnly = true)
    public Page<TrainingEnrollment> getOverdueEnrollments(PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return trainingEnrollmentRepository.findOverdueEnrollments(LocalDate.now(), pageable);
    }

    /**
     * Get enrollments due soon
     */
    @Transactional(readOnly = true)
    public List<TrainingEnrollment> getEnrollmentsDueSoon(int daysAhead) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(daysAhead);
        return trainingEnrollmentRepository.findEnrollmentsDueSoon(startDate, endDate);
    }

    /**
     * Search enrollments with criteria
     */
    @Transactional(readOnly = true)
    public Page<TrainingEnrollment> searchEnrollments(Long employeeId, Long trainingProgramId,
                                                     TrainingEnrollment.EnrollmentStatus status,
                                                     LocalDate startDate, LocalDate endDate,
                                                     Long assignedBy, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return trainingEnrollmentRepository.findBySearchCriteria(employeeId, trainingProgramId, status,
                                                                startDate, endDate, assignedBy, pageable);
    }

    // ===== STATISTICS AND REPORTING =====

    /**
     * Get training statistics for organization
     */
    @Transactional(readOnly = true)
    public TrainingStatistics getTrainingStatistics(Long organizationId) {
        long totalPrograms = trainingProgramRepository.countByOrganizationIdAndActiveTrue(organizationId);
        long mandatoryPrograms = trainingProgramRepository.countByOrganizationIdAndIsMandatoryTrue(organizationId);
        
        // Get enrollment statistics
        long totalEnrollments = trainingEnrollmentRepository.count();
        long completedEnrollments = trainingEnrollmentRepository.countByStatus(TrainingEnrollment.EnrollmentStatus.COMPLETED);
        long inProgressEnrollments = trainingEnrollmentRepository.countByStatus(TrainingEnrollment.EnrollmentStatus.IN_PROGRESS);
        long overdueEnrollments = trainingEnrollmentRepository.findOverdueEnrollments(LocalDate.now()).size();

        return new TrainingStatistics(totalPrograms, mandatoryPrograms, totalEnrollments,
                                    completedEnrollments, inProgressEnrollments, overdueEnrollments);
    }

    /**
     * Get completion rate for training program
     */
    @Transactional(readOnly = true)
    public Double getCompletionRate(Long trainingProgramId) {
        return trainingEnrollmentRepository.getCompletionRateByProgram(trainingProgramId);
    }

    /**
     * Get average score for training program
     */
    @Transactional(readOnly = true)
    public Double getAverageScore(Long trainingProgramId) {
        return trainingEnrollmentRepository.getAverageScoreByProgram(trainingProgramId);
    }

    /**
     * Get employee training statistics
     */
    @Transactional(readOnly = true)
    public EmployeeTrainingStatistics getEmployeeTrainingStatistics(Long employeeId) {
        long totalEnrollments = trainingEnrollmentRepository.countByEmployeeId(employeeId);
        long completedTrainings = trainingEnrollmentRepository.countByEmployeeIdAndStatus(employeeId, TrainingEnrollment.EnrollmentStatus.COMPLETED);
        long inProgressTrainings = trainingEnrollmentRepository.countByEmployeeIdAndStatus(employeeId, TrainingEnrollment.EnrollmentStatus.IN_PROGRESS);
        long failedTrainings = trainingEnrollmentRepository.countByEmployeeIdAndStatus(employeeId, TrainingEnrollment.EnrollmentStatus.FAILED);

        return new EmployeeTrainingStatistics(totalEnrollments, completedTrainings, inProgressTrainings, failedTrainings);
    }

    // ===== HELPER METHODS =====

    /**
     * Get current employee from authenticated user
     */
    private Employee getCurrentEmployee() {
        return employeeRepository.findByUser(authService.getCurrentUser())
            .orElseThrow(() -> new RuntimeException("Current user is not associated with an employee"));
    }

    /**
     * Create pageable from pagination request
     */
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    // ===== INNER CLASSES =====

    /**
     * Training statistics for organization
     */
    public static class TrainingStatistics {
        private final long totalPrograms;
        private final long mandatoryPrograms;
        private final long totalEnrollments;
        private final long completedEnrollments;
        private final long inProgressEnrollments;
        private final long overdueEnrollments;

        public TrainingStatistics(long totalPrograms, long mandatoryPrograms, long totalEnrollments,
                                long completedEnrollments, long inProgressEnrollments, long overdueEnrollments) {
            this.totalPrograms = totalPrograms;
            this.mandatoryPrograms = mandatoryPrograms;
            this.totalEnrollments = totalEnrollments;
            this.completedEnrollments = completedEnrollments;
            this.inProgressEnrollments = inProgressEnrollments;
            this.overdueEnrollments = overdueEnrollments;
        }

        // Getters
        public long getTotalPrograms() { return totalPrograms; }
        public long getMandatoryPrograms() { return mandatoryPrograms; }
        public long getTotalEnrollments() { return totalEnrollments; }
        public long getCompletedEnrollments() { return completedEnrollments; }
        public long getInProgressEnrollments() { return inProgressEnrollments; }
        public long getOverdueEnrollments() { return overdueEnrollments; }

        public double getCompletionRate() {
            return totalEnrollments > 0 ? (double) completedEnrollments / totalEnrollments * 100 : 0;
        }
    }

    /**
     * Employee training statistics
     */
    public static class EmployeeTrainingStatistics {
        private final long totalEnrollments;
        private final long completedTrainings;
        private final long inProgressTrainings;
        private final long failedTrainings;

        public EmployeeTrainingStatistics(long totalEnrollments, long completedTrainings,
                                        long inProgressTrainings, long failedTrainings) {
            this.totalEnrollments = totalEnrollments;
            this.completedTrainings = completedTrainings;
            this.inProgressTrainings = inProgressTrainings;
            this.failedTrainings = failedTrainings;
        }

        // Getters
        public long getTotalEnrollments() { return totalEnrollments; }
        public long getCompletedTrainings() { return completedTrainings; }
        public long getInProgressTrainings() { return inProgressTrainings; }
        public long getFailedTrainings() { return failedTrainings; }

        public double getCompletionRate() {
            return totalEnrollments > 0 ? (double) completedTrainings / totalEnrollments * 100 : 0;
        }

        public double getFailureRate() {
            return totalEnrollments > 0 ? (double) failedTrainings / totalEnrollments * 100 : 0;
        }
    }
}

