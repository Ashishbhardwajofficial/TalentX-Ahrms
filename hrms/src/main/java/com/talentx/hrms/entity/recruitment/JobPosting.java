package com.talentx.hrms.entity.recruitment;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Location;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "job_postings",
        indexes = {
                @Index(name = "idx_job_org", columnList = "organization_id"),
                @Index(name = "idx_job_status", columnList = "status"),
                @Index(name = "idx_job_posted_date", columnList = "posted_date")
        }
)
@AttributeOverride(name = "id", column = @Column(name = "job_posting_id"))
@Getter
@Setter
@NoArgsConstructor
public class JobPosting extends BaseEntity {

    // =====================================================
    // CORE FIELDS
    // =====================================================

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    private EmploymentType employmentType;

    @Column(name = "job_level", length = 50)
    private String jobLevel;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "responsibilities", columnDefinition = "TEXT")
    private String responsibilities;

    // =====================================================
    // COMPENSATION
    // =====================================================

    @Column(name = "salary_min", precision = 15, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 15, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "salary_currency", length = 3)
    private String salaryCurrency;

    // =====================================================
    // HIRING DETAILS
    // =====================================================

    @Column(name = "openings", nullable = false)
    private Integer openings = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private JobPostingStatus status = JobPostingStatus.DRAFT;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hiring_manager_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee hiringManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee recruiter;

    // =====================================================
    // OWNERSHIP & AUDIT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_employee_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee createdByEmployee;

    // =====================================================
    // RELATIONSHIPS
    // =====================================================

    @JsonIgnore
    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();

    // =====================================================
    // ENUMS
    // =====================================================

    public enum JobPostingStatus {
        DRAFT,
        OPEN,
        CLOSED,
        ON_HOLD,
        CANCELLED
    }

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public JobPosting(String title,
                      EmploymentType employmentType,
                      Organization organization) {
        this.title = title;
        this.employmentType = employmentType;
        this.organization = organization;
    }

    // =====================================================
    // DERIVED / BUSINESS LOGIC
    // =====================================================

    @Transient
    private Integer positionsFilled = 0;

    public boolean isActive() {
        return JobPostingStatus.OPEN.equals(this.status);
    }

    public boolean isExpired() {
        return closingDate != null && closingDate.isBefore(LocalDate.now());
    }

    public boolean hasOpenPositions() {
        return openings != null && positionsFilled != null && openings > positionsFilled;
    }

    // =====================================================
    // STATUS HELPERS (STRING SAFE)
    // =====================================================

    public void setStatusFromString(String statusStr) {
        if (statusStr == null) {
            return;
        }
        try {
            this.status = JobPostingStatus.valueOf(statusStr.toUpperCase());
        } catch (Exception ex) {
            this.status = JobPostingStatus.DRAFT;
        }
    }

    public String getStatusAsString() {
        return status != null ? status.name() : null;
    }
}
