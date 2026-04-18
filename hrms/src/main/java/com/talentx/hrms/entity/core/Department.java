package com.talentx.hrms.entity.core;

import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"code", "organization_id"})
})
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long id;

    @NotBlank(message = "Department name is required")
    @Size(max = 255, message = "Department name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 50, message = "Department code must not exceed 50 characters")
    @Column(name = "code")
    private String code;

    @Column(name = "description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_department_id")
    private Department parentDepartment;

    @OneToMany(mappedBy = "parentDepartment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Department> subDepartments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Employee manager;

    @Size(max = 50, message = "Cost center must not exceed 50 characters")
    @Column(name = "cost_center")
    private String costCenter;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    @Column(name = "location")
    private String location;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    // Constructors
    public Department() {}

    public Department(String name, String code, Organization organization) {
        this.name = name;
        this.code = code;
        this.organization = organization;
    }

    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public Department getParentDepartment() {
        return parentDepartment;
    }

    public void setParentDepartment(Department parentDepartment) {
        this.parentDepartment = parentDepartment;
    }

    public List<Department> getSubDepartments() {
        return subDepartments;
    }

    public void setSubDepartments(List<Department> subDepartments) {
        this.subDepartments = subDepartments;
    }

    public Employee getManager() {
        return manager;
    }

    public void setManager(Employee manager) {
        this.manager = manager;
    }

    public String getCostCenter() {
        return costCenter;
    }

    public void setCostCenter(String costCenter) {
        this.costCenter = costCenter;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods
    public void addSubDepartment(Department subDepartment) {
        subDepartments.add(subDepartment);
        subDepartment.setParentDepartment(this);
    }

    public void removeSubDepartment(Department subDepartment) {
        subDepartments.remove(subDepartment);
        subDepartment.setParentDepartment(null);
    }

    public boolean isRootDepartment() {
        return parentDepartment == null;
    }

    public boolean hasSubDepartments() {
        return !subDepartments.isEmpty();
    }
}

