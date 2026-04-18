package com.talentx.hrms.dto.asset;

import java.time.Instant;
import java.time.LocalDate;

public class AssetAssignmentResponse {

    private Long id;
    private Long assetId;
    private String assetTag;
    private String assetType;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private LocalDate assignedDate;
    private LocalDate returnedDate;
    private String notes;
    private String conditionAtAssignment;
    private String conditionAtReturn;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public AssetAssignmentResponse() {}

    public AssetAssignmentResponse(Long id, Long assetId, String assetTag, String assetType,
                                  Long employeeId, String employeeName, String employeeNumber,
                                  LocalDate assignedDate, LocalDate returnedDate, String notes,
                                  String conditionAtAssignment, String conditionAtReturn,
                                  Boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.assetId = assetId;
        this.assetTag = assetTag;
        this.assetType = assetType;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeNumber = employeeNumber;
        this.assignedDate = assignedDate;
        this.returnedDate = returnedDate;
        this.notes = notes;
        this.conditionAtAssignment = conditionAtAssignment;
        this.conditionAtReturn = conditionAtReturn;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getAssetTag() {
        return assetTag;
    }

    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
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

    public String getEmployeeNumber() {
        return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public LocalDate getReturnedDate() {
        return returnedDate;
    }

    public void setReturnedDate(LocalDate returnedDate) {
        this.returnedDate = returnedDate;
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

    public String getConditionAtReturn() {
        return conditionAtReturn;
    }

    public void setConditionAtReturn(String conditionAtReturn) {
        this.conditionAtReturn = conditionAtReturn;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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

