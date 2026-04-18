package com.talentx.hrms.service.employee;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.employee.EmployeeRequest;
import com.talentx.hrms.dto.employee.EmployeeResponse;
import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.mapper.EmployeeMapper;
import com.talentx.hrms.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final EmployeeMapper employeeMapper;

    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository,
                          OrganizationRepository organizationRepository,
                          DepartmentRepository departmentRepository,
                          LocationRepository locationRepository,
                          UserRepository userRepository,
                          EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.employeeMapper = employeeMapper;
    }

    /**
     * Create a new employee
     */
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        // Validate organization
        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Check if employee number already exists
        if (employeeRepository.existsByEmployeeNumberAndOrganization(request.getEmployeeNumber(), organization)) {
            throw new RuntimeException("Employee number already exists in organization");
        }

        // Check if email already exists (if provided)
        if (request.getEmail() != null && 
            employeeRepository.existsByEmailAndOrganization(request.getEmail(), organization)) {
            throw new RuntimeException("Email already exists in organization");
        }

        // Create employee entity
        Employee employee = new Employee();
        mapRequestToEntity(request, employee, organization);

        // Save employee
        employee = employeeRepository.save(employee);

        return employeeMapper.toResponse(employee);
    }

    /**
     * Update an existing employee
     */
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Validate organization
        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Check if employee number already exists (excluding current employee)
        Optional<Employee> existingByNumber = employeeRepository
            .findByEmployeeNumberAndOrganization(request.getEmployeeNumber(), organization);
        if (existingByNumber.isPresent() && !existingByNumber.get().getId().equals(id)) {
            throw new RuntimeException("Employee number already exists in organization");
        }

        // Check if email already exists (excluding current employee)
        if (request.getEmail() != null) {
            Optional<Employee> existingByEmail = employeeRepository
                .findByEmailAndOrganization(request.getEmail(), organization);
            if (existingByEmail.isPresent() && !existingByEmail.get().getId().equals(id)) {
                throw new RuntimeException("Email already exists in organization");
            }
        }

        // Update employee entity
        mapRequestToEntity(request, employee, organization);

        // Save employee
        employee = employeeRepository.save(employee);

        return employeeMapper.toResponse(employee);
    }

    /**
     * Get employee by ID
     */
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployee(Long id) {
        // Fetch addresses first
        Employee employee = employeeRepository.findByIdWithFullDetails(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Fetch emergency contacts in a separate query to avoid MultipleBagFetchException
        employeeRepository.findByIdWithEmergencyContacts(id)
            .ifPresent(e -> employee.setEmergencyContacts(e.getEmergencyContacts()));

        return employeeMapper.toResponse(employee);
    }

    /**
     * Get all employees with pagination
     */
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployees(PaginationRequest paginationRequest) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Pageable pageable = createPageable(paginationRequest);
        Page<Employee> employees = employeeRepository.findByOrganization(organization, pageable);

        return employees.map(employeeMapper::toResponse);
    }

    /**
     * Search employees with comprehensive criteria
     */
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> searchEmployees(String name, String employeeNumber, String jobTitle,
                                                 Long departmentId, Long locationId, 
                                                 EmploymentStatus employmentStatus, EmploymentType employmentType,
                                                 PaginationRequest paginationRequest) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        Department department = null;
        if (departmentId != null) {
            department = departmentRepository.findById(departmentId).orElse(null);
        }

        Location location = null;
        if (locationId != null) {
            location = locationRepository.findById(locationId).orElse(null);
        }

        Pageable pageable = createPageable(paginationRequest);
        Page<Employee> employees = employeeRepository.findBySearchCriteria(
            organization, name, employeeNumber, jobTitle, department, location,
            employmentStatus, employmentType, pageable
        );

        return employees.map(employeeMapper::toResponse);
    }

    /**
     * Get employees by department
     */
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getEmployeesByDepartment(Long departmentId, PaginationRequest paginationRequest) {
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new RuntimeException("Department not found"));

        Pageable pageable = createPageable(paginationRequest);
        Page<Employee> employees = employeeRepository.findByDepartment(department, pageable);

        return employees.map(employeeMapper::toResponse);
    }

    /**
     * Get employees by manager
     */
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getDirectReports(Long managerId) {
        Employee manager = employeeRepository.findById(managerId)
            .orElseThrow(() -> new RuntimeException("Manager not found"));

        List<Employee> directReports = employeeRepository.findByManager(manager);
        return directReports.stream()
            .map(employeeMapper::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get employees on probation
     */
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesOnProbation() {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        List<Employee> employees = employeeRepository.findByOrganizationOnProbation(organization);
        return employees.stream()
            .map(employeeMapper::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get employees with upcoming probation end dates
     */
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesWithUpcomingProbationEnd(int daysAhead) {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        LocalDate endDate = LocalDate.now().plusDays(daysAhead);
        List<Employee> employees = employeeRepository.findByOrganizationWithUpcomingProbationEnd(organization, endDate);
        
        return employees.stream()
            .map(employeeMapper::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get employees with birthdays in current month
     */
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesWithBirthdaysThisMonth() {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        int currentMonth = LocalDate.now().getMonthValue();
        List<Employee> employees = employeeRepository.findByOrganizationAndBirthdayMonth(organization, currentMonth);
        
        return employees.stream()
            .map(employeeMapper::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get managers (employees with direct reports)
     */
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getManagers() {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        List<Employee> managers = employeeRepository.findManagersByOrganization(organization);
        return managers.stream()
            .map(employeeMapper::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Terminate employee
     */
    public EmployeeResponse terminateEmployee(Long id, LocalDate terminationDate, String reason) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.isTerminated()) {
            throw new RuntimeException("Employee is already terminated");
        }

        employee.setEmploymentStatus(EmploymentStatus.TERMINATED);
        employee.setTerminationDate(java.sql.Date.valueOf(terminationDate));
        employee.setTerminationReason(reason);

        employee = employeeRepository.save(employee);
        return employeeMapper.toResponse(employee);
    }

    /**
     * Reactivate terminated employee
     */
    public EmployeeResponse reactivateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.isTerminated()) {
            throw new RuntimeException("Employee is not terminated");
        }

        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setTerminationDate((java.sql.Date) null);
        employee.setTerminationReason(null);

        employee = employeeRepository.save(employee);
        return employeeMapper.toResponse(employee);
    }

    /**
     * Confirm employee (end probation)
     */
    public EmployeeResponse confirmEmployee(Long id, LocalDate confirmationDate) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!employee.isOnProbation()) {
            throw new RuntimeException("Employee is not on probation");
        }

        employee.setConfirmationDate(java.sql.Date.valueOf(confirmationDate));
        employee.setProbationEndDate(java.sql.Date.valueOf(confirmationDate));

        employee = employeeRepository.save(employee);
        return employeeMapper.toResponse(employee);
    }

    /**
     * Delete employee
     */
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Check if employee has any dependencies that prevent deletion
        if (!employee.getDirectReports().isEmpty()) {
            throw new RuntimeException("Cannot delete employee who has direct reports");
        }

        employeeRepository.delete(employee);
    }

    /**
     * Check if current user is the employee or their manager (for @PreAuthorize)
     */
    public boolean isCurrentUserOrManager(Long employeeId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) return false;
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username).orElse(null);
            if (currentUser == null) return false;
            // Check if current user is the employee
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            if (employee == null) return false;
            if (employee.getUser() != null && employee.getUser().getId().equals(currentUser.getId())) return true;
            // Check if current user is the manager
            Employee currentEmployee = employeeRepository.findByUser(currentUser).orElse(null);
            if (currentEmployee == null) return false;
            return currentEmployee.getId().equals(employee.getManager() != null ? employee.getManager().getId() : null);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if current user is the employee (for @PreAuthorize)
     */
    public boolean isCurrentUser(Long employeeId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) return false;
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username).orElse(null);
            if (currentUser == null) return false;
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            if (employee == null) return false;
            return employee.getUser() != null && employee.getUser().getId().equals(currentUser.getId());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get employee statistics
     */
    @Transactional(readOnly = true)
    public EmployeeStatistics getEmployeeStatistics() {
        User currentUser = getCurrentUser();
        Organization organization = currentUser.getOrganization();

        long totalEmployees = employeeRepository.countByOrganization(organization);
        long activeEmployees = employeeRepository.countByOrganizationAndEmploymentStatus(organization, EmploymentStatus.ACTIVE);
        long terminatedEmployees = employeeRepository.countByOrganizationAndEmploymentStatus(organization, EmploymentStatus.TERMINATED);
        long fullTimeEmployees = employeeRepository.countByOrganizationAndEmploymentType(organization, EmploymentType.FULL_TIME);
        long partTimeEmployees = employeeRepository.countByOrganizationAndEmploymentType(organization, EmploymentType.PART_TIME);

        return new EmployeeStatistics(totalEmployees, activeEmployees, terminatedEmployees, fullTimeEmployees, partTimeEmployees);
    }

    /**
     * Map request DTO to entity
     */
    private void mapRequestToEntity(EmployeeRequest request, Employee employee, Organization organization) {
        employee.setEmployeeNumber(request.getEmployeeNumber());
        employee.setFirstName(request.getFirstName());
        employee.setMiddleName(request.getMiddleName());
        employee.setLastName(request.getLastName());
        employee.setWorkEmail(request.getEmail());
        employee.setPhoneNumber(request.getPhone());
        employee.setMobileNumber(request.getMobile());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setGender(request.getGender());
        employee.setNationality(request.getNationality());
        employee.setMaritalStatus(request.getMaritalStatus());
        // employee.setSocialSecurityNumber(request.getSocialSecurityNumber()); // Field not in DB schema
        // employee.setTaxId(request.getTaxId()); // Field not in DB schema
        employee.setHireDate(request.getHireDate());
        employee.setTerminationDate(request.getTerminationDate());
        // employee.setTerminationReason(request.getTerminationReason()); // Field not in DB schema
        employee.setEmploymentStatus(request.getEmploymentStatus());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setJobTitle(request.getJobTitle());
        employee.setJobLevel(request.getJobLevel());
        employee.setSalaryAmount(request.getSalary());
        employee.setSalaryCurrency(request.getSalaryCurrency());
        // employee.setHourlyRate(request.getHourlyRate()); // Field not in DB schema
        employee.setProbationEndDate(request.getProbationEndDate());
        // employee.setConfirmationDate(request.getConfirmationDate()); // Field not in DB schema
        employee.setOrganization(organization);

        // Set department if provided
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
            employee.setDepartment(department);
        }

        // Set location if provided
        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));
            employee.setLocation(location);
        }

        // Set manager if provided
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));
            employee.setManager(manager);
        }

        // Set user if provided
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            employee.setUser(user);
        }
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
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userRepository.findByUsernameWithOrganization(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        }
        throw new RuntimeException("No authenticated user found");
    }

    /**
     * Employee statistics inner class
     */
    public static class EmployeeStatistics {
        private final long totalEmployees;
        private final long activeEmployees;
        private final long terminatedEmployees;
        private final long fullTimeEmployees;
        private final long partTimeEmployees;

        public EmployeeStatistics(long totalEmployees, long activeEmployees, long terminatedEmployees, 
                                long fullTimeEmployees, long partTimeEmployees) {
            this.totalEmployees = totalEmployees;
            this.activeEmployees = activeEmployees;
            this.terminatedEmployees = terminatedEmployees;
            this.fullTimeEmployees = fullTimeEmployees;
            this.partTimeEmployees = partTimeEmployees;
        }

        // Getters
        public long getTotalEmployees() { return totalEmployees; }
        public long getActiveEmployees() { return activeEmployees; }
        public long getTerminatedEmployees() { return terminatedEmployees; }
        public long getFullTimeEmployees() { return fullTimeEmployees; }
        public long getPartTimeEmployees() { return partTimeEmployees; }
    }
}

