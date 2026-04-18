package com.talentx.hrms.service.benefits;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.benefits.BenefitPlan;
import com.talentx.hrms.entity.benefits.EmployeeBenefit;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.BenefitPlanType;
import com.talentx.hrms.entity.enums.BenefitStatus;
import com.talentx.hrms.entity.enums.CoverageLevel;
import com.talentx.hrms.repository.BenefitPlanRepository;
import com.talentx.hrms.repository.EmployeeBenefitRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.OrganizationRepository;
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
public class BenefitService {

    private final BenefitPlanRepository benefitPlanRepository;
    private final EmployeeBenefitRepository employeeBenefitRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthService authService;

    @Autowired
    public BenefitService(BenefitPlanRepository benefitPlanRepository,
                         EmployeeBenefitRepository employeeBenefitRepository,
                         EmployeeRepository employeeRepository,
                         OrganizationRepository organizationRepository,
                         AuthService authService) {
        this.benefitPlanRepository = benefitPlanRepository;
        this.employeeBenefitRepository = employeeBenefitRepository;
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.authService = authService;
    }

    // ===== BENEFIT PLAN MANAGEMENT =====

    /**
     * Create a new benefit plan
     */
    public BenefitPlan createBenefitPlan(String name, BenefitPlanType planType, String description,
                                        String provider, BigDecimal employeeCost, BigDecimal employerCost,
                                        String costFrequency, LocalDate effectiveDate, LocalDate expiryDate) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Check if benefit plan name already exists
        if (benefitPlanRepository.existsByNameAndOrganization(name, organization)) {
            throw new RuntimeException("Benefit plan with this name already exists in organization");
        }

        BenefitPlan benefitPlan = new BenefitPlan();
        benefitPlan.setName(name);
        // Convert external enum to entity's inner enum
        if (planType != null) {
            benefitPlan.setPlanType(BenefitPlan.BenefitPlanType.valueOf(planType.name()));
        }
        benefitPlan.setDescription(description);
        benefitPlan.setProviderName(provider);
        benefitPlan.setEmployeeCost(employeeCost);
        benefitPlan.setEmployerCost(employerCost);
        // Note: costFrequency field doesn't exist in entity, removing this line
        benefitPlan.setEffectiveDate(effectiveDate);
        benefitPlan.setExpirationDate(expiryDate);
        // Note: setActive method doesn't exist, using isActive field instead
        benefitPlan.setOrganization(organization);

        return benefitPlanRepository.save(benefitPlan);
    }

    /**
     * Update an existing benefit plan
     */
    public BenefitPlan updateBenefitPlan(Long id, String name, BenefitPlanType planType, String description,
                                        String provider, BigDecimal employeeCost, BigDecimal employerCost,
                                        String costFrequency, LocalDate effectiveDate, LocalDate expiryDate,
                                        Boolean isActive) {
        BenefitPlan benefitPlan = benefitPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Benefit plan not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the benefit plan belongs to the current organization
        if (!benefitPlan.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Benefit plan does not belong to your organization");
        }

        // Check if name already exists (excluding current plan)
        Optional<BenefitPlan> existingByName = benefitPlanRepository
            .findByNameAndOrganization(name, organization);
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            throw new RuntimeException("Benefit plan with this name already exists in organization");
        }

        benefitPlan.setName(name);
        // Convert external enum to entity's inner enum
        if (planType != null) {
            benefitPlan.setPlanType(BenefitPlan.BenefitPlanType.valueOf(planType.name()));
        }
        benefitPlan.setDescription(description);
        benefitPlan.setProviderName(provider);
        benefitPlan.setEmployeeCost(employeeCost);
        benefitPlan.setEmployerCost(employerCost);
        // Note: costFrequency field doesn't exist in entity, removing this line
        benefitPlan.setEffectiveDate(effectiveDate);
        benefitPlan.setExpirationDate(expiryDate);
        // Note: setActive method doesn't exist, removing this section

        return benefitPlanRepository.save(benefitPlan);
    }

    /**
     * Get benefit plan by ID
     */
    @Transactional(readOnly = true)
    public BenefitPlan getBenefitPlan(Long id) {
        BenefitPlan benefitPlan = benefitPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Benefit plan not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the benefit plan belongs to the current organization
        if (!benefitPlan.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Benefit plan does not belong to your organization");
        }

        return benefitPlan;
    }

    /**
     * Get all benefit plans with pagination
     */
    @Transactional(readOnly = true)
    public Page<BenefitPlan> getBenefitPlans(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return benefitPlanRepository.findByOrganization(organization, pageable);
    }

    /**
     * Get active benefit plans
     */
    @Transactional(readOnly = true)
    public List<BenefitPlan> getActiveBenefitPlans() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return benefitPlanRepository.findActiveByOrganization(organization);
    }

    /**
     * Search benefit plans with comprehensive criteria
     */
    @Transactional(readOnly = true)
    public Page<BenefitPlan> searchBenefitPlans(String name, BenefitPlanType planType, String provider,
                                               Boolean isActive, PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return benefitPlanRepository.findBySearchCriteria(
            organization, name, planType, provider, isActive, pageable
        );
    }

    /**
     * Get benefit plans by type
     */
    @Transactional(readOnly = true)
    public List<BenefitPlan> getBenefitPlansByType(BenefitPlanType planType) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return benefitPlanRepository.findByOrganizationAndPlanType(organization, planType);
    }

    /**
     * Get benefit plans expiring soon
     */
    @Transactional(readOnly = true)
    public List<BenefitPlan> getBenefitPlansExpiringSoon(int daysAhead) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        LocalDate endDate = LocalDate.now().plusDays(daysAhead);
        return benefitPlanRepository.findByOrganizationWithUpcomingExpiry(organization, endDate);
    }

    /**
     * Delete benefit plan
     */
    public void deleteBenefitPlan(Long id) {
        BenefitPlan benefitPlan = benefitPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Benefit plan not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the benefit plan belongs to the current organization
        if (!benefitPlan.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Benefit plan does not belong to your organization");
        }

        // Check if there are active enrollments
        long activeEnrollments = employeeBenefitRepository.countByBenefitPlanAndStatus(benefitPlan, BenefitStatus.ACTIVE);
        if (activeEnrollments > 0) {
            throw new RuntimeException("Cannot delete benefit plan with active enrollments");
        }

        benefitPlanRepository.delete(benefitPlan);
    }

    // ===== EMPLOYEE BENEFIT ENROLLMENT =====

    /**
     * Enroll employee in benefit plan
     */
    public EmployeeBenefit enrollEmployee(Long employeeId, Long benefitPlanId, LocalDate enrollmentDate,
                                         LocalDate effectiveDate, CoverageLevel coverageLevel, String beneficiaries) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        BenefitPlan benefitPlan = benefitPlanRepository.findById(benefitPlanId)
            .orElseThrow(() -> new RuntimeException("Benefit plan not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify both employee and benefit plan belong to the current organization
        if (!employee.getOrganization().getId().equals(organization.getId()) ||
            !benefitPlan.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee or benefit plan does not belong to your organization");
        }

        // Check if employee is already enrolled in this benefit plan
        if (employeeBenefitRepository.existsActiveByEmployeeAndBenefitPlan(employee, benefitPlan)) {
            throw new RuntimeException("Employee is already actively enrolled in this benefit plan");
        }

        // Check if benefit plan is active and effective
        if (!benefitPlan.isActive()) {
            throw new RuntimeException("Cannot enroll in inactive benefit plan");
        }

        LocalDate today = LocalDate.now();
        if (benefitPlan.getEffectiveDate() != null && benefitPlan.getEffectiveDate().isAfter(today)) {
            throw new RuntimeException("Benefit plan is not yet effective");
        }

        if (benefitPlan.getExpirationDate() != null && benefitPlan.getExpirationDate().isBefore(today)) {
            throw new RuntimeException("Benefit plan has expired");
        }

        EmployeeBenefit employeeBenefit = new EmployeeBenefit();
        employeeBenefit.setEmployee(employee);
        employeeBenefit.setBenefitPlan(benefitPlan);
        employeeBenefit.setEnrollmentDate(enrollmentDate != null ? enrollmentDate : today);
        employeeBenefit.setEffectiveDate(effectiveDate != null ? effectiveDate : today);
        // Convert external enum to entity's inner enum
        if (coverageLevel != null) {
            employeeBenefit.setCoverageLevel(EmployeeBenefit.CoverageLevel.valueOf(coverageLevel.name()));
        } else {
            employeeBenefit.setCoverageLevel(EmployeeBenefit.CoverageLevel.EMPLOYEE_ONLY);
        }
        employeeBenefit.setIsActive(true);
        // Note: setBeneficiaries method doesn't exist, using individual beneficiary fields
        if (beneficiaries != null && !beneficiaries.isEmpty()) {
            // Assuming beneficiaries is a JSON string or similar, store in notes for now
            employeeBenefit.setNotes("Beneficiaries: " + beneficiaries);
        }

        return employeeBenefitRepository.save(employeeBenefit);
    }

    /**
     * Update employee benefit enrollment
     */
    public EmployeeBenefit updateEmployeeBenefit(Long id, CoverageLevel coverageLevel, String beneficiaries) {
        EmployeeBenefit employeeBenefit = employeeBenefitRepository.findByIdWithFullDetails(id)
            .orElseThrow(() -> new RuntimeException("Employee benefit not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the employee benefit belongs to the current organization
        if (!employeeBenefit.getEmployee().getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee benefit does not belong to your organization");
        }

        if (coverageLevel != null) {
            // Convert external enum to entity's inner enum
            employeeBenefit.setCoverageLevel(EmployeeBenefit.CoverageLevel.valueOf(coverageLevel.name()));
        }
        if (beneficiaries != null) {
            // Note: setBeneficiaries method doesn't exist, using notes field
            employeeBenefit.setNotes("Beneficiaries: " + beneficiaries);
        }

        return employeeBenefitRepository.save(employeeBenefit);
    }

    /**
     * Get employee benefit enrollment by ID.
     */
    @Transactional(readOnly = true)
    public EmployeeBenefit getEmployeeBenefit(Long id) {
        EmployeeBenefit employeeBenefit = employeeBenefitRepository.findByIdWithFullDetails(id)
            .orElseThrow(() -> new RuntimeException("Employee benefit not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        if (!employeeBenefit.getEmployee().getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee benefit does not belong to your organization");
        }

        return employeeBenefit;
    }

    /**
     * Terminate employee benefit enrollment
     */
    public EmployeeBenefit terminateEmployeeBenefit(Long id, LocalDate terminationDate, String terminationReason) {
        EmployeeBenefit employeeBenefit = employeeBenefitRepository.findByIdWithFullDetails(id)
            .orElseThrow(() -> new RuntimeException("Employee benefit not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the employee benefit belongs to the current organization
        if (!employeeBenefit.getEmployee().getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee benefit does not belong to your organization");
        }

        if (!employeeBenefit.getIsActive()) {
            throw new RuntimeException("Employee benefit is already terminated");
        }

        employeeBenefit.setIsActive(false);
        employeeBenefit.setTerminationDate(terminationDate != null ? terminationDate : LocalDate.now());
        // Note: setTerminationReason method doesn't exist, using notes field
        if (terminationReason != null) {
            String existingNotes = employeeBenefit.getNotes();
            employeeBenefit.setNotes((existingNotes != null ? existingNotes + "; " : "") + "Termination reason: " + terminationReason);
        }

        return employeeBenefitRepository.save(employeeBenefit);
    }

    /**
     * Delete employee benefit enrollment.
     */
    public void deleteEmployeeBenefit(Long id) {
        EmployeeBenefit employeeBenefit = employeeBenefitRepository.findByIdWithFullDetails(id)
            .orElseThrow(() -> new RuntimeException("Employee benefit not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        if (!employeeBenefit.getEmployee().getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee benefit does not belong to your organization");
        }

        employeeBenefitRepository.delete(employeeBenefit);
    }

    /**
     * Get employee benefits
     */
    @Transactional(readOnly = true)
    public List<EmployeeBenefit> getEmployeeBenefits(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the employee belongs to the current organization
        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        return employeeBenefitRepository.findByEmployee(employee);
    }

    /**
     * Get active employee benefits
     */
    @Transactional(readOnly = true)
    public List<EmployeeBenefit> getActiveEmployeeBenefits(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the employee belongs to the current organization
        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        return employeeBenefitRepository.findByEmployeeAndStatus(employee, BenefitStatus.ACTIVE);
    }

    /**
     * Get all employee benefits with pagination
     */
    @Transactional(readOnly = true)
    public Page<EmployeeBenefit> getAllEmployeeBenefits(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return employeeBenefitRepository.findByOrganization(organization, pageable);
    }

    /**
     * Search employee benefits with comprehensive criteria
     */
    @Transactional(readOnly = true)
    public Page<EmployeeBenefit> searchEmployeeBenefits(Long employeeId, Long benefitPlanId, BenefitStatus status,
                                                       CoverageLevel coverageLevel, BenefitPlanType planType,
                                                       PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId).orElse(null);
        }

        BenefitPlan benefitPlan = null;
        if (benefitPlanId != null) {
            benefitPlan = benefitPlanRepository.findById(benefitPlanId).orElse(null);
        }

        Pageable pageable = createPageable(paginationRequest);
        return employeeBenefitRepository.findBySearchCriteria(
            organization, employee, benefitPlan, status, coverageLevel, planType, pageable
        );
    }

    // ===== BENEFIT COST CALCULATIONS =====

    /**
     * Calculate total benefit cost for an employee
     */
    @Transactional(readOnly = true)
    public BenefitCostSummary calculateEmployeeBenefitCosts(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Verify the employee belongs to the current organization
        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        List<EmployeeBenefit> activeBenefits = employeeBenefitRepository
            .findByEmployeeAndStatus(employee, BenefitStatus.ACTIVE);

        BigDecimal totalEmployeeCost = BigDecimal.ZERO;
        BigDecimal totalEmployerCost = BigDecimal.ZERO;

        for (EmployeeBenefit benefit : activeBenefits) {
            BenefitPlan plan = benefit.getBenefitPlan();
            
            // Calculate costs based on coverage level
            // Convert entity's inner enum to external enum for calculation
            CoverageLevel externalCoverageLevel = benefit.getCoverageLevel() != null ? 
                CoverageLevel.valueOf(benefit.getCoverageLevel().name()) : CoverageLevel.EMPLOYEE_ONLY;
            BigDecimal employeeCost = calculateCostByCoverage(plan.getEmployeeCost(), externalCoverageLevel);
            BigDecimal employerCost = calculateCostByCoverage(plan.getEmployerCost(), externalCoverageLevel);

            totalEmployeeCost = totalEmployeeCost.add(employeeCost != null ? employeeCost : BigDecimal.ZERO);
            totalEmployerCost = totalEmployerCost.add(employerCost != null ? employerCost : BigDecimal.ZERO);
        }

        return new BenefitCostSummary(totalEmployeeCost, totalEmployerCost, activeBenefits.size());
    }

    /**
     * Calculate cost based on coverage level
     */
    private BigDecimal calculateCostByCoverage(BigDecimal baseCost, CoverageLevel coverageLevel) {
        if (baseCost == null) {
            return BigDecimal.ZERO;
        }

        // Apply multipliers based on coverage level
        switch (coverageLevel) {
            case EMPLOYEE_ONLY:
                return baseCost;
            case EMPLOYEE_SPOUSE:
                return baseCost.multiply(BigDecimal.valueOf(1.5));
            case EMPLOYEE_CHILDREN:
                return baseCost.multiply(BigDecimal.valueOf(1.3));
            case FAMILY:
                return baseCost.multiply(BigDecimal.valueOf(2.0));
            default:
                return baseCost;
        }
    }

    /**
     * Get benefit statistics
     */
    @Transactional(readOnly = true)
    public BenefitStatistics getBenefitStatistics() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        long totalPlans = benefitPlanRepository.countByOrganization(organization);
        long activePlans = benefitPlanRepository.countByOrganizationAndIsActive(organization, true);
        long totalEnrollments = employeeBenefitRepository.countByOrganization(organization);
        long activeEnrollments = employeeBenefitRepository.findActiveByOrganization(organization).size();

        return new BenefitStatistics(totalPlans, activePlans, totalEnrollments, activeEnrollments);
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
     * Benefit cost summary
     */
    public static class BenefitCostSummary {
        private final BigDecimal totalEmployeeCost;
        private final BigDecimal totalEmployerCost;
        private final int activeBenefitCount;

        public BenefitCostSummary(BigDecimal totalEmployeeCost, BigDecimal totalEmployerCost, int activeBenefitCount) {
            this.totalEmployeeCost = totalEmployeeCost;
            this.totalEmployerCost = totalEmployerCost;
            this.activeBenefitCount = activeBenefitCount;
        }

        public BigDecimal getTotalEmployeeCost() { return totalEmployeeCost; }
        public BigDecimal getTotalEmployerCost() { return totalEmployerCost; }
        public BigDecimal getTotalCost() { return totalEmployeeCost.add(totalEmployerCost); }
        public int getActiveBenefitCount() { return activeBenefitCount; }
    }

    /**
     * Benefit statistics
     */
    public static class BenefitStatistics {
        private final long totalPlans;
        private final long activePlans;
        private final long totalEnrollments;
        private final long activeEnrollments;

        public BenefitStatistics(long totalPlans, long activePlans, long totalEnrollments, long activeEnrollments) {
            this.totalPlans = totalPlans;
            this.activePlans = activePlans;
            this.totalEnrollments = totalEnrollments;
            this.activeEnrollments = activeEnrollments;
        }

        public long getTotalPlans() { return totalPlans; }
        public long getActivePlans() { return activePlans; }
        public long getTotalEnrollments() { return totalEnrollments; }
        public long getActiveEnrollments() { return activeEnrollments; }
    }
}

