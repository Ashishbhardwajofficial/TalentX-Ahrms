package com.talentx.hrms.entity.payroll;

import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Entity
@Table(name = "payslips", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "employee_id", "payslip_month" })
})
@Getter
@Setter
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payslip_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee employee;

    /**
     * DB column: payroll_item_id (FK to payroll_items) — NOT NULL
     * This is the primary payroll item associated with this payslip.
     * Stored as a direct FK in the payslips table.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_item_id", nullable = true)
    private PayrollItem primaryPayrollItem;

    @Column(name = "payslip_month", length = 7)
    private String payslipMonth; // YYYY-MM format

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "generated_at")
    private Instant generatedAt;

    // Salary and Hours (transient - not stored in payslips table, calculated from payroll_items)
    @Transient
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Transient
    private BigDecimal regularHours = BigDecimal.ZERO;

    @Transient
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Transient
    private BigDecimal overtimeRate = BigDecimal.ZERO;

    @Transient
    private BigDecimal overtimePay = BigDecimal.ZERO;

    // Earnings (transient)
    @Transient
    private BigDecimal bonus = BigDecimal.ZERO;

    @Transient
    private BigDecimal commission = BigDecimal.ZERO;

    @Transient
    private BigDecimal allowances = BigDecimal.ZERO;

    @Transient
    private BigDecimal reimbursements = BigDecimal.ZERO;

    // Taxes (transient)
    @Transient
    private BigDecimal federalTax = BigDecimal.ZERO;

    @Transient
    private BigDecimal stateTax = BigDecimal.ZERO;

    @Transient
    private BigDecimal socialSecurityTax = BigDecimal.ZERO;

    @Transient
    private BigDecimal medicareTax = BigDecimal.ZERO;

    @Transient
    private BigDecimal unemploymentTax = BigDecimal.ZERO;

    @Transient
    private BigDecimal totalTaxes = BigDecimal.ZERO;

    // Deductions (transient)
    @Transient
    private BigDecimal healthInsurance = BigDecimal.ZERO;

    @Transient
    private BigDecimal dentalInsurance = BigDecimal.ZERO;

    @Transient
    private BigDecimal visionInsurance = BigDecimal.ZERO;

    @Transient
    private BigDecimal lifeInsurance = BigDecimal.ZERO;

    @Transient
    private BigDecimal retirement401k = BigDecimal.ZERO;

    @Transient
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Transient
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    // Totals (transient)
    @Transient
    private BigDecimal grossPay = BigDecimal.ZERO;

    @Transient
    private BigDecimal netPay = BigDecimal.ZERO;

    // Status fields (transient)
    @Transient
    private Boolean isFinalized = false;

    @Transient
    private String pdfPath;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = Instant.now();
    }

    // Constructors
    public Payslip() {
    }

    public Payslip(PayrollRun payrollRun, Employee employee) {
        this.payrollRun = payrollRun;
        this.employee = employee;
        initializeDefaults();
    }

    public Payslip(PayrollRun payrollRun, Employee employee, String payslipMonth, String pdfUrl) {
        this.payrollRun = payrollRun;
        this.employee = employee;
        this.payslipMonth = payslipMonth;
        this.pdfUrl = pdfUrl;
        initializeDefaults();
    }

    private void initializeDefaults() {
        this.basicSalary = BigDecimal.ZERO;
        this.regularHours = BigDecimal.ZERO;
        this.overtimeHours = BigDecimal.ZERO;
        this.overtimeRate = BigDecimal.ZERO;
        this.overtimePay = BigDecimal.ZERO;
        this.bonus = BigDecimal.ZERO;
        this.commission = BigDecimal.ZERO;
        this.allowances = BigDecimal.ZERO;
        this.reimbursements = BigDecimal.ZERO;
        this.federalTax = BigDecimal.ZERO;
        this.stateTax = BigDecimal.ZERO;
        this.socialSecurityTax = BigDecimal.ZERO;
        this.medicareTax = BigDecimal.ZERO;
        this.unemploymentTax = BigDecimal.ZERO;
        this.totalTaxes = BigDecimal.ZERO;
        this.healthInsurance = BigDecimal.ZERO;
        this.dentalInsurance = BigDecimal.ZERO;
        this.visionInsurance = BigDecimal.ZERO;
        this.lifeInsurance = BigDecimal.ZERO;
        this.retirement401k = BigDecimal.ZERO;
        this.otherDeductions = BigDecimal.ZERO;
        this.totalDeductions = BigDecimal.ZERO;
        this.grossPay = BigDecimal.ZERO;
        this.netPay = BigDecimal.ZERO;
        this.isFinalized = false;
    }

    /**
     * Calculate all totals for the payslip
     */
    public void calculateTotals() {
        // Calculate gross pay
        this.grossPay = this.basicSalary
                .add(this.overtimePay)
                .add(this.bonus)
                .add(this.commission)
                .add(this.allowances)
                .add(this.reimbursements);

        // Calculate total taxes
        this.totalTaxes = this.federalTax
                .add(this.stateTax)
                .add(this.socialSecurityTax)
                .add(this.medicareTax)
                .add(this.unemploymentTax);

        // Calculate total deductions
        this.totalDeductions = this.healthInsurance
                .add(this.dentalInsurance)
                .add(this.visionInsurance)
                .add(this.lifeInsurance)
                .add(this.retirement401k)
                .add(this.otherDeductions)
                .add(this.totalTaxes);

        // Calculate net pay
        this.netPay = this.grossPay.subtract(this.totalDeductions);

        // Round to 2 decimal places
        this.grossPay = this.grossPay.setScale(2, RoundingMode.HALF_UP);
        this.totalTaxes = this.totalTaxes.setScale(2, RoundingMode.HALF_UP);
        this.totalDeductions = this.totalDeductions.setScale(2, RoundingMode.HALF_UP);
        this.netPay = this.netPay.setScale(2, RoundingMode.HALF_UP);
    }

    // Getter/Setter for isFinalized (Boolean wrapper methods)
    public Boolean getIsFinalized() {
        return isFinalized;
    }

    public void setIsFinalized(Boolean isFinalized) {
        this.isFinalized = isFinalized;
    }

    // Getter/Setter for pdfPath
    public String getPdfPath() {
        return pdfPath;
    }

    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }

    // Getter/Setter for primaryPayrollItem
    public PayrollItem getPrimaryPayrollItem() {
        return primaryPayrollItem;
    }

    public void setPrimaryPayrollItem(PayrollItem primaryPayrollItem) {
        this.primaryPayrollItem = primaryPayrollItem;
    }
}

