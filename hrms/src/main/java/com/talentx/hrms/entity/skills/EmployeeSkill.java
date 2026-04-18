package com.talentx.hrms.entity.skills;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "skill_id"})
})
@Getter
@Setter
public class EmployeeSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false)
    private ProficiencyLevel proficiencyLevel;

    @Column(name = "years_of_experience", precision = 4, scale = 1)
    private BigDecimal yearsOfExperience;

    @Column(name = "last_used_year")
    private Integer lastUsedYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private Employee verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    public enum ProficiencyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }

    // Constructors
    public EmployeeSkill() {}

    public EmployeeSkill(Employee employee, Skill skill, ProficiencyLevel proficiencyLevel) {
        this.employee = employee;
        this.skill = skill;
        this.proficiencyLevel = proficiencyLevel;
    }

    // Business logic methods
    public void verify(Employee verifier) {
        this.verifiedBy = verifier;
        this.verifiedAt = LocalDateTime.now();
    }
}

