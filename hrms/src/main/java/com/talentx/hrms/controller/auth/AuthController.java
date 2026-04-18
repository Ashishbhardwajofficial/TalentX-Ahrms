package com.talentx.hrms.controller.auth;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.dto.auth.JwtResponse;
import com.talentx.hrms.dto.auth.LoginRequest;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication and user management endpoints")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login endpoint
     */
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and generate JWT token")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticate(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", jwtResponse));
    }

    /**
     * Logout endpoint
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "User logout", description = "Logout current user and invalidate session")
    public ResponseEntity<ApiResponse<Void>> logout() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }

    /**
     * Get current user information
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user", description = "Get information about the currently authenticated user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        User user = authService.getCurrentUser();

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", user.getEmail());
        userInfo.put("firstName", user.getFirstName());
        userInfo.put("lastName", user.getLastName());
        userInfo.put("organizationId", user.getOrganization().getId());
        userInfo.put("organizationName", user.getOrganization().getName());
        userInfo.put("roles", user.getUserRoles().stream()
            .map(ur -> ur.getRole().getName())
            .toList());
        userInfo.put("isEnabled", user.isEnabled());
        userInfo.put("isAccountNonLocked", user.isAccountNonLocked());
        userInfo.put("mustChangePassword", user.isMustChangePassword());

        return ResponseEntity.ok(ApiResponse.success("User information retrieved", userInfo));
    }

    /**
     * Refresh JWT token
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh JWT token before expiration")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid authorization header"));
        }

        String token = authHeader.substring(7);
        JwtResponse jwtResponse = authService.refreshToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", jwtResponse));
    }

    /**
     * Change password
     */
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change password", description = "Change password for the current user")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        authService.changePassword(currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    /**
     * Check username availability
     */
    @GetMapping("/check-username")
    @Operation(summary = "Check username availability", description = "Check if a username is available for registration")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUsername(@RequestParam String username) {
        boolean available = authService.isUsernameAvailable(username);
        Map<String, Boolean> result = new HashMap<>();
        result.put("available", available);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Check email availability
     */
    @GetMapping("/check-email")
    @Operation(summary = "Check email availability", description = "Check if an email is available for registration")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEmail(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);
        Map<String, Boolean> result = new HashMap<>();
        result.put("available", available);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Reset password (admin function)
     */
    @PostMapping("/reset-password/{userId:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset user password", description = "Reset password for a specific user (admin only)")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long userId,
            @RequestParam String newPassword) {
        authService.resetPassword(userId, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    /**
     * Lock user account (admin function)
     */
    @PostMapping("/lock-account/{userId:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lock user account", description = "Lock a user account (admin only)")
    public ResponseEntity<ApiResponse<Void>> lockAccount(@PathVariable Long userId) {
        authService.lockAccount(userId);
        return ResponseEntity.ok(ApiResponse.success("Account locked successfully"));
    }

    /**
     * Unlock user account (admin function)
     */
    @PostMapping("/unlock-account/{userId:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unlock user account", description = "Unlock a user account (admin only)")
    public ResponseEntity<ApiResponse<Void>> unlockAccount(@PathVariable Long userId) {
        authService.unlockAccount(userId);
        return ResponseEntity.ok(ApiResponse.success("Account unlocked successfully"));
    }

    @GetMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Validate token", description = "Validate the current access token")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> validateToken() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("valid", true)));
    }
}

