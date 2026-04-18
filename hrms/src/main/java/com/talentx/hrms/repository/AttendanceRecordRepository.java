package com.talentx.hrms.repository;

import com.talentx.hrms.entity.attendance.AttendanceRecord;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    /* ================= BASIC LOOKUPS ================= */

    Optional<AttendanceRecord> findByEmployeeAndAttendanceDate(
            Employee employee,
            LocalDate attendanceDate
    );

    List<AttendanceRecord> findByEmployee(Employee employee);

    Page<AttendanceRecord> findByEmployee(Employee employee, Pageable pageable);

    /* ================= DATE RANGE ================= */

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        WHERE ar.employee = :employee
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    List<AttendanceRecord> findByEmployeeAndDateRange(
            @Param("employee") Employee employee,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        WHERE ar.employee.id = :employeeId
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    List<AttendanceRecord> findByEmployeeIdAndDateBetween(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        WHERE ar.employee.department.id = :departmentId
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    List<AttendanceRecord> findByDepartmentIdAndDateBetween(
            @Param("departmentId") Long departmentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /* ================= STATUS BASED ================= */

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        WHERE ar.status = :status
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    List<AttendanceRecord> findByStatusAndDateBetween(
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /* ================= APPROVAL (using approvedBy IS NULL) ================= */

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        WHERE ar.approvedBy IS NULL
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    List<AttendanceRecord> findPendingApproval(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        WHERE ar.employee.manager.id = :managerId
          AND ar.approvedBy IS NULL
    """)
    List<AttendanceRecord> findPendingApprovalByManager(
            @Param("managerId") Long managerId
    );

    /* ================= COUNTS & SUMS ================= */

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.employee = :employee
          AND ar.status = :status
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    long countByEmployeeAndStatusAndDateBetween(
            @Param("employee") Employee employee,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.employee.id = :employeeId
          AND ar.status = :status
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    long countByEmployeeIdAndStatusAndDateBetween(
            @Param("employeeId") Long employeeId,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COALESCE(SUM(ar.totalHours), 0)
        FROM AttendanceRecord ar
        WHERE ar.employee = :employee
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    BigDecimal getTotalHoursByEmployeeAndDateRange(
            @Param("employee") Employee employee,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COALESCE(SUM(ar.totalHours), 0)
        FROM AttendanceRecord ar
        WHERE ar.employee.id = :employeeId
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    Double sumWorkHoursByEmployeeIdAndDateBetween(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COALESCE(SUM(ar.overtimeHours), 0)
        FROM AttendanceRecord ar
        WHERE ar.employee = :employee
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    BigDecimal sumOvertimeHoursByEmployeeAndDateBetween(
            @Param("employee") Employee employee,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COALESCE(SUM(ar.overtimeHours), 0)
        FROM AttendanceRecord ar
        WHERE ar.employee.id = :employeeId
          AND ar.attendanceDate BETWEEN :startDate AND :endDate
    """)
    Double sumOvertimeHoursByEmployeeIdAndDateBetween(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /* ================= PAGINATION ================= */

    @Query("""
        SELECT ar FROM AttendanceRecord ar
        WHERE ar.employee.id = :employeeId
    """)
    Page<AttendanceRecord> findByEmployeeId(
            @Param("employeeId") Long employeeId,
            Pageable pageable
    );
}
