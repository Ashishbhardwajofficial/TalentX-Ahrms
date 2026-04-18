package com.talentx.hrms.service.employee;

import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.employee.EmployeeEmploymentHistory;
import com.talentx.hrms.repository.EmploymentHistoryRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.common.exception.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing employee employment history
 * Handles history tracking and automatic history creation on changes
 */
@Service
@Transactional
public class EmploymentHistoryService {

    @Autowired
    private EmploymentHistoryRepository employmentHistoryRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Get employment history for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeEmploymentHistory> getEmployeeHistory(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return employmentHistoryRepository.findByEmployeeOrderByEffectiveDateDesc(employee);
    }

    /**
     * Get employment history for an employee with pagination
     */
    @Transactional(readOnly = true)
    public Page<EmployeeEmploymentHistory> getEmployeeHistory(Long employeeId, Pageable pageable) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return employmentHistoryRepository.findByEmployeeOrderByEffectiveDateDesc(employee, pageable);
    }

    /**
     * Get current employment history record for an employee
     */
    @Transactional(readOnly = true)
    public Optional<EmployeeEmploymentHistory> getCurrentEmploymentHistory(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return employmentHistoryRepository.findCurrentByEmployee(employee);
    }

    /**
     * Create a new employment history record
     */
    public EmployeeEmploymentHistory createEmploymentHistory(EmployeeEmploymentHistory history) {
        validateEmploymentHistory(history);
        
        // If this is marked as current, ensure no other record is current for this employee
        if (Boolean.TRUE.equals(history.getIsCurrent())) {
            markOtherRecordsAsNotCurrent(history.getEmployee());
        }
        
        return employmentHistoryRepository.save(history);
    }

    /**
     * Create employment history record for employee joining
     */
    public EmployeeEmploymentHistory createJoiningHistory(Long employeeId, LocalDate joiningDate, 
            String jobTitle, String jobLevel, Department department, Employee manager, 
            BigDecimal salary, String salaryCurrency, String changedBy) {
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        EmployeeEmploymentHistory history = new EmployeeEmploymentHistory();
        history.setEmployee(employee);
        history.setEffectiveDate(joiningDate);
        history.setJobTitle(jobTitle);
        history.setJobLevel(jobLevel);
        history.setDepartment(department);
        history.setManager(manager);
        history.setSalaryAmount(salary);
        history.setSalaryCurrency(salaryCurrency);
        history.setChangeType("JOINING");
        history.setChangeReason("Employee joining the organization");
        history.setChangedBy(changedBy);
        history.setIsCurrent(true);

        return createEmploymentHistory(history);
    }

    /**
     * Create employment history record for promotion
     */
    public EmployeeEmploymentHistory createPromotionHistory(Long employeeId, LocalDate effectiveDate,
            String newJobTitle, String newJobLevel, Department newDepartment, Employee newManager,
            BigDecimal newSalary, String changeReason, String changedBy) {
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        // End current history record
        endCurrentHistoryRecord(employee, effectiveDate.minusDays(1));

        EmployeeEmploymentHistory history = new EmployeeEmploymentHistory();
        history.setEmployee(employee);
        history.setEffectiveDate(effectiveDate);
        history.setJobTitle(newJobTitle);
        history.setJobLevel(newJobLevel);
        history.setDepartment(newDepartment);
        history.setManager(newManager);
        history.setSalary(newSalary);
        history.setChangeType("PROMOTION");
        history.setChangeReason(changeReason);
        history.setChangedBy(changedBy);
        history.setIsCurrent(true);

        return createEmploymentHistory(history);
    }

    /**
     * Create employment history record for transfer
     */
    public EmployeeEmploymentHistory createTransferHistory(Long employeeId, LocalDate effectiveDate,
            Department newDepartment, Employee newManager, String changeReason, String changedBy) {
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        // Get current history to copy existing values
        EmployeeEmploymentHistory currentHistory = getCurrentEmploymentHistory(employeeId)
                .orElseThrow(() -> new ValidationException("No current employment history found for employee"));

        // End current history record
        endCurrentHistoryRecord(employee, effectiveDate.minusDays(1));

        EmployeeEmploymentHistory history = new EmployeeEmploymentHistory();
        history.setEmployee(employee);
        history.setEffectiveDate(effectiveDate);
        history.setJobTitle(currentHistory.getJobTitle()); // Keep same job title
        history.setJobLevel(currentHistory.getJobLevel()); // Keep same job level
        history.setDepartment(newDepartment);
        history.setManager(newManager);
        history.setSalary(currentHistory.getSalary()); // Keep same salary
        history.setSalaryCurrency(currentHistory.getSalaryCurrency());
        history.setChangeType("TRANSFER");
        history.setChangeReason(changeReason);
        history.setChangedBy(changedBy);
        history.setIsCurrent(true);

        return createEmploymentHistory(history);
    }

    /**
     * Create employment history record for salary revision
     */
    public EmployeeEmploymentHistory createSalaryRevisionHistory(Long employeeId, LocalDate effectiveDate,
            BigDecimal newSalary, String salaryCurrency, String changeReason, String changedBy) {
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        // Get current history to copy existing values
        EmployeeEmploymentHistory currentHistory = getCurrentEmploymentHistory(employeeId)
                .orElseThrow(() -> new ValidationException("No current employment history found for employee"));

        // End current history record
        endCurrentHistoryRecord(employee, effectiveDate.minusDays(1));

        EmployeeEmploymentHistory history = new EmployeeEmploymentHistory();
        history.setEmployee(employee);
        history.setEffectiveDate(effectiveDate);
        history.setJobTitle(currentHistory.getJobTitle()); // Keep same job title
        history.setJobLevel(currentHistory.getJobLevel()); // Keep same job level
        history.setDepartment(currentHistory.getDepartment()); // Keep same department
        history.setManager(currentHistory.getManager()); // Keep same manager
        history.setSalary(newSalary);
        history.setSalaryCurrency(salaryCurrency);
        history.setChangeType("SALARY_REVISION");
        history.setChangeReason(changeReason);
        history.setChangedBy(changedBy);
        history.setIsCurrent(true);

        return createEmploymentHistory(history);
    }

    /**
     * Create employment history record for role change
     */
    public EmployeeEmploymentHistory createRoleChangeHistory(Long employeeId, LocalDate effectiveDate,
            String newJobTitle, String newJobLevel, String changeReason, String changedBy) {
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        // Get current history to copy existing values
        EmployeeEmploymentHistory currentHistory = getCurrentEmploymentHistory(employeeId)
                .orElseThrow(() -> new ValidationException("No current employment history found for employee"));

        // End current history record
        endCurrentHistoryRecord(employee, effectiveDate.minusDays(1));

        EmployeeEmploymentHistory history = new EmployeeEmploymentHistory();
        history.setEmployee(employee);
        history.setEffectiveDate(effectiveDate);
        history.setJobTitle(newJobTitle);
        history.setJobLevel(newJobLevel);
        history.setDepartment(currentHistory.getDepartment()); // Keep same department
        history.setManager(currentHistory.getManager()); // Keep same manager
        history.setSalary(currentHistory.getSalary()); // Keep same salary
        history.setSalaryCurrency(currentHistory.getSalaryCurrency());
        history.setChangeType("ROLE_CHANGE");
        history.setChangeReason(changeReason);
        history.setChangedBy(changedBy);
        history.setIsCurrent(true);

        return createEmploymentHistory(history);
    }

    /**
     * Get employment history by change type
     */
    @Transactional(readOnly = true)
    public List<EmployeeEmploymentHistory> getHistoryByChangeType(Long employeeId, String changeType) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        // Convert String to HistoryReason enum
        EmployeeEmploymentHistory.HistoryReason reason;
        try {
            reason = EmployeeEmploymentHistory.HistoryReason.valueOf(changeType);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid change type: " + changeType);
        }
        
        return employmentHistoryRepository.findByEmployeeAndReason(employee, reason);
    }

    /**
     * Get promotions for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeEmploymentHistory> getPromotions(Long employeeId) {
        return getHistoryByChangeType(employeeId, "PROMOTION");
    }

    /**
     * Get transfers for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeEmploymentHistory> getTransfers(Long employeeId) {
        return getHistoryByChangeType(employeeId, "TRANSFER");
    }

    /**
     * Get salary revisions for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeEmploymentHistory> getSalaryRevisions(Long employeeId) {
        return getHistoryByChangeType(employeeId, "SALARY_REVISION");
    }

    /**
     * Check if employee has any employment history
     */
    @Transactional(readOnly = true)
    public boolean hasEmploymentHistory(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return employmentHistoryRepository.existsByEmployee(employee);
    }

    /**
     * Get employment history count for an employee
     */
    @Transactional(readOnly = true)
    public long getHistoryCount(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return employmentHistoryRepository.countByEmployee(employee);
    }

    /**
     * Private helper method to validate employment history
     */
    private void validateEmploymentHistory(EmployeeEmploymentHistory history) {
        if (history.getEmployee() == null) {
            throw new ValidationException("Employee is required for employment history");
        }
        
        if (history.getEffectiveDate() == null) {
            throw new ValidationException("Effective date is required for employment history");
        }
        
        if (history.getEndDate() != null && history.getEndDate().isBefore(history.getEffectiveDate())) {
            throw new ValidationException("End date cannot be before effective date");
        }
        
        // Check for overlapping records
        List<EmployeeEmploymentHistory> overlapping = employmentHistoryRepository.findOverlappingRecords(
                history.getEmployee(), 
                history.getEffectiveDate(), 
                history.getEndDate() != null ? history.getEndDate() : LocalDate.now().plusYears(100)
        );
        
        // Remove current record from overlapping check if updating
        if (history.getId() != null) {
            overlapping.removeIf(h -> h.getId().equals(history.getId()));
        }
        
        if (!overlapping.isEmpty()) {
            throw new ValidationException("Employment history record overlaps with existing records");
        }
    }

    /**
     * Private helper method to mark other records as not current
     */
    private void markOtherRecordsAsNotCurrent(Employee employee) {
        List<EmployeeEmploymentHistory> currentRecords = employmentHistoryRepository.findActiveByEmployee(employee);
        for (EmployeeEmploymentHistory record : currentRecords) {
            record.setIsCurrent(false);
            employmentHistoryRepository.save(record);
        }
    }

    /**
     * Private helper method to end current history record
     */
    private void endCurrentHistoryRecord(Employee employee, LocalDate endDate) {
        Optional<EmployeeEmploymentHistory> currentHistory = employmentHistoryRepository.findCurrentByEmployee(employee);
        if (currentHistory.isPresent()) {
            EmployeeEmploymentHistory history = currentHistory.get();
            history.setEndDate(endDate);
            history.setIsCurrent(false);
            employmentHistoryRepository.save(history);
        }
    }
}

