package com.talentx.hrms.dto.expense;

import com.talentx.hrms.entity.enums.ExpenseType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for expense creation and update requests
 */
public class ExpenseRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Expense type is required")
    private ExpenseType expenseType;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Size(max = 255, message = "Receipt URL must not exceed 255 characters")
    private String receiptUrl;

    // Constructors
    public ExpenseRequest() {}

    public ExpenseRequest(Long employeeId, ExpenseType expenseType, BigDecimal amount, 
                         LocalDate expenseDate, String description, String receiptUrl) {
        this.employeeId = employeeId;
        this.expenseType = expenseType;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.description = description;
        this.receiptUrl = receiptUrl;
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public ExpenseType getExpenseType() {
        return expenseType;
    }

    public void setExpenseType(ExpenseType expenseType) {
        this.expenseType = expenseType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }
}

