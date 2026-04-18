package com.talentx.hrms.dto.asset;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class AssetAssignmentRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private LocalDate assignedDate;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @Size(max = 255, message = "Condition at assignment must not exceed 255 characters")
    private String conditionAtAssignment;

    // Constructors
    public AssetAssignmentRequest() {}

    public AssetAssignmentRequest(Long employeeId, LocalDate assignedDate, String notes, String conditionAtAssignment) {
        this.employeeId = employeeId;
        this.assignedDate = assignedDate;
        this.notes = notes;
        this.conditionAtAssignment = conditionAtAssignment;
    }

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getConditionAtAssignment() {
        return conditionAtAssignment;
    }

    public void setConditionAtAssignment(String conditionAtAssignment) {
        this.conditionAtAssignment = conditionAtAssignment;
    }
}

