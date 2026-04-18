package com.talentx.hrms.service.attendance;

import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.common.exception.ValidationException;
import com.talentx.hrms.dto.attendance.*;
import com.talentx.hrms.entity.attendance.AttendanceRecord;
import com.talentx.hrms.entity.attendance.EmployeeShift;
import com.talentx.hrms.entity.attendance.LeaveCalendar;
import com.talentx.hrms.entity.attendance.Shift;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.AttendanceStatus;
import com.talentx.hrms.repository.AttendanceRecordRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.EmployeeShiftRepository;
import com.talentx.hrms.repository.LeaveCalendarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class AttendanceService {
    
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private EmployeeShiftRepository employeeShiftRepository;
    
    @Autowired
    private LeaveCalendarRepository leaveCalendarRepository;
    
    /**
     * Check in an employee
     */
    public AttendanceRecordResponse checkIn(CheckInRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));
        
        LocalDate today = LocalDate.now();
        LocalTime checkInTime = request.getCheckInTime() != null ? request.getCheckInTime() : LocalTime.now();
        
        // Check if already checked in today
        Optional<AttendanceRecord> existingRecord = attendanceRecordRepository
            .findByEmployeeAndAttendanceDate(employee, today);
        
        if (existingRecord.isPresent() && existingRecord.get().getCheckInTime() != null) {
            throw new ValidationException("Employee has already checked in today");
        }
        
        AttendanceRecord record;
        if (existingRecord.isPresent()) {
            record = existingRecord.get();
        } else {
            record = new AttendanceRecord();
            record.setEmployee(employee);
            record.setAttendanceDate(today);
        }
        
        record.setCheckInTime(checkInTime);
        // Convert location string to Location entity if needed
        if (request.getLocation() != null) {
            record.setCheckInLocation(request.getLocation());
        }
        record.setNotes(request.getNotes());
        
        // Get employee's shift for today
        Optional<EmployeeShift> employeeShift = employeeShiftRepository.findByEmployeeAndDate(employee, today);
        if (employeeShift.isPresent()) {
            // Note: AttendanceRecord doesn't have shift field in database schema
            
            // Determine status based on shift timing
            Shift shift = employeeShift.get().getShift();
            long minutesLate = checkInTime.until(shift.getStartTime(), ChronoUnit.MINUTES);
            int gracePeriod = shift.getGracePeriodMinutes() != null ? shift.getGracePeriodMinutes() : 15;
            
            if (minutesLate < -gracePeriod) {
                record.setStatus(AttendanceStatus.LATE);
            } else {
                record.setStatus(AttendanceStatus.PRESENT);
            }
        } else {
            record.setStatus(AttendanceStatus.PRESENT);
        }
        
        // Check if today is a holiday or weekend
        boolean isHoliday = leaveCalendarRepository.isHoliday(employee.getOrganization(), today);
        boolean isWeekend = today.getDayOfWeek() == DayOfWeek.SATURDAY || today.getDayOfWeek() == DayOfWeek.SUNDAY;
        
        // Note: AttendanceRecord doesn't have isHoliday/isWeekend fields in database schema
        
        record = attendanceRecordRepository.save(record);
        
        return mapToResponse(record);
    }
    
    /**
     * Check out an employee
     */
    public AttendanceRecordResponse checkOut(CheckOutRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));
        
        LocalDate today = LocalDate.now();
        LocalTime checkOutTime = request.getCheckOutTime() != null ? request.getCheckOutTime() : LocalTime.now();
        
        // Find today's attendance record
        AttendanceRecord record = attendanceRecordRepository.findByEmployeeAndAttendanceDate(employee, today)
            .orElseThrow(() -> new ValidationException("No check-in record found for today"));
        
        if (record.getCheckInTime() == null) {
            throw new ValidationException("Employee has not checked in today");
        }
        
        if (record.getCheckOutTime() != null) {
            throw new ValidationException("Employee has already checked out today");
        }
        
        record.setCheckOutTime(checkOutTime);
        if (request.getLocation() != null) {
            record.setCheckOutLocation(request.getLocation());
        }
        if (request.getNotes() != null) {
            record.setNotes(record.getNotes() != null ? record.getNotes() + "; " + request.getNotes() : request.getNotes());
        }
        
        // Calculate hours worked
        calculateHours(record);
        
        record = attendanceRecordRepository.save(record);
        
        return mapToResponse(record);
    }
    
    /**
     * Calculate total hours, break hours, and overtime
     */
    private void calculateHours(AttendanceRecord record) {
        if (record.getCheckInTime() == null || record.getCheckOutTime() == null) {
            return;
        }
        
        // Calculate total minutes worked
        long totalMinutes = record.getCheckInTime().until(record.getCheckOutTime(), ChronoUnit.MINUTES);
        
        // Calculate break hours
        BigDecimal breakHours = BigDecimal.ZERO;
        // Note: AttendanceRecord doesn't have breakStartTime/breakEndTime fields in database schema
        // Using default break hours from shift if available
        Optional<EmployeeShift> employeeShift = employeeShiftRepository.findByEmployeeAndDate(record.getEmployee(), record.getAttendanceDate());
        if (employeeShift.isPresent() && employeeShift.get().getShift().hasBreak()) {
            // Convert break minutes to hours
            Integer breakMinutes = employeeShift.get().getShift().getBreakMinutes();
            if (breakMinutes != null) {
                breakHours = BigDecimal.valueOf(breakMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            }
        }
        
        record.setBreakHours(breakHours);
        
        // Calculate net working hours
        BigDecimal totalHours = BigDecimal.valueOf(totalMinutes)
            .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)
            .subtract(breakHours);
        
        record.setTotalHours(totalHours);
        
        // Calculate overtime
        BigDecimal regularHours = BigDecimal.ZERO;
        BigDecimal overtimeHours = BigDecimal.ZERO;
        
        // Get shift information for overtime calculation
        Optional<EmployeeShift> shiftForOvertime = employeeShiftRepository.findByEmployeeAndDate(record.getEmployee(), record.getAttendanceDate());
        if (shiftForOvertime.isPresent()) {
            Shift shift = shiftForOvertime.get().getShift();
            // Calculate shift hours from start and end time
            if (shift.getStartTime() != null && shift.getEndTime() != null) {
                long shiftMinutes = shift.getStartTime().until(shift.getEndTime(), ChronoUnit.MINUTES);
                BigDecimal shiftHours = BigDecimal.valueOf(shiftMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
                
                if (totalHours.compareTo(shiftHours) > 0) {
                    regularHours = shiftHours;
                    overtimeHours = totalHours.subtract(shiftHours);
                } else {
                    regularHours = totalHours;
                }
            } else {
                regularHours = totalHours;
            }
        } else {
            // Default 8 hours as regular
            BigDecimal standardHours = BigDecimal.valueOf(8);
            if (totalHours.compareTo(standardHours) > 0) {
                regularHours = standardHours;
                overtimeHours = totalHours.subtract(standardHours);
            } else {
                regularHours = totalHours;
            }
        }
        
        // Note: AttendanceRecord doesn't have regularHours field in database schema
        // record.setRegularHours(regularHours);
        record.setOvertimeHours(overtimeHours);
    }
    
    /**
     * Get attendance records with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Page<AttendanceRecordResponse> getAttendanceRecords(
            Long organizationId,
            String employeeName,
            AttendanceStatus status,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {
        
        // This would need organization lookup, simplified for now
        return attendanceRecordRepository.findAll(pageable)
            .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AttendanceRecordResponse getAttendanceRecord(Long id) {
        AttendanceRecord record = attendanceRecordRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Attendance record not found with id: " + id));
        return mapToResponse(record);
    }
    
    /**
     * Get attendance records for a specific employee
     */
    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getEmployeeAttendance(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        List<AttendanceRecord> records;
        if (startDate != null && endDate != null) {
            records = attendanceRecordRepository.findByEmployeeAndDateRange(employee, startDate, endDate);
        } else {
            records = attendanceRecordRepository.findByEmployee(employee);
        }
        
        return records.stream()
            .map(this::mapToResponse)
            .toList();
    }

    public AttendanceRecordResponse createAttendanceRecord(AttendanceRecordRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        AttendanceRecord record = attendanceRecordRepository
            .findByEmployeeAndAttendanceDate(employee, request.getAttendanceDate())
            .orElseGet(AttendanceRecord::new);

        record.setEmployee(employee);
        record.setAttendanceDate(request.getAttendanceDate());
        record.setStatus(request.getStatus());
        record.setCheckInTime(request.getCheckInTime());
        record.setCheckOutTime(request.getCheckOutTime());
        record.setBreakHours(request.getBreakHours());
        record.setTotalHours(request.getTotalHours());
        record.setOvertimeHours(request.getOvertimeHours());
        record.setCheckInLocation(request.getCheckInLocation());
        record.setCheckOutLocation(request.getCheckOutLocation());
        record.setNotes(request.getNotes());

        if (request.getCheckInTime() != null && request.getCheckOutTime() != null) {
            calculateHours(record);
        }

        record = attendanceRecordRepository.save(record);
        return mapToResponse(record);
    }
    
    /**
     * Update an attendance record
     */
    public AttendanceRecordResponse updateAttendanceRecord(Long id, AttendanceRecordRequest request) {
        AttendanceRecord record = attendanceRecordRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Attendance record not found with id: " + id));
        
        if (request.getCheckInTime() != null) {
            record.setCheckInTime(request.getCheckInTime());
        }
        
        if (request.getCheckOutTime() != null) {
            record.setCheckOutTime(request.getCheckOutTime());
        }
        
        if (request.getStatus() != null) {
            record.setStatus(request.getStatus());
        }
        
        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }
        
        if (request.getCheckInLocation() != null) {
            record.setCheckInLocation(request.getCheckInLocation());
        }
        
        // Recalculate hours if check-in or check-out time changed
        if (record.getCheckInTime() != null && record.getCheckOutTime() != null) {
            calculateHours(record);
        }
        
        record = attendanceRecordRepository.save(record);
        
        return mapToResponse(record);
    }

    public void deleteAttendanceRecord(Long id) {
        AttendanceRecord record = attendanceRecordRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Attendance record not found with id: " + id));
        attendanceRecordRepository.delete(record);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getEmployeeAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return getEmployeeAttendance(employeeId, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public AttendanceRecordResponse getTodayAttendanceForEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        // No record today is a normal empty state, not an error — return null
        return attendanceRecordRepository
            .findByEmployeeAndAttendanceDate(employee, LocalDate.now())
            .map(this::mapToResponse)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public Page<AttendanceRecordResponse> getDepartmentAttendance(Long departmentId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate effectiveEnd = endDate != null ? endDate : LocalDate.now();

        List<AttendanceRecordResponse> responses = attendanceRecordRepository
            .findByDepartmentIdAndDateBetween(departmentId, effectiveStart, effectiveEnd)
            .stream()
            .map(this::mapToResponse)
            .toList();

        int start = Math.min((int) pageable.getOffset(), responses.size());
        int end = Math.min(start + pageable.getPageSize(), responses.size());
        return new org.springframework.data.domain.PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    public AttendanceRecordResponse approveAttendance(Long id, Long approverId) {
        AttendanceRecord record = attendanceRecordRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Attendance record not found with id: " + id));

        Employee approver = employeeRepository.findById(approverId)
            .orElseThrow(() -> new EntityNotFoundException("Approver not found with id: " + approverId));

        record.setApprovedBy(approver);
        record.setApprovedAt(LocalDateTime.now());
        record = attendanceRecordRepository.save(record);

        return mapToResponse(record);
    }

    public List<AttendanceRecordResponse> bulkApproveAttendance(List<Long> ids, Long approverId) {
        return ids.stream()
            .map(id -> approveAttendance(id, approverId))
            .toList();
    }
    
    /**
     * Generate attendance report for an employee
     */
    @Transactional(readOnly = true)
    public AttendanceReportResponse generateAttendanceReport(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
        
        List<AttendanceRecord> records = attendanceRecordRepository.findByEmployeeAndDateRange(employee, startDate, endDate);
        
        AttendanceReportResponse report = new AttendanceReportResponse();
        report.setEmployeeId(employeeId);
        report.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        
        long presentDays = records.stream().filter(AttendanceRecord::isPresent).count();
        long absentDays = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long lateDays = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long halfDays = records.stream().filter(r -> r.getStatus() == AttendanceStatus.HALF_DAY).count();
        
        report.setPresentDays((int) presentDays);
        report.setAbsentDays((int) absentDays);
        report.setLateDays((int) lateDays);
        report.setHalfDays((int) halfDays);
        
        BigDecimal totalHours = records.stream()
            .map(AttendanceRecord::getTotalHours)
            .filter(h -> h != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalOvertimeHours = records.stream()
            .map(AttendanceRecord::getOvertimeHours)
            .filter(h -> h != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        report.setTotalHoursWorked(totalHours);
        report.setTotalOvertimeHours(totalOvertimeHours);
        
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceSummary(Long organizationId, LocalDate startDate, LocalDate endDate) {
        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.now();
        LocalDate effectiveEnd = endDate != null ? endDate : effectiveStart;

        List<AttendanceRecordResponse> records = attendanceRecordRepository.findAll().stream()
            .map(this::mapToResponse)
            .filter(record -> !record.getAttendanceDate().isBefore(effectiveStart) && !record.getAttendanceDate().isAfter(effectiveEnd))
            .toList();

        long totalEmployees = records.stream().map(AttendanceRecordResponse::getEmployeeId).distinct().count();
        long presentToday = records.stream()
            .filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE || r.getStatus() == AttendanceStatus.WORK_FROM_HOME)
            .count();
        long absentToday = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long onLeaveToday = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ON_LEAVE).count();
        long lateToday = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        BigDecimal totalHoursWorked = records.stream().map(AttendanceRecordResponse::getTotalHours).filter(h -> h != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOvertimeHours = records.stream().map(AttendanceRecordResponse::getOvertimeHours).filter(h -> h != null).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalEmployees", totalEmployees);
        summary.put("presentToday", presentToday);
        summary.put("absentToday", absentToday);
        summary.put("onLeaveToday", onLeaveToday);
        summary.put("lateToday", lateToday);
        summary.put("averageAttendanceRate", totalEmployees > 0 ? (presentToday * 100.0) / totalEmployees : 0.0);
        summary.put("totalHoursWorked", totalHoursWorked);
        summary.put("totalOvertimeHours", totalOvertimeHours);
        return summary;
    }
    
    private AttendanceRecordResponse mapToResponse(AttendanceRecord record) {
        AttendanceRecordResponse response = new AttendanceRecordResponse();
        response.setId(record.getId());
        // Employee may be null if @NotFound IGNORE — handle gracefully
        if (record.getEmployee() != null) {
            try {
                response.setEmployeeId(record.getEmployee().getId());
                response.setEmployeeName(record.getEmployee().getFirstName() + " " + record.getEmployee().getLastName());
                response.setEmployeeNumber(record.getEmployee().getEmployeeNumber());
            } catch (Exception e) {
                response.setEmployeeId(null);
                response.setEmployeeName("Unknown");
            }
        }
        response.setAttendanceDate(record.getAttendanceDate());
        response.setCheckInTime(record.getCheckInTime());
        response.setCheckOutTime(record.getCheckOutTime());
        response.setTotalHours(record.getTotalHours());
        response.setOvertimeHours(record.getOvertimeHours());
        response.setBreakHours(record.getBreakHours());
        response.setStatus(record.getStatus());
        response.setLocationId(record.getLocation() != null ? record.getLocation().getId() : null);
        response.setLocationName(record.getLocation() != null ? record.getLocation().getName() : null);
        response.setCheckInLocation(record.getCheckInLocation());
        response.setCheckOutLocation(record.getCheckOutLocation());
        response.setNotes(record.getNotes());
        response.setApprovedBy(record.getApprovedBy() != null ? record.getApprovedBy().getId() : null);
        try {
            response.setApproverName(record.getApprovedBy() != null
                ? record.getApprovedBy().getFirstName() + " " + record.getApprovedBy().getLastName()
                : null);
        } catch (Exception e) {
            response.setApproverName(null);
        }
        response.setApprovedAt(record.getApprovedAt());
        response.setCreatedAt(record.getCreatedAt());
        response.setUpdatedAt(record.getUpdatedAt());
        response.setCreatedBy(record.getCreatedBy());
        response.setUpdatedBy(record.getUpdatedBy());
        response.setVersion(record.getVersion());
        response.setActive(record.getActive());
        return response;
    }
}

