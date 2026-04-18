package com.talentx.hrms.entity.attendance;

import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "employee_shifts")
public class EmployeeShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_shift_id")
    private Long id;

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull(message = "Shift is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @NotNull(message = "Effective from date is required")
    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Additional fields for compatibility with service layer
    @Transient
    private LocalDate effectiveDate;

    @Transient
    private LocalDate endDate;

    @Transient
    private Boolean isCurrent;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        // Sync transient fields with persistent fields
        syncTransientFields();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        // Sync transient fields with persistent fields
        syncTransientFields();
    }

    @PostLoad
    protected void onLoad() {
        // Sync transient fields after loading from database
        syncTransientFields();
    }

    // Sync transient fields with persistent fields
    private void syncTransientFields() {
        this.effectiveDate = this.effectiveFrom;
        this.endDate = this.effectiveTo;
        this.isCurrent = this.isActive;
    }

    // Override setters for transient fields to sync with persistent fields
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
        this.effectiveFrom = effectiveDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        this.effectiveTo = endDate;
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.isCurrent = isCurrent;
        this.isActive = isCurrent;
    }

    // Constructors
    public EmployeeShift() {
    }

    public EmployeeShift(Employee employee, Shift shift, LocalDate effectiveFrom) {
        this.employee = employee;
        this.shift = shift;
        this.effectiveFrom = effectiveFrom;
        this.effectiveDate = effectiveFrom;
    }

    // Helper methods
    public boolean isActive() {
        return Boolean.TRUE.equals(isActive) &&
                (effectiveTo == null || effectiveTo.isAfter(LocalDate.now()));
    }

    public boolean isActiveOn(LocalDate date) {
        return !date.isBefore(effectiveFrom) &&
                (effectiveTo == null || !date.isAfter(effectiveTo));
    }
}

