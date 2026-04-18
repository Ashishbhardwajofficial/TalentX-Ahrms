package com.talentx.hrms.entity.finance;

import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.AccountType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "employee_bank_details", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "account_number"})
})
@Getter
@Setter
public class EmployeeBankDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_bank_detail_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "branch_name")
    private String branchName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = true;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "external_account_type")
    @Enumerated(EnumType.STRING)
    private AccountType externalAccountType;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

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

    // Constructors
    public EmployeeBankDetail() {}

    public EmployeeBankDetail(Employee employee, String bankName, String accountNumber, AccountType accountType) {
        this.employee = employee;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountType = accountType;
    }

    // Utility method for masked account number
    public String getMaskedAccountNumber() {
        if (accountNumber == null || accountNumber.length() < 4) {
            return accountNumber;
        }
        String lastFour = accountNumber.substring(accountNumber.length() - 4);
        return "****" + lastFour;
    }

    // Convenience methods for boolean fields
    public Boolean isActive() {
        return active;
    }

    public void setIsActive(Boolean active) {
        this.active = active;
    }

    public Boolean isPrimary() {
        return isPrimary;
    }

    public void setExternalAccountType(AccountType externalAccountType) {
        this.externalAccountType = externalAccountType;
    }

    public AccountType getExternalAccountType() {
        return externalAccountType;
    }
}

