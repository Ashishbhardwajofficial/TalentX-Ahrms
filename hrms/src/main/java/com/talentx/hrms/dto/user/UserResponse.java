package com.talentx.hrms.dto.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    @JsonProperty("isActive")
    private Boolean isActive;
    @JsonProperty("isVerified")
    private Boolean isVerified;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp lastLoginAt;
    private Integer failedLoginAttempts;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp lockedUntil;
    private Boolean twoFactorEnabled;
    private Boolean accountExpired;
    private Boolean credentialsExpired;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp passwordChangedAt;
    private Boolean mustChangePassword;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private Timestamp updatedAt;
    private Long organizationId;
    private String organizationName;
    private List<RoleInfo> roles = new ArrayList<>();

    // Constructors
    public UserResponse() {}

    // Compatibility methods for backward compatibility
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

    public Boolean getAccountLocked() {
        return lockedUntil != null && lockedUntil.after(new Timestamp(System.currentTimeMillis()));
    }

    public void setAccountLocked(Boolean accountLocked) {
        // This is a computed field, so we don't set it directly
    }

    // Inner class for role information
    @Getter
    @Setter
    public static class RoleInfo {
        private Long id;
        private String name;
        private String description;
        @JsonProperty("isActive")
        private Boolean isActive;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        private Timestamp assignedAt;

        public RoleInfo() {}

        public RoleInfo(Long id, String name, String description, Boolean isActive, Timestamp assignedAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.isActive = isActive;
            this.assignedAt = assignedAt;
        }
    }
}

