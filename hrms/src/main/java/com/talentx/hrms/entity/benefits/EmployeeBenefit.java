package com.talentx.hrms.entity.benefits;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "employee_benefits")
@AttributeOverride(name = "id", column = @Column(name = "employee_benefit_id"))
@Getter
@Setter
public class EmployeeBenefit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "benefit_plan_id", nullable = false)
    private BenefitPlan benefitPlan;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EmployeeBenefitStatus status = EmployeeBenefitStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "coverage_level")
    private CoverageLevel coverageLevel;

    @Column(name = "beneficiaries", columnDefinition = "JSON")
    private String beneficiaries;

    // Backward compatibility methods for service layer
    public String getNotes() {
        return null; // This field doesn't exist in database schema
    }

    public void setNotes(String notes) {
        // This field doesn't exist in database schema - ignore
    }

    public Boolean getIsActive() {
        return status == EmployeeBenefitStatus.ACTIVE;
    }

    public void setIsActive(Boolean isActive) {
        if (Boolean.TRUE.equals(isActive)) {
            this.status = EmployeeBenefitStatus.ACTIVE;
        } else {
            this.status = EmployeeBenefitStatus.TERMINATED;
        }
    }

    public enum EmployeeBenefitStatus {
        ACTIVE, PENDING, TERMINATED, SUSPENDED
    }

    public enum CoverageLevel {
        EMPLOYEE_ONLY, EMPLOYEE_SPOUSE, EMPLOYEE_CHILDREN, FAMILY
    }

    // Constructors
    public EmployeeBenefit() {}

    public EmployeeBenefit(Employee employee, BenefitPlan benefitPlan, LocalDate enrollmentDate) {
        this.employee = employee;
        this.benefitPlan = benefitPlan;
        this.enrollmentDate = enrollmentDate;
        this.effectiveDate = enrollmentDate;
    }

    // Getters and Setters (manually added due to Lombok processing issues)
    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public BenefitPlan getBenefitPlan() {
        return benefitPlan;
    }

    public void setBenefitPlan(BenefitPlan benefitPlan) {
        this.benefitPlan = benefitPlan;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getTerminationDate() {
        return terminationDate;
    }

    public void setTerminationDate(LocalDate terminationDate) {
        this.terminationDate = terminationDate;
    }

    public EmployeeBenefitStatus getStatus() {
        return status;
    }

    public void setStatus(EmployeeBenefitStatus status) {
        this.status = status;
    }

    public CoverageLevel getCoverageLevel() {
        return coverageLevel;
    }

    public void setCoverageLevel(CoverageLevel coverageLevel) {
        this.coverageLevel = coverageLevel;
    }

    public String getBeneficiaries() {
        return beneficiaries;
    }

    public void setBeneficiaries(String beneficiaries) {
        this.beneficiaries = beneficiaries;
    }
}

