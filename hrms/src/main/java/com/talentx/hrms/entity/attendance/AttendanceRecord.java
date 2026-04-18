package com.talentx.hrms.entity.attendance;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.enums.AttendanceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "attendance_date"})
})
@AttributeOverride(name = "id", column = @Column(name = "attendance_id"))
public class AttendanceRecord extends BaseEntity {

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee employee;

    @NotNull(message = "Attendance date is required")
    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "total_hours", precision = 5, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "overtime_hours", precision = 5, scale = 2)
    private BigDecimal overtimeHours;

    @Column(name = "break_hours", precision = 5, scale = 2)
    private BigDecimal breakHours;

    @NotNull(message = "Attendance status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "check_in_location")
    private String checkInLocation;

    @Column(name = "check_out_location")
    private String checkOutLocation;

    @Column(name = "notes")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Constructors
    public AttendanceRecord() {}

    public AttendanceRecord(Employee employee, LocalDate attendanceDate, AttendanceStatus status) {
        this.employee = employee;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    // Getters and Setters
    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
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

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
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

    public Employee getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(Employee approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    // Helper methods
    public boolean isPresent() {
        return status == AttendanceStatus.PRESENT || status == AttendanceStatus.LATE || 
               status == AttendanceStatus.HALF_DAY;
    }

    public boolean isFullDay() {
        return status == AttendanceStatus.PRESENT || status == AttendanceStatus.LATE;
    }

    public boolean hasOvertime() {
        return overtimeHours != null && overtimeHours.compareTo(BigDecimal.ZERO) > 0;
    }

    // Backward compatibility methods for service layer
    public Shift getShift() {
        return null; // This field doesn't exist in database schema
    }

    public void setShift(Shift shift) {
        // This field doesn't exist in database schema
    }

    public LocalTime getBreakStartTime() {
        return null; // This field doesn't exist in database schema
    }

    public void setBreakStartTime(LocalTime breakStartTime) {
        // This field doesn't exist in database schema
    }

    public LocalTime getBreakEndTime() {
        return null; // This field doesn't exist in database schema
    }

    public void setBreakEndTime(LocalTime breakEndTime) {
        // This field doesn't exist in database schema
    }

    public void setIsHoliday(boolean isHoliday) {
        // This field doesn't exist in database schema
    }

    public void setIsWeekend(boolean isWeekend) {
        // This field doesn't exist in database schema
    }

    public void setRegularHours(BigDecimal regularHours) {
        this.totalHours = regularHours;
    }

    public BigDecimal getRegularHours() {
        return totalHours;
    }
}

