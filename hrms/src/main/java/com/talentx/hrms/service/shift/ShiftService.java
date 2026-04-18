package com.talentx.hrms.service.shift;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.common.exception.ValidationException;
import com.talentx.hrms.entity.attendance.EmployeeShift;
import com.talentx.hrms.entity.attendance.Shift;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.EmployeeShiftRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final EmployeeShiftRepository employeeShiftRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public ShiftService(ShiftRepository shiftRepository,
                       EmployeeShiftRepository employeeShiftRepository,
                       OrganizationRepository organizationRepository,
                       EmployeeRepository employeeRepository) {
        this.shiftRepository = shiftRepository;
        this.employeeShiftRepository = employeeShiftRepository;
        this.organizationRepository = organizationRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Create a new shift
     */
    public Shift createShift(Long organizationId, String name, String description,
                            LocalTime startTime, LocalTime endTime,
                            LocalTime breakStartTime, LocalTime breakEndTime,
                            Integer gracePeriodMinutes, Boolean isNightShift,
                            Boolean isFlexible, BigDecimal minimumHours) {
        
        // Get organization
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        // Validate unique name
        if (shiftRepository.existsByNameAndOrganization(name, organization)) {
            throw new ValidationException("Shift with name '" + name + "' already exists in this organization");
        }

        // Validate shift times
        validateShiftTimes(startTime, endTime, breakStartTime, breakEndTime);

        // Create shift entity
        Shift shift = new Shift();
        shift.setOrganization(organization);
        shift.setName(name);
        shift.setDescription(description);
        shift.setStartTime(startTime);
        shift.setEndTime(endTime);
        shift.setBreakStartTime(breakStartTime);
        shift.setBreakEndTime(breakEndTime);
        shift.setGracePeriodMinutes(gracePeriodMinutes != null ? gracePeriodMinutes : 0);
        shift.setIsNightShift(isNightShift != null ? isNightShift : false);
        shift.setIsFlexible(isFlexible != null ? isFlexible : false);
        shift.setMinimumHours(minimumHours);

        // Calculate total hours
        BigDecimal totalHours = calculateShiftHours(startTime, endTime, breakStartTime, breakEndTime);
        shift.setTotalHours(totalHours);

        return shiftRepository.save(shift);
    }

    /**
     * Update an existing shift
     */
    public Shift updateShift(Long shiftId, String name, String description,
                            LocalTime startTime, LocalTime endTime,
                            LocalTime breakStartTime, LocalTime breakEndTime,
                            Integer gracePeriodMinutes, Boolean isNightShift,
                            Boolean isFlexible, BigDecimal minimumHours) {
        
        Shift shift = shiftRepository.findById(shiftId)
            .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));

        // Validate unique name (excluding current shift)
        shiftRepository.findByNameAndOrganization(name, shift.getOrganization())
            .ifPresent(existing -> {
                if (!existing.getId().equals(shiftId)) {
                    throw new ValidationException("Shift with name '" + name + "' already exists in this organization");
                }
            });

        // Validate shift times
        validateShiftTimes(startTime, endTime, breakStartTime, breakEndTime);

        // Update shift entity
        shift.setName(name);
        shift.setDescription(description);
        shift.setStartTime(startTime);
        shift.setEndTime(endTime);
        shift.setBreakStartTime(breakStartTime);
        shift.setBreakEndTime(breakEndTime);
        shift.setGracePeriodMinutes(gracePeriodMinutes != null ? gracePeriodMinutes : 0);
        shift.setIsNightShift(isNightShift != null ? isNightShift : false);
        shift.setIsFlexible(isFlexible != null ? isFlexible : false);
        shift.setMinimumHours(minimumHours);

        // Recalculate total hours
        BigDecimal totalHours = calculateShiftHours(startTime, endTime, breakStartTime, breakEndTime);
        shift.setTotalHours(totalHours);

        return shiftRepository.save(shift);
    }

    /**
     * Get shift by ID
     */
    @Transactional(readOnly = true)
    public Shift getShift(Long shiftId) {
        return shiftRepository.findById(shiftId)
            .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));
    }

    /**
     * Get all shifts for an organization with pagination
     */
    @Transactional(readOnly = true)
    public Page<Shift> getShifts(Long organizationId, PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        Pageable pageable = createPageable(paginationRequest);
        return shiftRepository.findByOrganization(organization, pageable);
    }

    /**
     * Search shifts by criteria
     */
    @Transactional(readOnly = true)
    public Page<Shift> searchShifts(Long organizationId, String name, Boolean isNightShift,
                                   Boolean isFlexible, PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        Pageable pageable = createPageable(paginationRequest);
        return shiftRepository.findBySearchCriteria(organization, name, isNightShift, isFlexible, pageable);
    }

    /**
     * Delete a shift
     */
    public void deleteShift(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
            .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));

        // Check if shift has active assignments
        List<EmployeeShift> activeAssignments = employeeShiftRepository.findCurrentByShift(shift);
        if (!activeAssignments.isEmpty()) {
            throw new ValidationException("Cannot delete shift with active employee assignments. " +
                "Please reassign or end all employee shifts first.");
        }

        shiftRepository.delete(shift);
    }

    /**
     * Assign shift to employee
     */
    public EmployeeShift assignShiftToEmployee(Long employeeId, Long shiftId,
                                              LocalDate effectiveDate, LocalDate endDate) {
        
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        Shift shift = shiftRepository.findById(shiftId)
            .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));

        // Validate that shift belongs to employee's organization
        if (!shift.getOrganization().getId().equals(employee.getOrganization().getId())) {
            throw new ValidationException("Shift must belong to the same organization as the employee");
        }

        // Validate dates
        final LocalDate finalEffectiveDate = (effectiveDate == null) ? LocalDate.now() : effectiveDate;
        if (endDate != null && endDate.isBefore(finalEffectiveDate)) {
            throw new ValidationException("End date cannot be before effective date");
        }

        // Check for conflicts
        checkShiftConflicts(employee, finalEffectiveDate, endDate);

        // Deactivate current shift if exists
        employeeShiftRepository.findCurrentByEmployee(employee)
            .ifPresent(currentShift -> {
                currentShift.setIsCurrent(false);
                if (currentShift.getEndDate() == null) {
                    currentShift.setEndDate(finalEffectiveDate.minusDays(1));
                }
                employeeShiftRepository.save(currentShift);
            });

        // Create new shift assignment
        EmployeeShift employeeShift = new EmployeeShift();
        employeeShift.setEmployee(employee);
        employeeShift.setShift(shift);
        employeeShift.setEffectiveDate(finalEffectiveDate);
        employeeShift.setEndDate(endDate);
        employeeShift.setIsCurrent(true);

        return employeeShiftRepository.save(employeeShift);
    }

    /**
     * Get employee shifts
     */
    @Transactional(readOnly = true)
    public List<EmployeeShift> getEmployeeShifts(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        return employeeShiftRepository.findByEmployeeOrderByEffectiveDateDesc(employee);
    }

    /**
     * Get current shift for employee
     */
    @Transactional(readOnly = true)
    public EmployeeShift getCurrentEmployeeShift(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        return employeeShiftRepository.findCurrentByEmployee(employee)
            .orElse(null);
    }

    /**
     * Get employees assigned to a shift
     */
    @Transactional(readOnly = true)
    public List<EmployeeShift> getShiftAssignments(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
            .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));

        return employeeShiftRepository.findCurrentByShift(shift);
    }

    /**
     * End employee shift assignment
     */
    public EmployeeShift endEmployeeShift(Long employeeShiftId, LocalDate endDate) {
        EmployeeShift employeeShift = employeeShiftRepository.findById(employeeShiftId)
            .orElseThrow(() -> new EntityNotFoundException("Employee shift not found with id: " + employeeShiftId));

        if (endDate == null) {
            endDate = LocalDate.now();
        }

        if (endDate.isBefore(employeeShift.getEffectiveDate())) {
            throw new ValidationException("End date cannot be before effective date");
        }

        employeeShift.setEndDate(endDate);
        employeeShift.setIsCurrent(false);

        return employeeShiftRepository.save(employeeShift);
    }

    /**
     * Check for shift conflicts
     */
    private void checkShiftConflicts(Employee employee, LocalDate startDate, LocalDate endDate) {
        LocalDate checkEndDate = endDate != null ? endDate : startDate.plusYears(100); // Far future if no end date

        List<EmployeeShift> overlappingShifts = employeeShiftRepository.findOverlappingByEmployee(
            employee, startDate, checkEndDate);

        if (!overlappingShifts.isEmpty()) {
            throw new ValidationException("Employee already has a shift assignment during this period. " +
                "Please end the existing assignment before creating a new one.");
        }
    }

    /**
     * Validate shift times
     */
    private void validateShiftTimes(LocalTime startTime, LocalTime endTime,
                                   LocalTime breakStartTime, LocalTime breakEndTime) {
        if (startTime == null || endTime == null) {
            throw new ValidationException("Start time and end time are required");
        }

        // For night shifts, end time can be before start time (crosses midnight)
        // So we don't validate startTime < endTime

        // Validate break times if provided
        if (breakStartTime != null && breakEndTime != null) {
            if (breakEndTime.isBefore(breakStartTime) || breakEndTime.equals(breakStartTime)) {
                throw new ValidationException("Break end time must be after break start time");
            }

            // Break should be within shift hours (for non-night shifts)
            if (endTime.isAfter(startTime)) { // Regular shift
                if (breakStartTime.isBefore(startTime) || breakStartTime.isAfter(endTime)) {
                    throw new ValidationException("Break start time must be within shift hours");
                }
                if (breakEndTime.isBefore(startTime) || breakEndTime.isAfter(endTime)) {
                    throw new ValidationException("Break end time must be within shift hours");
                }
            }
        } else if (breakStartTime != null || breakEndTime != null) {
            throw new ValidationException("Both break start and end times must be provided");
        }
    }

    /**
     * Calculate shift hours
     */
    private BigDecimal calculateShiftHours(LocalTime startTime, LocalTime endTime,
                                          LocalTime breakStartTime, LocalTime breakEndTime) {
        long totalMinutes;

        // Handle night shifts (crosses midnight)
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            // Night shift: calculate from start to midnight + midnight to end
            long minutesToMidnight = startTime.until(LocalTime.MAX, ChronoUnit.MINUTES) + 1;
            long minutesFromMidnight = LocalTime.MIN.until(endTime, ChronoUnit.MINUTES);
            totalMinutes = minutesToMidnight + minutesFromMidnight;
        } else {
            // Regular shift
            totalMinutes = startTime.until(endTime, ChronoUnit.MINUTES);
        }

        // Subtract break time if provided
        if (breakStartTime != null && breakEndTime != null) {
            long breakMinutes = breakStartTime.until(breakEndTime, ChronoUnit.MINUTES);
            totalMinutes -= breakMinutes;
        }

        // Convert to hours with 2 decimal places
        return BigDecimal.valueOf(totalMinutes)
            .divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
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
        } else {
            // Default sort by start time
            sort = Sort.by(Sort.Direction.ASC, "startTime");
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    // ===== SECURITY HELPER METHODS FOR @PreAuthorize =====

    public boolean isCurrentUser(Long employeeId) {
        try {
            org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return false;
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            if (employee == null) return false;
            return employee.getUser() != null && auth.getName().equals(
                employee.getUser().getUsername());
        } catch (Exception e) { return false; }
    }
}

