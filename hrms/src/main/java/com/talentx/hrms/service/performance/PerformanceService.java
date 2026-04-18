package com.talentx.hrms.service.performance;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.performance.GoalResponse;
import com.talentx.hrms.dto.performance.PerformanceReviewResponse;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.performance.Goal;
import com.talentx.hrms.entity.performance.PerformanceReview;
import com.talentx.hrms.entity.performance.PerformanceReviewCycle;
import com.talentx.hrms.mapper.PerformanceMapper;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.GoalRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.PerformanceReviewCycleRepository;
import com.talentx.hrms.repository.PerformanceReviewRepository;
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
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PerformanceService {

    private final PerformanceReviewCycleRepository reviewCycleRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final GoalRepository goalRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeRepository employeeRepository;
    private final PerformanceMapper performanceMapper;

    @Autowired
    public PerformanceService(PerformanceReviewCycleRepository reviewCycleRepository,
                             PerformanceReviewRepository performanceReviewRepository,
                             GoalRepository goalRepository,
                             OrganizationRepository organizationRepository,
                             EmployeeRepository employeeRepository,
                             PerformanceMapper performanceMapper) {
        this.reviewCycleRepository = reviewCycleRepository;
        this.performanceReviewRepository = performanceReviewRepository;
        this.goalRepository = goalRepository;
        this.organizationRepository = organizationRepository;
        this.employeeRepository = employeeRepository;
        this.performanceMapper = performanceMapper;
    }

    // ===== REVIEW CYCLE MANAGEMENT =====

    /**
     * Create a new performance review cycle
     */
    public PerformanceReviewCycle createReviewCycle(Long organizationId, String name, 
                                                   PerformanceReviewCycle.ReviewType reviewType,
                                                   LocalDate startDate, LocalDate endDate,
                                                   LocalDate selfReviewDeadline,
                                                   LocalDate managerReviewDeadline) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Check if cycle name already exists
        if (reviewCycleRepository.existsByOrganizationAndNameIgnoreCase(organization, name)) {
            throw new RuntimeException("Review cycle name already exists in organization");
        }

        // Validate dates
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }

        if (selfReviewDeadline != null && selfReviewDeadline.isBefore(startDate)) {
            throw new RuntimeException("Self review deadline cannot be before start date");
        }

        if (managerReviewDeadline != null && managerReviewDeadline.isBefore(startDate)) {
            throw new RuntimeException("Manager review deadline cannot be before start date");
        }

        PerformanceReviewCycle cycle = new PerformanceReviewCycle(organization, name, reviewType, startDate, endDate);
        cycle.setSelfReviewDeadline(selfReviewDeadline);
        cycle.setManagerReviewDeadline(managerReviewDeadline);

        return reviewCycleRepository.save(cycle);
    }

    /**
     * Update a review cycle
     */
    public PerformanceReviewCycle updateReviewCycle(Long cycleId, String name, 
                                                   PerformanceReviewCycle.ReviewType reviewType,
                                                   LocalDate startDate, LocalDate endDate,
                                                   LocalDate selfReviewDeadline,
                                                   LocalDate managerReviewDeadline,
                                                   PerformanceReviewCycle.ReviewCycleStatus status) {
        PerformanceReviewCycle cycle = reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new RuntimeException("Review cycle not found"));

        // Check if name already exists (excluding current cycle)
        Optional<PerformanceReviewCycle> existingCycle = reviewCycleRepository
            .findByOrganization(cycle.getOrganization())
            .stream()
            .filter(c -> c.getName().equalsIgnoreCase(name) && !c.getId().equals(cycleId))
            .findFirst();

        if (existingCycle.isPresent()) {
            throw new RuntimeException("Review cycle name already exists in organization");
        }

        // Validate dates
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }

        cycle.setName(name);
        cycle.setReviewType(reviewType);
        cycle.setStartDate(startDate);
        cycle.setEndDate(endDate);
        cycle.setSelfReviewDeadline(selfReviewDeadline);
        cycle.setManagerReviewDeadline(managerReviewDeadline);
        cycle.setStatus(status);

        return reviewCycleRepository.save(cycle);
    }

    /**
     * Get review cycle by ID
     */
    @Transactional(readOnly = true)
    public PerformanceReviewCycle getReviewCycle(Long cycleId) {
        return reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new RuntimeException("Review cycle not found"));
    }

    /**
     * Get all review cycles for an organization
     */
    @Transactional(readOnly = true)
    public Page<PerformanceReviewCycle> getReviewCycles(Long organizationId, PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        Pageable pageable = PageRequest.of(
            paginationRequest.getPage(),
            paginationRequest.getSize(),
            Sort.by(Sort.Direction.fromString(paginationRequest.getSortDirection()), paginationRequest.getSortBy())
        );

        return reviewCycleRepository.findByOrganization(organization, pageable);
    }

    /**
     * Get active review cycles for an organization
     */
    @Transactional(readOnly = true)
    public List<PerformanceReviewCycle> getActiveReviewCycles(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        return reviewCycleRepository.findActiveByOrganization(organization);
    }

    /**
     * Activate a review cycle
     */
    public PerformanceReviewCycle activateReviewCycle(Long cycleId) {
        PerformanceReviewCycle cycle = reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new RuntimeException("Review cycle not found"));

        if (cycle.getStatus() != PerformanceReviewCycle.ReviewCycleStatus.DRAFT) {
            throw new RuntimeException("Only draft cycles can be activated");
        }

        cycle.setStatus(PerformanceReviewCycle.ReviewCycleStatus.ACTIVE);
        return reviewCycleRepository.save(cycle);
    }

    /**
     * Complete a review cycle
     */
    public PerformanceReviewCycle completeReviewCycle(Long cycleId) {
        PerformanceReviewCycle cycle = reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new RuntimeException("Review cycle not found"));

        if (cycle.getStatus() != PerformanceReviewCycle.ReviewCycleStatus.ACTIVE) {
            throw new RuntimeException("Only active cycles can be completed");
        }

        cycle.setStatus(PerformanceReviewCycle.ReviewCycleStatus.COMPLETED);
        return reviewCycleRepository.save(cycle);
    }

    // ===== PERFORMANCE REVIEW MANAGEMENT =====

    /**
     * Create a performance review
     */
    public PerformanceReview createPerformanceReview(Long reviewCycleId, Long employeeId, Long reviewerId,
                                                    PerformanceReview.ReviewType reviewType) {
        PerformanceReviewCycle cycle = reviewCycleRepository.findById(reviewCycleId)
            .orElseThrow(() -> new RuntimeException("Review cycle not found"));

        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        Employee reviewer = employeeRepository.findById(reviewerId)
            .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        // Check if review already exists for this combination
        if (performanceReviewRepository.existsByReviewCycleAndEmployeeAndReviewType(cycle, employee, reviewType)) {
            throw new RuntimeException("Review already exists for this employee and review type in this cycle");
        }

        PerformanceReview review = new PerformanceReview(cycle, employee, reviewer, reviewType);
        return performanceReviewRepository.save(review);
    }

    /**
     * Update performance review content
     */
    public PerformanceReview updatePerformanceReview(Long reviewId, Integer overallRating, String strengths,
                                                    String areasForImprovement, String achievements, 
                                                    String goalsNextPeriod) {
        PerformanceReview review = performanceReviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Performance review not found"));

        if (review.getStatus() == PerformanceReview.ReviewStatus.SUBMITTED ||
            review.getStatus() == PerformanceReview.ReviewStatus.ACKNOWLEDGED) {
            throw new RuntimeException("Cannot update submitted or acknowledged review");
        }

        review.setOverallRating(overallRating != null ? BigDecimal.valueOf(overallRating) : null);
        review.setStrengths(strengths);
        review.setAreasForImprovement(areasForImprovement);
        review.setAchievements(achievements);
        review.setGoalsNextPeriod(goalsNextPeriod);
        review.setStatus(PerformanceReview.ReviewStatus.IN_PROGRESS);

        return performanceReviewRepository.save(review);
    }

    /**
     * Submit a performance review
     */
    public PerformanceReview submitPerformanceReview(Long reviewId) {
        PerformanceReview review = performanceReviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Performance review not found"));

        if (review.getStatus() == PerformanceReview.ReviewStatus.SUBMITTED ||
            review.getStatus() == PerformanceReview.ReviewStatus.ACKNOWLEDGED) {
            throw new RuntimeException("Review is already submitted");
        }

        review.setStatus(PerformanceReview.ReviewStatus.SUBMITTED);
        review.setSubmittedAt(LocalDateTime.ofInstant(Instant.now(), java.time.ZoneId.systemDefault()));

        return performanceReviewRepository.save(review);
    }

    /**
     * Acknowledge a performance review
     */
    public PerformanceReview acknowledgePerformanceReview(Long reviewId) {
        PerformanceReview review = performanceReviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Performance review not found"));

        if (review.getStatus() != PerformanceReview.ReviewStatus.SUBMITTED) {
            throw new RuntimeException("Only submitted reviews can be acknowledged");
        }

        review.setStatus(PerformanceReview.ReviewStatus.ACKNOWLEDGED);
        review.setAcknowledgedAt(LocalDateTime.ofInstant(Instant.now(), java.time.ZoneId.systemDefault()));

        return performanceReviewRepository.save(review);
    }

    /**
     * Get performance reviews for an employee
     */
    @Transactional(readOnly = true)
    public Page<PerformanceReview> getEmployeeReviews(Long employeeId, PaginationRequest paginationRequest) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        Pageable pageable = PageRequest.of(
            paginationRequest.getPage(),
            paginationRequest.getSize(),
            Sort.by(Sort.Direction.fromString(paginationRequest.getSortDirection()), paginationRequest.getSortBy())
        );

        return performanceReviewRepository.findByEmployee(employee, pageable);
    }

    /**
     * Get performance reviews for a reviewer
     */
    @Transactional(readOnly = true)
    public Page<PerformanceReview> getReviewerReviews(Long reviewerId, PaginationRequest paginationRequest) {
        Employee reviewer = employeeRepository.findById(reviewerId)
            .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        Pageable pageable = PageRequest.of(
            paginationRequest.getPage(),
            paginationRequest.getSize(),
            Sort.by(Sort.Direction.fromString(paginationRequest.getSortDirection()), paginationRequest.getSortBy())
        );

        return performanceReviewRepository.findByReviewer(reviewer, pageable);
    }

    /**
     * Get pending reviews for an employee
     */
    @Transactional(readOnly = true)
    public List<PerformanceReview> getPendingReviewsForEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        return performanceReviewRepository.findPendingByEmployee(employee);
    }

    /**
     * Get pending reviews for a reviewer
     */
    @Transactional(readOnly = true)
    public List<PerformanceReview> getPendingReviewsForReviewer(Long reviewerId) {
        Employee reviewer = employeeRepository.findById(reviewerId)
            .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        return performanceReviewRepository.findPendingByReviewer(reviewer);
    }

    // ===== GOAL MANAGEMENT =====

    /**
     * Create a goal
     */
    public Goal createGoal(Long employeeId, String title, String description, Goal.GoalType goalType,
                          Goal.GoalCategory category, LocalDate startDate, LocalDate targetDate,
                          Integer weight, String measurementCriteria, Long createdByEmployeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        Employee createdByEmployee = null;
        if (createdByEmployeeId != null) {
            createdByEmployee = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new RuntimeException("Creator employee not found"));
        }

        // Validate dates
        if (targetDate != null && startDate != null && targetDate.isBefore(startDate)) {
            throw new RuntimeException("Target date cannot be before start date");
        }

        Goal goal = new Goal(employee, title, goalType, category);
        goal.setDescription(description);
        goal.setStartDate(startDate);
        goal.setTargetDate(targetDate);
        goal.setWeight(weight != null ? BigDecimal.valueOf(weight) : null);
        goal.setMeasurementCriteria(measurementCriteria);
        goal.setCreatedByEmployee(createdByEmployee);

        return goalRepository.save(goal);
    }

    /**
     * Update goal progress
     */
    public Goal updateGoalProgress(Long goalId, Integer progressPercentage, Goal.GoalStatus status) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (progressPercentage < 0 || progressPercentage > 100) {
            throw new RuntimeException("Progress percentage must be between 0 and 100");
        }

        goal.setProgressPercentage(progressPercentage);
        goal.setStatus(status);

        // Set completion date if goal is completed
        if (status == Goal.GoalStatus.COMPLETED && goal.getCompletionDate() == null) {
            goal.setCompletionDate(LocalDate.now());
        }

        return goalRepository.save(goal);
    }

    /**
     * Update goal details
     */
    public Goal updateGoal(Long goalId, String title, String description, Goal.GoalType goalType,
                          Goal.GoalCategory category, LocalDate startDate, LocalDate targetDate,
                          Integer weight, String measurementCriteria) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new RuntimeException("Goal not found"));

        // Validate dates
        if (targetDate != null && startDate != null && targetDate.isBefore(startDate)) {
            throw new RuntimeException("Target date cannot be before start date");
        }

        goal.setTitle(title);
        goal.setDescription(description);
        goal.setGoalType(goalType);
        goal.setCategory(category);
        goal.setStartDate(startDate);
        goal.setTargetDate(targetDate);
        goal.setWeight(weight != null ? BigDecimal.valueOf(weight) : null);
        goal.setMeasurementCriteria(measurementCriteria);

        return goalRepository.save(goal);
    }

    /**
     * Get goals for an employee
     */
    @Transactional(readOnly = true)
    public Page<Goal> getEmployeeGoals(Long employeeId, PaginationRequest paginationRequest) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        Pageable pageable = PageRequest.of(
            paginationRequest.getPage(),
            paginationRequest.getSize(),
            Sort.by(Sort.Direction.fromString(paginationRequest.getSortDirection()), paginationRequest.getSortBy())
        );

        return goalRepository.findByEmployee(employee, pageable);
    }

    /**
     * Search performance reviews with pagination — mapped inside transaction to avoid lazy proxy issues.
     */
    @Transactional(readOnly = true)
    public Page<PerformanceReviewResponse> getPerformanceReviews(Long reviewCycleId, Long employeeId, Long reviewerId,
                                                         PerformanceReview.ReviewType reviewType,
                                                         PerformanceReview.ReviewStatus status,
                                                         PaginationRequest paginationRequest) {
        PerformanceReviewCycle reviewCycle = reviewCycleId != null
            ? reviewCycleRepository.findById(reviewCycleId)
                .orElseThrow(() -> new RuntimeException("Review cycle not found"))
            : null;
        Employee employee = employeeId != null
            ? employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"))
            : null;
        Employee reviewer = reviewerId != null
            ? employeeRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"))
            : null;

        Pageable pageable = PageRequest.of(
            paginationRequest.getPage(),
            paginationRequest.getSize(),
            Sort.by(Sort.Direction.fromString(paginationRequest.getSortDirection()), paginationRequest.getSortBy())
        );

        // Map inside transaction so lazy proxies are still accessible
        return performanceReviewRepository.findBySearchCriteria(
            reviewCycle, employee, reviewer, reviewType, status, null, null, pageable
        ).map(performanceMapper::toResponse);
    }

    /**
     * Search goals with pagination — mapped inside transaction to avoid lazy proxy issues.
     */
    @Transactional(readOnly = true)
    public Page<GoalResponse> getGoals(Long employeeId, String search, Goal.GoalType goalType,
                               Goal.GoalCategory category, Goal.GoalStatus status,
                               LocalDate startDate, LocalDate endDate,
                               PaginationRequest paginationRequest) {
        Employee employee = employeeId != null
            ? employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"))
            : null;

        Pageable pageable = PageRequest.of(
            paginationRequest.getPage(),
            paginationRequest.getSize(),
            Sort.by(Sort.Direction.fromString(paginationRequest.getSortDirection()), paginationRequest.getSortBy())
        );

        // Map inside transaction so lazy proxies are still accessible
        return goalRepository.findBySearchCriteria(
            employee, search, goalType, category, status, null, null, startDate, endDate, pageable
        ).map(performanceMapper::toResponse);
    }

    /**
     * Get active goals for an employee
     */
    @Transactional(readOnly = true)
    public List<Goal> getActiveGoalsForEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        return goalRepository.findActiveByEmployee(employee);
    }

    /**
     * Get overdue goals for an employee
     */
    @Transactional(readOnly = true)
    public List<Goal> getOverdueGoalsForEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        return goalRepository.findOverdueByEmployee(employee);
    }

    /**
     * Get goals due soon for an employee
     */
    @Transactional(readOnly = true)
    public List<Goal> getGoalsDueSoonForEmployee(Long employeeId, LocalDate dueDate) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        return goalRepository.findDueSoonByEmployee(employee, dueDate);
    }

    /**
     * Delete a goal
     */
    public void deleteGoal(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new RuntimeException("Goal not found"));

        goalRepository.delete(goal);
    }

    /**
     * Get goal by ID
     */
    @Transactional(readOnly = true)
    public Goal getGoal(Long goalId) {
        return goalRepository.findById(goalId)
            .orElseThrow(() -> new RuntimeException("Goal not found"));
    }

    /**
     * Get performance review by ID
     */
    @Transactional(readOnly = true)
    public PerformanceReview getPerformanceReview(Long reviewId) {
        return performanceReviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Performance review not found"));
    }

    // ===== SECURITY HELPER METHODS FOR @PreAuthorize =====

    public boolean isReviewOwner(Long reviewId, String username) {
        try {
            PerformanceReview review = performanceReviewRepository.findById(reviewId).orElse(null);
            if (review == null) return false;
            Employee reviewer = review.getReviewer();
            return reviewer != null && reviewer.getUser() != null &&
                   username.equals(reviewer.getUser().getUsername());
        } catch (Exception e) { return false; }
    }

    public boolean isGoalOwner(Long goalId, String username) {
        try {
            Goal goal = goalRepository.findById(goalId).orElse(null);
            if (goal == null) return false;
            Employee employee = goal.getEmployee();
            return employee != null && employee.getUser() != null &&
                   username.equals(employee.getUser().getUsername());
        } catch (Exception e) { return false; }
    }
}

