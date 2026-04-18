package com.talentx.hrms.service.holiday;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.common.exception.ValidationException;
import com.talentx.hrms.dto.attendance.HolidayRequest;
import com.talentx.hrms.dto.attendance.HolidayResponse;
import com.talentx.hrms.dto.attendance.HolidayCalendarResponse;
import com.talentx.hrms.entity.attendance.Holiday;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.enums.HolidayType;
import com.talentx.hrms.repository.HolidayRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class HolidayService {

    private final HolidayRepository holidayRepository;
    private final OrganizationRepository organizationRepository;

    @Autowired
    public HolidayService(HolidayRepository holidayRepository, OrganizationRepository organizationRepository) {
        this.holidayRepository = holidayRepository;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Create a new holiday
     */
    public HolidayResponse createHoliday(HolidayRequest request) {
        // Validate organization exists
        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        // Validate unique constraint - no duplicate holidays on same date for same organization
        if (holidayRepository.existsByOrganizationAndHolidayDate(organization, request.getHolidayDate())) {
            throw new ValidationException("Holiday already exists for this date in the organization");
        }

        // Validate holiday date is not in the past
        if (request.getHolidayDate().isBefore(LocalDate.now())) {
            throw new ValidationException("Holiday date cannot be in the past");
        }

        // Create holiday entity
        Holiday holiday = new Holiday();
        mapRequestToEntity(request, holiday, organization);

        // Save holiday
        holiday = holidayRepository.save(holiday);

        return mapEntityToResponse(holiday);
    }

    /**
     * Update an existing holiday
     */
    public HolidayResponse updateHoliday(Long id, HolidayRequest request) {
        Holiday holiday = holidayRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Holiday not found"));

        // Validate organization exists
        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        // Validate unique constraint (excluding current holiday)
        holidayRepository.findByOrganizationAndHolidayDate(organization, request.getHolidayDate())
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ValidationException("Holiday already exists for this date in the organization");
                }
            });

        // Update holiday entity
        mapRequestToEntity(request, holiday, organization);

        // Save holiday
        holiday = holidayRepository.save(holiday);

        return mapEntityToResponse(holiday);
    }

    /**
     * Get holiday by ID
     */
    @Transactional(readOnly = true)
    public HolidayResponse getHoliday(Long id) {
        Holiday holiday = holidayRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Holiday not found"));

        return mapEntityToResponse(holiday);
    }

    /**
     * Get all holidays with pagination
     */
    @Transactional(readOnly = true)
    public Page<HolidayResponse> getHolidays(Long organizationId, PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        Pageable pageable = createPageable(paginationRequest);
        Page<Holiday> holidays = holidayRepository.findByOrganization(organization, pageable);

        return holidays.map(this::mapEntityToResponse);
    }

    /**
     * Search holidays with comprehensive criteria
     */
    @Transactional(readOnly = true)
    public Page<HolidayResponse> searchHolidays(Long organizationId, String name, String type, 
                                               Boolean isMandatory, LocalDate startDate, LocalDate endDate,
                                               PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        Pageable pageable = createPageable(paginationRequest);
        Page<Holiday> holidays = holidayRepository.findBySearchCriteria(
            organization, name, type, isMandatory, startDate, endDate, pageable);

        return holidays.map(this::mapEntityToResponse);
    }

    /**
     * Get holidays by year
     */
    @Transactional(readOnly = true)
    public List<HolidayResponse> getHolidaysByYear(Long organizationId, int year) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        List<Holiday> holidays = holidayRepository.findByOrganizationAndYear(organization, year);
        return holidays.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get holidays by date range
     */
    @Transactional(readOnly = true)
    public List<HolidayResponse> getHolidaysByDateRange(Long organizationId, LocalDate startDate, LocalDate endDate) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        List<Holiday> holidays = holidayRepository.findByOrganizationAndDateRange(organization, startDate, endDate);
        return holidays.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get mandatory holidays
     */
    @Transactional(readOnly = true)
    public List<HolidayResponse> getMandatoryHolidays(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        List<Holiday> holidays = holidayRepository.findMandatoryByOrganization(organization);
        return holidays.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get optional holidays
     */
    @Transactional(readOnly = true)
    public List<HolidayResponse> getOptionalHolidays(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        List<Holiday> holidays = holidayRepository.findOptionalByOrganization(organization);
        return holidays.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get upcoming holidays
     */
    @Transactional(readOnly = true)
    public List<HolidayResponse> getUpcomingHolidays(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        List<Holiday> holidays = holidayRepository.findUpcomingByOrganization(organization, LocalDate.now());
        return holidays.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Generate holiday calendar for a year
     */
    @Transactional(readOnly = true)
    public HolidayCalendarResponse generateHolidayCalendar(Long organizationId, int year) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        List<Holiday> holidays = holidayRepository.findByOrganizationAndYear(organization, year);
        List<HolidayResponse> holidayResponses = holidays.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());

        HolidayCalendarResponse calendar = new HolidayCalendarResponse(year, organizationId);
        calendar.setOrganizationName(organization.getName());
        calendar.setHolidays(holidayResponses);
        calendar.setTotalHolidays(holidayResponses.size());

        // Calculate statistics
        long mandatoryCount = holidays.stream().filter(h -> Boolean.TRUE.equals(h.getIsMandatory())).count();
        calendar.setMandatoryHolidays((int) mandatoryCount);
        calendar.setOptionalHolidays(holidayResponses.size() - (int) mandatoryCount);

        // Count by type
        Map<String, Integer> countByType = holidays.stream()
            .collect(Collectors.groupingBy(
                h -> h.getHolidayType() != null ? h.getHolidayType().name() : "UNKNOWN",
                Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
            ));
        calendar.setHolidayCountByType(countByType);

        // Count by month
        Map<String, Integer> countByMonth = holidays.stream()
            .collect(Collectors.groupingBy(
                h -> h.getHolidayDate().getMonth().name(),
                Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
            ));
        calendar.setHolidayCountByMonth(countByMonth);

        return calendar;
    }

    /**
     * Calculate leave days excluding holidays and weekends
     */
    @Transactional(readOnly = true)
    public int calculateLeaveDays(Long organizationId, LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new ValidationException("Start date cannot be after end date");
        }

        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        // Get holidays in the date range
        List<Holiday> holidays = holidayRepository.findByOrganizationAndDateRange(organization, startDate, endDate);
        Set<LocalDate> holidayDates = holidays.stream()
            .map(Holiday::getHolidayDate)
            .collect(Collectors.toSet());

        int leaveDays = 0;
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            // Skip weekends (Saturday = 6, Sunday = 7)
            if (currentDate.getDayOfWeek().getValue() < 6 && !holidayDates.contains(currentDate)) {
                leaveDays++;
            }
            currentDate = currentDate.plusDays(1);
        }

        return leaveDays;
    }

    /**
     * Check if a date is a holiday
     */
    @Transactional(readOnly = true)
    public boolean isHoliday(Long organizationId, LocalDate date) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        return holidayRepository.existsByOrganizationAndHolidayDate(organization, date);
    }

    /**
     * Get holidays by location - Note: Holiday entity doesn't have location field in database schema
     */
    @Transactional(readOnly = true)
    public List<HolidayResponse> getHolidaysByLocation(Long organizationId, String location) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        // Since Holiday entity doesn't have location field, return all holidays for organization
        List<Holiday> holidays = holidayRepository.findByOrganization(organization);
        return holidays.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Delete holiday
     */
    public void deleteHoliday(Long id) {
        Holiday holiday = holidayRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Holiday not found"));

        // Check if holiday is in the past
        if (holiday.getHolidayDate().isBefore(LocalDate.now())) {
            throw new ValidationException("Cannot delete past holidays");
        }

        holidayRepository.delete(holiday);
    }

    /**
     * Get holiday statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getHolidayStatistics(Long organizationId, int year) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found"));

        Map<String, Object> statistics = new HashMap<>();
        
        long totalHolidays = holidayRepository.countByOrganizationAndYear(organization, year);
        long mandatoryHolidays = holidayRepository.countMandatoryByOrganizationAndYear(organization, year);
        
        statistics.put("totalHolidays", totalHolidays);
        statistics.put("mandatoryHolidays", mandatoryHolidays);
        statistics.put("optionalHolidays", totalHolidays - mandatoryHolidays);
        statistics.put("year", year);
        statistics.put("organizationId", organizationId);
        statistics.put("organizationName", organization.getName());

        return statistics;
    }

    /**
     * Map request DTO to entity
     */
    private void mapRequestToEntity(HolidayRequest request, Holiday holiday, Organization organization) {
        holiday.setHolidayName(request.getName());
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setDescription(request.getDescription());
        holiday.setHolidayType(HolidayType.valueOf(request.getHolidayType()));
        holiday.setIsMandatory(!Boolean.TRUE.equals(request.getIsOptional()));
        holiday.setIsRecurring(Boolean.TRUE.equals(request.getIsRecurring()));
        holiday.setApplicableLocations(request.getApplicableLocations());
        holiday.setOrganization(organization);
    }

    /**
     * Map entity to response DTO
     */
    private HolidayResponse mapEntityToResponse(Holiday holiday) {
        HolidayResponse response = new HolidayResponse();
        response.setId(holiday.getId());
        response.setName(holiday.getHolidayName());
        response.setHolidayDate(holiday.getHolidayDate());
        response.setDescription(holiday.getDescription());
        response.setHolidayType(holiday.getHolidayType().name());
        response.setIsOptional(!Boolean.TRUE.equals(holiday.getIsMandatory()));
        response.setIsRecurring(Boolean.TRUE.equals(holiday.getIsRecurring()));
        response.setApplicableLocations(holiday.getApplicableLocations());
        response.setOrganizationId(holiday.getOrganization().getId());
        response.setOrganizationName(holiday.getOrganization().getName());

        if (holiday.getCreatedAt() != null) {
            response.setCreatedAt(LocalDateTime.ofInstant(
                holiday.getCreatedAt(), ZoneId.systemDefault()));
        }
        if (holiday.getUpdatedAt() != null) {
            response.setUpdatedAt(LocalDateTime.ofInstant(
                holiday.getUpdatedAt(), ZoneId.systemDefault()));
        }

        return response;
    }

    /**
     * Create pageable from pagination request
     */
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.by(Sort.Direction.ASC, "holidayDate"); // Default sort by date
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }
}

