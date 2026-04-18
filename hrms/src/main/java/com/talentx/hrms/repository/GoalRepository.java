package com.talentx.hrms.repository;

import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.performance.Goal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    // Find by employee
    List<Goal> findByEmployee(Employee employee);
    
    // Find by employee with pagination
    Page<Goal> findByEmployee(Employee employee, Pageable pageable);
    
    // Find by employee and status
    List<Goal> findByEmployeeAndStatus(Employee employee, Goal.GoalStatus status);
    
    // Find by employee and goal type
    List<Goal> findByEmployeeAndGoalType(Employee employee, Goal.GoalType goalType);
    
    // Find by employee and category
    List<Goal> findByEmployeeAndCategory(Employee employee, Goal.GoalCategory category);
    
    // Find by status
    List<Goal> findByStatus(Goal.GoalStatus status);
    
    // Find by goal type
    List<Goal> findByGoalType(Goal.GoalType goalType);
    
    // Find by category
    List<Goal> findByCategory(Goal.GoalCategory category);
    
    // Find by created by employee
    List<Goal> findByCreatedByEmployee(Employee createdByEmployee);
    
    // Find active goals by employee
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND g.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<Goal> findActiveByEmployee(@Param("employee") Employee employee);
    
    // Find completed goals by employee
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND g.status = 'COMPLETED'")
    List<Goal> findCompletedByEmployee(@Param("employee") Employee employee);
    
    // Find overdue goals
    @Query("SELECT g FROM Goal g WHERE g.targetDate < CURRENT_DATE AND g.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<Goal> findOverdueGoals();
    
    // Find overdue goals by employee
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND g.targetDate < CURRENT_DATE AND " +
           "g.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<Goal> findOverdueByEmployee(@Param("employee") Employee employee);
    
    // Find goals due soon
    @Query("SELECT g FROM Goal g WHERE g.targetDate BETWEEN CURRENT_DATE AND :dueDate AND " +
           "g.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<Goal> findDueSoon(@Param("dueDate") LocalDate dueDate);
    
    // Find goals due soon by employee
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND g.targetDate BETWEEN CURRENT_DATE AND :dueDate AND " +
           "g.status IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<Goal> findDueSoonByEmployee(@Param("employee") Employee employee, @Param("dueDate") LocalDate dueDate);
    
    // Find goals by date range
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND " +
           "(:startDate IS NULL OR g.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR g.targetDate <= :endDate)")
    List<Goal> findByEmployeeAndDateRange(@Param("employee") Employee employee,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    // Find goals by progress range
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND " +
           "g.progressPercentage BETWEEN :minProgress AND :maxProgress")
    List<Goal> findByEmployeeAndProgressRange(@Param("employee") Employee employee,
                                             @Param("minProgress") Integer minProgress,
                                             @Param("maxProgress") Integer maxProgress);
    
    // Find goals by title containing (case insensitive)
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND " +
           "LOWER(g.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Goal> findByEmployeeAndTitleContainingIgnoreCase(@Param("employee") Employee employee,
                                                         @Param("title") String title,
                                                         Pageable pageable);
    
    // Find goals with comprehensive search — safe query without JOIN FETCH + pagination issue
    @Query("SELECT g FROM Goal g WHERE " +
           "(:employee IS NULL OR g.employee = :employee) AND " +
           "(:title IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:goalType IS NULL OR g.goalType = :goalType) AND " +
           "(:category IS NULL OR g.category = :category) AND " +
           "(:status IS NULL OR g.status = :status) AND " +
           "(:minProgress IS NULL OR g.progressPercentage >= :minProgress) AND " +
           "(:maxProgress IS NULL OR g.progressPercentage <= :maxProgress) AND " +
           "(:startDate IS NULL OR g.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR g.targetDate <= :endDate)")
    Page<Goal> findBySearchCriteria(@Param("employee") Employee employee,
                                   @Param("title") String title,
                                   @Param("goalType") Goal.GoalType goalType,
                                   @Param("category") Goal.GoalCategory category,
                                   @Param("status") Goal.GoalStatus status,
                                   @Param("minProgress") Integer minProgress,
                                   @Param("maxProgress") Integer maxProgress,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   Pageable pageable);
    
    // Find goals by organization (through employee)
    @Query("SELECT g FROM Goal g WHERE g.employee.organization = :organization")
    List<Goal> findByOrganization(@Param("organization") com.talentx.hrms.entity.core.Organization organization);
    
    // Find goals by organization with pagination
    @Query("SELECT g FROM Goal g WHERE g.employee.organization = :organization")
    Page<Goal> findByOrganization(@Param("organization") com.talentx.hrms.entity.core.Organization organization, 
                                 Pageable pageable);
    
    // Find goals by department (through employee)
    @Query("SELECT g FROM Goal g WHERE g.employee.department = :department")
    List<Goal> findByDepartment(@Param("department") com.talentx.hrms.entity.core.Department department);
    
    // Count goals by employee and status
    long countByEmployeeAndStatus(Employee employee, Goal.GoalStatus status);
    
    // Count goals by status
    long countByStatus(Goal.GoalStatus status);
    
    // Count goals by goal type
    long countByGoalType(Goal.GoalType goalType);
    
    // Count goals by category
    long countByCategory(Goal.GoalCategory category);
    
    // Find average progress by employee
    @Query("SELECT AVG(g.progressPercentage) FROM Goal g WHERE g.employee = :employee")
    Double findAverageProgressByEmployee(@Param("employee") Employee employee);
    
    // Find average progress by employee and status
    @Query("SELECT AVG(g.progressPercentage) FROM Goal g WHERE g.employee = :employee AND g.status = :status")
    Double findAverageProgressByEmployeeAndStatus(@Param("employee") Employee employee, 
                                                 @Param("status") Goal.GoalStatus status);
    
    // Find goals completed in date range
    @Query("SELECT g FROM Goal g WHERE g.completionDate BETWEEN :startDate AND :endDate")
    List<Goal> findCompletedBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find goals completed by employee in date range
    @Query("SELECT g FROM Goal g WHERE g.employee = :employee AND g.completionDate BETWEEN :startDate AND :endDate")
    List<Goal> findCompletedByEmployeeBetween(@Param("employee") Employee employee,
                                             @Param("startDate") LocalDate startDate, 
                                             @Param("endDate") LocalDate endDate);
}

