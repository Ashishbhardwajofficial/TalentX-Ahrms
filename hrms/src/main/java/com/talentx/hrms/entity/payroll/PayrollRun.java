package com.talentx.hrms.entity.payroll;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.PayrollStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payroll_runs")
@AttributeOverride(name = "id", column = @Column(name = "payroll_run_id"))
public class PayrollRun extends BaseEntity {

    @NotBlank(message = "Payroll run name is required")
    @Size(max = 255, message = "Payroll run name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description")
    private String description;

    @NotNull(message = "Pay period start date is required")
    @Column(name = "pay_period_start", nullable = false)
    private LocalDate payPeriodStart;

    @NotNull(message = "Pay period end date is required")
    @Column(name = "pay_period_end", nullable = false)
    private LocalDate payPeriodEnd;

    @NotNull(message = "Pay date is required")
    @Column(name = "pay_date", nullable = false)
    private LocalDate payDate;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PayrollStatus status = PayrollStatus.DRAFT;

    @Column(name = "total_gross_pay", precision = 15, scale = 2)
    private BigDecimal totalGrossPay = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 15, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "total_net_pay", precision = 15, scale = 2)
    private BigDecimal totalNetPay = BigDecimal.ZERO;

    @Column(name = "total_taxes", precision = 15, scale = 2)
    private BigDecimal totalTaxes = BigDecimal.ZERO;

    @Column(name = "employee_count")
    private Integer employeeCount = 0;

    @Column(name = "processed_at")
    private Instant processedAt;

    // DB column processed_by is bigint FK to employees
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee processedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    // DB column approved_by is bigint FK to employees
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee approvedBy;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Size(max = 255, message = "Paid by must not exceed 255 characters")
    @Column(name = "paid_by")
    private String paidBy;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Column(name = "notes")
    private String notes;

    @NotNull(message = "Organization is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @OneToMany(mappedBy = "payrollRun", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payslip> payslips = new ArrayList<>();

    // Constructors
    public PayrollRun() {}

    public PayrollRun(String name, LocalDate payPeriodStart, LocalDate payPeriodEnd, 
                     LocalDate payDate, Organization organization) {
        this.name = name;
        this.payPeriodStart = payPeriodStart;
        this.payPeriodEnd = payPeriodEnd;
        this.payDate = payDate;
        this.organization = organization;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getPayPeriodStart() {
        return payPeriodStart;
    }

    public void setPayPeriodStart(LocalDate payPeriodStart) {
        this.payPeriodStart = payPeriodStart;
    }

    public LocalDate getPayPeriodEnd() {
        return payPeriodEnd;
    }

    public void setPayPeriodEnd(LocalDate payPeriodEnd) {
        this.payPeriodEnd = payPeriodEnd;
    }

    public LocalDate getPayDate() {
        return payDate;
    }

    public void setPayDate(LocalDate payDate) {
        this.payDate = payDate;
    }

    public PayrollStatus getStatus() {
        return status;
    }

    public void setStatus(PayrollStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalGrossPay() {
        return totalGrossPay;
    }

    public void setTotalGrossPay(BigDecimal totalGrossPay) {
        this.totalGrossPay = totalGrossPay;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getTotalNetPay() {
        return totalNetPay;
    }

    public void setTotalNetPay(BigDecimal totalNetPay) {
        this.totalNetPay = totalNetPay;
    }

    public BigDecimal getTotalTaxes() {
        return totalTaxes;
    }

    public void setTotalTaxes(BigDecimal totalTaxes) {
        this.totalTaxes = totalTaxes;
    }

    public Integer getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(Integer employeeCount) {
        this.employeeCount = employeeCount;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public Employee getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(Employee processedBy) {
        this.processedBy = processedBy;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }

    public Employee getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Employee approvedBy) {
        this.approvedBy = approvedBy;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }

    public String getPaidBy() {
        return paidBy;
    }

    public void setPaidBy(String paidBy) {
        this.paidBy = paidBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public List<Payslip> getPayslips() {
        return payslips;
    }

    public void setPayslips(List<Payslip> payslips) {
        this.payslips = payslips;
    }

    // Helper methods
    public boolean isDraft() {
        return status == PayrollStatus.DRAFT;
    }

    public boolean isProcessed() {
        return status == PayrollStatus.CALCULATED || status == PayrollStatus.APPROVED || status == PayrollStatus.PAID;
    }

    public boolean canBeModified() {
        return status == PayrollStatus.DRAFT || status == PayrollStatus.ERROR;
    }

    public boolean canBeApproved() {
        return status == PayrollStatus.CALCULATED;
    }

    public boolean canBePaid() {
        return status == PayrollStatus.APPROVED;
    }

    public void addPayslip(Payslip payslip) {
        payslips.add(payslip);
        payslip.setPayrollRun(this);
    }

    public void removePayslip(Payslip payslip) {
        payslips.remove(payslip);
        payslip.setPayrollRun(null);
    }

    public void calculateTotals() {
        // Payslip transient fields are populated in-memory during processing.
        // Sum from payslips if they have in-memory values, otherwise default to zero.
        this.totalGrossPay = payslips.stream()
            .map(p -> p.getGrossPay() != null ? p.getGrossPay() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.totalDeductions = payslips.stream()
            .map(p -> p.getTotalDeductions() != null ? p.getTotalDeductions() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.totalTaxes = payslips.stream()
            .map(p -> p.getTotalTaxes() != null ? p.getTotalTaxes() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.totalNetPay = payslips.stream()
            .map(p -> p.getNetPay() != null ? p.getNetPay() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.employeeCount = payslips.size();
    }
}

