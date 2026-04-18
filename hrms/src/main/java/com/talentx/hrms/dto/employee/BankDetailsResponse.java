package com.talentx.hrms.dto.employee;

import com.talentx.hrms.entity.enums.AccountType;

import java.time.Instant;

public class BankDetailsResponse {
    
    private Long id;
    private Long employeeId;
    private String employeeNumber;
    private String employeeName;
    private String bankName;
    private String accountNumber;
    private String maskedAccountNumber;
    private String ifscCode;
    private String branchName;
    private AccountType accountType;
    private Boolean isPrimary;
    // Removed: isActive - field does not exist in database
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public BankDetailsResponse() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getMaskedAccountNumber() {
        return maskedAccountNumber;
    }

    public void setMaskedAccountNumber(String maskedAccountNumber) {
        this.maskedAccountNumber = maskedAccountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods

    public boolean isPrimary() {
        return Boolean.TRUE.equals(isPrimary);
    }

    public String getDisplayName() {
        return String.format("%s (%s)", employeeName, employeeNumber);
    }

    public String getAccountTypeDisplayName() {
        return accountType != null ? accountType.getDisplayName() : null;
    }

    public String getBankAccountSummary() {
        return String.format("%s - %s (%s)", bankName, maskedAccountNumber, 
                accountType != null ? accountType.getDisplayName() : "Unknown");
    }
}

