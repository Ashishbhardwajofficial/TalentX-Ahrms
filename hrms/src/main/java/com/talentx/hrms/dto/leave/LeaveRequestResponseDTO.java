package com.talentx.hrms.dto.leave;

import com.talentx.hrms.entity.enums.LeaveStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class LeaveRequestResponseDTO {
    
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private Boolean isHalfDay;
    private String halfDayPeriod;
    private String reason;
    private LeaveStatus status;
    private String contactDetails;
    private String emergencyContact;
    private Boolean isEmergency;
    private Instant appliedAt;
    private String attachmentPath;
    private String cancellationReason;
    private Instant cancelledAt;
    private Instant reviewedAt;
    private String reviewComments;
    
    // Employee details
    private Long employeeId;
    private String employeeNumber;
    private String employeeName;
    private String employeeEmail;
    
    // Leave type details
    private Long leaveTypeId;
    private String leaveTypeName;
    private String leaveTypeCode;
    private String leaveTypeCategory;
    private Boolean leaveTypeIsPaid;
    
    // Reviewer details
    private Long reviewedById;
    private String reviewedByName;
    private String reviewedByEmployeeNumber;
    
    // Department details
    private Long departmentId;
    private String departmentName;
    
    // Constructors
    public LeaveRequestResponseDTO() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public BigDecimal getTotalDays() {
        return totalDays;
    }
    
    public void setTotalDays(BigDecimal totalDays) {
        this.totalDays = totalDays;
    }
    
    public Boolean getIsHalfDay() {
        return isHalfDay;
    }
    
    public void setIsHalfDay(Boolean isHalfDay) {
        this.isHalfDay = isHalfDay;
    }
    
    public String getHalfDayPeriod() {
        return halfDayPeriod;
    }
    
    public void setHalfDayPeriod(String halfDayPeriod) {
        this.halfDayPeriod = halfDayPeriod;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public LeaveStatus getStatus() {
        return status;
    }
    
    public void setStatus(LeaveStatus status) {
        this.status = status;
    }
    
    public String getContactDetails() {
        return contactDetails;
    }
    
    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }
    
    public String getEmergencyContact() {
        return emergencyContact;
    }
    
    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }
    
    public Boolean getIsEmergency() {
        return isEmergency;
    }
    
    public void setIsEmergency(Boolean isEmergency) {
        this.isEmergency = isEmergency;
    }
    
    public Instant getAppliedAt() {
        return appliedAt;
    }
    
    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }
    
    public String getAttachmentPath() {
        return attachmentPath;
    }
    
    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }
    
    public String getCancellationReason() {
        return cancellationReason;
    }
    
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
    
    public Instant getCancelledAt() {
        return cancelledAt;
    }
    
    public void setCancelledAt(Instant cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
    
    public Instant getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    public String getReviewComments() {
        return reviewComments;
    }
    
    public void setReviewComments(String reviewComments) {
        this.reviewComments = reviewComments;
    }
    
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public String getEmployeeNumber() {
        return employeeNumber;
    }
    
    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }
    
    public String getEmployeeName() {
        return employeeName;
    }
    
    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }
    
    public String getEmployeeEmail() {
        return employeeEmail;
    }
    
    public void setEmployeeEmail(String employeeEmail) {
        this.employeeEmail = employeeEmail;
    }
    
    public Long getLeaveTypeId() {
        return leaveTypeId;
    }
    
    public void setLeaveTypeId(Long leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
    }
    
    public String getLeaveTypeName() {
        return leaveTypeName;
    }
    
    public void setLeaveTypeName(String leaveTypeName) {
        this.leaveTypeName = leaveTypeName;
    }
    
    public String getLeaveTypeCode() {
        return leaveTypeCode;
    }
    
    public void setLeaveTypeCode(String leaveTypeCode) {
        this.leaveTypeCode = leaveTypeCode;
    }
    
    public String getLeaveTypeCategory() {
        return leaveTypeCategory;
    }
    
    public void setLeaveTypeCategory(String leaveTypeCategory) {
        this.leaveTypeCategory = leaveTypeCategory;
    }
    
    public Boolean getLeaveTypeIsPaid() {
        return leaveTypeIsPaid;
    }
    
    public void setLeaveTypeIsPaid(Boolean leaveTypeIsPaid) {
        this.leaveTypeIsPaid = leaveTypeIsPaid;
    }
    
    public Long getReviewedById() {
        return reviewedById;
    }
    
    public void setReviewedById(Long reviewedById) {
        this.reviewedById = reviewedById;
    }
    
    public String getReviewedByName() {
        return reviewedByName;
    }
    
    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }
    
    public String getReviewedByEmployeeNumber() {
        return reviewedByEmployeeNumber;
    }
    
    public void setReviewedByEmployeeNumber(String reviewedByEmployeeNumber) {
        this.reviewedByEmployeeNumber = reviewedByEmployeeNumber;
    }
    
    public Long getDepartmentId() {
        return departmentId;
    }
    
    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }
    
    public String getDepartmentName() {
        return departmentName;
    }
    
    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
}

