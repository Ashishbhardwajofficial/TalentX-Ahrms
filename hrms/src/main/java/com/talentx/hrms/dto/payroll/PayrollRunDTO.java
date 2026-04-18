package com.talentx.hrms.dto.payroll;

import com.talentx.hrms.entity.enums.PayrollStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class PayrollRunDTO {
    
    private Long id;
    
    @NotNull(message = "Pay period start date is required")
    private LocalDate payPeriodStart;
    
    @NotNull(message = "Pay period end date is required")
    private LocalDate payPeriodEnd;
    
    @NotNull(message = "Pay date is required")
    private LocalDate payDate;
    
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
    
    private PayrollStatus status;
    
    private BigDecimal totalGrossPay;
    private BigDecimal totalDeductions;
    private BigDecimal totalNetPay;
    private BigDecimal totalTaxes;
    
    private Integer employeeCount;
    private Instant createdAt;
    private Instant processedAt;
    private Instant approvedAt;
    
    // Organization details
    private Long organizationId;
    private String organizationName;
    
    // Created by details
    private Long createdById;
    private String createdByName;
    
    // Approved by details
    private Long approvedById;
    private String approvedByName;
    
    // Constructors
    public PayrollRunDTO() {}
    
    public PayrollRunDTO(LocalDate payPeriodStart, LocalDate payPeriodEnd, LocalDate payDate) {
        this.payPeriodStart = payPeriodStart;
        this.payPeriodEnd = payPeriodEnd;
        this.payDate = payDate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public Instant getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }
    
    public Instant getApprovedAt() {
        return approvedAt;
    }
    
    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }
    
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    
    public String getOrganizationName() {
        return organizationName;
    }
    
    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }
    
    public Long getCreatedById() {
        return createdById;
    }
    
    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }
    
    public String getCreatedByName() {
        return createdByName;
    }
    
    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
    
    public Long getApprovedById() {
        return approvedById;
    }
    
    public void setApprovedById(Long approvedById) {
        this.approvedById = approvedById;
    }
    
    public String getApprovedByName() {
        return approvedByName;
    }
    
    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }
    
    // Additional fields for service compatibility
    private String name;
    private String processedBy;
    private String approvedBy;
    private String notes;
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
    
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

