package com.talentx.hrms.entity.employee;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Department;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employee_employment_history")
@Getter
@Setter
public class EmployeeEmploymentHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "job_level", length = 50)
    private String jobLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee manager;

    @Column(name = "salary_amount", precision = 15, scale = 2)
    private BigDecimal salaryAmount;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason")
    private HistoryReason reason;

    public enum HistoryReason {
        JOINING, PROMOTION, TRANSFER, SALARY_REVISION, ROLE_CHANGE
    }

    // Constructors
    public EmployeeEmploymentHistory() {}

    public EmployeeEmploymentHistory(Employee employee, LocalDate effectiveFrom, HistoryReason reason) {
        this.employee = employee;
        this.effectiveFrom = effectiveFrom;
        this.reason = reason;
    }

    // Backward compatibility methods for service layer
    public LocalDate getEffectiveDate() {
        return this.effectiveFrom;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveFrom = effectiveDate;
    }

    public LocalDate getEndDate() {
        return this.effectiveTo;
    }

    public void setEndDate(LocalDate endDate) {
        this.effectiveTo = endDate;
    }

    public BigDecimal getSalary() {
        return this.salaryAmount;
    }

    public void setSalary(BigDecimal salary) {
        this.salaryAmount = salary;
    }

    public String getSalaryCurrency() {
        // Default currency - services expect this but DB doesn't have it
        return "USD";
    }

    public void setSalaryCurrency(String currency) {
        // No-op - DB doesn't store currency at history level
    }

    public String getEmploymentStatus() {
        // Default status - services expect this but DB doesn't have it
        return "ACTIVE";
    }

    public String getEmploymentType() {
        // Default type - services expect this but DB doesn't have it
        return "FULL_TIME";
    }

    public BigDecimal getHourlyRate() {
        // Default hourly rate - services expect this but DB doesn't have it
        return BigDecimal.ZERO;
    }

    public Boolean getIsCurrent() {
        return this.effectiveTo == null;
    }

    public void setIsCurrent(Boolean isCurrent) {
        if (isCurrent != null && !isCurrent && this.effectiveTo == null) {
            this.effectiveTo = LocalDate.now();
        }
    }

    public String getChangeType() {
        return this.reason != null ? this.reason.name() : null;
    }

    public void setChangeType(String changeType) {
        // Map to reason enum if possible
        if (changeType != null) {
            try {
                this.reason = HistoryReason.valueOf(changeType);
            } catch (IllegalArgumentException e) {
                // Default to role change if unknown
                this.reason = HistoryReason.ROLE_CHANGE;
            }
        }
    }

    public String getChangeReason() {
        return this.reason != null ? this.reason.name() : null;
    }

    public void setChangeReason(String changeReason) {
        // Same as setChangeType
        setChangeType(changeReason);
    }

    public String getChangedBy() {
        // Services expect this but DB doesn't have it
        return "SYSTEM";
    }

    public void setChangedBy(String changedBy) {
        // No-op - DB doesn't store who made the change
    }
}

