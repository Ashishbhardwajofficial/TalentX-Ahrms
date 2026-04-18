package com.talentx.hrms.entity.core;

import com.talentx.hrms.entity.security.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "username"),
    @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Size(max = 100, message = "Username must not exceed 100 characters")
    @Column(name = "username", unique = true)
    private String username;

    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Column(name = "first_name")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Column(name = "last_name")
    private String lastName;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column(name = "phone")
    private String phone;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "last_login_at")
    private Timestamp lastLoginAt;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private Timestamp lockedUntil;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private Timestamp passwordResetExpires;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "account_locked")
    private Boolean accountLocked = false;

    @Column(name = "account_expired")
    private Boolean accountExpired = false;

    @Column(name = "credentials_expired")
    private Boolean credentialsExpired = false;

    @Column(name = "password_changed_at")
    private Timestamp passwordChangedAt;

    @Column(name = "must_change_password")
    private Boolean mustChangePassword = false;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserRole> userRoles = new ArrayList<>();

    // Constructors
    public User() {}

    public User(String username, String email, String passwordHash, Organization organization) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
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

    // Compatibility methods for existing code
    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        this.isActive = active;
    }

    public Boolean getEmailVerified() {
        return isVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.isVerified = emailVerified;
    }

    public String getPassword() {
        return passwordHash;
    }

    public void setPassword(String password) {
        this.passwordHash = password;
    }

    public List<UserRole> getRoles() {
        return userRoles;
    }

    public void setRoles(List<UserRole> roles) {
        this.userRoles = roles;
    }

    // Boolean helper methods
    public boolean isMustChangePassword() {
        return Boolean.TRUE.equals(mustChangePassword);
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(isActive);
    }

    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive);
    }

    // Business logic methods

    // Business logic methods
    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts = (this.failedLoginAttempts == null) ? 1 : this.failedLoginAttempts + 1;
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
    }

    public void recordSuccessfulLogin() {
        this.lastLoginAt = new Timestamp(System.currentTimeMillis());
        resetFailedLoginAttempts();
    }

    // Spring Security UserDetails compatibility methods
    public boolean isAccountNonLocked() {
        return !Boolean.TRUE.equals(accountLocked);
    }

    public boolean isAccountNonExpired() {
        return !Boolean.TRUE.equals(accountExpired);
    }

    public boolean isCredentialsNonExpired() {
        return !Boolean.TRUE.equals(credentialsExpired);
    }

    // Name-related methods
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        }
        return email;
    }
}

