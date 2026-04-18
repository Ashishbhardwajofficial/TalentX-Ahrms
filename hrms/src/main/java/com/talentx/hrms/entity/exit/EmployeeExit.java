package com.talentx.hrms.entity.exit;

import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.ExitStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "employee_exits")
@Getter
@Setter
public class EmployeeExit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_exit_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "resignation_date")
    private LocalDate resignationDate;

    @Column(name = "last_working_day")
    private LocalDate lastWorkingDay;

    @Column(name = "exit_reason")
    private String exitReason;

    @Column(name = "notes")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExitStatus status = ExitStatus.INITIATED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee approvedBy;

    @Column(name = "approved_at")
    private LocalDate approvedAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Constructors
    public EmployeeExit() {}

    public EmployeeExit(Employee employee, ExitStatus status) {
        this.employee = employee;
        this.status = status;
    }

    // Business logic methods
    public boolean canBeApproved() {
        return status == ExitStatus.INITIATED || status == ExitStatus.PENDING;
    }

    public boolean canBeWithdrawn() {
        return status == ExitStatus.INITIATED || status == ExitStatus.PENDING;
    }

    public boolean canBeCompleted() {
        return status == ExitStatus.APPROVED;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDate approvedAt) {
        this.approvedAt = approvedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

