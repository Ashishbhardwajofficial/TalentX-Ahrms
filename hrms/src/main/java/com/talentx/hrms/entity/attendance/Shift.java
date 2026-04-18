package com.talentx.hrms.entity.attendance;

import com.talentx.hrms.entity.core.Organization;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "shifts")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_id")
    private Long id;

    @NotNull(message = "Organization is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "break_start_time")
    private LocalTime breakStartTime;

    @Column(name = "break_end_time")
    private LocalTime breakEndTime;

    @Column(name = "break_minutes")
    private Integer breakMinutes = 0;

    @Column(name = "grace_period_minutes")
    private Integer gracePeriodMinutes = 15;

    @Column(name = "is_night_shift")
    private Boolean isNightShift = false;

    @Column(name = "is_flexible")
    private Boolean isFlexible = false;

    @Column(name = "minimum_hours")
    private BigDecimal minimumHours;

    @Column(name = "total_hours")
    private BigDecimal totalHours;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "shift", fetch = FetchType.LAZY)
    private List<EmployeeShift> employeeShifts = new ArrayList<>();

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
    public Shift() {}

    public Shift(String name, LocalTime startTime, LocalTime endTime, Organization organization) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.organization = organization;
    }

    // Helper methods
    public boolean hasBreak() {
        return breakMinutes != null && breakMinutes > 0;
    }
}

