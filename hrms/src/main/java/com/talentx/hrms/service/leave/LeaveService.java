package com.talentx.hrms.service.leave;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.leave.LeaveRequestCreateDTO;
import com.talentx.hrms.dto.leave.LeaveRequestResponseDTO;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.LeaveStatus;
import com.talentx.hrms.entity.leave.LeaveBalance;
import com.talentx.hrms.entity.leave.LeaveRequest;
import com.talentx.hrms.entity.leave.LeaveType;
import com.talentx.hrms.mapper.LeaveRequestMapper;
import com.talentx.hrms.repository.*;
import com.talentx.hrms.service.auth.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final LeaveRequestMapper leaveRequestMapper;
    private final AuthService authService;
    private final com.talentx.hrms.repository.OrganizationRepository organizationRepository;

    @Autowired
    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                       LeaveBalanceRepository leaveBalanceRepository,
                       LeaveTypeRepository leaveTypeRepository,
                       EmployeeRepository employeeRepository,
                       UserRepository userRepository,
                       LeaveRequestMapper leaveRequestMapper,
                       AuthService authService,
                       com.talentx.hrms.repository.OrganizationRepository organizationRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.leaveRequestMapper = leaveRequestMapper;
        this.authService = authService;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        return authService.getCurrentUser();
    }

    /**
     * Create a new leave type
     */
    public LeaveType createLeaveType(Long organizationId, String name, String code, String description,
                                     Boolean isPaid, Integer maxDaysPerYear, Boolean requiresApproval,
                                     Boolean allowNegativeBalance, Boolean isActive) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (leaveTypeRepository.existsByCodeAndOrganization(code, organization)) {
            throw new RuntimeException("Leave type with code '" + code + "' already exists");
        }

        LeaveType leaveType = new LeaveType(name, code, organization);
        leaveType.setDescription(description);
        leaveType.setIsPaid(isPaid != null ? isPaid : true);
        leaveType.setMaxDaysPerYear(maxDaysPerYear);
        leaveType.setRequiresApproval(requiresApproval != null ? requiresApproval : true);
        leaveType.setAllowNegativeBalance(allowNegativeBalance != null ? allowNegativeBalance : false);
        leaveType.setActive(isActive != null ? isActive : true);
        return leaveTypeRepository.save(leaveType);
    }

    /**
     * Create a new leave request
     */
    public LeaveRequestResponseDTO createLeaveRequest(LeaveRequestCreateDTO createDTO) {
        // Validate employee
        Employee employee = employeeRepository.findById(createDTO.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Validate leave type
        LeaveType leaveType = leaveTypeRepository.findById(createDTO.getLeaveTypeId())
            .orElseThrow(() -> new RuntimeException("Leave type not found"));

        // Validate dates
        validateLeaveDates(createDTO.getStartDate(), createDTO.getEndDate());

        // Check if leave type is applicable to employee
        validateLeaveTypeApplicability(leaveType, employee);

        // Calculate total days
        BigDecimal totalDays = calculateLeaveDays(createDTO.getStartDate(), createDTO.getEndDate(), 
                                                 createDTO.getIsHalfDay());

        // Check for overlapping leave requests
        validateNoOverlappingLeave(employee, createDTO.getStartDate(), createDTO.getEndDate(), null);

        // Check leave balance availability
        validateLeaveBalance(employee, leaveType, totalDays, createDTO.getStartDate().getYear());

        // Check minimum notice period
        validateNoticeRequirement(leaveType, createDTO.getStartDate());

        // Create leave request
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStartDate(createDTO.getStartDate());
        leaveRequest.setEndDate(createDTO.getEndDate());
        leaveRequest.setTotalDays(totalDays);
        leaveRequest.setIsHalfDay(createDTO.getIsHalfDay());
        leaveRequest.setHalfDayPeriod(createDTO.getHalfDayPeriod());
        leaveRequest.setReason(createDTO.getReason());
        leaveRequest.setContactDetails(createDTO.getContactDetails());
        leaveRequest.setEmergencyContact(createDTO.getEmergencyContact());
        leaveRequest.setIsEmergency(createDTO.getIsEmergency());
        leaveRequest.setAttachmentPath(createDTO.getAttachmentPath());

        // Set status based on leave type approval requirement
        if (Boolean.TRUE.equals(leaveType.getRequiresApproval())) {
            leaveRequest.setStatus(LeaveStatus.PENDING);
        } else {
            leaveRequest.setStatus(LeaveStatus.APPROVED);
        }

        // Save leave request
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update leave balance pending days
        updateLeaveBalancePendingDays(employee, leaveType, totalDays, createDTO.getStartDate().getYear(), true);

        return leaveRequestMapper.toResponseDTO(leaveRequest);
    }

    /**
     * Approve leave request
     */
    public LeaveRequestResponseDTO approveLeaveRequest(Long leaveRequestId, String comments) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.canBeModified()) {
            throw new RuntimeException("Leave request cannot be modified in current status");
        }

        User currentUser = getCurrentUser();
        // Admin users may not have an employee record — allow null approver
        Employee approver = employeeRepository.findByUser(currentUser).orElse(null);

        // Approve the request
        leaveRequest.approve(approver, comments);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update leave balance (move from pending to used)
        updateLeaveBalanceOnApproval(leaveRequest);

        return leaveRequestMapper.toResponseDTO(leaveRequest);
    }

    /**
     * Reject leave request
     */
    public LeaveRequestResponseDTO rejectLeaveRequest(Long leaveRequestId, String comments) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.canBeModified()) {
            throw new RuntimeException("Leave request cannot be modified in current status");
        }

        User currentUser = getCurrentUser();
        // Admin users may not have an employee record — allow null reviewer
        Employee reviewer = employeeRepository.findByUser(currentUser).orElse(null);

        // Reject the request
        leaveRequest.reject(reviewer, comments);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update leave balance (remove pending days)
        updateLeaveBalancePendingDays(leaveRequest.getEmployee(), leaveRequest.getLeaveType(), 
                                    leaveRequest.getTotalDays(), leaveRequest.getStartDate().getYear(), false);

        return leaveRequestMapper.toResponseDTO(leaveRequest);
    }

    /**
     * Cancel leave request
     */
    public LeaveRequestResponseDTO cancelLeaveRequest(Long leaveRequestId, String reason) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.canBeCancelled()) {
            throw new RuntimeException("Leave request cannot be cancelled in current status");
        }

        // Cancel the request
        leaveRequest.cancel(reason);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        // Update leave balance based on current status
        if (leaveRequest.getStatus() == LeaveStatus.PENDING) {
            // Remove pending days
            updateLeaveBalancePendingDays(leaveRequest.getEmployee(), leaveRequest.getLeaveType(), 
                                        leaveRequest.getTotalDays(), leaveRequest.getStartDate().getYear(), false);
        } else if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            // Remove used days and add back to balance
            updateLeaveBalanceOnCancellation(leaveRequest);
        }

        return leaveRequestMapper.toResponseDTO(leaveRequest);
    }

    /**
     * Get leave request by ID
     */
    @Transactional(readOnly = true)
    public LeaveRequestResponseDTO getLeaveRequest(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));

        return leaveRequestMapper.toResponseDTO(leaveRequest);
    }

    /**
     * Get leave requests with pagination
     */
    @Transactional(readOnly = true)
    public Page<LeaveRequestResponseDTO> getLeaveRequests(PaginationRequest paginationRequest) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        Page<LeaveRequest> leaveRequests = leaveRequestRepository.findByOrganization(organization, pageable);

        return leaveRequests.map(leaveRequestMapper::toResponseDTO);
    }

    /**
     * Get all leave requests with filters
     */
    @Transactional(readOnly = true)
    public Page<LeaveRequestResponseDTO> getAllLeaveRequests(Long employeeId, Long departmentId, 
                                                           LeaveStatus status, LocalDate startDateFrom, 
                                                           LocalDate startDateTo, PaginationRequest paginationRequest) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        // For now, use basic findByOrganization - this method needs to be implemented in repository
        Page<LeaveRequest> leaveRequests = leaveRequestRepository.findByOrganization(organization, pageable);

        return leaveRequests.map(leaveRequestMapper::toResponseDTO);
    }

    /**
     * Get current user leave requests
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDTO> getCurrentUserLeaveRequests(LeaveStatus status, Integer year) {
        User currentUser = getCurrentUser();
        // Admin user may not have an employee record — return empty list gracefully
        return employeeRepository.findByUser(currentUser)
            .map(employee -> leaveRequestRepository.findByEmployee(employee).stream()
                .map(leaveRequestMapper::toResponseDTO)
                .collect(Collectors.toList()))
            .orElse(java.util.Collections.emptyList());
    }

    /**
     * Get leave requests by employee
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDTO> getEmployeeLeaveRequests(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<LeaveRequest> leaveRequests = leaveRequestRepository.findByEmployee(employee);
        return leaveRequests.stream()
            .map(leaveRequestMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get leave requests by employee with filters
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDTO> getEmployeeLeaveRequests(Long employeeId, LeaveStatus status, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // For now, use basic findByEmployee - this method needs to be implemented in repository
        List<LeaveRequest> leaveRequests = leaveRequestRepository.findByEmployee(employee);
        return leaveRequests.stream()
            .map(leaveRequestMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get pending leave requests for manager
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDTO> getPendingLeaveRequestsForManager(Long managerId) {
        Employee manager = employeeRepository.findById(managerId)
            .orElseThrow(() -> new RuntimeException("Manager not found"));

        List<LeaveRequest> pendingRequests = leaveRequestRepository.findPendingByManager(manager);
        return pendingRequests.stream()
            .map(leaveRequestMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get leave balance for employee
     */
    @Transactional(readOnly = true)
    public List<LeaveBalanceDTO> getEmployeeLeaveBalance(Long employeeId, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (year == null) {
            year = LocalDate.now().getYear();
        }

        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeAndYear(employee, year);
        return balances.stream()
            .map(this::mapToLeaveBalanceDTO)
            .collect(Collectors.toList());
    }

    /**
     * Initialize leave balances for employee
     */
    public void initializeLeaveBalances(Long employeeId, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (year == null) {
            year = LocalDate.now().getYear();
        }

        List<LeaveType> leaveTypes = leaveTypeRepository.findByOrganizationAndActiveTrue(employee.getOrganization());

        for (LeaveType leaveType : leaveTypes) {
            // Check if balance already exists
            if (!leaveBalanceRepository.existsByEmployeeAndLeaveTypeAndYear(employee, leaveType, year)) {
                LeaveBalance balance = new LeaveBalance(employee, leaveType, year);
                
                // Set allocated days based on leave type configuration
                if (leaveType.getMaxDaysPerYear() != null) {
                    balance.setAllocatedDays(BigDecimal.valueOf(leaveType.getMaxDaysPerYear()));
                }
                
                leaveBalanceRepository.save(balance);
            }
        }
    }

    /**
     * Process carry forward for year end
     */
    public void processCarryForward(Integer fromYear, Integer toYear) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        List<LeaveBalance> eligibleBalances = leaveBalanceRepository.findEligibleForCarryForward(organization, fromYear);

        for (LeaveBalance balance : eligibleBalances) {
            BigDecimal remainingDays = balance.getRemainingDays();
            LeaveType leaveType = balance.getLeaveType();

            if (remainingDays.compareTo(BigDecimal.ZERO) > 0 && Boolean.TRUE.equals(leaveType.getIsCarryForward())) {
                BigDecimal carryForwardDays = remainingDays;
                
                // Apply maximum carry forward limit if specified
                if (leaveType.getMaxCarryForwardDays() != null && 
                    carryForwardDays.compareTo(BigDecimal.valueOf(leaveType.getMaxCarryForwardDays())) > 0) {
                    carryForwardDays = BigDecimal.valueOf(leaveType.getMaxCarryForwardDays());
                }

                // Create or update balance for next year
                Optional<LeaveBalance> nextYearBalance = leaveBalanceRepository
                    .findByEmployeeAndLeaveTypeAndYear(balance.getEmployee(), leaveType, toYear);

                if (nextYearBalance.isPresent()) {
                    LeaveBalance existingBalance = nextYearBalance.get();
                    existingBalance.setCarryForwardDays(carryForwardDays);
                    leaveBalanceRepository.save(existingBalance);
                } else {
                    LeaveBalance newBalance = new LeaveBalance(balance.getEmployee(), leaveType, toYear);
                    newBalance.setCarryForwardDays(carryForwardDays);
                    if (leaveType.getMaxDaysPerYear() != null) {
                        newBalance.setAllocatedDays(BigDecimal.valueOf(leaveType.getMaxDaysPerYear()));
                    }
                    leaveBalanceRepository.save(newBalance);
                }
            }
        }
    }

    // Private helper methods

    private void validateLeaveDates(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Start date cannot be after end date");
        }
        
        if (startDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot apply for leave in the past");
        }
    }

    private void validateLeaveTypeApplicability(LeaveType leaveType, Employee employee) {
        String gender = employee.getGender() != null ? employee.getGender().name() : null;
        boolean isOnProbation = employee.isOnProbation();

        if (!leaveType.isApplicableToEmployee(gender, isOnProbation)) {
            throw new RuntimeException("Leave type is not applicable to this employee");
        }
    }

    private BigDecimal calculateLeaveDays(LocalDate startDate, LocalDate endDate, Boolean isHalfDay) {
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        
        if (Boolean.TRUE.equals(isHalfDay)) {
            return BigDecimal.valueOf(0.5);
        }
        
        return BigDecimal.valueOf(daysBetween);
    }

    private void validateNoOverlappingLeave(Employee employee, LocalDate startDate, LocalDate endDate, Long excludeId) {
        Long excludeIdValue = excludeId != null ? excludeId : -1L;
        List<LeaveRequest> overlappingRequests = leaveRequestRepository
            .findOverlappingLeaveRequests(employee, excludeIdValue, startDate, endDate);

        if (!overlappingRequests.isEmpty()) {
            throw new RuntimeException("Employee has overlapping leave requests for the specified dates");
        }
    }

    private void validateLeaveBalance(Employee employee, LeaveType leaveType, BigDecimal requestedDays, Integer year) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
            .findByEmployeeAndLeaveTypeAndYear(employee, leaveType, year);

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            if (!balance.canTakeLeave(requestedDays)) {
                throw new RuntimeException("Insufficient leave balance for the requested days");
            }
        } else {
            // Initialize balance if it doesn't exist
            initializeLeaveBalances(employee.getId(), year);
            validateLeaveBalance(employee, leaveType, requestedDays, year);
        }
    }

    private void validateNoticeRequirement(LeaveType leaveType, LocalDate startDate) {
        if (leaveType.getMinDaysNotice() != null) {
            long daysUntilLeave = ChronoUnit.DAYS.between(LocalDate.now(), startDate);
            if (daysUntilLeave < leaveType.getMinDaysNotice()) {
                throw new RuntimeException("Minimum notice period of " + leaveType.getMinDaysNotice() + 
                                         " days is required for this leave type");
            }
        }
    }

    private void updateLeaveBalancePendingDays(Employee employee, LeaveType leaveType, 
                                             BigDecimal days, Integer year, boolean add) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
            .findByEmployeeAndLeaveTypeAndYear(employee, leaveType, year);

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            BigDecimal currentPending = balance.getPendingDays();
            
            if (add) {
                balance.setPendingDays(currentPending.add(days));
            } else {
                balance.setPendingDays(currentPending.subtract(days));
            }
            
            leaveBalanceRepository.save(balance);
        }
    }

    private void updateLeaveBalanceOnApproval(LeaveRequest leaveRequest) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
            .findByEmployeeAndLeaveTypeAndYear(leaveRequest.getEmployee(), 
                                             leaveRequest.getLeaveType(), 
                                             leaveRequest.getStartDate().getYear());

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            BigDecimal days = leaveRequest.getTotalDays();
            
            // Move from pending to used
            balance.setPendingDays(balance.getPendingDays().subtract(days));
            balance.setUsedDays(balance.getUsedDays().add(days));
            
            leaveBalanceRepository.save(balance);
        }
    }

    private void updateLeaveBalanceOnCancellation(LeaveRequest leaveRequest) {
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
            .findByEmployeeAndLeaveTypeAndYear(leaveRequest.getEmployee(), 
                                             leaveRequest.getLeaveType(), 
                                             leaveRequest.getStartDate().getYear());

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            BigDecimal days = leaveRequest.getTotalDays();
            
            // Remove from used days
            balance.setUsedDays(balance.getUsedDays().subtract(days));
            
            leaveBalanceRepository.save(balance);
        }
    }

    private LeaveBalanceDTO mapToLeaveBalanceDTO(LeaveBalance balance) {
        LeaveBalanceDTO dto = new LeaveBalanceDTO();
        dto.setId(balance.getId());
        dto.setYear(balance.getYear());
        dto.setAllocatedDays(balance.getAllocatedDays());
        dto.setUsedDays(balance.getUsedDays());
        dto.setPendingDays(balance.getPendingDays());
        dto.setCarryForwardDays(balance.getCarriedForwardDays());
        dto.setAdjustmentDays(BigDecimal.ZERO); // Default to zero if not tracked
        dto.setRemainingDays(balance.getRemainingDays());
        dto.setLeaveTypeId(balance.getLeaveType().getId());
        dto.setLeaveTypeName(balance.getLeaveType().getName());
        dto.setLeaveTypeCode(balance.getLeaveType().getCode());
        return dto;
    }

    /**
     * Update leave request
     */
    public LeaveRequestResponseDTO updateLeaveRequest(Long id, LeaveRequestCreateDTO updateDTO) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.canBeModified()) {
            throw new RuntimeException("Leave request cannot be modified in current status");
        }

        // Update fields
        leaveRequest.setStartDate(updateDTO.getStartDate());
        leaveRequest.setEndDate(updateDTO.getEndDate());
        leaveRequest.setReason(updateDTO.getReason());
        leaveRequest.setIsHalfDay(updateDTO.getIsHalfDay());
        leaveRequest.setHalfDayPeriod(updateDTO.getHalfDayPeriod());
        leaveRequest.setContactDetails(updateDTO.getContactDetails());
        leaveRequest.setEmergencyContact(updateDTO.getEmergencyContact());

        // Recalculate total days
        BigDecimal totalDays = calculateLeaveDays(updateDTO.getStartDate(), updateDTO.getEndDate(), 
                                                 updateDTO.getIsHalfDay());
        leaveRequest.setTotalDays(totalDays);

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return leaveRequestMapper.toResponseDTO(leaveRequest);
    }

    /**
     * Get pending approvals
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDTO> getPendingApprovals() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // For now, return empty list - this method needs to be implemented in repository
        List<LeaveRequest> pendingRequests = List.of();
        return pendingRequests.stream()
            .map(leaveRequestMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get manager approval requests
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDTO> getManagerApprovalRequests() {
        User currentUser = authService.getCurrentUser();
        // Admin user may not have an employee record — return empty list gracefully
        return employeeRepository.findByUser(currentUser)
            .map(manager -> leaveRequestRepository.findPendingByManager(manager).stream()
                .map(leaveRequestMapper::toResponseDTO)
                .collect(Collectors.toList()))
            .orElse(java.util.Collections.emptyList());
    }

    /**
     * Get leave balance as map
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getLeaveBalance(Long employeeId) {
        List<LeaveBalanceDTO> balances = getEmployeeLeaveBalance(employeeId, LocalDate.now().getYear());
        Map<String, Object> result = new HashMap<>();
        result.put("balances", balances);
        result.put("year", LocalDate.now().getYear());
        return result;
    }

    /**
     * Get current user leave balance
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentUserLeaveBalance() {
        User currentUser = authService.getCurrentUser();
        // Admin user may not have an employee record — return empty balance gracefully
        return employeeRepository.findByUser(currentUser)
            .map(employee -> getLeaveBalance(employee.getId()))
            .orElse(java.util.Collections.emptyMap());
    }

    /**
     * Get leave calendar
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLeaveCalendar(LocalDate startDate, LocalDate endDate, Long departmentId) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // For now, return empty list - this method needs to be implemented in repository
        List<LeaveRequest> leaveRequests = List.of();

        return leaveRequests.stream()
            .map(this::mapLeaveRequestToCalendarEntry)
            .collect(Collectors.toList());
    }

    /**
     * Get leave statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getLeaveStatistics(Integer year, Long departmentId) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }

        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("year", year);
        // For now, use placeholder values - these methods need to be implemented in repository
        statistics.put("totalRequests", 0L);
        statistics.put("approvedRequests", 0L);
        statistics.put("pendingRequests", 0L);
        statistics.put("rejectedRequests", 0L);

        return statistics;
    }

    /**
     * Get leave types
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLeaveTypes() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        List<LeaveType> leaveTypes = leaveTypeRepository.findByOrganizationAndActiveTrue(organization);
        return leaveTypes.stream()
            .map(this::mapLeaveTypeToMap)
            .collect(Collectors.toList());
    }

    /**
     * Check leave availability
     */
    @Transactional(readOnly = true)
    public Map<String, Object> checkLeaveAvailability(Long employeeId, Long leaveTypeId, 
                                                     LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        LeaveType leaveType = leaveTypeRepository.findById(leaveTypeId)
            .orElseThrow(() -> new RuntimeException("Leave type not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("available", true);
        result.put("message", "Leave can be taken for the specified dates");

        try {
            BigDecimal requestedDays = calculateLeaveDays(startDate, endDate, false);
            validateLeaveBalance(employee, leaveType, requestedDays, startDate.getYear());
            validateNoOverlappingLeave(employee, startDate, endDate, null);
            validateNoticeRequirement(leaveType, startDate);
        } catch (RuntimeException e) {
            result.put("available", false);
            result.put("message", e.getMessage());
        }

        return result;
    }

    // Helper methods
    private Map<String, Object> mapLeaveRequestToCalendarEntry(LeaveRequest leaveRequest) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("id", leaveRequest.getId());
        entry.put("employeeName", leaveRequest.getEmployee().getFullName());
        entry.put("leaveType", leaveRequest.getLeaveType().getName());
        entry.put("startDate", leaveRequest.getStartDate());
        entry.put("endDate", leaveRequest.getEndDate());
        entry.put("totalDays", leaveRequest.getTotalDays());
        entry.put("status", leaveRequest.getStatus());
        return entry;
    }

    private Map<String, Object> mapLeaveTypeToMap(LeaveType leaveType) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", leaveType.getId());
        map.put("name", leaveType.getName());
        map.put("code", leaveType.getCode());
        map.put("description", leaveType.getDescription());
        map.put("maxDaysPerYear", leaveType.getMaxDaysPerYear());
        map.put("requiresApproval", leaveType.getRequiresApproval());
        map.put("isCarryForward", leaveType.getIsCarryForward());
        return map;
    }

    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    // ===== SECURITY HELPER METHODS FOR @PreAuthorize =====

    public boolean isCurrentUserOrManager(Long employeeId) {
        try {
            User currentUser = authService.getCurrentUser();
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            if (employee == null) return false;
            if (employee.getUser() != null && employee.getUser().getId().equals(currentUser.getId())) return true;
            Employee currentEmployee = employeeRepository.findByUser(currentUser).orElse(null);
            if (currentEmployee == null) return false;
            return currentEmployee.getId().equals(employee.getManager() != null ? employee.getManager().getId() : null);
        } catch (Exception e) { return false; }
    }

    public boolean isCurrentUser(Long employeeId) {
        try {
            User currentUser = authService.getCurrentUser();
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            return employee != null && employee.getUser() != null && employee.getUser().getId().equals(currentUser.getId());
        } catch (Exception e) { return false; }
    }

    public boolean isCurrentUserRequest(Long leaveRequestId) {
        try {
            User currentUser = authService.getCurrentUser();
            LeaveRequest request = leaveRequestRepository.findById(leaveRequestId).orElse(null);
            if (request == null) return false;
            return request.getEmployee().getUser() != null && request.getEmployee().getUser().getId().equals(currentUser.getId());
        } catch (Exception e) { return false; }
    }

    public boolean canModifyRequest(Long leaveRequestId) {
        try {
            LeaveRequest request = leaveRequestRepository.findById(leaveRequestId).orElse(null);
            return request != null && request.getStatus() == LeaveStatus.PENDING;
        } catch (Exception e) { return false; }
    }

    public boolean canCancelRequest(Long leaveRequestId) {
        try {
            LeaveRequest request = leaveRequestRepository.findById(leaveRequestId).orElse(null);
            if (request == null) return false;
            return request.getStatus() == LeaveStatus.PENDING || request.getStatus() == LeaveStatus.APPROVED;
        } catch (Exception e) { return false; }
    }

    public boolean canApproveRequest(Long leaveRequestId) {
        try {
            LeaveRequest request = leaveRequestRepository.findById(leaveRequestId).orElse(null);
            return request != null && request.getStatus() == LeaveStatus.PENDING;
        } catch (Exception e) { return false; }
    }

    /**
     * Leave Balance DTO inner class
     */
    public static class LeaveBalanceDTO {
        private Long id;
        private Integer year;
        private BigDecimal allocatedDays;
        private BigDecimal usedDays;
        private BigDecimal pendingDays;
        private BigDecimal carryForwardDays;
        private BigDecimal adjustmentDays;
        private BigDecimal remainingDays;
        private Long leaveTypeId;
        private String leaveTypeName;
        private String leaveTypeCode;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }
        
        public BigDecimal getAllocatedDays() { return allocatedDays; }
        public void setAllocatedDays(BigDecimal allocatedDays) { this.allocatedDays = allocatedDays; }
        
        public BigDecimal getUsedDays() { return usedDays; }
        public void setUsedDays(BigDecimal usedDays) { this.usedDays = usedDays; }
        
        public BigDecimal getPendingDays() { return pendingDays; }
        public void setPendingDays(BigDecimal pendingDays) { this.pendingDays = pendingDays; }
        
        public BigDecimal getCarryForwardDays() { return carryForwardDays; }
        public void setCarryForwardDays(BigDecimal carryForwardDays) { this.carryForwardDays = carryForwardDays; }
        
        public BigDecimal getAdjustmentDays() { return adjustmentDays; }
        public void setAdjustmentDays(BigDecimal adjustmentDays) { this.adjustmentDays = adjustmentDays; }
        
        public BigDecimal getRemainingDays() { return remainingDays; }
        public void setRemainingDays(BigDecimal remainingDays) { this.remainingDays = remainingDays; }
        
        public Long getLeaveTypeId() { return leaveTypeId; }
        public void setLeaveTypeId(Long leaveTypeId) { this.leaveTypeId = leaveTypeId; }
        
        public String getLeaveTypeName() { return leaveTypeName; }
        public void setLeaveTypeName(String leaveTypeName) { this.leaveTypeName = leaveTypeName; }
        
        public String getLeaveTypeCode() { return leaveTypeCode; }
        public void setLeaveTypeCode(String leaveTypeCode) { this.leaveTypeCode = leaveTypeCode; }
    }
}

