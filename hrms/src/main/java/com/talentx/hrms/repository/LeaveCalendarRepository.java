package com.talentx.hrms.repository;

import com.talentx.hrms.entity.attendance.LeaveCalendar;
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

/**
 * Repository for LeaveCalendar entity.
 * This is an alias for HolidayRepository to maintain consistency with entity
 * naming.
 * Both repositories point to the same LeaveCalendar entity.
 */
@Repository
public interface LeaveCalendarRepository extends JpaRepository<LeaveCalendar, Long> {

       // Find holiday by organization and date
       Optional<LeaveCalendar> findByOrganizationAndCalendarDate(Organization organization, LocalDate calendarDate);

       // Find all holidays by organization
       List<LeaveCalendar> findByOrganization(Organization organization);

       // Find all holidays by organization with pagination
       Page<LeaveCalendar> findByOrganization(Organization organization, Pageable pageable);

       // Find holidays by organization and date range
       @Query("SELECT lc FROM LeaveCalendar lc WHERE lc.organization = :organization AND " +
                     "lc.calendarDate BETWEEN :startDate AND :endDate ORDER BY lc.calendarDate")
       List<LeaveCalendar> findByOrganizationAndDateRange(@Param("organization") Organization organization,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       // Find holidays by organization and year
       @Query("SELECT lc FROM LeaveCalendar lc WHERE lc.organization = :organization AND " +
                     "YEAR(lc.calendarDate) = :year ORDER BY lc.calendarDate")
       List<LeaveCalendar> findByOrganizationAndYear(@Param("organization") Organization organization,
                     @Param("year") int year);

       // Check if date is a holiday
       @Query("SELECT COUNT(lc) > 0 FROM LeaveCalendar lc WHERE lc.organization = :organization AND " +
                     "lc.calendarDate = :date AND lc.dayType = 'HOLIDAY'")
       boolean isHoliday(@Param("organization") Organization organization,
                     @Param("date") LocalDate date);

       // Check if date is a mandatory holiday
       @Query("SELECT COUNT(lc) > 0 FROM LeaveCalendar lc JOIN lc.holiday h WHERE lc.organization = :organization AND "
                     +
                     "lc.calendarDate = :date AND lc.dayType = 'HOLIDAY' AND h.isOptional = false")
       boolean isMandatoryHoliday(@Param("organization") Organization organization,
                     @Param("date") LocalDate date);

       // Count working days in date range (excluding holidays)
       @Query("SELECT COUNT(lc) FROM LeaveCalendar lc JOIN lc.holiday h WHERE lc.organization = :organization AND " +
                     "lc.calendarDate BETWEEN :startDate AND :endDate AND lc.dayType = 'HOLIDAY' AND h.isOptional = false")
       long countHolidaysInRange(@Param("organization") Organization organization,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       // Find holidays applicable to a location
       @Query("SELECT lc FROM LeaveCalendar lc WHERE lc.organization = :organization AND " +
                     "lc.calendarDate BETWEEN :startDate AND :endDate AND lc.dayType = 'HOLIDAY'")
       List<LeaveCalendar> findApplicableHolidays(@Param("organization") Organization organization,
                     @Param("location") String location,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       // Find mandatory holidays in date range
       @Query("SELECT lc FROM LeaveCalendar lc JOIN lc.holiday h WHERE lc.organization = :organization AND " +
                     "lc.calendarDate BETWEEN :startDate AND :endDate AND lc.dayType = 'HOLIDAY' AND h.isOptional = false ORDER BY lc.calendarDate")
       List<LeaveCalendar> findMandatoryHolidaysInRange(@Param("organization") Organization organization,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       // Find optional holidays in date range
       @Query("SELECT lc FROM LeaveCalendar lc JOIN lc.holiday h WHERE lc.organization = :organization AND " +
                     "lc.calendarDate BETWEEN :startDate AND :endDate AND lc.dayType = 'HOLIDAY' AND h.isOptional = true ORDER BY lc.calendarDate")
       List<LeaveCalendar> findOptionalHolidaysInRange(@Param("organization") Organization organization,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       // Get holiday calendar for a year
       @Query("SELECT lc FROM LeaveCalendar lc WHERE lc.organization = :organization AND " +
                     "YEAR(lc.calendarDate) = :year ORDER BY lc.calendarDate")
       List<LeaveCalendar> getYearlyCalendar(@Param("organization") Organization organization,
                     @Param("year") int year);

       // Check if holiday exists for organization and date
       boolean existsByOrganizationAndCalendarDate(Organization organization, LocalDate calendarDate);
}

