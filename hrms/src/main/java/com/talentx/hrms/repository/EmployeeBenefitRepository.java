package com.talentx.hrms.repository;

import com.talentx.hrms.entity.benefits.BenefitPlan;
import com.talentx.hrms.entity.benefits.EmployeeBenefit;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.BenefitPlanType;
import com.talentx.hrms.entity.enums.BenefitStatus;
import com.talentx.hrms.entity.enums.CoverageLevel;
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
public interface EmployeeBenefitRepository extends JpaRepository<EmployeeBenefit, Long> {
    
    // Find all benefits for an employee
    List<EmployeeBenefit> findByEmployee(Employee employee);
    
    // Find all benefits for an employee with pagination
    Page<EmployeeBenefit> findByEmployee(Employee employee, Pageable pageable);
    
    // Find active benefits for an employee
    List<EmployeeBenefit> findByEmployeeAndStatus(Employee employee, BenefitStatus status);
    
    // Find benefits by benefit plan
    List<EmployeeBenefit> findByBenefitPlan(BenefitPlan benefitPlan);
    
    // Find benefits by benefit plan with pagination
    Page<EmployeeBenefit> findByBenefitPlan(BenefitPlan benefitPlan, Pageable pageable);
    
    // Find specific employee benefit by employee and benefit plan
    Optional<EmployeeBenefit> findByEmployeeAndBenefitPlan(Employee employee, BenefitPlan benefitPlan);
    
    // Find benefits by organization
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee.organization = :organization")
    List<EmployeeBenefit> findByOrganization(@Param("organization") Organization organization);
    
    // Find benefits by organization with pagination
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee.organization = :organization")
    Page<EmployeeBenefit> findByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    // Find active benefits by organization
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee.organization = :organization AND eb.status = 'ACTIVE'")
    List<EmployeeBenefit> findActiveByOrganization(@Param("organization") Organization organization);
    
    // Find benefits by benefit plan type
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee.organization = :organization AND " +
           "eb.benefitPlan.planType = :planType")
    List<EmployeeBenefit> findByOrganizationAndPlanType(@Param("organization") Organization organization, 
                                                       @Param("planType") BenefitPlanType planType);
    
    // Find benefits by coverage level
    List<EmployeeBenefit> findByEmployeeAndCoverageLevel(Employee employee, CoverageLevel coverageLevel);
    
    // Find benefits enrolled between dates
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee = :employee AND " +
           "eb.enrollmentDate BETWEEN :startDate AND :endDate")
    List<EmployeeBenefit> findByEmployeeAndEnrollmentDateBetween(@Param("employee") Employee employee, 
                                                                @Param("startDate") LocalDate startDate, 
                                                                @Param("endDate") LocalDate endDate);
    
    // Find benefits effective on a specific date
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee = :employee AND " +
           "eb.effectiveDate <= :date AND (eb.terminationDate IS NULL OR eb.terminationDate >= :date)")
    List<EmployeeBenefit> findByEmployeeAndEffectiveOnDate(@Param("employee") Employee employee, 
                                                          @Param("date") LocalDate date);
    
    // Find benefits terminating soon
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee.organization = :organization AND " +
           "eb.terminationDate IS NOT NULL AND eb.terminationDate BETWEEN CURRENT_DATE AND :endDate")
    List<EmployeeBenefit> findByOrganizationWithUpcomingTermination(@Param("organization") Organization organization, 
                                                                   @Param("endDate") LocalDate endDate);
    
    // Find benefits with comprehensive search
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee.organization = :organization AND " +
           "(:employee IS NULL OR eb.employee = :employee) AND " +
           "(:benefitPlan IS NULL OR eb.benefitPlan = :benefitPlan) AND " +
           "(:status IS NULL OR eb.status = :status) AND " +
           "(:coverageLevel IS NULL OR eb.coverageLevel = :coverageLevel) AND " +
           "(:planType IS NULL OR eb.benefitPlan.planType = :planType)")
    Page<EmployeeBenefit> findBySearchCriteria(@Param("organization") Organization organization,
                                              @Param("employee") Employee employee,
                                              @Param("benefitPlan") BenefitPlan benefitPlan,
                                              @Param("status") BenefitStatus status,
                                              @Param("coverageLevel") CoverageLevel coverageLevel,
                                              @Param("planType") BenefitPlanType planType,
                                              Pageable pageable);
    
    // Count benefits by employee
    long countByEmployee(Employee employee);
    
    // Count active benefits by employee
    long countByEmployeeAndStatus(Employee employee, BenefitStatus status);
    
    // Count benefits by organization
    @Query("SELECT COUNT(eb) FROM EmployeeBenefit eb WHERE eb.employee.organization = :organization")
    long countByOrganization(@Param("organization") Organization organization);
    
    // Count benefits by benefit plan
    long countByBenefitPlan(BenefitPlan benefitPlan);
    
    // Count active benefits by benefit plan
    long countByBenefitPlanAndStatus(BenefitPlan benefitPlan, BenefitStatus status);
    
    // Check if employee is enrolled in a specific benefit plan
    boolean existsByEmployeeAndBenefitPlan(Employee employee, BenefitPlan benefitPlan);
    
    // Check if employee has active enrollment in a specific benefit plan
    @Query("SELECT COUNT(eb) > 0 FROM EmployeeBenefit eb WHERE eb.employee = :employee AND " +
           "eb.benefitPlan = :benefitPlan AND eb.status = 'ACTIVE'")
    boolean existsActiveByEmployeeAndBenefitPlan(@Param("employee") Employee employee, 
                                                @Param("benefitPlan") BenefitPlan benefitPlan);
    
    // Find benefits with full details (including benefit plan and employee)
    @Query("SELECT DISTINCT eb FROM EmployeeBenefit eb " +
           "LEFT JOIN FETCH eb.benefitPlan " +
           "LEFT JOIN FETCH eb.employee " +
           "WHERE eb.id = :id")
    Optional<EmployeeBenefit> findByIdWithFullDetails(@Param("id") Long id);
    
    // Find terminated benefits
    List<EmployeeBenefit> findByEmployeeAndTerminationDateIsNotNull(Employee employee);
    
    // Find benefits terminated between dates
    @Query("SELECT eb FROM EmployeeBenefit eb WHERE eb.employee = :employee AND " +
           "eb.terminationDate BETWEEN :startDate AND :endDate")
    List<EmployeeBenefit> findByEmployeeAndTerminationDateBetween(@Param("employee") Employee employee, 
                                                                 @Param("startDate") LocalDate startDate, 
                                                                 @Param("endDate") LocalDate endDate);
}

