package com.talentx.hrms.dto.leave;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LeaveRequestCreateDTO {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    @NotNull(message = "Leave type ID is required")
    private Long leaveTypeId;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    private BigDecimal totalDays;
    
    private Boolean isHalfDay = false;
    
    @Size(max = 20, message = "Half day period must not exceed 20 characters")
    private String halfDayPeriod; // MORNING, AFTERNOON
    
    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
    
    @Size(max = 255, message = "Contact details must not exceed 255 characters")
    private String contactDetails;
    
    @Size(max = 500, message = "Emergency contact must not exceed 500 characters")
    private String emergencyContact;
    
    private Boolean isEmergency = false;
    
    @Size(max = 500, message = "Attachment path must not exceed 500 characters")
    private String attachmentPath;
    
    // Constructors
    public LeaveRequestCreateDTO() {}
    
    public LeaveRequestCreateDTO(Long employeeId, Long leaveTypeId, LocalDate startDate, LocalDate endDate) {
        this.employeeId = employeeId;
        this.leaveTypeId = leaveTypeId;
        this.startDate = startDate;
        this.endDate = endDate;
    }
    
    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public Long getLeaveTypeId() {
        return leaveTypeId;
    }
    
    public void setLeaveTypeId(Long leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
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
    
    public String getAttachmentPath() {
        return attachmentPath;
    }
    
    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }
}

