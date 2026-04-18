package com.talentx.hrms.entity.training;

import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "training_enrollments")
@Getter
@Setter
public class TrainingEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_program_id", nullable = false)
    private TrainingProgram trainingProgram;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "enrolled_date", nullable = false)
    private LocalDate enrolledDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "passing_score", precision = 5, scale = 2)
    private BigDecimal passingScore;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee assignedBy;

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

    public enum EnrollmentStatus {
        ENROLLED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED, EXPIRED
    }

    // Constructors
    public TrainingEnrollment() {
    }

    public TrainingEnrollment(TrainingProgram trainingProgram, Employee employee, LocalDate enrolledDate) {
        this.trainingProgram = trainingProgram;
        this.employee = employee;
        this.enrolledDate = enrolledDate;
        this.status = EnrollmentStatus.ENROLLED;
    }
}

