package com.talentx.hrms.entity.training;

import com.talentx.hrms.entity.core.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "training_programs",
        indexes = {
                @Index(name = "idx_training_org", columnList = "organization_id"),
                @Index(name = "idx_training_active", columnList = "is_active"),
                @Index(name = "idx_training_type", columnList = "training_type")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class TrainingProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "training_program_id")
    private Long id;

    // ================== RELATIONSHIPS ==================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // ================== CORE FIELDS ==================

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "training_type", nullable = false)
    private TrainingType trainingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", nullable = false)
    private DeliveryMethod deliveryMethod;

    @Column(name = "duration_hours", precision = 6, scale = 2)
    private BigDecimal durationHours;

    @Column(name = "cost_per_participant", precision = 10, scale = 2)
    private BigDecimal costPerParticipant;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "provider", length = 200)
    private String provider;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    // ================== FLAGS ==================

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory = Boolean.FALSE;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    // ================== AUDIT FIELDS ==================

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // ================== ENTITY LIFECYCLE ==================

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ================== ENUMS ==================

    public enum TrainingType {
        ONBOARDING,
        COMPLIANCE,
        TECHNICAL,
        SOFT_SKILLS,
        LEADERSHIP,
        SAFETY
    }

    public enum DeliveryMethod {
        IN_PERSON,
        ONLINE,
        HYBRID,
        SELF_PACED
    }

    // ================== CONSTRUCTORS ==================

    public TrainingProgram(Organization organization,
                           String title,
                           TrainingType trainingType,
                           DeliveryMethod deliveryMethod,
                           Boolean isMandatory) {
        this.organization = organization;
        this.title = title;
        this.trainingType = trainingType;
        this.deliveryMethod = deliveryMethod;
        this.isMandatory = isMandatory;
    }

    // ================== BUSINESS METHODS ==================

    public Long getOrganizationId() {
        return organization != null ? organization.getId() : null;
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
