package com.talentx.hrms.repository;

import com.talentx.hrms.entity.compliance.ComplianceJurisdiction;
import com.talentx.hrms.entity.compliance.ComplianceRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ComplianceRuleRepository extends JpaRepository<ComplianceRule, Long> {
    
    // Find by jurisdiction
    List<ComplianceRule> findByJurisdiction(ComplianceJurisdiction jurisdiction);
    Page<ComplianceRule> findByJurisdiction(ComplianceJurisdiction jurisdiction, Pageable pageable);
    
    // Find by rule category
    List<ComplianceRule> findByRuleCategory(ComplianceRule.RuleCategory ruleCategory);
    
    // Find by isActive status
    List<ComplianceRule> findByIsActive(Boolean isActive);
    Page<ComplianceRule> findByIsActive(Boolean isActive, Pageable pageable);
    
    // Find by jurisdiction and isActive
    List<ComplianceRule> findByJurisdictionAndIsActive(ComplianceJurisdiction jurisdiction, Boolean isActive);
    
    // Find active rules (within effective date range)
    @Query("SELECT r FROM ComplianceRule r WHERE r.isActive = true AND " +
           "(r.effectiveDate IS NULL OR r.effectiveDate <= :currentDate) AND " +
           "(r.expiryDate IS NULL OR r.expiryDate >= :currentDate)")
    List<ComplianceRule> findActiveRules(@Param("currentDate") LocalDate currentDate);
    
    // Find active rules by jurisdiction
    @Query("SELECT r FROM ComplianceRule r WHERE r.jurisdiction = :jurisdiction AND r.isActive = true AND " +
           "(r.effectiveDate IS NULL OR r.effectiveDate <= :currentDate) AND " +
           "(r.expiryDate IS NULL OR r.expiryDate >= :currentDate)")
    List<ComplianceRule> findActiveRulesByJurisdiction(@Param("jurisdiction") ComplianceJurisdiction jurisdiction, 
                                                      @Param("currentDate") LocalDate currentDate);
    
    // Search rules by name or description
    @Query("SELECT r FROM ComplianceRule r WHERE " +
           "(LOWER(r.ruleName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<ComplianceRule> findByRuleNameOrDescriptionContainingIgnoreCase(@Param("searchTerm") String searchTerm, 
                                                                         Pageable pageable);
    
    // Search rules by jurisdiction and name or description
    @Query("SELECT r FROM ComplianceRule r WHERE r.jurisdiction = :jurisdiction AND " +
           "(LOWER(r.ruleName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<ComplianceRule> findByJurisdictionAndRuleNameOrDescriptionContainingIgnoreCase(
            @Param("jurisdiction") ComplianceJurisdiction jurisdiction,
            @Param("searchTerm") String searchTerm, 
            Pageable pageable);
    
    // Find rules expiring soon
    @Query("SELECT r FROM ComplianceRule r WHERE r.expiryDate IS NOT NULL AND " +
           "r.expiryDate BETWEEN :currentDate AND :endDate")
    List<ComplianceRule> findRulesExpiringSoon(@Param("currentDate") LocalDate currentDate, 
                                              @Param("endDate") LocalDate endDate);
    
    // Count by jurisdiction
    long countByJurisdiction(ComplianceJurisdiction jurisdiction);
    
    // Count active rules by jurisdiction
    @Query("SELECT COUNT(r) FROM ComplianceRule r WHERE r.jurisdiction = :jurisdiction AND r.isActive = true AND " +
           "(r.effectiveDate IS NULL OR r.effectiveDate <= :currentDate) AND " +
           "(r.expiryDate IS NULL OR r.expiryDate >= :currentDate)")
    long countActiveRulesByJurisdiction(@Param("jurisdiction") ComplianceJurisdiction jurisdiction, 
                                       @Param("currentDate") LocalDate currentDate);
    
    // Find by rule name
    List<ComplianceRule> findByRuleNameContainingIgnoreCase(String ruleName);
}
