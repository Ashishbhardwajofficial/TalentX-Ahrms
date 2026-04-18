package com.talentx.hrms.repository;

import com.talentx.hrms.entity.compliance.ComplianceJurisdiction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceJurisdictionRepository extends JpaRepository<ComplianceJurisdiction, Long> {
    
    // Find by name
    Optional<ComplianceJurisdiction> findByName(String name);
    
    // Find by country code
    List<ComplianceJurisdiction> findByCountryCode(String countryCode);
    Page<ComplianceJurisdiction> findByCountryCode(String countryCode, Pageable pageable);
    
    // Find by state/province code
    List<ComplianceJurisdiction> findByStateProvinceCode(String stateProvinceCode);
    
    // Find by country code and state/province code
    List<ComplianceJurisdiction> findByCountryCodeAndStateProvinceCode(String countryCode, String stateProvinceCode);
    
    // Find by jurisdiction type
    List<ComplianceJurisdiction> findByJurisdictionType(ComplianceJurisdiction.JurisdictionType jurisdictionType);
    
    // Find by isActive
    List<ComplianceJurisdiction> findByIsActive(Boolean isActive);
    
    // Search by name
    @Query("SELECT j FROM ComplianceJurisdiction j WHERE LOWER(j.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<ComplianceJurisdiction> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find all ordered by name
    @Query("SELECT j FROM ComplianceJurisdiction j ORDER BY j.name")
    List<ComplianceJurisdiction> findAllOrderByName();
    
    // Find all ordered by country code then state/province code
    @Query("SELECT j FROM ComplianceJurisdiction j ORDER BY j.countryCode, j.stateProvinceCode, j.name")
    List<ComplianceJurisdiction> findAllOrderByCountryAndState();
    
    // Check if name exists
    boolean existsByName(String name);
    
    // Check if country code and state province code combination exists
    boolean existsByCountryCodeAndStateProvinceCode(String countryCode, String stateProvinceCode);
    
    // Count by country code
    long countByCountryCode(String countryCode);
    
    // Count by jurisdiction type
    long countByJurisdictionType(ComplianceJurisdiction.JurisdictionType jurisdictionType);
    
    // Backward compatibility - check by code (uses countryCode)
    @Query("SELECT CASE WHEN COUNT(j) > 0 THEN true ELSE false END FROM ComplianceJurisdiction j WHERE j.countryCode = :code OR CONCAT(j.countryCode, '-', j.stateProvinceCode) = :code")
    boolean existsByCode(@Param("code") String code);
}
