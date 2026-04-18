package com.talentx.hrms.repository;

import com.talentx.hrms.entity.attendance.EmployeeShift;
import com.talentx.hrms.entity.attendance.Shift;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeShiftRepository extends JpaRepository<EmployeeShift, Long> {

    // Find current shift assignment for employee
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee = :employee AND es.isActive = true")
    Optional<EmployeeShift> findCurrentByEmployee(@Param("employee") Employee employee);

    // Find all shift assignments for employee
    List<EmployeeShift> findByEmployee(Employee employee);

    // Find all shift assignments for employee with pagination
    Page<EmployeeShift> findByEmployee(Employee employee, Pageable pageable);

    // Find shift assignments by employee ordered by effective date
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee = :employee ORDER BY es.effectiveFrom DESC")
    List<EmployeeShift> findByEmployeeOrderByEffectiveDateDesc(@Param("employee") Employee employee);

    // Find all employees assigned to a shift
    List<EmployeeShift> findByShift(Shift shift);

    // Find current employees assigned to a shift
    @Query("SELECT es FROM EmployeeShift es WHERE es.shift = :shift AND es.isActive = true")
    List<EmployeeShift> findCurrentByShift(@Param("shift") Shift shift);

    // Find shift assignment for employee on a specific date
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee = :employee AND " +
           "es.effectiveFrom <= :date AND (es.effectiveTo IS NULL OR es.effectiveTo >= :date)")
    Optional<EmployeeShift> findByEmployeeAndDate(@Param("employee") Employee employee,
                                                  @Param("date") LocalDate date);

    // Find shift assignments by organization
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee.organization = :organization")
    Page<EmployeeShift> findByOrganization(@Param("organization") Organization organization,
                                           Pageable pageable);

    // Find current shift assignments by organization
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee.organization = :organization AND es.isActive = true")
    List<EmployeeShift> findCurrentByOrganization(@Param("organization") Organization organization);

    // Find shift assignments by date range
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee = :employee AND " +
           "((es.effectiveFrom BETWEEN :startDate AND :endDate) OR " +
           "(es.effectiveTo BETWEEN :startDate AND :endDate) OR " +
           "(es.effectiveFrom <= :startDate AND (es.effectiveTo IS NULL OR es.effectiveTo >= :endDate)))")
    List<EmployeeShift> findByEmployeeAndDateRange(@Param("employee") Employee employee,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    // Find shift assignments by shift and date range
    @Query("SELECT es FROM EmployeeShift es WHERE es.shift = :shift AND " +
           "((es.effectiveFrom BETWEEN :startDate AND :endDate) OR " +
           "(es.effectiveTo BETWEEN :startDate AND :endDate) OR " +
           "(es.effectiveFrom <= :startDate AND (es.effectiveTo IS NULL OR es.effectiveTo >= :endDate)))")
    List<EmployeeShift> findByShiftAndDateRange(@Param("shift") Shift shift,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    // Find overlapping shift assignments for employee - FIXED!
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee = :employee AND " +
           "es.effectiveFrom <= :endDate AND (es.effectiveTo IS NULL OR es.effectiveTo >= :startDate)")
    List<EmployeeShift> findOverlappingShiftAssignments(@Param("employee") Employee employee,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    // Find overlapping shift assignments by employee (alias for compatibility)
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee = :employee AND " +
           "es.effectiveFrom <= :endDate AND (es.effectiveTo IS NULL OR es.effectiveTo >= :startDate)")
    List<EmployeeShift> findOverlappingByEmployee(@Param("employee") Employee employee,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    // Check if employee has shift assignment on date
    @Query("SELECT COUNT(es) > 0 FROM EmployeeShift es WHERE es.employee = :employee AND " +
           "es.effectiveFrom <= :date AND (es.effectiveTo IS NULL OR es.effectiveTo >= :date)")
    boolean existsByEmployeeAndDate(@Param("employee") Employee employee,
                                    @Param("date") LocalDate date);

    // Find shift assignments by department
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee.department.id = :departmentId AND es.isActive = true")
    List<EmployeeShift> findCurrentByDepartment(@Param("departmentId") Long departmentId);

    // Count employees on a shift
    @Query("SELECT COUNT(DISTINCT es.employee) FROM EmployeeShift es WHERE es.shift = :shift AND es.isActive = true")
    long countEmployeesByShift(@Param("shift") Shift shift);

    // Find shift assignments expiring soon
    @Query("SELECT es FROM EmployeeShift es WHERE es.employee.organization = :organization AND " +
           "es.effectiveTo IS NOT NULL AND es.effectiveTo BETWEEN :startDate AND :endDate AND es.isActive = true")
    List<EmployeeShift> findExpiringSoon(@Param("organization") Organization organization,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
}
