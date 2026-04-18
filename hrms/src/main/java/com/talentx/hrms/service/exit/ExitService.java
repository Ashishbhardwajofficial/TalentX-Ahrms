package com.talentx.hrms.service.exit;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.ExitStatus;
import com.talentx.hrms.entity.exit.EmployeeExit;
import com.talentx.hrms.repository.EmployeeExitRepository;
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

import java.time.LocalDate;
import java.util.List;

/**
 * Service class for managing employee exits
 */
@Service
@Transactional
public class ExitService {

    private final EmployeeExitRepository employeeExitRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthService authService;

    @Autowired
    public ExitService(EmployeeExitRepository employeeExitRepository,
                      EmployeeRepository employeeRepository,
                      OrganizationRepository organizationRepository,
                      AuthService authService) {
        this.employeeExitRepository = employeeExitRepository;
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.authService = authService;
    }

    /**
     * Initiate employee exit
     */
    public EmployeeExit initiateExit(Long employeeId, LocalDate resignationDate, 
                                    LocalDate lastWorkingDay, String exitReason, String notes) {
        // Validate employee
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Get current user's organization
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Validate that employee belongs to the same organization
        if (!employee.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Employee does not belong to your organization");
        }

        // Check if employee already has an active exit
        if (employeeExitRepository.hasEmployeeActiveExit(employee)) {
            throw new RuntimeException("Employee already has an active exit process");
        }

        // Validate dates
        if (resignationDate != null && lastWorkingDay != null && lastWorkingDay.isBefore(resignationDate)) {
            throw new RuntimeException("Last working day cannot be before resignation date");
        }

        // Create exit record
        EmployeeExit exit = new EmployeeExit(employee, ExitStatus.INITIATED);
        exit.setResignationDate(resignationDate);
        exit.setLastWorkingDay(lastWorkingDay);
        exit.setExitReason(exitReason);
        exit.setNotes(notes);

        return employeeExitRepository.save(exit);
    }

    /**
     * Get exit by ID
     */
    @Transactional(readOnly = true)
    public EmployeeExit getExit(Long id) {
        EmployeeExit exit = employeeExitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exit record not found"));

        // Verify access - user can only access exits from their organization
        User currentUser = authService.getCurrentUser();
        if (!exit.getEmployee().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return exit;
    }

    /**
     * Get exit by employee
     */
    @Transactional(readOnly = true)
    public EmployeeExit getExitByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!employee.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        return employeeExitRepository.findMostRecentByEmployee(employee)
            .orElseThrow(() -> new RuntimeException("No exit record found for employee"));
    }

    /**
     * Get all exits with pagination
     */
    @Transactional(readOnly = true)
    public Page<EmployeeExit> getExits(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return employeeExitRepository.findByOrganization(organization, pageable);
    }

    /**
     * Get exits by status
     */
    @Transactional(readOnly = true)
    public Page<EmployeeExit> getExitsByStatus(ExitStatus status, PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return employeeExitRepository.findByOrganizationAndStatus(organization, status, pageable);
    }

    /**
     * Get pending exits (initiated status)
     */
    @Transactional(readOnly = true)
    public Page<EmployeeExit> getPendingExits(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return employeeExitRepository.findPendingByOrganization(organization, pageable);
    }

    /**
     * Get active exits (initiated or approved)
     */
    @Transactional(readOnly = true)
    public Page<EmployeeExit> getActiveExits(PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        return employeeExitRepository.findActiveByOrganization(organization, pageable);
    }

    /**
     * Get pending exits for a specific manager
     */
    @Transactional(readOnly = true)
    public Page<EmployeeExit> getPendingExitsForManager(Long managerId, PaginationRequest paginationRequest) {
        Employee manager = employeeRepository.findById(managerId)
            .orElseThrow(() -> new RuntimeException("Manager not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!manager.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        Pageable pageable = createPageable(paginationRequest);
        return employeeExitRepository.findPendingForApproval(manager.getOrganization(), manager, pageable);
    }

    /**
     * Get exits with upcoming last working day
     */
    @Transactional(readOnly = true)
    public List<EmployeeExit> getExitsWithUpcomingLastWorkingDay(int daysAhead) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        LocalDate endDate = LocalDate.now().plusDays(daysAhead);
        return employeeExitRepository.findWithUpcomingLastWorkingDay(organization, endDate);
    }

    /**
     * Search exits with comprehensive criteria
     */
    @Transactional(readOnly = true)
    public Page<EmployeeExit> searchExits(Long employeeId, ExitStatus status, LocalDate startDate, 
                                         LocalDate endDate, Long approverId, PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            // Verify employee belongs to same organization
            if (!employee.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Employee does not belong to your organization");
            }
        }

        Employee approver = null;
        if (approverId != null) {
            approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));
            
            // Verify approver belongs to same organization
            if (!approver.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Approver does not belong to your organization");
            }
        }

        Pageable pageable = createPageable(paginationRequest);
        return employeeExitRepository.findBySearchCriteria(organization, employee, status, 
                startDate, endDate, approver, pageable);
    }

    /**
     * Approve exit
     */
    public EmployeeExit approveExit(Long exitId, Long approverId) {
        EmployeeExit exit = employeeExitRepository.findById(exitId)
            .orElseThrow(() -> new RuntimeException("Exit record not found"));

        Employee approver = employeeRepository.findById(approverId)
            .orElseThrow(() -> new RuntimeException("Approver not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!exit.getEmployee().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Validate exit can be approved
        if (!exit.canBeApproved()) {
            throw new RuntimeException("Exit cannot be approved in current status: " + exit.getStatus());
        }

        // Validate approver authority (manager or department manager)
        if (!canApproveExit(approver, exit.getEmployee())) {
            throw new RuntimeException("Approver does not have authority to approve this exit");
        }

        exit.setStatus(ExitStatus.APPROVED);
        exit.setApprovedBy(approver);
        exit.setApprovedAt(LocalDate.now());

        return employeeExitRepository.save(exit);
    }

    /**
     * Withdraw exit
     */
    public EmployeeExit withdrawExit(Long exitId, String withdrawalReason) {
        EmployeeExit exit = employeeExitRepository.findById(exitId)
            .orElseThrow(() -> new RuntimeException("Exit record not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!exit.getEmployee().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Validate exit can be withdrawn
        if (!exit.canBeWithdrawn()) {
            throw new RuntimeException("Exit cannot be withdrawn in current status: " + exit.getStatus());
        }

        exit.setStatus(ExitStatus.WITHDRAWN);
        if (withdrawalReason != null) {
            exit.setNotes(exit.getNotes() != null ? 
                exit.getNotes() + "\nWithdrawal reason: " + withdrawalReason : 
                "Withdrawal reason: " + withdrawalReason);
        }

        return employeeExitRepository.save(exit);
    }

    /**
     * Complete exit
     */
    public EmployeeExit completeExit(Long exitId) {
        EmployeeExit exit = employeeExitRepository.findById(exitId)
            .orElseThrow(() -> new RuntimeException("Exit record not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!exit.getEmployee().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Validate exit can be completed
        if (!exit.canBeCompleted()) {
            throw new RuntimeException("Exit cannot be completed in current status: " + exit.getStatus());
        }

        // Validate last working day has passed
        if (exit.getLastWorkingDay() != null && exit.getLastWorkingDay().isAfter(LocalDate.now())) {
            throw new RuntimeException("Cannot complete exit before last working day");
        }

        exit.setStatus(ExitStatus.COMPLETED);

        // Update employee status to terminated
        Employee employee = exit.getEmployee();
        LocalDate terminationDate = exit.getLastWorkingDay() != null ? 
            exit.getLastWorkingDay() : LocalDate.now();
        employee.setTerminationDate(java.sql.Date.valueOf(terminationDate));
        employeeRepository.save(employee);

        return employeeExitRepository.save(exit);
    }

    /**
     * Update exit details (only for initiated exits)
     */
    public EmployeeExit updateExit(Long exitId, LocalDate resignationDate, LocalDate lastWorkingDay, 
                                  String exitReason, String notes) {
        EmployeeExit exit = employeeExitRepository.findById(exitId)
            .orElseThrow(() -> new RuntimeException("Exit record not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!exit.getEmployee().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Only initiated exits can be updated
        if (exit.getStatus() != ExitStatus.INITIATED) {
            throw new RuntimeException("Only initiated exits can be updated");
        }

        // Validate dates
        if (resignationDate != null && lastWorkingDay != null && lastWorkingDay.isBefore(resignationDate)) {
            throw new RuntimeException("Last working day cannot be before resignation date");
        }

        // Update fields
        if (resignationDate != null) {
            exit.setResignationDate(resignationDate);
        }
        if (lastWorkingDay != null) {
            exit.setLastWorkingDay(lastWorkingDay);
        }
        if (exitReason != null) {
            exit.setExitReason(exitReason);
        }
        if (notes != null) {
            exit.setNotes(notes);
        }

        return employeeExitRepository.save(exit);
    }

    /**
     * Delete exit (only initiated exits)
     */
    public void deleteExit(Long exitId) {
        EmployeeExit exit = employeeExitRepository.findById(exitId)
            .orElseThrow(() -> new RuntimeException("Exit record not found"));

        // Verify access
        User currentUser = authService.getCurrentUser();
        if (!exit.getEmployee().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new RuntimeException("Access denied");
        }

        // Only initiated exits can be deleted
        if (exit.getStatus() != ExitStatus.INITIATED) {
            throw new RuntimeException("Only initiated exits can be deleted");
        }

        employeeExitRepository.delete(exit);
    }

    /**
     * Get exit statistics
     */
    @Transactional(readOnly = true)
    public ExitStatistics getExitStatistics() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        long totalExits = employeeExitRepository.countByOrganization(organization);
        long initiatedExits = employeeExitRepository.countByOrganizationAndStatus(organization, ExitStatus.INITIATED);
        long approvedExits = employeeExitRepository.countByOrganizationAndStatus(organization, ExitStatus.APPROVED);
        long withdrawnExits = employeeExitRepository.countByOrganizationAndStatus(organization, ExitStatus.WITHDRAWN);
        long completedExits = employeeExitRepository.countByOrganizationAndStatus(organization, ExitStatus.COMPLETED);

        return new ExitStatistics(totalExits, initiatedExits, approvedExits, withdrawnExits, completedExits);
    }

    /**
     * Get exits by month and year
     */
    @Transactional(readOnly = true)
    public List<EmployeeExit> getExitsByMonthYear(int year, int month) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return employeeExitRepository.findByOrganizationAndMonthYear(organization, year, month);
    }

    /**
     * Get overdue exits (approved but not completed after last working day)
     */
    @Transactional(readOnly = true)
    public List<EmployeeExit> getOverdueExits() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        return employeeExitRepository.findOverdueExits(organization);
    }

    /**
     * Check if approver can approve exit for employee
     */
    private boolean canApproveExit(Employee approver, Employee employee) {
        // Direct manager can approve
        if (employee.getManager() != null && employee.getManager().getId().equals(approver.getId())) {
            return true;
        }

        // Department manager can approve
        if (employee.getDepartment() != null && employee.getDepartment().getManager() != null &&
            employee.getDepartment().getManager().getId().equals(approver.getId())) {
            return true;
        }

        // TODO: Add role-based approval (HR_MANAGER, ADMIN)
        return false;
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

    /**
     * Exit statistics inner class
     */
    public static class ExitStatistics {
        private final long totalExits;
        private final long initiatedExits;
        private final long approvedExits;
        private final long withdrawnExits;
        private final long completedExits;

        public ExitStatistics(long totalExits, long initiatedExits, long approvedExits, 
                            long withdrawnExits, long completedExits) {
            this.totalExits = totalExits;
            this.initiatedExits = initiatedExits;
            this.approvedExits = approvedExits;
            this.withdrawnExits = withdrawnExits;
            this.completedExits = completedExits;
        }

        // Getters
        public long getTotalExits() { return totalExits; }
        public long getInitiatedExits() { return initiatedExits; }
        public long getApprovedExits() { return approvedExits; }
        public long getWithdrawnExits() { return withdrawnExits; }
        public long getCompletedExits() { return completedExits; }
    }
}

