package com.talentx.hrms.dto.skill;

import com.talentx.hrms.entity.skills.EmployeeSkill.ProficiencyLevel;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class EmployeeSkillCreateDTO {
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    @NotNull(message = "Skill ID is required")
    private Long skillId;
    
    private ProficiencyLevel proficiencyLevel;
    
    private Integer yearsOfExperience;
    
    private LocalDate lastUsedDate;
    
    private Boolean isCertified = false;
    
    private String certificationName;
    
    private LocalDate certificationDate;
    
    private LocalDate certificationExpiryDate;
    
    // Constructors
    public EmployeeSkillCreateDTO() {}
    
    // Getters and Setters
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public Long getSkillId() {
        return skillId;
    }
    
    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }
    
    public ProficiencyLevel getProficiencyLevel() {
        return proficiencyLevel;
    }
    
    public void setProficiencyLevel(ProficiencyLevel proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }
    
    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }
    
    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
    
    public LocalDate getLastUsedDate() {
        return lastUsedDate;
    }
    
    public void setLastUsedDate(LocalDate lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
    }
    
    public Boolean getIsCertified() {
        return isCertified;
    }
    
    public void setIsCertified(Boolean isCertified) {
        this.isCertified = isCertified;
    }
    
    public String getCertificationName() {
        return certificationName;
    }
    
    public void setCertificationName(String certificationName) {
        this.certificationName = certificationName;
    }
    
    public LocalDate getCertificationDate() {
        return certificationDate;
    }
    
    public void setCertificationDate(LocalDate certificationDate) {
        this.certificationDate = certificationDate;
    }
    
    public LocalDate getCertificationExpiryDate() {
        return certificationExpiryDate;
    }
    
    public void setCertificationExpiryDate(LocalDate certificationExpiryDate) {
        this.certificationExpiryDate = certificationExpiryDate;
    }
}

