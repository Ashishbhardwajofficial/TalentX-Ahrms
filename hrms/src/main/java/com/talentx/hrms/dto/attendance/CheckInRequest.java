package com.talentx.hrms.dto.attendance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

public class CheckInRequest {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    private LocalTime checkInTime;
    
    @Size(max = 500, message = "Location must not exceed 500 characters")
    private String location;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    public CheckInRequest() {}
    
    public CheckInRequest(Long employeeId, LocalTime checkInTime, String location) {
        this.employeeId = employeeId;
        this.checkInTime = checkInTime;
        this.location = location;
    }
    
    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public LocalTime getCheckInTime() {
        return checkInTime;
    }
    
    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}

