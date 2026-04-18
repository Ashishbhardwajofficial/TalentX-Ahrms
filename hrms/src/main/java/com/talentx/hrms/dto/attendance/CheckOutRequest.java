package com.talentx.hrms.dto.attendance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

public class CheckOutRequest {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    private LocalTime checkOutTime;
    
    @Size(max = 500, message = "Location must not exceed 500 characters")
    private String location;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    public CheckOutRequest() {}
    
    public CheckOutRequest(Long employeeId, LocalTime checkOutTime, String location) {
        this.employeeId = employeeId;
        this.checkOutTime = checkOutTime;
        this.location = location;
    }
    
    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }
    
    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
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

