package com.talentx.hrms.entity.attendance;

import com.talentx.hrms.entity.core.Organization;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "leave_calendar", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "calendar_date"})
})
@Getter
@Setter
public class LeaveCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Organization is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @NotNull(message = "Calendar date is required")
    @Column(name = "calendar_date", nullable = false)
    private LocalDate calendarDate;

    @NotNull(message = "Day type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", nullable = false)
    private DayType dayType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "holiday_id")
    private Holiday holiday;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Constructors
    public LeaveCalendar() {}

    public LeaveCalendar(Organization organization, LocalDate calendarDate, DayType dayType) {
        this.organization = organization;
        this.calendarDate = calendarDate;
        this.dayType = dayType;
    }

    // Enum for day type
    public enum DayType {
        WORKING, HOLIDAY, WEEKEND
    }
}

