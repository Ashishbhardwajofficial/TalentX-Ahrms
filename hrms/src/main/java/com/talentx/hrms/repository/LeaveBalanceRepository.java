package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.leave.LeaveBalance;
import com.talentx.hrms.entity.leave.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository for LeaveBalance entity
 * 
 * Entity field mappings:
 * - carriedForwardDays (not carryForwardDays)
 * - No adjustmentDays field exists
 */
@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    
    // Find leave balance by employee, leave type, and year
    Optional<LeaveBalance> findByEmployeeAndLeaveTypeAndYear(Employee employee, LeaveType leaveType, Integer year);
    
    // Find all leave balances by employee
    List<LeaveBalance> findByEmployee(Employee employee);
    
    // Find all leave balances by employee and year
    List<LeaveBalance> findByEmployeeAndYear(Employee employee, Integer year);
    
    // Find all leave balances by leave type
    List<LeaveBalance> findByLeaveType(LeaveType leaveType);
    
    // Find all leave balances by year
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND lb.year = :year")
    Page<LeaveBalance> findByOrganizationAndYear(@Param("organization") Organization organization, 
                                                @Param("year") Integer year, 
                                                Pageable pageable);
    
    // Find leave balances by organization
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.organization = :organization")
    Page<LeaveBalance> findByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Find leave balances with remaining days greater than zero
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND " +
           "(lb.allocatedDays + lb.carriedForwardDays - lb.usedDays - lb.pendingDays) > 0")
    List<LeaveBalance> findWithRemainingDaysByOrganization(@Param("organization") Organization organization);
    
    // Find leave balances with no remaining days
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND " +
           "(lb.allocatedDays + lb.carriedForwardDays - lb.usedDays - lb.pendingDays) <= 0")
    List<LeaveBalance> findWithNoRemainingDaysByOrganization(@Param("organization") Organization organization);
    
    // Find leave balances by employee with remaining days
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee = :employee AND " +
           "(lb.allocatedDays + lb.carriedForwardDays - lb.usedDays - lb.pendingDays) > 0")
    List<LeaveBalance> findByEmployeeWithRemainingDays(@Param("employee") Employee employee);
    
    // Find leave balances with carry forward days
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND lb.carriedForwardDays > 0")
    List<LeaveBalance> findWithCarryForwardDaysByOrganization(@Param("organization") Organization organization);
    
    // Find leave balances by department
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.department.id = :departmentId AND lb.year = :year")
    List<LeaveBalance> findByDepartmentAndYear(@Param("departmentId") Long departmentId, @Param("year") Integer year);
    
    // Get total allocated days by organization and year
    @Query("SELECT SUM(lb.allocatedDays) FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND lb.year = :year")
    BigDecimal getTotalAllocatedDaysByOrganizationAndYear(@Param("organization") Organization organization, @Param("year") Integer year);
    
    // Get total used days by organization and year
    @Query("SELECT SUM(lb.usedDays) FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND lb.year = :year")
    BigDecimal getTotalUsedDaysByOrganizationAndYear(@Param("organization") Organization organization, @Param("year") Integer year);
    
    // Get total pending days by organization and year
    @Query("SELECT SUM(lb.pendingDays) FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND lb.year = :year")
    BigDecimal getTotalPendingDaysByOrganizationAndYear(@Param("organization") Organization organization, @Param("year") Integer year);
    
    // Update used days
    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.usedDays = :usedDays WHERE lb.employee = :employee AND lb.leaveType = :leaveType AND lb.year = :year")
    void updateUsedDays(@Param("employee") Employee employee, 
                       @Param("leaveType") LeaveType leaveType, 
                       @Param("year") Integer year, 
                       @Param("usedDays") BigDecimal usedDays);
    
    // Update pending days
    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.pendingDays = :pendingDays WHERE lb.employee = :employee AND lb.leaveType = :leaveType AND lb.year = :year")
    void updatePendingDays(@Param("employee") Employee employee, 
                          @Param("leaveType") LeaveType leaveType, 
                          @Param("year") Integer year, 
                          @Param("pendingDays") BigDecimal pendingDays);
    
    // Count leave balances by organization and year
    @Query("SELECT COUNT(lb) FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND lb.year = :year")
    long countByOrganizationAndYear(@Param("organization") Organization organization, @Param("year") Integer year);
    
    // Find employees without leave balance for specific leave type and year
    @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
           "NOT EXISTS (SELECT lb FROM LeaveBalance lb WHERE lb.employee = e AND lb.leaveType = :leaveType AND lb.year = :year)")
    List<Employee> findEmployeesWithoutLeaveBalance(@Param("organization") Organization organization,
                                                   @Param("leaveType") LeaveType leaveType,
                                                   @Param("year") Integer year);
    
    // Find leave balances that need carry forward processing
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.organization = :organization AND lb.year = :year AND " +
           "(lb.allocatedDays + lb.carriedForwardDays - lb.usedDays - lb.pendingDays) > 0")
    List<LeaveBalance> findEligibleForCarryForward(@Param("organization") Organization organization, @Param("year") Integer year);
    
    // Get leave balance summary by employee and year
    @Query("SELECT lb.leaveType.name, lb.allocatedDays, lb.usedDays, lb.pendingDays, " +
           "(lb.allocatedDays + lb.carriedForwardDays - lb.usedDays - lb.pendingDays) as remainingDays " +
           "FROM LeaveBalance lb WHERE lb.employee = :employee AND lb.year = :year")
    List<Object[]> getLeaveBalanceSummaryByEmployeeAndYear(@Param("employee") Employee employee, @Param("year") Integer year);
    
    // Check if leave balance exists
    boolean existsByEmployeeAndLeaveTypeAndYear(Employee employee, LeaveType leaveType, Integer year);
}
