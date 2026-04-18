package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.enums.CompanySize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
    // Find by name
    Optional<Organization> findByName(String name);
    
    // Find by legal name
    Optional<Organization> findByLegalName(String legalName);
    
    // Find by tax ID
    Optional<Organization> findByTaxId(String taxId);
    
    // Find by company size
    List<Organization> findByCompanySize(CompanySize companySize);
    
    // Find by industry
    List<Organization> findByIndustry(String industry);
    
    // Search organizations by name (case-insensitive)
    @Query("SELECT o FROM Organization o WHERE LOWER(o.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Organization> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
    
    // Search organizations by multiple criteria
    @Query("SELECT o FROM Organization o WHERE " +
           "(:name IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:industry IS NULL OR LOWER(o.industry) LIKE LOWER(CONCAT('%', :industry, '%'))) AND " +
           "(:companySize IS NULL OR o.companySize = :companySize)")
    Page<Organization> findBySearchCriteria(@Param("name") String name, 
                                          @Param("industry") String industry, 
                                          @Param("companySize") CompanySize companySize, 
                                          Pageable pageable);
    
    // Find active organizations
    @Query("SELECT o FROM Organization o WHERE o.isActive = true")
    List<Organization> findActiveOrganizations();
    
    // Count organizations by company size
    @Query("SELECT COUNT(o) FROM Organization o WHERE o.companySize = :companySize")
    long countByCompanySize(@Param("companySize") CompanySize companySize);
    
    // Find organizations with departments
    @Query("SELECT DISTINCT o FROM Organization o LEFT JOIN FETCH o.departments WHERE o.id = :id")
    Optional<Organization> findByIdWithDepartments(@Param("id") Long id);
    
    // Find organizations with locations
    @Query("SELECT DISTINCT o FROM Organization o LEFT JOIN FETCH o.locations WHERE o.id = :id")
    Optional<Organization> findByIdWithLocations(@Param("id") Long id);
}

