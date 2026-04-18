package com.talentx.hrms.repository;

import com.talentx.hrms.entity.attendance.Holiday;
import com.talentx.hrms.entity.core.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    
    // Find holiday by organization and date
    Optional<Holiday> findByOrganizationAndHolidayDate(Organization organization, LocalDate holidayDate);
    
    // Find all holidays by organization
    List<Holiday> findByOrganization(Organization organization);
    
    // Find all holidays by organization with pagination
    Page<Holiday> findByOrganization(Organization organization, Pageable pageable);
    
    // Find holidays by organization and date range
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND " +
           "h.holidayDate BETWEEN :startDate AND :endDate ORDER BY h.holidayDate")
    List<Holiday> findByOrganizationAndDateRange(@Param("organization") Organization organization,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);
    
    // Find holidays by organization and year
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND " +
           "YEAR(h.holidayDate) = :year ORDER BY h.holidayDate")
    List<Holiday> findByOrganizationAndYear(@Param("organization") Organization organization,
                                                   @Param("year") int year);
    
    // Find optional holidays by organization
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND h.isOptional = true")
    List<Holiday> findOptionalByOrganization(@Param("organization") Organization organization);
    
    // Find mandatory holidays by organization
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND h.isOptional = false")
    List<Holiday> findMandatoryByOrganization(@Param("organization") Organization organization);
    
    // Find holidays by type
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND h.holidayType = :type")
    List<Holiday> findByOrganizationAndType(@Param("organization") Organization organization,
                                                   @Param("type") String type);
    
    // Find holidays by name containing (search)
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Holiday> findByOrganizationAndNameContaining(@Param("organization") Organization organization,
                                                             @Param("name") String name,
                                                             Pageable pageable);
    
    // Check if holiday exists for organization and date
    boolean existsByOrganizationAndHolidayDate(Organization organization, LocalDate holidayDate);
    
    // Find upcoming holidays
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND " +
           "h.holidayDate >= :fromDate ORDER BY h.holidayDate")
    List<Holiday> findUpcomingByOrganization(@Param("organization") Organization organization,
                                                    @Param("fromDate") LocalDate fromDate);
    
    // Find holidays with comprehensive search
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND " +
           "(:name IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:type IS NULL OR h.holidayType = :type) AND " +
           "(:isOptional IS NULL OR h.isOptional = :isOptional) AND " +
           "(:startDate IS NULL OR h.holidayDate >= :startDate) AND " +
           "(:endDate IS NULL OR h.holidayDate <= :endDate)")
    Page<Holiday> findBySearchCriteria(@Param("organization") Organization organization,
                                             @Param("name") String name,
                                             @Param("type") String type,
                                             @Param("isOptional") Boolean isOptional,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate,
                                             Pageable pageable);
    
    // Count holidays by organization and year
    @Query("SELECT COUNT(h) FROM Holiday h WHERE h.organization = :organization AND " +
           "YEAR(h.holidayDate) = :year")
    long countByOrganizationAndYear(@Param("organization") Organization organization,
                                    @Param("year") int year);
    
    // Count mandatory holidays by organization and year
    @Query("SELECT COUNT(h) FROM Holiday h WHERE h.organization = :organization AND " +
           "YEAR(h.holidayDate) = :year AND h.isOptional = false")
    long countMandatoryByOrganizationAndYear(@Param("organization") Organization organization,
                                             @Param("year") int year);
    
    // Find holidays by month
    @Query("SELECT h FROM Holiday h WHERE h.organization = :organization AND " +
           "YEAR(h.holidayDate) = :year AND MONTH(h.holidayDate) = :month ORDER BY h.holidayDate")
    List<Holiday> findByOrganizationAndYearAndMonth(@Param("organization") Organization organization,
                                                           @Param("year") int year,
                                                           @Param("month") int month);
}

