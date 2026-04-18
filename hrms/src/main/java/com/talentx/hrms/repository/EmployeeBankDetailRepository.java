package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.AccountType;
import com.talentx.hrms.entity.finance.EmployeeBankDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for EmployeeBankDetail entity
 */
@Repository
public interface EmployeeBankDetailRepository extends JpaRepository<EmployeeBankDetail, Long> {

    // Find by employee
    List<EmployeeBankDetail> findByEmployee(Employee employee);
    Page<EmployeeBankDetail> findByEmployee(Employee employee, Pageable pageable);

    // Find active bank details by employee
    List<EmployeeBankDetail> findByEmployeeAndActiveTrue(Employee employee);
    Page<EmployeeBankDetail> findByEmployeeAndActiveTrue(Employee employee, Pageable pageable);

    // Find by organization
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization")
    List<EmployeeBankDetail> findByOrganization(@Param("organization") Organization organization);

    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization")
    Page<EmployeeBankDetail> findByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find active bank details by organization
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.active = true")
    List<EmployeeBankDetail> findActiveByOrganization(@Param("organization") Organization organization);

    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.active = true")
    Page<EmployeeBankDetail> findActiveByOrganization(@Param("organization") Organization organization, Pageable pageable);

    // Find primary bank detail by employee
    Optional<EmployeeBankDetail> findByEmployeeAndIsPrimaryTrueAndActiveTrue(Employee employee);

    // Find by employee and account type
    List<EmployeeBankDetail> findByEmployeeAndAccountType(Employee employee, AccountType accountType);
    List<EmployeeBankDetail> findByEmployeeAndAccountTypeAndActiveTrue(Employee employee, AccountType accountType);

    // Find by organization and account type
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.accountType = :accountType")
    List<EmployeeBankDetail> findByOrganizationAndAccountType(@Param("organization") Organization organization,
                                                             @Param("accountType") AccountType accountType);

    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND " +
           "b.accountType = :accountType AND b.active = true")
    List<EmployeeBankDetail> findByOrganizationAndAccountTypeAndActiveTrue(@Param("organization") Organization organization,
                                                                            @Param("accountType") AccountType accountType);

    // Find by bank name
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND " +
           "LOWER(b.bankName) LIKE LOWER(CONCAT('%', :bankName, '%'))")
    List<EmployeeBankDetail> findByOrganizationAndBankNameContaining(@Param("organization") Organization organization,
                                                                    @Param("bankName") String bankName);

    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND " +
           "LOWER(b.bankName) LIKE LOWER(CONCAT('%', :bankName, '%')) AND b.active = true")
    List<EmployeeBankDetail> findByOrganizationAndBankNameContainingAndActiveTrue(@Param("organization") Organization organization,
                                                                                   @Param("bankName") String bankName);

    // Find by IFSC code
    List<EmployeeBankDetail> findByIfscCode(String ifscCode);
    
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.ifscCode = :ifscCode")
    List<EmployeeBankDetail> findByOrganizationAndIfscCode(@Param("organization") Organization organization,
                                                          @Param("ifscCode") String ifscCode);

    // Find by account number (exact match)
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee = :employee AND b.accountNumber = :accountNumber")
    Optional<EmployeeBankDetail> findByEmployeeAndAccountNumber(@Param("employee") Employee employee,
                                                               @Param("accountNumber") String accountNumber);

    // Comprehensive search with multiple criteria
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND " +
           "(:employee IS NULL OR b.employee = :employee) AND " +
           "(:accountType IS NULL OR b.accountType = :accountType) AND " +
           "(:bankName IS NULL OR LOWER(b.bankName) LIKE LOWER(CONCAT('%', :bankName, '%'))) AND " +
           "(:ifscCode IS NULL OR b.ifscCode = :ifscCode) AND " +
           "(:active IS NULL OR b.active = :active) AND " +
           "(:isPrimary IS NULL OR b.isPrimary = :isPrimary)")
    Page<EmployeeBankDetail> findBySearchCriteria(@Param("organization") Organization organization,
                                                 @Param("employee") Employee employee,
                                                 @Param("accountType") AccountType accountType,
                                                 @Param("bankName") String bankName,
                                                 @Param("ifscCode") String ifscCode,
                                                 @Param("active") Boolean active,
                                                 @Param("isPrimary") Boolean isPrimary,
                                                 Pageable pageable);

    // Count methods
    long countByEmployee(Employee employee);
    long countByEmployeeAndActiveTrue(Employee employee);

    @Query("SELECT COUNT(b) FROM EmployeeBankDetail b WHERE b.employee.organization = :organization")
    long countByOrganization(@Param("organization") Organization organization);

    @Query("SELECT COUNT(b) FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.active = true")
    long countActiveByOrganization(@Param("organization") Organization organization);

    @Query("SELECT COUNT(b) FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.accountType = :accountType")
    long countByOrganizationAndAccountType(@Param("organization") Organization organization, @Param("accountType") AccountType accountType);

    // Check if employee has primary bank account
    @Query("SELECT COUNT(b) > 0 FROM EmployeeBankDetail b WHERE b.employee = :employee AND b.isPrimary = true AND b.active = true")
    boolean hasEmployeePrimaryAccount(@Param("employee") Employee employee);

    // Check if account number exists for employee
    @Query("SELECT COUNT(b) > 0 FROM EmployeeBankDetail b WHERE b.employee = :employee AND b.accountNumber = :accountNumber AND b.active = true")
    boolean existsByEmployeeAndAccountNumber(@Param("employee") Employee employee, @Param("accountNumber") String accountNumber);

    // Update primary status - set all other accounts as non-primary for employee
    @Modifying
    @Query("UPDATE EmployeeBankDetail b SET b.isPrimary = false WHERE b.employee = :employee AND b.id != :excludeId")
    void updateOtherAccountsAsNonPrimary(@Param("employee") Employee employee, @Param("excludeId") Long excludeId);

    // Set all accounts as non-primary for employee
    @Modifying
    @Query("UPDATE EmployeeBankDetail b SET b.isPrimary = false WHERE b.employee = :employee")
    void setAllAccountsAsNonPrimary(@Param("employee") Employee employee);

    // Deactivate all bank accounts for employee
    @Modifying
    @Query("UPDATE EmployeeBankDetail b SET b.active = false WHERE b.employee = :employee")
    void deactivateAllAccountsForEmployee(@Param("employee") Employee employee);

    // Find employees without bank details
    @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
           "NOT EXISTS (SELECT b FROM EmployeeBankDetail b WHERE b.employee = e AND b.active = true)")
    List<Employee> findEmployeesWithoutBankDetails(@Param("organization") Organization organization);

    @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
           "NOT EXISTS (SELECT b FROM EmployeeBankDetail b WHERE b.employee = e AND b.active = true)")
    Page<Employee> findEmployeesWithoutBankDetails(@Param("organization") Organization organization, Pageable pageable);

    // Find employees without primary bank account
    @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
           "NOT EXISTS (SELECT b FROM EmployeeBankDetail b WHERE b.employee = e AND b.isPrimary = true AND b.active = true)")
    List<Employee> findEmployeesWithoutPrimaryAccount(@Param("organization") Organization organization);

    @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
           "NOT EXISTS (SELECT b FROM EmployeeBankDetail b WHERE b.employee = e AND b.isPrimary = true AND b.active = true)")
    Page<Employee> findEmployeesWithoutPrimaryAccount(@Param("organization") Organization organization, Pageable pageable);

    // Find bank details by branch name
    @Query("SELECT b FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND " +
           "LOWER(b.branchName) LIKE LOWER(CONCAT('%', :branchName, '%'))")
    List<EmployeeBankDetail> findByOrganizationAndBranchNameContaining(@Param("organization") Organization organization,
                                                                      @Param("branchName") String branchName);

    // Find most popular banks in organization
    @Query("SELECT b.bankName, COUNT(b) FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.active = true " +
           "GROUP BY b.bankName ORDER BY COUNT(b) DESC")
    List<Object[]> findPopularBanksByOrganization(@Param("organization") Organization organization);

    // Find most popular account types in organization
    @Query("SELECT b.accountType, COUNT(b) FROM EmployeeBankDetail b WHERE b.employee.organization = :organization AND b.active = true " +
           "GROUP BY b.accountType ORDER BY COUNT(b) DESC")
    List<Object[]> findPopularAccountTypesByOrganization(@Param("organization") Organization organization);
}

