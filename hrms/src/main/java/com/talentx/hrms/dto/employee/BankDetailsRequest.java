package com.talentx.hrms.dto.employee;

import com.talentx.hrms.entity.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class BankDetailsRequest {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    @NotBlank(message = "Bank name is required")
    @Size(max = 255, message = "Bank name must not exceed 255 characters")
    private String bankName;
    
    @NotBlank(message = "Account number is required")
    @Size(max = 50, message = "Account number must not exceed 50 characters")
    @Pattern(regexp = "^[0-9]{9,18}$", message = "Account number must be 9-18 digits")
    private String accountNumber;
    
    @Size(max = 20, message = "IFSC code must not exceed 20 characters")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format")
    private String ifscCode;
    
    @Size(max = 255, message = "Branch name must not exceed 255 characters")
    private String branchName;
    
    @NotNull(message = "Account type is required")
    private AccountType accountType;
    
    private Boolean isPrimary = false;

    // Constructors
    public BankDetailsRequest() {}

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
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
}

