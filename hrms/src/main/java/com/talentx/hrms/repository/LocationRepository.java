package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    // Find by name
    Optional<Location> findByName(String name);
    
    // Find by name and organization
    Optional<Location> findByNameAndOrganization(String name, Organization organization);
    
    // Find all locations by organization
    List<Location> findByOrganization(Organization organization);
    
    // Find all locations by organization with pagination
    Page<Location> findByOrganization(Organization organization, Pageable pageable);
    
    // Find headquarters location
    Optional<Location> findByOrganizationAndIsHeadquartersTrue(Organization organization);
    
    // Find locations by city
    List<Location> findByOrganizationAndCity(Organization organization, String city);
    
    // Find locations by country
    List<Location> findByOrganizationAndCountry(Organization organization, String country);
    
    // Find locations by state/province
    List<Location> findByOrganizationAndStateProvince(Organization organization, String stateProvince);
    
    // Search locations by name within organization
    @Query("SELECT l FROM Location l WHERE l.organization = :organization AND " +
           "LOWER(l.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Location> findByOrganizationAndNameContainingIgnoreCase(@Param("organization") Organization organization, 
                                                                @Param("name") String name, 
                                                                Pageable pageable);
    
    // Find locations with coordinates - removed as entity doesn't have latitude/longitude fields
    
    // Find locations by time zone
    List<Location> findByOrganizationAndTimezone(Organization organization, String timezone);
    
    // Search locations by address components
    @Query("SELECT l FROM Location l WHERE l.organization = :organization AND " +
           "(LOWER(l.addressLine1) LIKE LOWER(CONCAT('%', :address, '%')) OR " +
           "LOWER(l.addressLine2) LIKE LOWER(CONCAT('%', :address, '%')) OR " +
           "LOWER(l.city) LIKE LOWER(CONCAT('%', :address, '%')))")
    List<Location> findByOrganizationAndAddressContaining(@Param("organization") Organization organization, 
                                                         @Param("address") String address);
    
    // Count locations by organization
    long countByOrganization(Organization organization);
    
    // Count locations by country
    long countByOrganizationAndCountry(Organization organization, String country);
    
    // Check if location name exists in organization
    boolean existsByNameAndOrganization(String name, Organization organization);
    
    // Find active locations
    @Query("SELECT l FROM Location l WHERE l.organization = :organization AND l.isActive = true")
    List<Location> findActiveByOrganization(@Param("organization") Organization organization);
}

