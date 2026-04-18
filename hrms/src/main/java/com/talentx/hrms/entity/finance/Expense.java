package com.talentx.hrms.entity.finance;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.ExpenseType;
import com.talentx.hrms.entity.enums.ExpenseStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "expenses")
@Getter
@Setter
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false)
    private ExpenseType expenseType;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date")
    private LocalDate expenseDate;

    @Column(name = "description")
    private String description;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExpenseStatus status = ExpenseStatus.SUBMITTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee approvedBy;

    @Column(name = "approved_at")
    private LocalDate approvedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Constructors
    public Expense() {}

    public Expense(Employee employee, ExpenseType expenseType, BigDecimal amount, LocalDate expenseDate) {
        this.employee = employee;
        this.expenseType = expenseType;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.status = ExpenseStatus.SUBMITTED;
    }

    public Expense(Employee employee, Organization organization, ExpenseType expenseType, BigDecimal amount, LocalDate expenseDate) {
        this.employee = employee;
        this.organization = organization;
        this.expenseType = expenseType;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.status = ExpenseStatus.SUBMITTED;
    }

    // Business logic methods
    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public boolean isSubmitted() {
        return status == ExpenseStatus.SUBMITTED;
    }

    public boolean isApproved() {
        return status == ExpenseStatus.APPROVED;
    }

    public void approve(Employee approver) {
        this.status = ExpenseStatus.APPROVED;
        this.approvedBy = approver;
        this.approvedAt = LocalDate.now();
    }

    public void reject(Employee approver, String reason) {
        this.status = ExpenseStatus.REJECTED;
        this.approvedBy = approver;
        this.rejectionReason = reason;
    }

    public void markAsPaid(LocalDate paymentDate) {
        this.status = ExpenseStatus.PAID;
        this.paymentDate = paymentDate;
    }

    public LocalDate getApprovedAt() {
        return approvedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

