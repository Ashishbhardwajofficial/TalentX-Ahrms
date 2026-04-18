package com.talentx.hrms.dto.shift;

import com.talentx.hrms.entity.attendance.EmployeeShift;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO for employee shift assignment response
 */
public class EmployeeShiftResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long shiftId;
    private String shiftName;
    private LocalDate effectiveDate;
    private LocalDate endDate;
    @JsonProperty("isCurrent")
    private Boolean isCurrent;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public EmployeeShiftResponse() {}

    public EmployeeShiftResponse(EmployeeShift employeeShift) {
        this.id = employeeShift.getId();
        this.employeeId = employeeShift.getEmployee().getId();
        this.employeeName = employeeShift.getEmployee().getFirstName() + " " + 
                           employeeShift.getEmployee().getLastName();
        this.shiftId = employeeShift.getShift().getId();
        this.shiftName = employeeShift.getShift().getName();
        this.effectiveDate = employeeShift.getEffectiveDate();
        this.endDate = employeeShift.getEndDate();
        this.isCurrent = employeeShift.getIsCurrent();
        this.createdAt = employeeShift.getCreatedAt();
        this.updatedAt = employeeShift.getUpdatedAt();
    }

    // Static factory method
    public static EmployeeShiftResponse fromEntity(EmployeeShift employeeShift) {
        return new EmployeeShiftResponse(employeeShift);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Long getShiftId() {
        return shiftId;
    }

    public void setShiftId(Long shiftId) {
        this.shiftId = shiftId;
    }

    public String getShiftName() {
        return shiftName;
    }

    public void setShiftName(String shiftName) {
        this.shiftName = shiftName;
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

    public Boolean getIsCurrent() {
        return isCurrent;
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.isCurrent = isCurrent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

