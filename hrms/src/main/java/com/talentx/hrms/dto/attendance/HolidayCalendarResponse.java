package com.talentx.hrms.dto.attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class HolidayCalendarResponse {

    private int year;
    private Long organizationId;
    private String organizationName;
    private List<HolidayResponse> holidays;
    private Map<String, Integer> holidayCountByType;
    private Map<String, Integer> holidayCountByMonth;
    private int totalHolidays;
    private int mandatoryHolidays;
    private int optionalHolidays;

    // Constructors
    public HolidayCalendarResponse() {}

    public HolidayCalendarResponse(int year, Long organizationId) {
        this.year = year;
        this.organizationId = organizationId;
    }

    // Getters and Setters
    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public List<HolidayResponse> getHolidays() {
        return holidays;
    }

    public void setHolidays(List<HolidayResponse> holidays) {
        this.holidays = holidays;
    }

    public Map<String, Integer> getHolidayCountByType() {
        return holidayCountByType;
    }

    public void setHolidayCountByType(Map<String, Integer> holidayCountByType) {
        this.holidayCountByType = holidayCountByType;
    }

    public Map<String, Integer> getHolidayCountByMonth() {
        return holidayCountByMonth;
    }

    public void setHolidayCountByMonth(Map<String, Integer> holidayCountByMonth) {
        this.holidayCountByMonth = holidayCountByMonth;
    }

    public int getTotalHolidays() {
        return totalHolidays;
    }

    public void setTotalHolidays(int totalHolidays) {
        this.totalHolidays = totalHolidays;
    }

    public int getMandatoryHolidays() {
        return mandatoryHolidays;
    }

    public void setMandatoryHolidays(int mandatoryHolidays) {
        this.mandatoryHolidays = mandatoryHolidays;
    }

    public int getOptionalHolidays() {
        return optionalHolidays;
    }

    public void setOptionalHolidays(int optionalHolidays) {
        this.optionalHolidays = optionalHolidays;
    }
}

