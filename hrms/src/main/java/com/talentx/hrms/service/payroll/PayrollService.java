package com.talentx.hrms.service.payroll;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.payroll.PayrollRunDTO;
import com.talentx.hrms.entity.attendance.AttendanceRecord;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentType;
import com.talentx.hrms.entity.enums.PayrollStatus;
import com.talentx.hrms.entity.payroll.PayrollItem;
import com.talentx.hrms.entity.payroll.PayrollRun;
import com.talentx.hrms.entity.payroll.Payslip;
import com.talentx.hrms.repository.*;
import com.talentx.hrms.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollService {

    private final PayrollRunRepository payrollRunRepository;
    private final PayslipRepository payslipRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final PayrollItemRepository payrollItemRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    // Tax rates and deduction constants
    private static final BigDecimal FEDERAL_TAX_RATE = new BigDecimal("0.22");
    private static final BigDecimal STATE_TAX_RATE = new BigDecimal("0.05");
    private static final BigDecimal SOCIAL_SECURITY_RATE = new BigDecimal("0.062");
    private static final BigDecimal MEDICARE_RATE = new BigDecimal("0.0145");
    private static final BigDecimal UNEMPLOYMENT_TAX_RATE = new BigDecimal("0.006");
    private static final BigDecimal OVERTIME_MULTIPLIER = new BigDecimal("1.5");
    private static final BigDecimal STANDARD_WORK_HOURS_PER_DAY = new BigDecimal("8");
    private static final BigDecimal STANDARD_WORK_DAYS_PER_MONTH = new BigDecimal("22");

    @Autowired
    public PayrollService(PayrollRunRepository payrollRunRepository,
                         PayslipRepository payslipRepository,
                         EmployeeRepository employeeRepository,
                         AttendanceRecordRepository attendanceRecordRepository,
                         PayrollItemRepository payrollItemRepository,
                         OrganizationRepository organizationRepository,
                         UserRepository userRepository,
                         AuthService authService) {
        this.payrollRunRepository = payrollRunRepository;
        this.payslipRepository = payslipRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.payrollItemRepository = payrollItemRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    /**
     * Create a new payroll run
     */
    public PayrollRun createPayrollRun(String name, String description, LocalDate payPeriodStart, 
                                      LocalDate payPeriodEnd, LocalDate payDate, Organization organization) {
        // Check if payroll run already exists for this period
        if (payrollRunRepository.existsByOrganizationAndPayPeriod(organization, payPeriodStart, payPeriodEnd)) {
            throw new IllegalArgumentException("Payroll run already exists for this pay period");
        }

        PayrollRun payrollRun = new PayrollRun(name, payPeriodStart, payPeriodEnd, payDate, organization);
        payrollRun.setDescription(description);
        payrollRun.setStatus(PayrollStatus.DRAFT);
        
        return payrollRunRepository.save(payrollRun);
    }

    /**
     * Process payroll run - calculate payslips for all active employees
     */
    public PayrollRun processPayrollRun(Long payrollRunId, String processedByUsername) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new IllegalArgumentException("Payroll run not found"));

        if (!payrollRun.canBeModified()) {
            throw new IllegalStateException("Payroll run cannot be modified in current status: " + payrollRun.getStatus());
        }

        try {
            payrollRun.setStatus(PayrollStatus.PROCESSING);
            payrollRun = payrollRunRepository.save(payrollRun);

            // Get all active employees for the organization
            List<Employee> activeEmployees = employeeRepository.findActiveByOrganization(payrollRun.getOrganization());

            // Create payslips for each employee
            for (Employee employee : activeEmployees) {
                createPayslipForEmployee(payrollRun, employee);
            }

            // Calculate totals for the payroll run
            payrollRun.calculateTotals();
            payrollRun.setStatus(PayrollStatus.CALCULATED);
            payrollRun.setProcessedAt(Instant.now());
            // Resolve employee by username for the FK reference
            employeeRepository.findByUserUsername(processedByUsername)
                .ifPresent(payrollRun::setProcessedBy);

            return payrollRunRepository.save(payrollRun);

        } catch (Exception e) {
            payrollRun.setStatus(PayrollStatus.ERROR);
            payrollRun.setNotes("Error processing payroll: " + e.getMessage());
            payrollRunRepository.save(payrollRun);
            throw new RuntimeException("Failed to process payroll run", e);
        }
    }

    /**
     * Create payslip for a specific employee
     */
    private Payslip createPayslipForEmployee(PayrollRun payrollRun, Employee employee) {
        // Check if payslip already exists
        Optional<Payslip> existingPayslip = payslipRepository.findByPayrollRunAndEmployee(payrollRun, employee);
        if (existingPayslip.isPresent()) {
            return existingPayslip.get();
        }

        Payslip payslip = new Payslip(payrollRun, employee);

        // Calculate basic salary and hours
        calculateBasicSalaryAndHours(payslip, payrollRun.getPayPeriodStart(), payrollRun.getPayPeriodEnd());

        // Calculate earnings
        calculateEarnings(payslip);

        // Calculate deductions and taxes
        calculateDeductions(payslip);
        calculateTaxes(payslip);

        // Calculate totals
        payslip.calculateTotals();

        // Save payslip
        payslip = payslipRepository.save(payslip);

        // Add to payroll run
        payrollRun.addPayslip(payslip);

        return payslip;
    }

    /**
     * Calculate basic salary and hours worked
     */
    private void calculateBasicSalaryAndHours(Payslip payslip, LocalDate startDate, LocalDate endDate) {
        Employee employee = payslip.getEmployee();
        
        if (employee.getEmploymentType() == EmploymentType.FULL_TIME) {
            // For salaried employees, use monthly salary
            if (employee.getSalaryAmount() != null) {
                payslip.setBasicSalary(employee.getSalaryAmount());
            }
        } else if (employee.getEmploymentType() == EmploymentType.PART_TIME || 
                   employee.getEmploymentType() == EmploymentType.CONTRACT) {
            // For hourly employees, calculate based on hours worked
            if (employee.getHourlyRate() != null) {
                calculateHourlyPay(payslip, startDate, endDate);
            }
        }

        // Get attendance records for the pay period
        List<AttendanceRecord> attendanceRecords = attendanceRecordRepository
            .findByEmployeeAndDateRange(employee, startDate, endDate);

        // Calculate total hours
        BigDecimal totalRegularHours = BigDecimal.ZERO;
        BigDecimal totalOvertimeHours = BigDecimal.ZERO;

        for (AttendanceRecord record : attendanceRecords) {
            if (record.isPresent()) {
                if (record.getRegularHours() != null) {
                    totalRegularHours = totalRegularHours.add(record.getRegularHours());
                }
                if (record.getOvertimeHours() != null) {
                    totalOvertimeHours = totalOvertimeHours.add(record.getOvertimeHours());
                }
            }
        }

        payslip.setRegularHours(totalRegularHours);
        payslip.setOvertimeHours(totalOvertimeHours);

        // Calculate overtime pay
        if (totalOvertimeHours.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal overtimeRate = calculateOvertimeRate(employee);
            payslip.setOvertimeRate(overtimeRate);
            payslip.setOvertimePay(totalOvertimeHours.multiply(overtimeRate));
        }
    }

    /**
     * Calculate hourly pay for part-time/contract employees
     */
    private void calculateHourlyPay(Payslip payslip, LocalDate startDate, LocalDate endDate) {
        Employee employee = payslip.getEmployee();
        BigDecimal hourlyRate = employee.getHourlyRate();

        // Get total hours worked from attendance
        BigDecimal totalHours = attendanceRecordRepository
            .getTotalHoursByEmployeeAndDateRange(employee, startDate, endDate);

        if (totalHours == null) {
            totalHours = BigDecimal.ZERO;
        }

        BigDecimal basicPay = totalHours.multiply(hourlyRate);
        payslip.setBasicSalary(basicPay);
    }

    /**
     * Calculate overtime rate
     */
    private BigDecimal calculateOvertimeRate(Employee employee) {
        BigDecimal baseRate;
        
        // Note: hourlyRate field doesn't exist in database schema
        // For now, calculate from salary if available
        if (employee.getSalaryAmount() != null) {
            // Convert monthly salary to hourly rate
            BigDecimal monthlyHours = STANDARD_WORK_DAYS_PER_MONTH.multiply(STANDARD_WORK_HOURS_PER_DAY);
            baseRate = employee.getSalaryAmount().divide(monthlyHours, 2, RoundingMode.HALF_UP);
        } else {
            baseRate = BigDecimal.ZERO;
        }

        return baseRate.multiply(OVERTIME_MULTIPLIER);
    }

    /**
     * Calculate earnings (bonuses, commissions, allowances)
     */
    private void calculateEarnings(Payslip payslip) {
        // For now, set default values - in a real system, these would come from
        // employee records, performance data, or manual input
        payslip.setBonus(BigDecimal.ZERO);
        payslip.setCommission(BigDecimal.ZERO);
        payslip.setAllowances(BigDecimal.ZERO);
        payslip.setReimbursements(BigDecimal.ZERO);
    }

    /**
     * Calculate tax deductions
     */
    private void calculateTaxes(Payslip payslip) {
        BigDecimal grossPay = payslip.getBasicSalary().add(payslip.getOvertimePay())
            .add(payslip.getBonus()).add(payslip.getCommission())
            .add(payslip.getAllowances()).add(payslip.getReimbursements());

        // Federal tax
        BigDecimal federalTax = grossPay.multiply(FEDERAL_TAX_RATE)
            .setScale(2, RoundingMode.HALF_UP);
        payslip.setFederalTax(federalTax);

        // State tax
        BigDecimal stateTax = grossPay.multiply(STATE_TAX_RATE)
            .setScale(2, RoundingMode.HALF_UP);
        payslip.setStateTax(stateTax);

        // Social Security tax (up to wage base limit)
        BigDecimal socialSecurityTax = grossPay.multiply(SOCIAL_SECURITY_RATE)
            .setScale(2, RoundingMode.HALF_UP);
        payslip.setSocialSecurityTax(socialSecurityTax);

        // Medicare tax
        BigDecimal medicareTax = grossPay.multiply(MEDICARE_RATE)
            .setScale(2, RoundingMode.HALF_UP);
        payslip.setMedicareTax(medicareTax);

        // Unemployment tax (employer portion, but included for completeness)
        BigDecimal unemploymentTax = grossPay.multiply(UNEMPLOYMENT_TAX_RATE)
            .setScale(2, RoundingMode.HALF_UP);
        payslip.setUnemploymentTax(unemploymentTax);
    }

    /**
     * Calculate other deductions (insurance, retirement, etc.)
     */
    private void calculateDeductions(Payslip payslip) {
        // For now, set default values - in a real system, these would come from
        // employee benefit elections and plan configurations
        payslip.setHealthInsurance(new BigDecimal("150.00"));
        payslip.setDentalInsurance(new BigDecimal("25.00"));
        payslip.setVisionInsurance(new BigDecimal("10.00"));
        payslip.setLifeInsurance(new BigDecimal("20.00"));
        payslip.setRetirement401k(payslip.getBasicSalary().multiply(new BigDecimal("0.05"))
            .setScale(2, RoundingMode.HALF_UP));
        payslip.setOtherDeductions(BigDecimal.ZERO);
    }

    /**
     * Approve payroll run
     */
    public PayrollRun approvePayrollRun(Long payrollRunId, String approvedByUsername) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new IllegalArgumentException("Payroll run not found"));

        if (!payrollRun.canBeApproved()) {
            throw new IllegalStateException("Payroll run cannot be approved in current status: " + payrollRun.getStatus());
        }

        payrollRun.setStatus(PayrollStatus.APPROVED);
        payrollRun.setApprovedAt(Instant.now());
        // Resolve employee by username for the FK reference
        employeeRepository.findByUserUsername(approvedByUsername)
            .ifPresent(payrollRun::setApprovedBy);

        // Finalize all payslips
        List<Payslip> payslipsToFinalize = payrollRun.getPayslips();
        if (payslipsToFinalize != null) {
            for (Payslip payslip : payslipsToFinalize) {
                payslip.setIsFinalized(true);
            }
        }

        return payrollRunRepository.save(payrollRun);
    }

    /**
     * Mark payroll run as paid
     */
    public PayrollRun markPayrollRunAsPaid(Long payrollRunId, String paidBy) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new IllegalArgumentException("Payroll run not found"));

        if (!payrollRun.canBePaid()) {
            throw new IllegalStateException("Payroll run cannot be marked as paid in current status: " + payrollRun.getStatus());
        }

        payrollRun.setStatus(PayrollStatus.PAID);
        payrollRun.setPaidAt(Instant.now());
        payrollRun.setPaidBy(paidBy);

        return payrollRunRepository.save(payrollRun);
    }

    /**
     * Cancel payroll run
     */
    public PayrollRun cancelPayrollRun(Long payrollRunId, String reason) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new IllegalArgumentException("Payroll run not found"));

        if (payrollRun.getStatus() == PayrollStatus.PAID) {
            throw new IllegalStateException("Cannot cancel a paid payroll run");
        }

        payrollRun.setStatus(PayrollStatus.CANCELLED);
        payrollRun.setNotes(reason);

        return payrollRunRepository.save(payrollRun);
    }

    /**
     * Get payroll run by ID
     */
    @Transactional(readOnly = true)
    public Optional<PayrollRun> getPayrollRunById(Long id) {
        return payrollRunRepository.findById(id);
    }

    /**
     * Get payroll runs by organization
     */
    @Transactional(readOnly = true)
    public Page<PayrollRun> getPayrollRunsByOrganization(Organization organization, Pageable pageable) {
        return payrollRunRepository.findByOrganization(organization, pageable);
    }

    /**
     * Get payroll runs by status
     */
    @Transactional(readOnly = true)
    public Page<PayrollRun> getPayrollRunsByStatus(Organization organization, PayrollStatus status, Pageable pageable) {
        return payrollRunRepository.findByOrganizationAndStatus(organization, status, pageable);
    }

    /**
     * Get payslips for a payroll run
     */
    @Transactional(readOnly = true)
    public Page<Payslip> getPayslipsByPayrollRun(PayrollRun payrollRun, Pageable pageable) {
        return payslipRepository.findByPayrollRun(payrollRun, pageable);
    }

    /**
     * Get payslips for an employee
     */
    @Transactional(readOnly = true)
    public Page<Payslip> getPayslipsByEmployee(Employee employee, Pageable pageable) {
        return payslipRepository.findByEmployee(employee, pageable);
    }

    /**
     * Get payslip by ID
     */
    @Transactional(readOnly = true)
    public Optional<Payslip> getPayslipById(Long id) {
        return payslipRepository.findById(id);
    }

    /**
     * Recalculate payslip
     */
    public Payslip recalculatePayslip(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
            .orElseThrow(() -> new IllegalArgumentException("Payslip not found"));

        if (payslip.getIsFinalized()) {
            throw new IllegalStateException("Cannot recalculate finalized payslip");
        }

        PayrollRun payrollRun = payslip.getPayrollRun();
        
        // Recalculate all components
        calculateBasicSalaryAndHours(payslip, payrollRun.getPayPeriodStart(), payrollRun.getPayPeriodEnd());
        calculateEarnings(payslip);
        calculateDeductions(payslip);
        calculateTaxes(payslip);
        payslip.calculateTotals();

        return payslipRepository.save(payslip);
    }

    /**
     * Generate payslip PDF (placeholder - would integrate with PDF generation library)
     */
    public String generatePayslipPdf(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
            .orElseThrow(() -> new IllegalArgumentException("Payslip not found"));

        // Placeholder for PDF generation
        String pdfPath = "/payslips/" + payslip.getId() + "_" + 
                        payslip.getEmployee().getEmployeeNumber() + "_" +
                        payslip.getPayrollRun().getName().replaceAll("\\s+", "_") + ".pdf";
        
        payslip.setPdfPath(pdfPath);
        payslipRepository.save(payslip);

        return pdfPath;
    }

    /**
     * Get payroll statistics for organization
     */
    @Transactional(readOnly = true)
    public PayrollStatistics getPayrollStatistics(Organization organization, int year) {
        BigDecimal totalGrossPay = payrollRunRepository.getTotalGrossPayByOrganizationAndYear(organization, year);
        BigDecimal totalNetPay = payrollRunRepository.getTotalNetPayByOrganizationAndYear(organization, year);
        BigDecimal totalTaxes = payrollRunRepository.getTotalTaxesByOrganizationAndYear(organization, year);
        
        long totalPayrollRuns = payrollRunRepository.countByOrganizationAndStatus(organization, PayrollStatus.PAID);
        
        return new PayrollStatistics(totalGrossPay, totalNetPay, totalTaxes, totalPayrollRuns);
    }

    /**
     * Inner class for payroll statistics
     */
    public static class PayrollStatistics {
        private final BigDecimal totalGrossPay;
        private final BigDecimal totalNetPay;
        private final BigDecimal totalTaxes;
        private final long totalPayrollRuns;

        public PayrollStatistics(BigDecimal totalGrossPay, BigDecimal totalNetPay, 
                               BigDecimal totalTaxes, long totalPayrollRuns) {
            this.totalGrossPay = totalGrossPay != null ? totalGrossPay : BigDecimal.ZERO;
            this.totalNetPay = totalNetPay != null ? totalNetPay : BigDecimal.ZERO;
            this.totalTaxes = totalTaxes != null ? totalTaxes : BigDecimal.ZERO;
            this.totalPayrollRuns = totalPayrollRuns;
        }

        public BigDecimal getTotalGrossPay() { return totalGrossPay; }
        public BigDecimal getTotalNetPay() { return totalNetPay; }
        public BigDecimal getTotalTaxes() { return totalTaxes; }
        public long getTotalPayrollRuns() { return totalPayrollRuns; }
    }

    // Additional methods required by PayrollController
    
    /**
     * Get all payroll runs with filtering
     */
    @Transactional(readOnly = true)
    public Page<PayrollRunDTO> getAllPayrollRuns(PayrollStatus status, Integer year, Integer month, PaginationRequest paginationRequest) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();
        
        Pageable pageable = createPageable(paginationRequest);
        Page<PayrollRun> payrollRuns;
        
        if (status != null) {
            payrollRuns = payrollRunRepository.findByOrganizationAndStatus(organization, status, pageable);
        } else {
            payrollRuns = payrollRunRepository.findByOrganization(organization, pageable);
        }
        
        return payrollRuns.map(this::convertToDTO);
    }
    
    /**
     * Get payroll run by ID as DTO
     */
    @Transactional(readOnly = true)
    public PayrollRunDTO getPayrollRun(Long id) {
        PayrollRun payrollRun = payrollRunRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
        return convertToDTO(payrollRun);
    }
    
    /**
     * Create payroll run from DTO
     */
    public PayrollRunDTO createPayrollRun(PayrollRunDTO dto) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();

        // Auto-generate name from description or pay period if not provided
        String name = dto.getName();
        if (name == null || name.isBlank()) {
            if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
                name = dto.getDescription();
            } else if (dto.getPayPeriodStart() != null) {
                name = dto.getPayPeriodStart().getMonth().name() + " " + dto.getPayPeriodStart().getYear() + " Payroll";
            } else {
                name = "Payroll Run " + java.time.Instant.now().toString().substring(0, 10);
            }
        }

        PayrollRun payrollRun = createPayrollRun(
            name,
            dto.getDescription(),
            dto.getPayPeriodStart(),
            dto.getPayPeriodEnd(),
            dto.getPayDate(),
            organization
        );

        return convertToDTO(payrollRun);
    }
    
    /**
     * Update payroll run from DTO
     */
    public PayrollRunDTO updatePayrollRun(Long id, PayrollRunDTO dto) {
        PayrollRun payrollRun = payrollRunRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
            
        if (!payrollRun.canBeModified()) {
            throw new RuntimeException("Payroll run cannot be modified in current status");
        }
        
        payrollRun.setName(dto.getName());
        payrollRun.setDescription(dto.getDescription());
        payrollRun.setPayPeriodStart(dto.getPayPeriodStart());
        payrollRun.setPayPeriodEnd(dto.getPayPeriodEnd());
        payrollRun.setPayDate(dto.getPayDate());
        
        payrollRun = payrollRunRepository.save(payrollRun);
        return convertToDTO(payrollRun);
    }
    
    /**
     * Process payroll run and return DTO
     */
    public PayrollRunDTO processPayrollRun(Long id) {
        User currentUser = authService.getCurrentUser();
        PayrollRun payrollRun = processPayrollRun(id, currentUser.getUsername());
        return convertToDTO(payrollRun);
    }
    
    /**
     * Approve payroll run with comments
     */
    public PayrollRunDTO approvePayrollRunWithComments(Long id, String comments) {
        User currentUser = authService.getCurrentUser();
        PayrollRun payrollRun = approvePayrollRun(id, currentUser.getUsername());
        if (comments != null) {
            payrollRun.setNotes(comments);
            payrollRun = payrollRunRepository.save(payrollRun);
        }
        return convertToDTO(payrollRun);
    }
    
    /**
     * Reject payroll run
     */
    public PayrollRunDTO rejectPayrollRun(Long id, String reason) {
        PayrollRun payrollRun = payrollRunRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
            
        payrollRun.setStatus(PayrollStatus.REJECTED);
        payrollRun.setNotes(reason);
        payrollRun = payrollRunRepository.save(payrollRun);
        
        return convertToDTO(payrollRun);
    }
    
    /**
     * Delete payroll run
     */
    public void deletePayrollRun(Long id) {
        PayrollRun payrollRun = payrollRunRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
            
        if (payrollRun.getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Only draft payroll runs can be deleted");
        }
        
        payrollRunRepository.delete(payrollRun);
    }
    
    /**
     * Get payroll items for a payroll run
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPayrollItems(Long payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
        
        List<Payslip> payslips = payrollRun.getPayslips();
        if (payslips == null || payslips.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return payslips.stream()
            .map(this::convertPayslipToMap)
            .collect(Collectors.toList());
    }
    
    /**
     * Get payslips for a payroll run
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPayslips(Long payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
        
        List<Payslip> payslips = payrollRun.getPayslips();
        if (payslips == null || payslips.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return payslips.stream()
            .map(this::convertPayslipToMap)
            .collect(Collectors.toList());
    }
    
    /**
     * Get payslip by ID as map
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPayslip(Long id) {
        Payslip payslip = payslipRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payslip not found"));
        return convertPayslipToMap(payslip);
    }
    
    /**
     * Generate payslip PDF and return as Resource
     */
    public Resource getPayslipPdfResource(Long id) {
        String pdfPath = generatePayslipPdf(id);
        try {
            Path filePath = Paths.get(pdfPath);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read payslip PDF file");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error loading payslip PDF: " + e.getMessage());
        }
    }
    
    /**
     * Get employee payslips
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmployeePayslips(Long employeeId, Integer year, Integer month) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
            
        List<Payslip> payslips = payslipRepository.findByEmployee(employee, Pageable.unpaged()).getContent();
        
        return payslips.stream()
            .filter(p -> filterByYearMonth(p, year, month))
            .map(this::convertPayslipToMap)
            .collect(Collectors.toList());
    }
    
    /**
     * Get current user's payslips
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCurrentUserPayslips(Integer year, Integer month) {
        User currentUser = authService.getCurrentUser();
        // Admin user may not have an employee record — return empty list gracefully
        return employeeRepository.findByUser(currentUser)
            .map(employee -> getEmployeePayslips(employee.getId(), year, month))
            .orElse(java.util.Collections.emptyList());
    }
    
    /**
     * Generate payroll report
     */
    public Resource generatePayrollReport(Long payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository.findById(payrollRunId)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
            
        // Placeholder for PDF generation
        String reportPath = "/reports/payroll_" + payrollRunId + ".pdf";
        
        try {
            Path filePath = Paths.get(reportPath);
            Resource resource = new UrlResource(filePath.toUri());
            return resource;
        } catch (Exception e) {
            throw new RuntimeException("Error generating payroll report: " + e.getMessage());
        }
    }
    
    /**
     * Get payroll statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPayrollStatistics(Integer year, Integer month, Long departmentId) {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();
        
        Map<String, Object> stats = new HashMap<>();
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        
        PayrollStatistics statistics = getPayrollStatistics(organization, year);
        
        stats.put("totalGrossPay", statistics.getTotalGrossPay());
        stats.put("totalNetPay", statistics.getTotalNetPay());
        stats.put("totalTaxes", statistics.getTotalTaxes());
        stats.put("totalPayrollRuns", statistics.getTotalPayrollRuns());
        stats.put("year", year);
        
        return stats;
    }
    
    /**
     * Get pending payroll runs
     */
    @Transactional(readOnly = true)
    public List<PayrollRunDTO> getPendingPayrollRuns() {
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();
        
        List<PayrollRun> pendingRuns = payrollRunRepository.findByOrganizationAndStatus(
            organization, PayrollStatus.CALCULATED, Pageable.unpaged()).getContent();
            
        return pendingRuns.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Validate payroll run
     */
    @Transactional(readOnly = true)
    public Map<String, Object> validatePayrollRun(Long id) {
        PayrollRun payrollRun = payrollRunRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payroll run not found"));
            
        Map<String, Object> validation = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // Validate dates
        if (payrollRun.getPayPeriodStart().isAfter(payrollRun.getPayPeriodEnd())) {
            errors.add("Pay period start date must be before end date");
        }
        
        if (payrollRun.getPayDate().isBefore(payrollRun.getPayPeriodEnd())) {
            warnings.add("Pay date is before pay period end date");
        }
        
        // Validate employees
        List<Employee> activeEmployees = employeeRepository.findActiveByOrganization(payrollRun.getOrganization());
        if (activeEmployees.isEmpty()) {
            errors.add("No active employees found for this organization");
        }
        
        validation.put("isValid", errors.isEmpty());
        validation.put("errors", errors);
        validation.put("warnings", warnings);
        validation.put("employeeCount", activeEmployees.size());
        
        return validation;
    }
    
    /**
     * Get payroll calendar
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPayrollCalendar(Integer year) {
        final Integer targetYear = (year == null) ? LocalDate.now().getYear() : year;
        
        User currentUser = authService.getCurrentUser();
        Organization organization = currentUser.getOrganization();
        
        List<PayrollRun> payrollRuns = payrollRunRepository.findByOrganization(organization, Pageable.unpaged()).getContent();
        
        return payrollRuns.stream()
            .filter(pr -> pr.getPayPeriodStart().getYear() == targetYear || pr.getPayPeriodEnd().getYear() == targetYear)
            .map(pr -> {
                Map<String, Object> entry = new HashMap<>();
                entry.put("id", pr.getId());
                entry.put("name", pr.getName());
                entry.put("payPeriodStart", pr.getPayPeriodStart());
                entry.put("payPeriodEnd", pr.getPayPeriodEnd());
                entry.put("payDate", pr.getPayDate());
                entry.put("status", pr.getStatus());
                return entry;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Check if payslip belongs to current user
     */
    public boolean isCurrentUserPayslip(Long payslipId) {
        try {
            User currentUser = authService.getCurrentUser();
            Payslip payslip = payslipRepository.findById(payslipId).orElse(null);
            if (payslip == null) return false;
            
            Employee employee = employeeRepository.findByUser(currentUser).orElse(null);
            if (employee == null) return false;
            
            return payslip.getEmployee().getId().equals(employee.getId());
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if employee belongs to current user
     */
    public boolean isCurrentUser(Long employeeId) {
        try {
            User currentUser = authService.getCurrentUser();
            Employee employee = employeeRepository.findByUser(currentUser).orElse(null);
            if (employee == null) return false;
            
            return employee.getId().equals(employeeId);
        } catch (Exception e) {
            return false;
        }
    }
    
    // Helper methods
    
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }
        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }
    
    private PayrollRunDTO convertToDTO(PayrollRun payrollRun) {
        PayrollRunDTO dto = new PayrollRunDTO();
        dto.setId(payrollRun.getId());
        dto.setName(payrollRun.getName());
        dto.setDescription(payrollRun.getDescription());
        dto.setPayPeriodStart(payrollRun.getPayPeriodStart());
        dto.setPayPeriodEnd(payrollRun.getPayPeriodEnd());
        dto.setPayDate(payrollRun.getPayDate());
        dto.setStatus(payrollRun.getStatus());
        dto.setTotalGrossPay(payrollRun.getTotalGrossPay());
        dto.setTotalDeductions(payrollRun.getTotalDeductions());
        dto.setTotalNetPay(payrollRun.getTotalNetPay());
        dto.setEmployeeCount(payrollRun.getPayslips() != null ? payrollRun.getPayslips().size() : 0);
        dto.setProcessedAt(payrollRun.getProcessedAt());
        // Safe lazy access — proxy may not be initialized outside session
        try {
            if (payrollRun.getProcessedBy() != null) {
                dto.setProcessedBy(payrollRun.getProcessedBy().getFullName());
            }
        } catch (Exception ignored) { /* lazy proxy not initialized */ }
        dto.setApprovedAt(payrollRun.getApprovedAt());
        try {
            if (payrollRun.getApprovedBy() != null) {
                dto.setApprovedById(payrollRun.getApprovedBy().getId());
                dto.setApprovedByName(payrollRun.getApprovedBy().getFullName());
                dto.setApprovedBy(payrollRun.getApprovedBy().getFullName());
            }
        } catch (Exception ignored) { /* lazy proxy not initialized */ }
        dto.setNotes(payrollRun.getNotes());
        return dto;
    }
    
    private Map<String, Object> convertPayslipToMap(Payslip payslip) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", payslip.getId());
        // Safe employee access — employee may be null if @NotFound IGNORE
        try {
            if (payslip.getEmployee() != null) {
                map.put("employeeId", payslip.getEmployee().getId());
                map.put("employeeName", payslip.getEmployee().getFirstName() + " " + payslip.getEmployee().getLastName());
                map.put("employeeNumber", payslip.getEmployee().getEmployeeNumber());
            } else {
                map.put("employeeId", null);
                map.put("employeeName", "Unknown");
                map.put("employeeNumber", "N/A");
            }
        } catch (Exception e) {
            map.put("employeeId", null);
            map.put("employeeName", "Unknown");
            map.put("employeeNumber", "N/A");
        }
        map.put("basicSalary", payslip.getBasicSalary());
        map.put("overtimePay", payslip.getOvertimePay());
        map.put("bonus", payslip.getBonus());
        map.put("commission", payslip.getCommission());
        map.put("allowances", payslip.getAllowances());
        map.put("grossPay", payslip.getGrossPay());
        map.put("totalDeductions", payslip.getTotalDeductions());
        map.put("netPay", payslip.getNetPay());
        map.put("federalTax", payslip.getFederalTax());
        map.put("stateTax", payslip.getStateTax());
        map.put("socialSecurityTax", payslip.getSocialSecurityTax());
        map.put("medicareTax", payslip.getMedicareTax());
        map.put("isFinalized", payslip.getIsFinalized());
        map.put("pdfPath", payslip.getPdfPath());
        return map;
    }
    
    private boolean filterByYearMonth(Payslip payslip, Integer year, Integer month) {
        LocalDate periodStart = payslip.getPayrollRun().getPayPeriodStart();
        
        if (year != null && periodStart.getYear() != year) {
            return false;
        }
        
        if (month != null && periodStart.getMonthValue() != month) {
            return false;
        }
        
        return true;
    }
}

