package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.expense.ExpenseResponse;
import com.talentx.hrms.entity.finance.Expense;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Expense entities and DTOs
 */
@Component
public class ExpenseMapper {

    /**
     * Convert Expense entity to ExpenseResponse DTO
     */
    public ExpenseResponse toResponse(Expense expense) {
        if (expense == null) {
            return null;
        }

        ExpenseResponse response = new ExpenseResponse();
        
        // Basic expense information
        response.setId(expense.getId());
        response.setExpenseType(expense.getExpenseType());
        response.setAmount(expense.getAmount());
        response.setExpenseDate(expense.getExpenseDate());
        response.setDescription(expense.getDescription());
        response.setReceiptUrl(expense.getReceiptUrl());
        response.setStatus(expense.getStatus());
        if (expense.getApprovedAt() != null) {
            response.setApprovedAt(expense.getApprovedAt().atStartOfDay());
        }
        response.setRejectionReason(expense.getRejectionReason());
        response.setPaymentDate(expense.getPaymentDate());
        if (expense.getCreatedAt() != null) {
            response.setCreatedAt(expense.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        if (expense.getUpdatedAt() != null) {
            response.setUpdatedAt(expense.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        
        // Employee information — safe lazy access
        if (expense.getEmployee() != null) {
            try {
                response.setEmployeeId(expense.getEmployee().getId());
                response.setEmployeeName(buildFullName(
                    expense.getEmployee().getFirstName(),
                    expense.getEmployee().getMiddleName(),
                    expense.getEmployee().getLastName()
                ));
                response.setEmployeeNumber(expense.getEmployee().getEmployeeNumber());
            } catch (Exception e) { /* lazy proxy not initialized */ }
        }
        
        // Organization information — safe lazy access
        if (expense.getOrganization() != null) {
            try {
                response.setOrganizationId(expense.getOrganization().getId());
                response.setOrganizationName(expense.getOrganization().getName());
            } catch (Exception e) { /* lazy proxy not initialized */ }
        }
        
        // Approver information — safe lazy access
        if (expense.getApprovedBy() != null) {
            try {
                response.setApprovedById(expense.getApprovedBy().getId());
                response.setApprovedByName(buildFullName(
                    expense.getApprovedBy().getFirstName(),
                    expense.getApprovedBy().getMiddleName(),
                    expense.getApprovedBy().getLastName()
                ));
            } catch (Exception e) { /* lazy proxy not initialized */ }
        }
        
        return response;
    }
    
    /**
     * Build full name from first, middle, and last names
     */
    private String buildFullName(String firstName, String middleName, String lastName) {
        StringBuilder fullName = new StringBuilder();
        
        if (firstName != null && !firstName.trim().isEmpty()) {
            fullName.append(firstName.trim());
        }
        
        if (middleName != null && !middleName.trim().isEmpty()) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(middleName.trim());
        }
        
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(lastName.trim());
        }
        
        return fullName.toString();
    }
}

