package com.talentx.hrms.entity.employee;

import com.talentx.hrms.entity.enums.AddressType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.sql.Timestamp;

@Entity
@Table(name = "employee_addresses")
public class EmployeeAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_address_id")
    private Long id;

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "address_type")
    private AddressType addressType;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    @Column(name = "address_line1", nullable = false)
    private String addressLine1;

    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    @Column(name = "address_line2")
    private String addressLine2;

    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(name = "city")
    private String city;

    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    @Column(name = "state_province")
    private String stateProvince;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    @Column(name = "postal_code")
    private String postalCode;

    @Size(max = 2, message = "Country must be 2 characters")
    @Column(name = "country")
    private String country;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    // Constructors
    public EmployeeAddress() {}

    public EmployeeAddress(AddressType addressType, Employee employee) {
        this.addressType = addressType;
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

    public AddressType getAddressType() {
        return addressType;
    }

    public void setAddressType(AddressType addressType) {
        this.addressType = addressType;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStateProvince() {
        return stateProvince;
    }

    public void setStateProvince(String stateProvince) {
        this.stateProvince = stateProvince;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
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

    // Helper methods
    public String getFullAddress() {
        StringBuilder address = new StringBuilder();
        if (addressLine1 != null) address.append(addressLine1);
        if (addressLine2 != null) {
            if (address.length() > 0) address.append(", ");
            address.append(addressLine2);
        }
        if (city != null) {
            if (address.length() > 0) address.append(", ");
            address.append(city);
        }
        if (stateProvince != null) {
            if (address.length() > 0) address.append(", ");
            address.append(stateProvince);
        }
        if (postalCode != null) {
            if (address.length() > 0) address.append(" ");
            address.append(postalCode);
        }
        if (country != null) {
            if (address.length() > 0) address.append(", ");
            address.append(country);
        }
        return address.toString();
    }
}

