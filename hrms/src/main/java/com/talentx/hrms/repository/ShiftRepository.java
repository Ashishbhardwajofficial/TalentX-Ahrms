package com.talentx.hrms.repository;

import com.talentx.hrms.entity.attendance.Shift;
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
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    
    // Find shift by name and organization
    Optional<Shift> findByNameAndOrganization(String name, Organization organization);
    
    // Find all shifts by organization
    List<Shift> findByOrganization(Organization organization);
    
    // Find all shifts by organization with pagination
    Page<Shift> findByOrganization(Organization organization, Pageable pageable);
    
    // Find night shifts by organization
    @Query("SELECT s FROM Shift s WHERE s.organization = :organization AND s.isNightShift = true")
    List<Shift> findNightShiftsByOrganization(@Param("organization") Organization organization);
    
    // Find flexible shifts by organization
    @Query("SELECT s FROM Shift s WHERE s.organization = :organization AND s.isFlexible = true")
    List<Shift> findFlexibleShiftsByOrganization(@Param("organization") Organization organization);
    
    // Find shifts by name containing (search)
    @Query("SELECT s FROM Shift s WHERE s.organization = :organization AND LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Shift> findByOrganizationAndNameContaining(@Param("organization") Organization organization,
                                                     @Param("name") String name,
                                                     Pageable pageable);
    
    // Check if shift name exists for organization
    boolean existsByNameAndOrganization(String name, Organization organization);
    
    // Find shifts with comprehensive search
    @Query("SELECT s FROM Shift s WHERE s.organization = :organization AND " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:isNightShift IS NULL OR s.isNightShift = :isNightShift) AND " +
           "(:isFlexible IS NULL OR s.isFlexible = :isFlexible)")
    Page<Shift> findBySearchCriteria(@Param("organization") Organization organization,
                                     @Param("name") String name,
                                     @Param("isNightShift") Boolean isNightShift,
                                     @Param("isFlexible") Boolean isFlexible,
                                     Pageable pageable);
    
    // Count shifts by organization
    long countByOrganization(Organization organization);
    
    // Find shifts ordered by start time
    @Query("SELECT s FROM Shift s WHERE s.organization = :organization ORDER BY s.startTime")
    List<Shift> findByOrganizationOrderByStartTime(@Param("organization") Organization organization);
}

