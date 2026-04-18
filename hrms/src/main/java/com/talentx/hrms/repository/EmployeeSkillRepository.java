package com.talentx.hrms.repository;

import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.skills.EmployeeSkill;
import com.talentx.hrms.entity.skills.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {
    
    // Find employee skills by employee
    List<EmployeeSkill> findByEmployee(Employee employee);
    
    // Find employee skills by employee with pagination
    Page<EmployeeSkill> findByEmployee(Employee employee, Pageable pageable);
    
    // Find employee skills by employee ID
    List<EmployeeSkill> findByEmployeeId(Long employeeId);
    
    // Find employee skills by employee ID with pagination
    Page<EmployeeSkill> findByEmployeeId(Long employeeId, Pageable pageable);
    
    // Find employee skills by skill
    List<EmployeeSkill> findBySkill(Skill skill);
    
    // Find employee skills by skill ID
    List<EmployeeSkill> findBySkillId(Long skillId);
    
    // Find specific employee skill by employee and skill
    Optional<EmployeeSkill> findByEmployeeAndSkill(Employee employee, Skill skill);
    
    // Find specific employee skill by employee ID and skill ID
    Optional<EmployeeSkill> findByEmployeeIdAndSkillId(Long employeeId, Long skillId);
    
    // Find employee skills by proficiency level
    List<EmployeeSkill> findByProficiencyLevel(EmployeeSkill.ProficiencyLevel proficiencyLevel);
    
    // Find employee skills by employee and proficiency level
    List<EmployeeSkill> findByEmployeeAndProficiencyLevel(Employee employee, EmployeeSkill.ProficiencyLevel proficiencyLevel);
    
    // Find verified employee skills
    List<EmployeeSkill> findByVerifiedByIsNotNull();
    
    // Find unverified employee skills
    List<EmployeeSkill> findByVerifiedByIsNull();
    
    // Find employee skills verified by specific verifier
    List<EmployeeSkill> findByVerifiedBy(Employee verifier);
    
    // Find employee skills by skill category
    @Query("SELECT es FROM EmployeeSkill es JOIN es.skill s WHERE s.category = :category")
    List<EmployeeSkill> findBySkillCategory(@Param("category") String category);
    
    // Find employee skills by employee and skill category
    @Query("SELECT es FROM EmployeeSkill es JOIN es.skill s WHERE es.employee = :employee AND s.category = :category")
    List<EmployeeSkill> findByEmployeeAndSkillCategory(@Param("employee") Employee employee, @Param("category") String category);
    
    // Find employees with specific skill
    @Query("SELECT es.employee FROM EmployeeSkill es WHERE es.skill = :skill")
    List<Employee> findEmployeesBySkill(@Param("skill") Skill skill);
    
    // Find employees with specific skill and minimum proficiency level
    @Query("SELECT es.employee FROM EmployeeSkill es WHERE es.skill = :skill AND " +
           "es.proficiencyLevel IN :proficiencyLevels")
    List<Employee> findEmployeesBySkillAndProficiencyLevel(@Param("skill") Skill skill, 
                                                          @Param("proficiencyLevels") List<EmployeeSkill.ProficiencyLevel> proficiencyLevels);
    
    // Find employees with skills in category
    @Query("SELECT DISTINCT es.employee FROM EmployeeSkill es JOIN es.skill s WHERE s.category = :category")
    List<Employee> findEmployeesBySkillCategory(@Param("category") String category);
    
    // Search employee skills with comprehensive criteria
    @Query("SELECT es FROM EmployeeSkill es JOIN es.skill s WHERE " +
           "(:employeeId IS NULL OR es.employee.id = :employeeId) AND " +
           "(:skillName IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :skillName, '%'))) AND " +
           "(:category IS NULL OR LOWER(s.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
           "(:proficiencyLevel IS NULL OR es.proficiencyLevel = :proficiencyLevel) AND " +
           "(:verified IS NULL OR (:verified = true AND es.verifiedBy IS NOT NULL) OR (:verified = false AND es.verifiedBy IS NULL))")
    Page<EmployeeSkill> findBySearchCriteria(@Param("employeeId") Long employeeId,
                                           @Param("skillName") String skillName,
                                           @Param("category") String category,
                                           @Param("proficiencyLevel") EmployeeSkill.ProficiencyLevel proficiencyLevel,
                                           @Param("verified") Boolean verified,
                                           Pageable pageable);
    
    // Count employee skills by employee
    long countByEmployee(Employee employee);
    
    // Count employee skills by skill
    long countBySkill(Skill skill);
    
    // Count verified skills by employee
    @Query("SELECT COUNT(es) FROM EmployeeSkill es WHERE es.employee = :employee AND es.verifiedBy IS NOT NULL")
    long countVerifiedSkillsByEmployee(@Param("employee") Employee employee);
    
    // Count skills by proficiency level for employee
    long countByEmployeeAndProficiencyLevel(Employee employee, EmployeeSkill.ProficiencyLevel proficiencyLevel);
    
    // Check if employee has specific skill
    boolean existsByEmployeeAndSkill(Employee employee, Skill skill);
    
    // Check if employee has specific skill by IDs
    boolean existsByEmployeeIdAndSkillId(Long employeeId, Long skillId);
    
    // Find employee skills with full details (employee, skill, verifier)
    @Query("SELECT DISTINCT es FROM EmployeeSkill es " +
           "LEFT JOIN FETCH es.employee " +
           "LEFT JOIN FETCH es.skill " +
           "LEFT JOIN FETCH es.verifiedBy " +
           "WHERE es.id = :id")
    Optional<EmployeeSkill> findByIdWithFullDetails(@Param("id") Long id);
    
    // Find top skills by employee count
    @Query("SELECT es.skill, COUNT(es.employee) as employeeCount FROM EmployeeSkill es " +
           "GROUP BY es.skill " +
           "ORDER BY COUNT(es.employee) DESC")
    List<Object[]> findTopSkillsByEmployeeCount(Pageable pageable);
    
    // Find skill proficiency distribution
    @Query("SELECT es.proficiencyLevel, COUNT(es) FROM EmployeeSkill es " +
           "WHERE es.skill = :skill " +
           "GROUP BY es.proficiencyLevel")
    List<Object[]> findProficiencyDistributionBySkill(@Param("skill") Skill skill);
    
    // Find employees needing skill verification
    @Query("SELECT es FROM EmployeeSkill es WHERE es.verifiedBy IS NULL AND " +
           "es.createdAt < :cutoffDate")
    List<EmployeeSkill> findUnverifiedSkillsOlderThan(@Param("cutoffDate") java.time.Instant cutoffDate);
}

