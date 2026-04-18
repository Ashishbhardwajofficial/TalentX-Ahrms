package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.payroll.PayrollItem;
import com.talentx.hrms.entity.payroll.Payslip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PayrollItemRepository extends JpaRepository<PayrollItem, Long> {
    
    // Find payroll items by payslip
    List<PayrollItem> findByPayslip(Payslip payslip);
    
    // Find payroll items by payslip ordered by calculation order
    List<PayrollItem> findByPayslipOrderByCalculationOrder(Payslip payslip);
    
    // Find payroll items by item type
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = :itemType")
    List<PayrollItem> findByOrganizationAndItemType(@Param("organization") Organization organization, 
                                                   @Param("itemType") String itemType);
    
    // Find payroll items by item type with pagination
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = :itemType")
    Page<PayrollItem> findByOrganizationAndItemType(@Param("organization") Organization organization, 
                                                   @Param("itemType") String itemType, 
                                                   Pageable pageable);
    
    // Find payroll items by item code
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemCode = :itemCode")
    List<PayrollItem> findByOrganizationAndItemCode(@Param("organization") Organization organization, 
                                                   @Param("itemCode") String itemCode);
    
    // Find earnings items
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = 'EARNING'")
    List<PayrollItem> findEarningsByOrganization(@Param("organization") Organization organization);
    
    // Find deduction items
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = 'DEDUCTION'")
    List<PayrollItem> findDeductionsByOrganization(@Param("organization") Organization organization);
    
    // Find tax items
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = 'TAX'")
    List<PayrollItem> findTaxesByOrganization(@Param("organization") Organization organization);
    
    // Find taxable items
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.isTaxable = true")
    List<PayrollItem> findTaxableByOrganization(@Param("organization") Organization organization);
    
    // Find non-taxable items
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.isTaxable = false")
    List<PayrollItem> findNonTaxableByOrganization(@Param("organization") Organization organization);
    
    // Find statutory items
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.isStatutory = true")
    List<PayrollItem> findStatutoryByOrganization(@Param("organization") Organization organization);
    
    // Find payroll items by payslip and item type
    List<PayrollItem> findByPayslipAndItemType(Payslip payslip, String itemType);
    
    // Find payroll items by payslip and item code
    List<PayrollItem> findByPayslipAndItemCode(Payslip payslip, String itemCode);
    
    // Find payroll items with amount greater than specified value
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.amount > :amount")
    List<PayrollItem> findByOrganizationAndAmountGreaterThan(@Param("organization") Organization organization, 
                                                            @Param("amount") BigDecimal amount);
    
    // Find payroll items with amount between values
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND " +
           "pi.amount BETWEEN :minAmount AND :maxAmount")
    List<PayrollItem> findByOrganizationAndAmountBetween(@Param("organization") Organization organization,
                                                        @Param("minAmount") BigDecimal minAmount,
                                                        @Param("maxAmount") BigDecimal maxAmount);
    
    // Search payroll items by item name
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND " +
           "LOWER(pi.itemName) LIKE LOWER(CONCAT('%', :itemName, '%'))")
    List<PayrollItem> findByOrganizationAndItemNameContainingIgnoreCase(@Param("organization") Organization organization,
                                                                       @Param("itemName") String itemName);
    
    // Get total amount by organization and item type
    @Query("SELECT SUM(pi.amount) FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = :itemType")
    BigDecimal getTotalAmountByOrganizationAndItemType(@Param("organization") Organization organization, 
                                                      @Param("itemType") String itemType);
    
    // Get total amount by organization and item code
    @Query("SELECT SUM(pi.amount) FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemCode = :itemCode")
    BigDecimal getTotalAmountByOrganizationAndItemCode(@Param("organization") Organization organization, 
                                                      @Param("itemCode") String itemCode);
    
    // Count payroll items by organization and item type
    @Query("SELECT COUNT(pi) FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = :itemType")
    long countByOrganizationAndItemType(@Param("organization") Organization organization, 
                                       @Param("itemType") String itemType);
    
    // Count payroll items by payslip
    long countByPayslip(Payslip payslip);
    
    // Find payroll items by department
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.department.id = :departmentId")
    List<PayrollItem> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    // Find payroll items by department and item type
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.department.id = :departmentId AND pi.itemType = :itemType")
    List<PayrollItem> findByDepartmentIdAndItemType(@Param("departmentId") Long departmentId, 
                                                   @Param("itemType") String itemType);
    
    // Get payroll item statistics by organization
    @Query("SELECT pi.itemType, pi.itemCode, pi.itemName, COUNT(pi), SUM(pi.amount), AVG(pi.amount) " +
           "FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization " +
           "GROUP BY pi.itemType, pi.itemCode, pi.itemName")
    List<Object[]> getPayrollItemStatsByOrganization(@Param("organization") Organization organization);
    
    // Get payroll item summary by item type
    @Query("SELECT pi.itemType, COUNT(pi), SUM(pi.amount) " +
           "FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization " +
           "GROUP BY pi.itemType")
    List<Object[]> getPayrollItemSummaryByOrganization(@Param("organization") Organization organization);
    
    // Find most common payroll items
    @Query("SELECT pi.itemCode, pi.itemName, COUNT(pi) as frequency " +
           "FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization " +
           "GROUP BY pi.itemCode, pi.itemName ORDER BY frequency DESC")
    List<Object[]> findMostCommonItemsByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Find payroll items with rate and quantity
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND " +
           "pi.rate IS NOT NULL AND pi.quantity IS NOT NULL")
    List<PayrollItem> findWithRateAndQuantityByOrganization(@Param("organization") Organization organization);
    
    // Find payroll items by calculation order
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization " +
           "ORDER BY pi.calculationOrder")
    List<PayrollItem> findByOrganizationOrderByCalculationOrder(@Param("organization") Organization organization);
    
    // Find payroll items with comprehensive search
    @Query("SELECT pi FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND " +
           "(:itemType IS NULL OR pi.itemType = :itemType) AND " +
           "(:itemCode IS NULL OR LOWER(pi.itemCode) LIKE LOWER(CONCAT('%', :itemCode, '%'))) AND " +
           "(:itemName IS NULL OR LOWER(pi.itemName) LIKE LOWER(CONCAT('%', :itemName, '%'))) AND " +
           "(:isTaxable IS NULL OR pi.isTaxable = :isTaxable) AND " +
           "(:isStatutory IS NULL OR pi.isStatutory = :isStatutory)")
    Page<PayrollItem> findBySearchCriteria(@Param("organization") Organization organization,
                                          @Param("itemType") String itemType,
                                          @Param("itemCode") String itemCode,
                                          @Param("itemName") String itemName,
                                          @Param("isTaxable") Boolean isTaxable,
                                          @Param("isStatutory") Boolean isStatutory,
                                          Pageable pageable);
    
    // Get average amount by item type
    @Query("SELECT AVG(pi.amount) FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization AND pi.itemType = :itemType")
    BigDecimal getAverageAmountByOrganizationAndItemType(@Param("organization") Organization organization, 
                                                        @Param("itemType") String itemType);
    
    // Find unique item codes by organization
    @Query("SELECT DISTINCT pi.itemCode FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization")
    List<String> findUniqueItemCodesByOrganization(@Param("organization") Organization organization);
    
    // Find unique item types by organization
    @Query("SELECT DISTINCT pi.itemType FROM PayrollItem pi WHERE pi.payslip.employee.organization = :organization")
    List<String> findUniqueItemTypesByOrganization(@Param("organization") Organization organization);
}

