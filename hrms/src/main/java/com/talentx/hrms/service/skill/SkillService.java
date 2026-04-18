package com.talentx.hrms.service.skill;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.skills.EmployeeSkill;
import com.talentx.hrms.entity.skills.Skill;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.EmployeeSkillRepository;
import com.talentx.hrms.repository.SkillRepository;
import com.talentx.hrms.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SkillService {

    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthService authService;

    @Autowired
    public SkillService(SkillRepository skillRepository,
                       EmployeeSkillRepository employeeSkillRepository,
                       EmployeeRepository employeeRepository,
                       AuthService authService) {
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeRepository = employeeRepository;
        this.authService = authService;
    }

    // ===== SKILL CATALOG MANAGEMENT =====

    /**
     * Create a new skill
     */
    public Skill createSkill(String name, String category, String description) {
        // Check if skill already exists (case-insensitive)
        if (skillRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Skill with name '" + name + "' already exists");
        }

        Skill skill = new Skill(name, category, description);
        return skillRepository.save(skill);
    }

    /**
     * Update an existing skill
     */
    public Skill updateSkill(Long skillId, String name, String category, String description) {
        Skill skill = skillRepository.findById(skillId)
            .orElseThrow(() -> new RuntimeException("Skill not found"));

        // Check if name already exists (excluding current skill)
        Optional<Skill> existingSkill = skillRepository.findByNameIgnoreCase(name);
        if (existingSkill.isPresent() && !existingSkill.get().getId().equals(skillId)) {
            throw new RuntimeException("Skill with name '" + name + "' already exists");
        }

        skill.setName(name);
        skill.setCategory(category);
        skill.setDescription(description);

        return skillRepository.save(skill);
    }

    /**
     * Get skill by ID
     */
    @Transactional(readOnly = true)
    public Skill getSkill(Long skillId) {
        return skillRepository.findById(skillId)
            .orElseThrow(() -> new RuntimeException("Skill not found"));
    }

    /**
     * Get all skills with pagination
     */
    @Transactional(readOnly = true)
    public Page<Skill> getSkills(PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return skillRepository.findByActiveTrue(pageable);
    }

    /**
     * Search skills with criteria
     */
    @Transactional(readOnly = true)
    public Page<Skill> searchSkills(String name, String category, String description, 
                                   PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return skillRepository.findBySearchCriteria(name, category, description, pageable);
    }

    /**
     * Get skills by category
     */
    @Transactional(readOnly = true)
    public Page<Skill> getSkillsByCategory(String category, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return skillRepository.findByCategory(category, pageable);
    }

    /**
     * Get all skill categories
     */
    @Transactional(readOnly = true)
    public List<String> getSkillCategories() {
        return skillRepository.findDistinctCategories();
    }

    /**
     * Get most popular skills
     */
    @Transactional(readOnly = true)
    public List<Skill> getMostPopularSkills(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return skillRepository.findMostPopularSkills(pageable);
    }

    /**
     * Delete skill
     */
    public void deleteSkill(Long skillId) {
        Skill skill = skillRepository.findById(skillId)
            .orElseThrow(() -> new RuntimeException("Skill not found"));

        // Check if skill is assigned to any employees
        long employeeCount = employeeSkillRepository.countBySkill(skill);
        if (employeeCount > 0) {
            throw new RuntimeException("Cannot delete skill that is assigned to " + employeeCount + " employee(s)");
        }

        skillRepository.delete(skill);
    }

    // ===== EMPLOYEE SKILL TRACKING =====

    /**
     * Add skill to employee
     */
    public EmployeeSkill addSkillToEmployee(Long employeeId, Long skillId, 
                                          EmployeeSkill.ProficiencyLevel proficiencyLevel,
                                          Integer yearsOfExperience, Integer lastUsedYear) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        Skill skill = skillRepository.findById(skillId)
            .orElseThrow(() -> new RuntimeException("Skill not found"));

        // Check if employee already has this skill
        if (employeeSkillRepository.existsByEmployeeAndSkill(employee, skill)) {
            throw new RuntimeException("Employee already has this skill");
        }

        EmployeeSkill employeeSkill = new EmployeeSkill(employee, skill, proficiencyLevel);
        employeeSkill.setYearsOfExperience(yearsOfExperience != null ? BigDecimal.valueOf(yearsOfExperience) : null);
        employeeSkill.setLastUsedYear(lastUsedYear);

        return employeeSkillRepository.save(employeeSkill);
    }

    /**
     * Update employee skill
     */
    public EmployeeSkill updateEmployeeSkill(Long employeeSkillId, 
                                           EmployeeSkill.ProficiencyLevel proficiencyLevel,
                                           Integer yearsOfExperience, Integer lastUsedYear) {
        EmployeeSkill employeeSkill = employeeSkillRepository.findById(employeeSkillId)
            .orElseThrow(() -> new RuntimeException("Employee skill not found"));

        employeeSkill.setProficiencyLevel(proficiencyLevel);
        employeeSkill.setYearsOfExperience(yearsOfExperience != null ? BigDecimal.valueOf(yearsOfExperience) : null);
        employeeSkill.setLastUsedYear(lastUsedYear);

        return employeeSkillRepository.save(employeeSkill);
    }

    /**
     * Get employee skills
     */
    @Transactional(readOnly = true)
    public Page<EmployeeSkill> getEmployeeSkills(Long employeeId, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return employeeSkillRepository.findByEmployeeId(employeeId, pageable);
    }

    /**
     * Get employees with specific skill
     */
    @Transactional(readOnly = true)
    public List<Employee> getEmployeesWithSkill(Long skillId) {
        Skill skill = skillRepository.findById(skillId)
            .orElseThrow(() -> new RuntimeException("Skill not found"));

        return employeeSkillRepository.findEmployeesBySkill(skill);
    }

    /**
     * Get employees with specific skill and minimum proficiency
     */
    @Transactional(readOnly = true)
    public List<Employee> getEmployeesWithSkillAndProficiency(Long skillId, 
                                                            EmployeeSkill.ProficiencyLevel minProficiency) {
        Skill skill = skillRepository.findById(skillId)
            .orElseThrow(() -> new RuntimeException("Skill not found"));

        List<EmployeeSkill.ProficiencyLevel> proficiencyLevels = getProficiencyLevelsFromMinimum(minProficiency);
        return employeeSkillRepository.findEmployeesBySkillAndProficiencyLevel(skill, proficiencyLevels);
    }

    /**
     * Search employee skills
     */
    @Transactional(readOnly = true)
    public Page<EmployeeSkill> searchEmployeeSkills(Long employeeId, String skillName, String category,
                                                   EmployeeSkill.ProficiencyLevel proficiencyLevel,
                                                   Boolean verified, PaginationRequest paginationRequest) {
        Pageable pageable = createPageable(paginationRequest);
        return employeeSkillRepository.findBySearchCriteria(employeeId, skillName, category, 
                                                          proficiencyLevel, verified, pageable);
    }

    /**
     * Remove skill from employee
     */
    public void removeSkillFromEmployee(Long employeeSkillId) {
        EmployeeSkill employeeSkill = employeeSkillRepository.findById(employeeSkillId)
            .orElseThrow(() -> new RuntimeException("Employee skill not found"));

        employeeSkillRepository.delete(employeeSkill);
    }

    // ===== SKILL VERIFICATION WORKFLOW =====

    /**
     * Verify employee skill
     */
    public EmployeeSkill verifyEmployeeSkill(Long employeeSkillId) {
        EmployeeSkill employeeSkill = employeeSkillRepository.findById(employeeSkillId)
            .orElseThrow(() -> new RuntimeException("Employee skill not found"));

        // Get current user as verifier
        Employee verifier = getCurrentEmployee();
        
        // Verify the skill
        employeeSkill.verify(verifier);

        return employeeSkillRepository.save(employeeSkill);
    }

    /**
     * Get unverified skills for review
     */
    @Transactional(readOnly = true)
    public List<EmployeeSkill> getUnverifiedSkills() {
        return employeeSkillRepository.findByVerifiedByIsNull();
    }

    /**
     * Get skills needing verification (older than specified days)
     */
    @Transactional(readOnly = true)
    public List<EmployeeSkill> getSkillsNeedingVerification(int daysOld) {
        Instant cutoffDate = Instant.now().minus(daysOld, ChronoUnit.DAYS);
        return employeeSkillRepository.findUnverifiedSkillsOlderThan(cutoffDate);
    }

    /**
     * Get skill statistics for employee
     */
    @Transactional(readOnly = true)
    public EmployeeSkillStatistics getEmployeeSkillStatistics(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        long totalSkills = employeeSkillRepository.countByEmployee(employee);
        long verifiedSkills = employeeSkillRepository.countVerifiedSkillsByEmployee(employee);
        long beginnerSkills = employeeSkillRepository.countByEmployeeAndProficiencyLevel(employee, EmployeeSkill.ProficiencyLevel.BEGINNER);
        long intermediateSkills = employeeSkillRepository.countByEmployeeAndProficiencyLevel(employee, EmployeeSkill.ProficiencyLevel.INTERMEDIATE);
        long advancedSkills = employeeSkillRepository.countByEmployeeAndProficiencyLevel(employee, EmployeeSkill.ProficiencyLevel.ADVANCED);
        long expertSkills = employeeSkillRepository.countByEmployeeAndProficiencyLevel(employee, EmployeeSkill.ProficiencyLevel.EXPERT);

        return new EmployeeSkillStatistics(totalSkills, verifiedSkills, beginnerSkills, 
                                         intermediateSkills, advancedSkills, expertSkills);
    }

    // ===== HELPER METHODS =====

    /**
     * Get current employee from authenticated user
     */
    private Employee getCurrentEmployee() {
        return employeeRepository.findByUser(authService.getCurrentUser())
            .orElseThrow(() -> new RuntimeException("Current user is not associated with an employee"));
    }

    /**
     * Get proficiency levels from minimum level
     */
    private List<EmployeeSkill.ProficiencyLevel> getProficiencyLevelsFromMinimum(EmployeeSkill.ProficiencyLevel minLevel) {
        return switch (minLevel) {
            case BEGINNER -> List.of(EmployeeSkill.ProficiencyLevel.BEGINNER, 
                                   EmployeeSkill.ProficiencyLevel.INTERMEDIATE,
                                   EmployeeSkill.ProficiencyLevel.ADVANCED, 
                                   EmployeeSkill.ProficiencyLevel.EXPERT);
            case INTERMEDIATE -> List.of(EmployeeSkill.ProficiencyLevel.INTERMEDIATE,
                                       EmployeeSkill.ProficiencyLevel.ADVANCED, 
                                       EmployeeSkill.ProficiencyLevel.EXPERT);
            case ADVANCED -> List.of(EmployeeSkill.ProficiencyLevel.ADVANCED, 
                                   EmployeeSkill.ProficiencyLevel.EXPERT);
            case EXPERT -> List.of(EmployeeSkill.ProficiencyLevel.EXPERT);
        };
    }

    /**
     * Create pageable from pagination request
     */
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    // ===== INNER CLASSES =====

    /**
     * Employee skill statistics
     */
    public static class EmployeeSkillStatistics {
        private final long totalSkills;
        private final long verifiedSkills;
        private final long beginnerSkills;
        private final long intermediateSkills;
        private final long advancedSkills;
        private final long expertSkills;

        public EmployeeSkillStatistics(long totalSkills, long verifiedSkills, long beginnerSkills,
                                     long intermediateSkills, long advancedSkills, long expertSkills) {
            this.totalSkills = totalSkills;
            this.verifiedSkills = verifiedSkills;
            this.beginnerSkills = beginnerSkills;
            this.intermediateSkills = intermediateSkills;
            this.advancedSkills = advancedSkills;
            this.expertSkills = expertSkills;
        }

        // Getters
        public long getTotalSkills() { return totalSkills; }
        public long getVerifiedSkills() { return verifiedSkills; }
        public long getBeginnerSkills() { return beginnerSkills; }
        public long getIntermediateSkills() { return intermediateSkills; }
        public long getAdvancedSkills() { return advancedSkills; }
        public long getExpertSkills() { return expertSkills; }
        
        public double getVerificationRate() {
            return totalSkills > 0 ? (double) verifiedSkills / totalSkills * 100 : 0;
        }
    }

    // ===== SECURITY HELPER METHODS FOR @PreAuthorize =====

    public boolean isCurrentUserOrManager(Long employeeId) {
        try {
            com.talentx.hrms.entity.core.User currentUser = authService.getCurrentUser();
            Employee employee = employeeRepository.findById(employeeId).orElse(null);
            if (employee == null) return false;
            if (employee.getUser() != null && employee.getUser().getId().equals(currentUser.getId())) return true;
            Employee currentEmployee = employeeRepository.findByUser(currentUser).orElse(null);
            if (currentEmployee == null) return false;
            return currentEmployee.getId().equals(employee.getManager() != null ? employee.getManager().getId() : null);
        } catch (Exception e) { return false; }
    }

    public boolean isCurrentUserOrManagerForEmployeeSkill(Long employeeSkillId) {
        try {
            EmployeeSkill skill = employeeSkillRepository.findById(employeeSkillId).orElse(null);
            if (skill == null) return false;
            return isCurrentUserOrManager(skill.getEmployee().getId());
        } catch (Exception e) { return false; }
    }
}

