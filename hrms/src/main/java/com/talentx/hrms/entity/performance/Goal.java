package com.talentx.hrms.entity.performance;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
@Getter
@Setter
// BaseEntity.createdBy (String) conflicts with goals.created_by (bigint FK).
// Remap BaseEntity's string field to a non-existent column so it is ignored,
// and use createdByEmployee as the actual FK to employees.
@AttributeOverride(name = "id",        column = @Column(name = "goal_id"))
@AttributeOverride(name = "createdBy", column = @Column(name = "created_by_audit", insertable = false, updatable = false))
public class Goal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false)
    private GoalType goalType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private GoalCategory category;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GoalStatus status = GoalStatus.NOT_STARTED;

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "measurement_criteria", columnDefinition = "TEXT")
    private String measurementCriteria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Employee createdByEmployee;

    public enum GoalType {
        INDIVIDUAL, TEAM, DEPARTMENTAL, ORGANIZATIONAL
    }

    public enum GoalCategory {
        PERFORMANCE, DEVELOPMENT, BEHAVIORAL, PROJECT
    }

    public enum GoalStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED, DEFERRED
    }

    // Constructors
    public Goal() {}

    public Goal(Employee employee, String title, GoalType goalType, GoalCategory category) {
        this.employee = employee;
        this.title = title;
        this.goalType = goalType;
        this.category = category;
    }

    // Methods for service layer compatibility
    public Employee getCreatedByEmployee() {
        return createdByEmployee;
    }

    public void setCreatedByEmployee(Employee employee) {
        this.createdByEmployee = employee;
    }
}

