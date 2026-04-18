package com.talentx.hrms.dto.expense;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO for expense payment requests
 */
public class ExpensePaymentRequest {

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    // Constructors
    public ExpensePaymentRequest() {}

    public ExpensePaymentRequest(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    // Getters and Setters
    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }
}

