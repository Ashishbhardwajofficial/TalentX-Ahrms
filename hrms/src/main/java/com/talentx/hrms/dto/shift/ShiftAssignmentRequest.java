package com.talentx.hrms.dto.shift;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO for assigning a shift to an employee
 */
public class ShiftAssignmentRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Shift ID is required")
    private Long shiftId;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    private LocalDate endDate;

    // Constructors
    public ShiftAssignmentRequest() {}

    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getShiftId() {
        return shiftId;
    }

    public void setShiftId(Long shiftId) {
        this.shiftId = shiftId;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}

