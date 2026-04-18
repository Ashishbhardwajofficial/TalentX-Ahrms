package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
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
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

       // Find by employee number and organization
       Optional<Employee> findByEmployeeNumberAndOrganization(String employeeNumber, Organization organization);

       // Find by work email and organization
       Optional<Employee> findByWorkEmailAndOrganization(String workEmail, Organization organization);

       // Find by any email (work or personal) and organization
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "(e.workEmail = :email OR e.personalEmail = :email)")
       Optional<Employee> findByEmailAndOrganization(@Param("email") String email,
                     @Param("organization") Organization organization);

       // Find all employees by organization
       List<Employee> findByOrganization(Organization organization);

       // Find all employees by organization with pagination
       Page<Employee> findByOrganization(Organization organization, Pageable pageable);

       // Find employees by department
       List<Employee> findByDepartment(Department department);

       // Find employees by department with pagination
       Page<Employee> findByDepartment(Department department, Pageable pageable);

       // Find employees by location
       List<Employee> findByLocation(Location location);

       // Find employees by manager
       List<Employee> findByManager(Employee manager);

       // Find employees by employment status
       List<Employee> findByOrganizationAndEmploymentStatus(Organization organization,
                     EmploymentStatus employmentStatus);

       // Find active employees by organization
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND e.employmentStatus = 'ACTIVE'")
       List<Employee> findActiveByOrganization(@Param("organization") Organization organization);

       // Find employees by employment type
       List<Employee> findByOrganizationAndEmploymentType(Organization organization, EmploymentType employmentType);

       // Search employees by name
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
                     "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
                     "LOWER(CONCAT(e.firstName, ' ', e.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))")
       Page<Employee> findByOrganizationAndNameContainingIgnoreCase(@Param("organization") Organization organization,
                     @Param("name") String name,
                     Pageable pageable);

       // Search employees by employee number
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :employeeNumber, '%'))")
       Page<Employee> findByOrganizationAndEmployeeNumberContainingIgnoreCase(
                     @Param("organization") Organization organization,
                     @Param("employeeNumber") String employeeNumber,
                     Pageable pageable);

       // Search employees by job title
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :jobTitle, '%'))")
       Page<Employee> findByOrganizationAndJobTitleContainingIgnoreCase(
                     @Param("organization") Organization organization,
                     @Param("jobTitle") String jobTitle,
                     Pageable pageable);

       // Find employees with comprehensive search
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "(:name IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
                     "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
                     "LOWER(CONCAT(e.firstName, ' ', e.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
                     "(:employeeNumber IS NULL OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :employeeNumber, '%'))) AND "
                     +
                     "(:jobTitle IS NULL OR LOWER(e.jobTitle) LIKE LOWER(CONCAT('%', :jobTitle, '%'))) AND " +
                     "(:department IS NULL OR e.department = :department) AND " +
                     "(:location IS NULL OR e.location = :location) AND " +
                     "(:employmentStatus IS NULL OR e.employmentStatus = :employmentStatus) AND " +
                     "(:employmentType IS NULL OR e.employmentType = :employmentType)")
       Page<Employee> findBySearchCriteria(@Param("organization") Organization organization,
                     @Param("name") String name,
                     @Param("employeeNumber") String employeeNumber,
                     @Param("jobTitle") String jobTitle,
                     @Param("department") Department department,
                     @Param("location") Location location,
                     @Param("employmentStatus") EmploymentStatus employmentStatus,
                     @Param("employmentType") EmploymentType employmentType,
                     Pageable pageable);

       // Find employees hired between dates
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "e.hireDate BETWEEN :startDate AND :endDate")
       List<Employee> findByOrganizationAndHireDateBetween(@Param("organization") Organization organization,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       // Find employees with birthdays in month
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "MONTH(e.dateOfBirth) = :month")
       List<Employee> findByOrganizationAndBirthdayMonth(@Param("organization") Organization organization,
                     @Param("month") int month);

       // Find employees on probation
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "e.probationEndDate IS NOT NULL AND e.probationEndDate > CURRENT_DATE")
       List<Employee> findByOrganizationOnProbation(@Param("organization") Organization organization);

       // Find employees with salary range
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "e.salaryAmount BETWEEN :minSalary AND :maxSalary")
       List<Employee> findByOrganizationAndSalaryBetween(@Param("organization") Organization organization,
                     @Param("minSalary") BigDecimal minSalary,
                     @Param("maxSalary") BigDecimal maxSalary);

       // Find managers (employees who have direct reports)
       @Query("SELECT DISTINCT e FROM Employee e WHERE e.organization = :organization AND " +
                     "EXISTS (SELECT dr FROM Employee dr WHERE dr.manager = e)")
       List<Employee> findManagersByOrganization(@Param("organization") Organization organization);

       // Find employees without manager
       List<Employee> findByOrganizationAndManagerIsNull(Organization organization);

       // Find employees with user account
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND e.user IS NOT NULL")
       List<Employee> findByOrganizationWithUserAccount(@Param("organization") Organization organization);

       // Find employees without user account
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND e.user IS NULL")
       List<Employee> findByOrganizationWithoutUserAccount(@Param("organization") Organization organization);

       // Count employees by organization
       long countByOrganization(Organization organization);

       // Count employees by department
       long countByDepartment(Department department);

       // Count employees by employment status
       long countByOrganizationAndEmploymentStatus(Organization organization, EmploymentStatus employmentStatus);

       // Count employees by employment type
       long countByOrganizationAndEmploymentType(Organization organization, EmploymentType employmentType);

       // Check if employee number exists in organization
       boolean existsByEmployeeNumberAndOrganization(String employeeNumber, Organization organization);

       // Check if email exists in organization
       @Query("SELECT COUNT(e) > 0 FROM Employee e WHERE e.organization = :organization AND " +
                     "(e.workEmail = :email OR e.personalEmail = :email)")
       boolean existsByEmailAndOrganization(@Param("email") String email,
                     @Param("organization") Organization organization);

       // Find employee with full details (addresses only — emergencyContacts fetched separately to avoid MultipleBagFetchException)
       @Query("SELECT DISTINCT e FROM Employee e " +
                     "LEFT JOIN FETCH e.addresses " +
                     "WHERE e.id = :id")
       Optional<Employee> findByIdWithFullDetails(@Param("id") Long id);

       // Fetch emergency contacts separately (avoids Hibernate MultipleBagFetchException)
       @Query("SELECT DISTINCT e FROM Employee e " +
                     "LEFT JOIN FETCH e.emergencyContacts " +
                     "WHERE e.id = :id")
       Optional<Employee> findByIdWithEmergencyContacts(@Param("id") Long id);

       // Find employees with upcoming probation end dates
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "e.probationEndDate BETWEEN CURRENT_DATE AND :endDate")
       List<Employee> findByOrganizationWithUpcomingProbationEnd(@Param("organization") Organization organization,
                     @Param("endDate") LocalDate endDate);

       // Find employees by job level
       List<Employee> findByOrganizationAndJobLevel(Organization organization, String jobLevel);

       // Find terminated employees
       List<Employee> findByOrganizationAndTerminationDateIsNotNull(Organization organization);

       // Find employees terminated between dates
       @Query("SELECT e FROM Employee e WHERE e.organization = :organization AND " +
                     "e.terminationDate BETWEEN :startDate AND :endDate")
       List<Employee> findByOrganizationAndTerminationDateBetween(@Param("organization") Organization organization,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       // Find employee by user
       Optional<Employee> findByUser(User user);

       // Find employee by user's username
       Optional<Employee> findByUserUsername(String username);
}

