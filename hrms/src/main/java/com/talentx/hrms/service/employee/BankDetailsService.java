package com.talentx.hrms.service.employee;

import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.AccountType;
import com.talentx.hrms.entity.finance.EmployeeBankDetail;
import com.talentx.hrms.repository.EmployeeBankDetailRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.common.exception.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Service class for managing employee bank details
 * Handles bank account management and primary account designation
 */
@Service
@Transactional
public class BankDetailsService {

    @Autowired
    private EmployeeBankDetailRepository bankDetailRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // IFSC code pattern for validation
    private static final Pattern IFSC_PATTERN = Pattern.compile("^[A-Z]{4}0[A-Z0-9]{6}$");
    
    // Account number pattern for basic validation (digits only, 9-18 characters)
    private static final Pattern ACCOUNT_NUMBER_PATTERN = Pattern.compile("^[0-9]{9,18}$");

    /**
     * Get all bank details for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeBankDetail> getEmployeeBankDetails(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return bankDetailRepository.findByEmployeeAndActiveTrue(employee);
    }

    /**
     * Get all bank details for an employee with pagination
     */
    @Transactional(readOnly = true)
    public Page<EmployeeBankDetail> getEmployeeBankDetails(Long employeeId, Pageable pageable) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return bankDetailRepository.findByEmployeeAndActiveTrue(employee, pageable);
    }

    /**
     * Get primary bank account for an employee
     */
    @Transactional(readOnly = true)
    public Optional<EmployeeBankDetail> getPrimaryBankAccount(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return bankDetailRepository.findByEmployeeAndIsPrimaryTrueAndActiveTrue(employee);
    }

    /**
     * Get bank detail by ID
     */
    @Transactional(readOnly = true)
    public EmployeeBankDetail getBankDetailById(Long bankDetailId) {
        return bankDetailRepository.findById(bankDetailId)
                .orElseThrow(() -> new EntityNotFoundException("Bank detail not found with id: " + bankDetailId));
    }

    /**
     * Add new bank account for employee
     */
    public EmployeeBankDetail addBankAccount(Long employeeId, String bankName, String accountNumber, 
            String ifscCode, String branchName, AccountType accountType, boolean isPrimary) {
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        // Validate input
        validateBankDetails(bankName, accountNumber, ifscCode, accountType);
        
        // Check if account number already exists for this employee
        if (bankDetailRepository.existsByEmployeeAndAccountNumber(employee, accountNumber)) {
            throw new ValidationException("Account number already exists for this employee");
        }

        EmployeeBankDetail bankDetail = new EmployeeBankDetail();
        bankDetail.setEmployee(employee);
        bankDetail.setBankName(bankName);
        bankDetail.setAccountNumber(accountNumber);
        bankDetail.setIfscCode(ifscCode);
        bankDetail.setBranchName(branchName);
        bankDetail.setExternalAccountType(accountType);
        bankDetail.setIsPrimary(isPrimary);
        bankDetail.setIsActive(true);

        // If this is being set as primary, ensure no other account is primary
        if (isPrimary) {
            setPrimaryAccount(employee, null); // Clear existing primary
        }

        return bankDetailRepository.save(bankDetail);
    }

    /**
     * Update existing bank account
     */
    public EmployeeBankDetail updateBankAccount(Long bankDetailId, String bankName, String accountNumber,
            String ifscCode, String branchName, AccountType accountType) {
        
        EmployeeBankDetail bankDetail = getBankDetailById(bankDetailId);
        
        // Validate input
        validateBankDetails(bankName, accountNumber, ifscCode, accountType);
        
        // Check if account number already exists for this employee (excluding current record)
        Optional<EmployeeBankDetail> existingAccount = bankDetailRepository
                .findByEmployeeAndAccountNumber(bankDetail.getEmployee(), accountNumber);
        if (existingAccount.isPresent() && !existingAccount.get().getId().equals(bankDetailId)) {
            throw new ValidationException("Account number already exists for this employee");
        }

        bankDetail.setBankName(bankName);
        bankDetail.setAccountNumber(accountNumber);
        bankDetail.setIfscCode(ifscCode);
        bankDetail.setBranchName(branchName);
        bankDetail.setExternalAccountType(accountType);

        return bankDetailRepository.save(bankDetail);
    }

    /**
     * Set an account as primary for an employee
     */
    public EmployeeBankDetail setPrimaryAccount(Long employeeId, Long bankDetailId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return setPrimaryAccount(employee, bankDetailId);
    }

    /**
     * Private helper method to set primary account
     */
    private EmployeeBankDetail setPrimaryAccount(Employee employee, Long bankDetailId) {
        // First, set all accounts as non-primary for this employee
        bankDetailRepository.setAllAccountsAsNonPrimary(employee);
        
        if (bankDetailId != null) {
            // Then set the specified account as primary
            EmployeeBankDetail bankDetail = getBankDetailById(bankDetailId);
            
            // Verify the account belongs to the employee
            if (!bankDetail.getEmployee().getId().equals(employee.getId())) {
                throw new ValidationException("Bank account does not belong to the specified employee");
            }
            
            if (!bankDetail.isActive()) {
                throw new ValidationException("Cannot set inactive bank account as primary");
            }
            
            bankDetail.setIsPrimary(true);
            return bankDetailRepository.save(bankDetail);
        }
        
        return null;
    }

    /**
     * Delete (deactivate) a bank account
     */
    public void deleteBankAccount(Long bankDetailId) {
        EmployeeBankDetail bankDetail = getBankDetailById(bankDetailId);
        
        // If this is the primary account, clear primary status
        if (bankDetail.isPrimary()) {
            bankDetail.setIsPrimary(false);
        }
        
        // Soft delete by setting as inactive
        bankDetail.setIsActive(false);
        bankDetailRepository.save(bankDetail);
    }

    /**
     * Get bank accounts by account type for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeBankDetail> getBankAccountsByType(Long employeeId, AccountType accountType) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return bankDetailRepository.findByEmployeeAndAccountTypeAndActiveTrue(employee, accountType);
    }

    /**
     * Check if employee has a primary bank account
     */
    @Transactional(readOnly = true)
    public boolean hasPrimaryAccount(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return bankDetailRepository.hasEmployeePrimaryAccount(employee);
    }

    /**
     * Get count of active bank accounts for an employee
     */
    @Transactional(readOnly = true)
    public long getBankAccountCount(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        return bankDetailRepository.countByEmployeeAndActiveTrue(employee);
    }

    /**
     * Validate IFSC code format
     */
    @Transactional(readOnly = true)
    public boolean isValidIfscCode(String ifscCode) {
        return ifscCode != null && IFSC_PATTERN.matcher(ifscCode).matches();
    }

    /**
     * Validate account number format
     */
    @Transactional(readOnly = true)
    public boolean isValidAccountNumber(String accountNumber) {
        return accountNumber != null && ACCOUNT_NUMBER_PATTERN.matcher(accountNumber).matches();
    }

    /**
     * Get masked account number for display
     */
    @Transactional(readOnly = true)
    public String getMaskedAccountNumber(Long bankDetailId) {
        EmployeeBankDetail bankDetail = getBankDetailById(bankDetailId);
        return bankDetail.getMaskedAccountNumber();
    }

    /**
     * Deactivate all bank accounts for an employee (used during employee termination)
     */
    public void deactivateAllAccountsForEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        bankDetailRepository.deactivateAllAccountsForEmployee(employee);
    }

    /**
     * Reactivate a bank account
     */
    public EmployeeBankDetail reactivateBankAccount(Long bankDetailId) {
        EmployeeBankDetail bankDetail = getBankDetailById(bankDetailId);
        bankDetail.setIsActive(true);
        return bankDetailRepository.save(bankDetail);
    }

    /**
     * Get bank accounts by bank name for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeBankDetail> getBankAccountsByBankName(Long employeeId, String bankName) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        List<EmployeeBankDetail> allAccounts = bankDetailRepository.findByEmployeeAndActiveTrue(employee);
        return allAccounts.stream()
                .filter(account -> account.getBankName().toLowerCase().contains(bankName.toLowerCase()))
                .toList();
    }

    /**
     * Check if employee has any bank accounts
     */
    @Transactional(readOnly = true)
    public boolean hasAnyBankAccount(Long employeeId) {
        return getBankAccountCount(employeeId) > 0;
    }

    /**
     * Private method to validate bank details
     */
    private void validateBankDetails(String bankName, String accountNumber, String ifscCode, AccountType accountType) {
        if (bankName == null || bankName.trim().isEmpty()) {
            throw new ValidationException("Bank name is required");
        }
        
        if (bankName.length() > 255) {
            throw new ValidationException("Bank name must not exceed 255 characters");
        }
        
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            throw new ValidationException("Account number is required");
        }
        
        if (!isValidAccountNumber(accountNumber)) {
            throw new ValidationException("Invalid account number format. Must be 9-18 digits");
        }
        
        if (ifscCode != null && !ifscCode.trim().isEmpty() && !isValidIfscCode(ifscCode)) {
            throw new ValidationException("Invalid IFSC code format");
        }
        
        if (accountType == null) {
            throw new ValidationException("Account type is required");
        }
    }

    /**
     * Create default salary account for new employee
     */
    public EmployeeBankDetail createDefaultSalaryAccount(Long employeeId, String bankName, String accountNumber,
            String ifscCode, String branchName) {
        
        return addBankAccount(employeeId, bankName, accountNumber, ifscCode, branchName, AccountType.SALARY, true);
    }

    /**
     * Get salary accounts for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeBankDetail> getSalaryAccounts(Long employeeId) {
        return getBankAccountsByType(employeeId, AccountType.SALARY);
    }

    /**
     * Get savings accounts for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeBankDetail> getSavingsAccounts(Long employeeId) {
        return getBankAccountsByType(employeeId, AccountType.SAVINGS);
    }

    /**
     * Get current accounts for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeBankDetail> getCurrentAccounts(Long employeeId) {
        return getBankAccountsByType(employeeId, AccountType.CURRENT);
    }
}

