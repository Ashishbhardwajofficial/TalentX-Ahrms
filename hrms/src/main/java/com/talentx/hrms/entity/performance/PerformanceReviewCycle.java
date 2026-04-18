package com.talentx.hrms.entity.performance;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "performance_review_cycles")
@AttributeOverride(name = "id", column = @Column(name = "performance_review_cycle_id"))
@Getter
@Setter
public class PerformanceReviewCycle extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", nullable = false)
    private ReviewType reviewType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "self_review_deadline")
    private LocalDate selfReviewDeadline;

    @Column(name = "manager_review_deadline")
    private LocalDate managerReviewDeadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReviewCycleStatus status = ReviewCycleStatus.DRAFT;

    @OneToMany(mappedBy = "reviewCycle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PerformanceReview> reviews = new ArrayList<>();

    public enum ReviewType {
        ANNUAL, SEMI_ANNUAL, QUARTERLY, PROBATION, PROJECT_BASED
    }

    public enum ReviewCycleStatus {
        DRAFT, ACTIVE, COMPLETED, CANCELLED
    }

    // Constructors
    public PerformanceReviewCycle() {}

    public PerformanceReviewCycle(Organization organization, String name, ReviewType reviewType, 
                                 LocalDate startDate, LocalDate endDate) {
        this.organization = organization;
        this.name = name;
        this.reviewType = reviewType;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

