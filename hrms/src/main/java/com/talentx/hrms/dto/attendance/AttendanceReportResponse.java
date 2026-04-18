package com.talentx.hrms.dto.attendance;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AttendanceReportResponse {
    
    private Long employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer presentDays;
    private Integer absentDays;
    private Integer lateDays;
    private Integer halfDays;
    private Integer leaveDays;
    private BigDecimal totalHoursWorked;
    private BigDecimal totalOvertimeHours;
    private BigDecimal averageHoursPerDay;
    
    public AttendanceReportResponse() {}
    
    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public String getEmployeeName() {
        return employeeName;
    }
    
    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public Integer getPresentDays() {
        return presentDays;
    }
    
    public void setPresentDays(Integer presentDays) {
        this.presentDays = presentDays;
    }
    
    public Integer getAbsentDays() {
        return absentDays;
    }
    
    public void setAbsentDays(Integer absentDays) {
        this.absentDays = absentDays;
    }
    
    public Integer getLateDays() {
        return lateDays;
    }
    
    public void setLateDays(Integer lateDays) {
        this.lateDays = lateDays;
    }
    
    public Integer getHalfDays() {
        return halfDays;
    }
    
    public void setHalfDays(Integer halfDays) {
        this.halfDays = halfDays;
    }
    
    public Integer getLeaveDays() {
        return leaveDays;
    }
    
    public void setLeaveDays(Integer leaveDays) {
        this.leaveDays = leaveDays;
    }
    
    public BigDecimal getTotalHoursWorked() {
        return totalHoursWorked;
    }
    
    public void setTotalHoursWorked(BigDecimal totalHoursWorked) {
        this.totalHoursWorked = totalHoursWorked;
    }
    
    public BigDecimal getTotalOvertimeHours() {
        return totalOvertimeHours;
    }
    
    public void setTotalOvertimeHours(BigDecimal totalOvertimeHours) {
        this.totalOvertimeHours = totalOvertimeHours;
    }
    
    public BigDecimal getAverageHoursPerDay() {
        return averageHoursPerDay;
    }
    
    public void setAverageHoursPerDay(BigDecimal averageHoursPerDay) {
        this.averageHoursPerDay = averageHoursPerDay;
    }
}

