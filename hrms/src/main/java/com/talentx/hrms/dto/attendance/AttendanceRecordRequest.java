package com.talentx.hrms.dto.attendance;

import com.talentx.hrms.entity.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceRecordRequest {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;
    
    private LocalTime checkInTime;
    
    private LocalTime checkOutTime;
    
    private BigDecimal totalHours;
    
    private BigDecimal overtimeHours;
    
    private BigDecimal breakHours;
    
    @NotNull(message = "Status is required")
    private AttendanceStatus status;
    
    private Long locationId;
    
    @Size(max = 500, message = "Check-in location must not exceed 500 characters")
    private String checkInLocation;
    
    @Size(max = 500, message = "Check-out location must not exceed 500 characters")
    private String checkOutLocation;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    private Long approvedBy;
    
    public AttendanceRecordRequest() {}
    
    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }
    
    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }
    
    public LocalTime getCheckInTime() {
        return checkInTime;
    }
    
    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }
    
    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }
    
    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }
    
    public BigDecimal getTotalHours() {
        return totalHours;
    }
    
    public void setTotalHours(BigDecimal totalHours) {
        this.totalHours = totalHours;
    }
    
    public BigDecimal getOvertimeHours() {
        return overtimeHours;
    }
    
    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours;
    }
    
    public BigDecimal getBreakHours() {
        return breakHours;
    }
    
    public void setBreakHours(BigDecimal breakHours) {
        this.breakHours = breakHours;
    }
    
    public AttendanceStatus getStatus() {
        return status;
    }
    
    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }
    
    public Long getLocationId() {
        return locationId;
    }
    
    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }
    
    public String getCheckInLocation() {
        return checkInLocation;
    }
    
    public void setCheckInLocation(String checkInLocation) {
        this.checkInLocation = checkInLocation;
    }
    
    public String getCheckOutLocation() {
        return checkOutLocation;
    }
    
    public void setCheckOutLocation(String checkOutLocation) {
        this.checkOutLocation = checkOutLocation;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Long getApprovedBy() {
        return approvedBy;
    }
    
    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }
}

