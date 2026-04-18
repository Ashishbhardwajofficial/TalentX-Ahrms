package com.talentx.hrms.entity.attendance;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.enums.HolidayType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "holidays", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "holiday_date"})
})
@Getter
@Setter
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "holiday_id")
    private Long holidayId;

    @NotNull(message = "Organization is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @NotNull(message = "Holiday date is required")
    @Column(name = "holiday_date", nullable = false)
    private LocalDate holidayDate;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "holiday_type")
    private HolidayType holidayType;

    @Column(name = "is_optional")
    private Boolean isOptional = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Constructors
    public Holiday() {}

    public Holiday(Organization organization, LocalDate holidayDate, String name, HolidayType holidayType) {
        this.organization = organization;
        this.holidayDate = holidayDate;
        this.name = name;
        this.holidayType = holidayType;
    }

    // Helper methods
    public boolean isHolidayOn(LocalDate date) {
        return holidayDate.equals(date);
    }

    // Getters and Setters (manually added due to Lombok processing issues)
    public Long getHolidayId() {
        return holidayId;
    }

    public void setHolidayId(Long holidayId) {
        this.holidayId = holidayId;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public HolidayType getHolidayType() {
        return holidayType;
    }

    public void setHolidayType(HolidayType holidayType) {
        this.holidayType = holidayType;
    }

    public Boolean getIsOptional() {
        return isOptional;
    }

    public void setIsOptional(Boolean isOptional) {
        this.isOptional = isOptional;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return null; // Field doesn't exist in database
    }

    public void setUpdatedAt(Instant updatedAt) {
        // Field doesn't exist in database
    }

    // Backward compatibility methods for service layer
    public Long getId() {
        return holidayId;
    }

    public void setId(Long id) {
        this.holidayId = id;
    }

    public String getHolidayName() {
        return name;
    }

    public void setHolidayName(String holidayName) {
        this.name = holidayName;
    }

    public LocalDate getHolidayDate() {
        return holidayDate;
    }

    public void setHolidayDate(LocalDate holidayDate) {
        this.holidayDate = holidayDate;
    }

    public String getDescription() {
        return null; // Field doesn't exist in database
    }

    public void setDescription(String description) {
        // Field doesn't exist in database
    }

    public String getHolidayTypeString() {
        return holidayType != null ? holidayType.name() : null;
    }

    public void setHolidayTypeString(String holidayType) {
        if (holidayType != null) {
            try {
                this.holidayType = HolidayType.valueOf(holidayType);
            } catch (IllegalArgumentException e) {
                // Invalid holiday type
            }
        }
    }

    public Boolean getIsMandatory() {
        return !Boolean.TRUE.equals(isOptional);
    }

    public void setIsMandatory(Boolean isMandatory) {
        this.isOptional = !Boolean.TRUE.equals(isMandatory);
    }

    public Boolean getIsRecurring() {
        return false; // Field doesn't exist in database
    }

    public void setIsRecurring(Boolean isRecurring) {
        // Field doesn't exist in database
    }

    public String getApplicableLocations() {
        return null; // Field doesn't exist in database
    }

    public void setApplicableLocations(String applicableLocations) {
        // Field doesn't exist in database
    }
}

