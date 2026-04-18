package com.talentx.hrms.dto.exit;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO for employee exit creation and update requests
 */
public class ExitRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private LocalDate resignationDate;

    private LocalDate lastWorkingDay;

    @Size(max = 500, message = "Exit reason must not exceed 500 characters")
    private String exitReason;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    // Constructors
    public ExitRequest() {}

    public ExitRequest(Long employeeId, LocalDate resignationDate, LocalDate lastWorkingDay, 
                      String exitReason, String notes) {
        this.employeeId = employeeId;
        this.resignationDate = resignationDate;
        this.lastWorkingDay = lastWorkingDay;
        this.exitReason = exitReason;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getResignationDate() {
        return resignationDate;
    }

    public void setResignationDate(LocalDate resignationDate) {
        this.resignationDate = resignationDate;
    }

    public LocalDate getLastWorkingDay() {
        return lastWorkingDay;
    }

    public void setLastWorkingDay(LocalDate lastWorkingDay) {
        this.lastWorkingDay = lastWorkingDay;
    }

    public String getExitReason() {
        return exitReason;
    }

    public void setExitReason(String exitReason) {
        this.exitReason = exitReason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

