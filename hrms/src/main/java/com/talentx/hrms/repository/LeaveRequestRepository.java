package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.LeaveStatus;
import com.talentx.hrms.entity.leave.LeaveRequest;
import com.talentx.hrms.entity.leave.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    // Find leave requests by employee
    List<LeaveRequest> findByEmployee(Employee employee);
    
    // Find leave requests by employee with pagination
    Page<LeaveRequest> findByEmployee(Employee employee, Pageable pageable);
    
    // Find leave requests by employee and status
    List<LeaveRequest> findByEmployeeAndStatus(Employee employee, LeaveStatus status);
    
    // Find leave requests by employee and leave type
    List<LeaveRequest> findByEmployeeAndLeaveType(Employee employee, LeaveType leaveType);
    
    // Find leave requests by organization — simple query without JOIN FETCH to avoid pagination issue
    @Query(value = "SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization",
           countQuery = "SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.employee.organization = :organization")
    Page<LeaveRequest> findByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Find leave requests by status
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND lr.status = :status")
    Page<LeaveRequest> findByOrganizationAndStatus(@Param("organization") Organization organization, 
                                                  @Param("status") LeaveStatus status, 
                                                  Pageable pageable);
    
    // Find pending leave requests
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND lr.status = 'PENDING'")
    List<LeaveRequest> findPendingByOrganization(@Param("organization") Organization organization);
    
    // Find leave requests by date range
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND " +
           "lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findByOrganizationAndDateRange(@Param("organization") Organization organization,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
    
    // Find leave requests by employee and date range
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee = :employee AND " +
           "lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findByEmployeeAndDateRange(@Param("employee") Employee employee,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);
    
    // Find overlapping leave requests for employee
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee = :employee AND " +
           "lr.id != :excludeId AND lr.status IN ('PENDING', 'APPROVED') AND " +
           "lr.startDate <= :endDate AND lr.endDate >= :startDate")
    List<LeaveRequest> findOverlappingLeaveRequests(@Param("employee") Employee employee,
                                                   @Param("excludeId") Long excludeId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
    
    // Find leave requests by reviewer
    List<LeaveRequest> findByReviewedBy(Employee reviewer);
    
    // Find half-day leave requests (based on totalDays being 0.5)
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND lr.totalDays = 0.5")
    List<LeaveRequest> findHalfDayByOrganization(@Param("organization") Organization organization);
    
    // Find leave requests by leave type
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.leaveType = :leaveType")
    Page<LeaveRequest> findByLeaveType(@Param("leaveType") LeaveType leaveType, Pageable pageable);
    
    // Find leave requests requiring approval by manager
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.manager = :manager AND lr.status = 'PENDING'")
    List<LeaveRequest> findPendingByManager(@Param("manager") Employee manager);
    
    // Find leave requests by department
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.department.id = :departmentId")
    Page<LeaveRequest> findByDepartmentId(@Param("departmentId") Long departmentId, Pageable pageable);
    
    // Count leave requests by status
    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND lr.status = :status")
    long countByOrganizationAndStatus(@Param("organization") Organization organization, @Param("status") LeaveStatus status);
    
    // Count leave requests by employee and year
    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.employee = :employee AND " +
           "YEAR(lr.startDate) = :year")
    long countByEmployeeAndYear(@Param("employee") Employee employee, @Param("year") int year);
    
    // Find cancelled leave requests
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND lr.status = 'CANCELLED'")
    List<LeaveRequest> findCancelledByOrganization(@Param("organization") Organization organization);
    
    // Find leave requests by employee and status with date range
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee = :employee AND lr.status = :status AND " +
           "lr.startDate >= :fromDate AND lr.endDate <= :toDate")
    List<LeaveRequest> findByEmployeeAndStatusAndDateRange(@Param("employee") Employee employee,
                                                          @Param("status") LeaveStatus status,
                                                          @Param("fromDate") LocalDate fromDate,
                                                          @Param("toDate") LocalDate toDate);
    
    // Find upcoming approved leave requests
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND " +
           "lr.status = 'APPROVED' AND lr.startDate > CURRENT_DATE AND lr.startDate <= :upcomingDate")
    List<LeaveRequest> findUpcomingApprovedByOrganization(@Param("organization") Organization organization,
                                                         @Param("upcomingDate") LocalDate upcomingDate);
    
    // Find current active leave requests
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND " +
           "lr.status = 'APPROVED' AND lr.startDate <= CURRENT_DATE AND lr.endDate >= CURRENT_DATE")
    List<LeaveRequest> findCurrentActiveByOrganization(@Param("organization") Organization organization);
    
    // Search leave requests by employee name
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND " +
           "(LOWER(lr.employee.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(lr.employee.lastName) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<LeaveRequest> findByOrganizationAndEmployeeNameContaining(@Param("organization") Organization organization,
                                                                  @Param("name") String name,
                                                                  Pageable pageable);
    
    // Find leave requests with comprehensive search
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.organization = :organization AND " +
           "(:employeeName IS NULL OR LOWER(lr.employee.firstName) LIKE LOWER(CONCAT('%', :employeeName, '%')) OR " +
           "LOWER(lr.employee.lastName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) AND " +
           "(:status IS NULL OR lr.status = :status) AND " +
           "(:leaveType IS NULL OR lr.leaveType = :leaveType) AND " +
           "(:startDate IS NULL OR lr.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR lr.endDate <= :endDate)")
    Page<LeaveRequest> findBySearchCriteria(@Param("organization") Organization organization,
                                           @Param("employeeName") String employeeName,
                                           @Param("status") LeaveStatus status,
                                           @Param("leaveType") LeaveType leaveType,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate,
                                           Pageable pageable);
}

