package com.talentx.hrms.controller.skill;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.skills.EmployeeSkill;
import com.talentx.hrms.entity.skills.Skill;
import com.talentx.hrms.service.skill.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/skills")
@Tag(name = "Skills Management", description = "Skills catalog and employee skill tracking")
public class SkillController {

    private final SkillService skillService;

    @Autowired
    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    // ===== SKILL CATALOG ENDPOINTS =====

    /**
     * Create skill
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create skill", description = "Create a new skill in the catalog")
    public ResponseEntity<ApiResponse<Skill>> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        try {
            Skill skill = skillService.createSkill(request.getName(), request.getCategory(), request.getDescription());
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Skill created successfully", skill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all skills
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "List skills", description = "Get all skills with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<Skill>>> getSkills(
            @Parameter(description = "Skill name filter") @RequestParam(required = false) String name,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Description filter") @RequestParam(required = false) String description,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        
        Page<Skill> skills;
        if (name != null || category != null || description != null) {
            skills = skillService.searchSkills(name, category, description, paginationRequest);
        } else {
            skills = skillService.getSkills(paginationRequest);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Skills retrieved successfully", skills));
    }

    /**
     * Get skill by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get skill by ID", description = "Retrieve a specific skill by its ID")
    public ResponseEntity<ApiResponse<Skill>> getSkill(@PathVariable Long id) {
        try {
            Skill skill = skillService.getSkill(id);
            return ResponseEntity.ok(ApiResponse.success("Skill retrieved successfully", skill));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update skill
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update skill", description = "Update an existing skill")
    public ResponseEntity<ApiResponse<Skill>> updateSkill(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateSkillRequest request) {
        try {
            Skill skill = skillService.updateSkill(id, request.getName(), request.getCategory(), request.getDescription());
            return ResponseEntity.ok(ApiResponse.success("Skill updated successfully", skill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete skill
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete skill", description = "Delete a skill from the catalog")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable Long id) {
        try {
            skillService.deleteSkill(id);
            return ResponseEntity.ok(ApiResponse.success("Skill deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get skill categories
     */
    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get skill categories", description = "Get all distinct skill categories")
    public ResponseEntity<ApiResponse<List<String>>> getSkillCategories() {
        List<String> categories = skillService.getSkillCategories();
        return ResponseEntity.ok(ApiResponse.success("Skill categories retrieved successfully", categories));
    }

    /**
     * Get most popular skills
     */
    @GetMapping("/popular")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get popular skills", description = "Get most popular skills by employee count")
    public ResponseEntity<ApiResponse<List<Skill>>> getMostPopularSkills(
            @Parameter(description = "Number of skills to return") @RequestParam(defaultValue = "10") int limit) {
        List<Skill> skills = skillService.getMostPopularSkills(limit);
        return ResponseEntity.ok(ApiResponse.success("Popular skills retrieved successfully", skills));
    }

    // ===== EMPLOYEE SKILL ENDPOINTS =====

    /**
     * Add skill to employee
     */
    @PostMapping("/employee")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @skillService.isCurrentUserOrManager(#request.employeeId)")
    @Operation(summary = "Add skill to employee", description = "Add a skill to an employee's profile")
    public ResponseEntity<ApiResponse<EmployeeSkill>> addSkillToEmployee(@Valid @RequestBody AddEmployeeSkillRequest request) {
        try {
            EmployeeSkill employeeSkill = skillService.addSkillToEmployee(
                request.getEmployeeId(), 
                request.getSkillId(),
                request.getProficiencyLevel(),
                request.getYearsOfExperience(),
                request.getLastUsedYear()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Skill added to employee successfully", employeeSkill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update employee skill
     */
    @PutMapping("/employee/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @skillService.isCurrentUserOrManagerForEmployeeSkill(#id)")
    @Operation(summary = "Update employee skill", description = "Update an employee's skill proficiency and details")
    public ResponseEntity<ApiResponse<EmployeeSkill>> updateEmployeeSkill(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeSkillRequest request) {
        try {
            EmployeeSkill employeeSkill = skillService.updateEmployeeSkill(
                id,
                request.getProficiencyLevel(),
                request.getYearsOfExperience(),
                request.getLastUsedYear()
            );
            return ResponseEntity.ok(ApiResponse.success("Employee skill updated successfully", employeeSkill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Verify employee skill
     */
    @PutMapping("/employee/{id:\\d+}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Verify employee skill", description = "Verify an employee's skill proficiency")
    public ResponseEntity<ApiResponse<EmployeeSkill>> verifyEmployeeSkill(@PathVariable Long id) {
        try {
            EmployeeSkill employeeSkill = skillService.verifyEmployeeSkill(id);
            return ResponseEntity.ok(ApiResponse.success("Employee skill verified successfully", employeeSkill));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get employee skills
     */
    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @skillService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Get employee skills", description = "Get all skills for a specific employee")
    public ResponseEntity<ApiResponse<Page<EmployeeSkill>>> getEmployeeSkills(
            @PathVariable Long employeeId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeSkill> employeeSkills = skillService.getEmployeeSkills(employeeId, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Employee skills retrieved successfully", employeeSkills));
    }

    /**
     * Search employee skills
     */
    @GetMapping("/employee/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Search employee skills", description = "Search employee skills with various criteria")
    public ResponseEntity<ApiResponse<Page<EmployeeSkill>>> searchEmployeeSkills(
            @Parameter(description = "Employee ID filter") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Skill name filter") @RequestParam(required = false) String skillName,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Proficiency level filter") @RequestParam(required = false) EmployeeSkill.ProficiencyLevel proficiencyLevel,
            @Parameter(description = "Verification status filter") @RequestParam(required = false) Boolean verified,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<EmployeeSkill> employeeSkills = skillService.searchEmployeeSkills(
            employeeId, skillName, category, proficiencyLevel, verified, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Employee skills search completed", employeeSkills));
    }

    /**
     * Get employees with specific skill
     */
    @GetMapping("/{skillId:\\d+}/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get employees with skill", description = "Get all employees who have a specific skill")
    public ResponseEntity<ApiResponse<List<Employee>>> getEmployeesWithSkill(
            @PathVariable Long skillId,
            @Parameter(description = "Minimum proficiency level") @RequestParam(required = false) EmployeeSkill.ProficiencyLevel minProficiency) {
        
        List<Employee> employees;
        if (minProficiency != null) {
            employees = skillService.getEmployeesWithSkillAndProficiency(skillId, minProficiency);
        } else {
            employees = skillService.getEmployeesWithSkill(skillId);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Employees with skill retrieved successfully", employees));
    }

    /**
     * Remove skill from employee
     */
    @DeleteMapping("/employee/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @skillService.isCurrentUserOrManagerForEmployeeSkill(#id)")
    @Operation(summary = "Remove skill from employee", description = "Remove a skill from an employee's profile")
    public ResponseEntity<ApiResponse<Void>> removeSkillFromEmployee(@PathVariable Long id) {
        try {
            skillService.removeSkillFromEmployee(id);
            return ResponseEntity.ok(ApiResponse.success("Skill removed from employee successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get unverified skills
     */
    @GetMapping("/unverified")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get unverified skills", description = "Get all employee skills that need verification")
    public ResponseEntity<ApiResponse<List<EmployeeSkill>>> getUnverifiedSkills() {
        List<EmployeeSkill> unverifiedSkills = skillService.getUnverifiedSkills();
        return ResponseEntity.ok(ApiResponse.success("Unverified skills retrieved successfully", unverifiedSkills));
    }

    /**
     * Get employee skill statistics
     */
    @GetMapping("/employee/{employeeId:\\d+}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @skillService.isCurrentUserOrManager(#employeeId)")
    @Operation(summary = "Get employee skill statistics", description = "Get skill statistics for an employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeSkillStatistics(@PathVariable Long employeeId) {
        SkillService.EmployeeSkillStatistics stats = skillService.getEmployeeSkillStatistics(employeeId);
        
        Map<String, Object> statisticsMap = Map.of(
            "totalSkills", stats.getTotalSkills(),
            "verifiedSkills", stats.getVerifiedSkills(),
            "verificationRate", stats.getVerificationRate(),
            "beginnerSkills", stats.getBeginnerSkills(),
            "intermediateSkills", stats.getIntermediateSkills(),
            "advancedSkills", stats.getAdvancedSkills(),
            "expertSkills", stats.getExpertSkills()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Employee skill statistics retrieved successfully", statisticsMap));
    }

    // ===== REQUEST DTOs =====

    public static class CreateSkillRequest {
        @NotBlank(message = "Skill name is required")
        private String name;
        
        private String category;
        private String description;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class UpdateSkillRequest {
        @NotBlank(message = "Skill name is required")
        private String name;
        
        private String category;
        private String description;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class AddEmployeeSkillRequest {
        @NotNull(message = "Employee ID is required")
        private Long employeeId;
        
        @NotNull(message = "Skill ID is required")
        private Long skillId;
        
        @NotNull(message = "Proficiency level is required")
        private EmployeeSkill.ProficiencyLevel proficiencyLevel;
        
        private Integer yearsOfExperience;
        private Integer lastUsedYear;

        // Getters and setters
        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
        public Long getSkillId() { return skillId; }
        public void setSkillId(Long skillId) { this.skillId = skillId; }
        public EmployeeSkill.ProficiencyLevel getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(EmployeeSkill.ProficiencyLevel proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
        public Integer getYearsOfExperience() { return yearsOfExperience; }
        public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
        public Integer getLastUsedYear() { return lastUsedYear; }
        public void setLastUsedYear(Integer lastUsedYear) { this.lastUsedYear = lastUsedYear; }
    }

    public static class UpdateEmployeeSkillRequest {
        @NotNull(message = "Proficiency level is required")
        private EmployeeSkill.ProficiencyLevel proficiencyLevel;
        
        private Integer yearsOfExperience;
        private Integer lastUsedYear;

        // Getters and setters
        public EmployeeSkill.ProficiencyLevel getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(EmployeeSkill.ProficiencyLevel proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
        public Integer getYearsOfExperience() { return yearsOfExperience; }
        public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
        public Integer getLastUsedYear() { return lastUsedYear; }
        public void setLastUsedYear(Integer lastUsedYear) { this.lastUsedYear = lastUsedYear; }
    }
}

