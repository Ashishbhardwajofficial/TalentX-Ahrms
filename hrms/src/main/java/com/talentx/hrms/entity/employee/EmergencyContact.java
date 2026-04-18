package com.talentx.hrms.entity.employee;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.sql.Timestamp;

@Entity
@Table(name = "emergency_contacts")
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emergency_contact_id")
    private Long id;

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 100, message = "Relationship must not exceed 100 characters")
    @Column(name = "relationship")
    private String relationship;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Size(max = 20, message = "Alternate phone must not exceed 20 characters")
    @Column(name = "alternate_phone")
    private String alternatePhone;

    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(name = "email")
    private String email;

    @Column(name = "address")
    private String address;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    // Constructors
    public EmergencyContact() {}

    public EmergencyContact(String name, String relationship, String phoneNumber, Employee employee) {
        this.name = name;
        this.relationship = relationship;
        this.phoneNumber = phoneNumber;
        this.employee = employee;
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

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAlternatePhone() {
        return alternatePhone;
    }

    public void setAlternatePhone(String alternatePhone) {
        this.alternatePhone = alternatePhone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
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

    // Compatibility methods for existing code
    public String getContactName() {
        return name;
    }

    public void setContactName(String contactName) {
        this.name = contactName;
    }

    public String getPrimaryPhone() {
        return phoneNumber;
    }

    public void setPrimaryPhone(String primaryPhone) {
        this.phoneNumber = primaryPhone;
    }

    public String getSecondaryPhone() {
        return alternatePhone;
    }

    public void setSecondaryPhone(String secondaryPhone) {
        this.alternatePhone = secondaryPhone;
    }

    // Helper methods
    public String getBestContactPhone() {
        return phoneNumber != null ? phoneNumber : alternatePhone;
    }

    public boolean hasContactInfo() {
        return phoneNumber != null || alternatePhone != null || email != null;
    }
}

