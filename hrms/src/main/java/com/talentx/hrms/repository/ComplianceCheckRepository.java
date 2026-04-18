package com.talentx.hrms.repository;

import com.talentx.hrms.entity.compliance.ComplianceCheck;
import com.talentx.hrms.entity.compliance.ComplianceRule;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ComplianceCheckRepository extends JpaRepository<ComplianceCheck, Long> {
    
    // Find by compliance rule (using actual field name 'rule')
    List<ComplianceCheck> findByRule(ComplianceRule rule);
    Page<ComplianceCheck> findByRule(ComplianceRule rule, Pageable pageable);
    
    // Backward compatibility method
    default List<ComplianceCheck> findByComplianceRule(ComplianceRule rule) {
        return findByRule(rule);
    }
    
    // Find by organization
    List<ComplianceCheck> findByOrganization(Organization organization);
    Page<ComplianceCheck> findByOrganization(Organization organization, Pageable pageable);
    
    // Find by employee
    List<ComplianceCheck> findByEmployee(Employee employee);
    Page<ComplianceCheck> findByEmployee(Employee employee, Pageable pageable);
    
    // Find by organization and employee
    List<ComplianceCheck> findByOrganizationAndEmployee(Organization organization, Employee employee);
    
    // Find by status
    List<ComplianceCheck> findByStatus(ComplianceCheck.CheckStatus status);
    List<ComplianceCheck> findByOrganizationAndStatus(Organization organization, ComplianceCheck.CheckStatus status);

    // Find compliant checks
    @Query("SELECT c FROM ComplianceCheck c WHERE c.status = 'COMPLIANT'")
    List<ComplianceCheck> findCompliantChecks();
    
    // Find non-compliant checks
    @Query("SELECT c FROM ComplianceCheck c WHERE c.status = 'NON_COMPLIANT'")
    List<ComplianceCheck> findNonCompliantChecks();
    
    // Find non-compliant checks by organization
    @Query("SELECT c FROM ComplianceCheck c WHERE c.organization = :organization AND c.status = 'NON_COMPLIANT'")
    List<ComplianceCheck> findNonCompliantChecksByOrganization(@Param("organization") Organization organization);
    
    // Find unresolved checks (using actual field name 'resolved')
    @Query("SELECT c FROM ComplianceCheck c WHERE c.resolved = false")
    List<ComplianceCheck> findUnresolvedChecks();
    
    // Find unresolved checks by organization
    @Query("SELECT c FROM ComplianceCheck c WHERE c.organization = :organization AND c.resolved = false")
    List<ComplianceCheck> findUnresolvedChecksByOrganization(@Param("organization") Organization organization);
    
    // Find overdue checks - simplified since remediationDueDate doesn't exist
    @Query("SELECT c FROM ComplianceCheck c WHERE c.organization = :organization AND c.resolved = false AND c.status = 'NON_COMPLIANT'")
    List<ComplianceCheck> findOverdueChecksByOrganization(@Param("organization") Organization organization, 
                                                         @Param("currentDate") LocalDate currentDate);
    
    // Find checks by date range
    @Query("SELECT c FROM ComplianceCheck c WHERE c.checkDate BETWEEN :startDate AND :endDate")
    List<ComplianceCheck> findByCheckDateBetween(@Param("startDate") LocalDate startDate, 
                                                @Param("endDate") LocalDate endDate);
    
    // Find checks by organization and date range
    @Query("SELECT c FROM ComplianceCheck c WHERE c.organization = :organization AND " +
           "c.checkDate BETWEEN :startDate AND :endDate")
    List<ComplianceCheck> findByOrganizationAndCheckDateBetween(@Param("organization") Organization organization,
                                                               @Param("startDate") LocalDate startDate, 
                                                               @Param("endDate") LocalDate endDate);
    
    // Find latest check for a rule and organization
    @Query("SELECT c FROM ComplianceCheck c WHERE c.rule = :rule AND c.organization = :organization " +
           "ORDER BY c.checkDate DESC")
    List<ComplianceCheck> findLatestCheckForRuleAndOrganization(@Param("rule") ComplianceRule rule, 
                                                               @Param("organization") Organization organization, 
                                                               Pageable pageable);
    
    // Find checks needing alerts - simplified since alertSent doesn't exist
    @Query("SELECT c FROM ComplianceCheck c WHERE c.status = 'NON_COMPLIANT' AND c.resolved = false")
    List<ComplianceCheck> findChecksNeedingAlerts();
    
    // Find checks needing alerts by organization
    @Query("SELECT c FROM ComplianceCheck c WHERE c.organization = :organization AND " +
           "c.status = 'NON_COMPLIANT' AND c.resolved = false")
    List<ComplianceCheck> findChecksNeedingAlertsByOrganization(@Param("organization") Organization organization);
    
    // Find checks with violations
    @Query("SELECT c FROM ComplianceCheck c WHERE c.violationDetails IS NOT NULL AND c.violationDetails != ''")
    List<ComplianceCheck> findChecksWithViolations();
    
    // Find checks with violations by organization
    @Query("SELECT c FROM ComplianceCheck c WHERE c.organization = :organization AND " +
           "c.violationDetails IS NOT NULL AND c.violationDetails != ''")
    List<ComplianceCheck> findChecksWithViolationsByOrganization(@Param("organization") Organization organization);

    // Count checks by organization
    long countByOrganization(Organization organization);
    
    // Count checks by status
    long countByStatus(ComplianceCheck.CheckStatus status);
    long countByOrganizationAndStatus(Organization organization, ComplianceCheck.CheckStatus status);
    
    // Count non-compliant checks by organization
    @Query("SELECT COUNT(c) FROM ComplianceCheck c WHERE c.organization = :organization AND c.status = 'NON_COMPLIANT'")
    long countNonCompliantByOrganization(@Param("organization") Organization organization);
    
    // Count unresolved checks by organization
    @Query("SELECT COUNT(c) FROM ComplianceCheck c WHERE c.organization = :organization AND c.resolved = false")
    long countUnresolvedByOrganization(@Param("organization") Organization organization);
    
    // Count overdue checks by organization - simplified
    @Query("SELECT COUNT(c) FROM ComplianceCheck c WHERE c.organization = :organization AND " +
           "c.resolved = false AND c.status = 'NON_COMPLIANT'")
    long countOverdueByOrganization(@Param("organization") Organization organization, 
                                   @Param("currentDate") LocalDate currentDate);
    
    // Check if a rule has been checked for an organization on a specific date
    boolean existsByRuleAndOrganizationAndCheckDate(ComplianceRule rule, 
                                                   Organization organization, 
                                                   LocalDate checkDate);
    
    // Check if a rule has been checked for an employee on a specific date
    boolean existsByRuleAndEmployeeAndCheckDate(ComplianceRule rule, 
                                               Employee employee, 
                                               LocalDate checkDate);
}
