package com.talentx.hrms.controller.employee;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.dto.employee.BankDetailsRequest;
import com.talentx.hrms.dto.employee.BankDetailsResponse;
import com.talentx.hrms.dto.employee.BankDetailsUpdateRequest;
import com.talentx.hrms.entity.enums.AccountType;
import com.talentx.hrms.entity.finance.EmployeeBankDetail;
import com.talentx.hrms.mapper.BankDetailsMapper;
import com.talentx.hrms.service.employee.BankDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bank-details")
@Tag(name = "Bank Details Management", description = "Employee bank account management")
public class BankDetailsController {

    private final BankDetailsService bankDetailsService;
    private final BankDetailsMapper bankDetailsMapper;

    @Autowired
    public BankDetailsController(BankDetailsService bankDetailsService,
                               BankDetailsMapper bankDetailsMapper) {
        this.bankDetailsService = bankDetailsService;
        this.bankDetailsMapper = bankDetailsMapper;
    }

    /**
     * Add new bank account for employee
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @employeeService.isCurrentUser(#request.employeeId)")
    @Operation(summary = "Add bank account", 
               description = "Add a new bank account for an employee")
    public ResponseEntity<ApiResponse<BankDetailsResponse>> addBankAccount(
            @Valid @RequestBody BankDetailsRequest request) {
        
        EmployeeBankDetail bankDetail = bankDetailsService.addBankAccount(
                request.getEmployeeId(),
                request.getBankName(),
                request.getAccountNumber(),
                request.getIfscCode(),
                request.getBranchName(),
                request.getAccountType(),
                request.getIsPrimary()
        );
        
        BankDetailsResponse response = bankDetailsMapper.toResponse(bankDetail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bank account added successfully", response));
    }

    /**
     * Update existing bank account
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @bankDetailsService.isOwner(#id, authentication.name)")
    @Operation(summary = "Update bank account", 
               description = "Update an existing bank account")
    public ResponseEntity<ApiResponse<BankDetailsResponse>> updateBankAccount(
            @Parameter(description = "Bank detail ID") @PathVariable Long id,
            @Valid @RequestBody BankDetailsUpdateRequest request) {
        
        EmployeeBankDetail bankDetail = bankDetailsService.updateBankAccount(
                id,
                request.getBankName(),
                request.getAccountNumber(),
                request.getIfscCode(),
                request.getBranchName(),
                request.getAccountType()
        );
        
        BankDetailsResponse response = bankDetailsMapper.toResponse(bankDetail);
        return ResponseEntity.ok(ApiResponse.success("Bank account updated successfully", response));
    }

    /**
     * Delete bank account
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @bankDetailsService.isOwner(#id, authentication.name)")
    @Operation(summary = "Delete bank account", 
               description = "Delete (deactivate) a bank account")
    public ResponseEntity<ApiResponse<Void>> deleteBankAccount(
            @Parameter(description = "Bank detail ID") @PathVariable Long id) {
        
        bankDetailsService.deleteBankAccount(id);
        return ResponseEntity.ok(ApiResponse.success("Bank account deleted successfully"));
    }

    /**
     * Set bank account as primary
     */
    @PutMapping("/{id:\\d+}/set-primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @bankDetailsService.isOwner(#id, authentication.name)")
    @Operation(summary = "Set as primary account", 
               description = "Set a bank account as the primary account for salary payments")
    public ResponseEntity<ApiResponse<BankDetailsResponse>> setPrimaryAccount(
            @Parameter(description = "Bank detail ID") @PathVariable Long id) {
        
        EmployeeBankDetail bankDetail = bankDetailsService.getBankDetailById(id);
        EmployeeBankDetail primaryAccount = bankDetailsService.setPrimaryAccount(
                bankDetail.getEmployee().getId(), id);
        
        BankDetailsResponse response = bankDetailsMapper.toResponse(primaryAccount);
        return ResponseEntity.ok(ApiResponse.success("Primary account set successfully", response));
    }

    /**
     * Get employee bank accounts
     */
    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee bank accounts", 
               description = "Retrieve all active bank accounts for a specific employee")
    public ResponseEntity<ApiResponse<List<BankDetailsResponse>>> getEmployeeBankAccounts(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        List<EmployeeBankDetail> bankDetails = bankDetailsService.getEmployeeBankDetails(employeeId);
        List<BankDetailsResponse> responseList = bankDetails.stream()
                .map(bankDetailsMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Bank accounts retrieved successfully", responseList));
    }

    /**
     * Get primary bank account for employee
     */
    @GetMapping("/employee/{employeeId:\\d+}/primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get primary bank account", 
               description = "Retrieve the primary bank account for a specific employee")
    public ResponseEntity<ApiResponse<BankDetailsResponse>> getPrimaryBankAccount(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        Optional<EmployeeBankDetail> primaryAccount = bankDetailsService.getPrimaryBankAccount(employeeId);
        
        return primaryAccount
                .map(account -> {
                    BankDetailsResponse response = bankDetailsMapper.toResponse(account);
                    return ResponseEntity.ok(ApiResponse.success("Primary bank account retrieved successfully", response));
                })
                .orElse(ResponseEntity.ok(ApiResponse.success("No primary bank account found")));
    }

    /**
     * Get bank accounts by account type
     */
    @GetMapping("/employee/{employeeId}/type/{accountType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get bank accounts by type", 
               description = "Retrieve bank accounts for a specific employee filtered by account type")
    public ResponseEntity<ApiResponse<List<BankDetailsResponse>>> getBankAccountsByType(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId,
            @Parameter(description = "Account type (SAVINGS, CURRENT, SALARY)") @PathVariable AccountType accountType) {
        
        List<EmployeeBankDetail> bankDetails = bankDetailsService.getBankAccountsByType(employeeId, accountType);
        List<BankDetailsResponse> responseList = bankDetails.stream()
                .map(bankDetailsMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(
                "Bank accounts for type '" + accountType + "' retrieved successfully", responseList));
    }

    /**
     * Get bank detail by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @bankDetailsService.isOwner(#id, authentication.name)")
    @Operation(summary = "Get bank account details", 
               description = "Retrieve bank account details by ID")
    public ResponseEntity<ApiResponse<BankDetailsResponse>> getBankDetailById(
            @Parameter(description = "Bank detail ID") @PathVariable Long id) {
        
        EmployeeBankDetail bankDetail = bankDetailsService.getBankDetailById(id);
        BankDetailsResponse response = bankDetailsMapper.toResponse(bankDetail);
        
        return ResponseEntity.ok(ApiResponse.success("Bank account details retrieved successfully", response));
    }

    /**
     * Check if employee has primary account
     */
    @GetMapping("/employee/{employeeId:\\d+}/has-primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Check if employee has primary account", 
               description = "Check if an employee has a primary bank account")
    public ResponseEntity<ApiResponse<Boolean>> hasPrimaryAccount(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        boolean hasPrimary = bankDetailsService.hasPrimaryAccount(employeeId);
        return ResponseEntity.ok(ApiResponse.success(
                hasPrimary ? "Employee has primary account" : "Employee has no primary account", hasPrimary));
    }

    /**
     * Get bank account count for employee
     */
    @GetMapping("/employee/{employeeId:\\d+}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get bank account count", 
               description = "Get the count of active bank accounts for an employee")
    public ResponseEntity<ApiResponse<Long>> getBankAccountCount(
            @Parameter(description = "Employee ID") @PathVariable Long employeeId) {
        
        long count = bankDetailsService.getBankAccountCount(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Bank account count retrieved successfully", count));
    }

    /**
     * Validate IFSC code
     */
    @GetMapping("/validate-ifsc/{ifscCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    @Operation(summary = "Validate IFSC code", 
               description = "Validate IFSC code format")
    public ResponseEntity<ApiResponse<Boolean>> validateIfscCode(
            @Parameter(description = "IFSC code to validate") @PathVariable String ifscCode) {
        
        boolean isValid = bankDetailsService.isValidIfscCode(ifscCode);
        return ResponseEntity.ok(ApiResponse.success(
                isValid ? "IFSC code is valid" : "IFSC code is invalid", isValid));
    }

    /**
     * Validate account number
     */
    @GetMapping("/validate-account/{accountNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    @Operation(summary = "Validate account number", 
               description = "Validate account number format")
    public ResponseEntity<ApiResponse<Boolean>> validateAccountNumber(
            @Parameter(description = "Account number to validate") @PathVariable String accountNumber) {
        
        boolean isValid = bankDetailsService.isValidAccountNumber(accountNumber);
        return ResponseEntity.ok(ApiResponse.success(
                isValid ? "Account number is valid" : "Account number is invalid", isValid));
    }

    /**
     * Get masked account number
     */
    @GetMapping("/{id:\\d+}/masked-account")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR') or @bankDetailsService.isOwner(#id, authentication.name)")
    @Operation(summary = "Get masked account number", 
               description = "Get masked account number for display purposes")
    public ResponseEntity<ApiResponse<String>> getMaskedAccountNumber(
            @Parameter(description = "Bank detail ID") @PathVariable Long id) {
        
        String maskedNumber = bankDetailsService.getMaskedAccountNumber(id);
        return ResponseEntity.ok(ApiResponse.success("Masked account number retrieved successfully", maskedNumber));
    }

    /**
     * Reactivate bank account
     */
    @PutMapping("/{id:\\d+}/reactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Reactivate bank account", 
               description = "Reactivate a previously deactivated bank account")
    public ResponseEntity<ApiResponse<BankDetailsResponse>> reactivateBankAccount(
            @Parameter(description = "Bank detail ID") @PathVariable Long id) {
        
        EmployeeBankDetail bankDetail = bankDetailsService.reactivateBankAccount(id);
        BankDetailsResponse response = bankDetailsMapper.toResponse(bankDetail);
        
        return ResponseEntity.ok(ApiResponse.success("Bank account reactivated successfully", response));
    }
}

