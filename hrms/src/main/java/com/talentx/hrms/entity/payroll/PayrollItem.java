package com.talentx.hrms.entity.payroll;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "payroll_items")
@AttributeOverride(name = "id", column = @Column(name = "payroll_item_id"))
public class PayrollItem extends BaseEntity {

    // DB: payroll_run_id (FK to payroll_runs) — NOT NULL
    @NotNull(message = "Payroll run is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    // DB: employee_id (FK to employees) — NOT NULL
    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee employee;

    // DB: payslip_id (FK to payslips) — NOT NULL
    @NotNull(message = "Payslip is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payslip_id", nullable = false)
    private Payslip payslip;

    // DB: regular_hours decimal(8,2)
    @Column(name = "regular_hours", precision = 8, scale = 2)
    private BigDecimal regularHours;

    // DB: overtime_hours decimal(8,2)
    @Column(name = "overtime_hours", precision = 8, scale = 2)
    private BigDecimal overtimeHours;

    // DB: gross_pay decimal(15,2)
    @Column(name = "gross_pay", precision = 15, scale = 2)
    private BigDecimal grossPay;

    // DB: tax_deductions decimal(15,2)
    @Column(name = "tax_deductions", precision = 15, scale = 2)
    private BigDecimal taxDeductions;

    // DB: other_deductions decimal(15,2)
    @Column(name = "other_deductions", precision = 15, scale = 2)
    private BigDecimal otherDeductions;

    // DB: net_pay decimal(15,2)
    @Column(name = "net_pay", precision = 15, scale = 2)
    private BigDecimal netPay;

    // DB: payment_method enum
    @Column(name = "payment_method")
    private String paymentMethod;

    // DB: payment_status enum
    @Column(name = "payment_status")
    private String paymentStatus;

    // DB: details json
    @Column(name = "details", columnDefinition = "JSON")
    private String details;

    @NotBlank(message = "Item type is required")
    @Size(max = 50, message = "Item type must not exceed 50 characters")
    @Column(name = "item_type", nullable = false)
    private String itemType; // EARNING, DEDUCTION, TAX

    @NotBlank(message = "Item code is required")
    @Size(max = 50, message = "Item code must not exceed 50 characters")
    @Column(name = "item_code", nullable = false)
    private String itemCode;

    @NotBlank(message = "Item name is required")
    @Size(max = 255, message = "Item name must not exceed 255 characters")
    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description")
    private String description;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "rate", precision = 10, scale = 4)
    private BigDecimal rate;

    @Column(name = "quantity", precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "is_taxable")
    private Boolean isTaxable = true;

    @Column(name = "is_statutory")
    private Boolean isStatutory = false;

    @Column(name = "calculation_order")
    private Integer calculationOrder = 0;

    @Size(max = 100, message = "Unit must not exceed 100 characters")
    @Column(name = "unit")
    private String unit;

    // Constructors
    public PayrollItem() {}

    public PayrollItem(PayrollRun payrollRun, Employee employee, Payslip payslip,
                       String itemType, String itemCode, String itemName, BigDecimal amount) {
        this.payrollRun = payrollRun;
        this.employee = employee;
        this.payslip = payslip;
        this.itemType = itemType;
        this.itemCode = itemCode;
        this.itemName = itemName;
        this.amount = amount;
    }

    // Backward compat constructor (payslip-only)
    public PayrollItem(Payslip payslip, String itemType, String itemCode, String itemName, BigDecimal amount) {
        this.payslip = payslip;
        this.payrollRun = payslip != null ? payslip.getPayrollRun() : null;
        this.employee = payslip != null ? payslip.getEmployee() : null;
        this.itemType = itemType;
        this.itemCode = itemCode;
        this.itemName = itemName;
        this.amount = amount;
    }

    // Getters and Setters
    public PayrollRun getPayrollRun() { return payrollRun; }
    public void setPayrollRun(PayrollRun payrollRun) { this.payrollRun = payrollRun; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public Payslip getPayslip() { return payslip; }
    public void setPayslip(Payslip payslip) {
        this.payslip = payslip;
        if (payslip != null) {
            if (this.payrollRun == null) this.payrollRun = payslip.getPayrollRun();
            if (this.employee == null) this.employee = payslip.getEmployee();
        }
    }

    public BigDecimal getRegularHours() { return regularHours; }
    public void setRegularHours(BigDecimal regularHours) { this.regularHours = regularHours; }

    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

    public BigDecimal getGrossPay() { return grossPay; }
    public void setGrossPay(BigDecimal grossPay) { this.grossPay = grossPay; }

    public BigDecimal getTaxDeductions() { return taxDeductions; }
    public void setTaxDeductions(BigDecimal taxDeductions) { this.taxDeductions = taxDeductions; }

    public BigDecimal getOtherDeductions() { return otherDeductions; }
    public void setOtherDeductions(BigDecimal otherDeductions) { this.otherDeductions = otherDeductions; }

    public BigDecimal getNetPay() { return netPay; }
    public void setNetPay(BigDecimal netPay) { this.netPay = netPay; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public Boolean getIsTaxable() { return isTaxable; }
    public void setIsTaxable(Boolean isTaxable) { this.isTaxable = isTaxable; }

    public Boolean getIsStatutory() { return isStatutory; }
    public void setIsStatutory(Boolean isStatutory) { this.isStatutory = isStatutory; }

    public Integer getCalculationOrder() { return calculationOrder; }
    public void setCalculationOrder(Integer calculationOrder) { this.calculationOrder = calculationOrder; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    // Helper methods
    public boolean isEarning() { return "EARNING".equalsIgnoreCase(itemType); }
    public boolean isDeduction() { return "DEDUCTION".equalsIgnoreCase(itemType); }
    public boolean isTax() { return "TAX".equalsIgnoreCase(itemType); }

    public BigDecimal calculateAmount() {
        if (rate != null && quantity != null) {
            return rate.multiply(quantity);
        }
        return amount != null ? amount : BigDecimal.ZERO;
    }
}
