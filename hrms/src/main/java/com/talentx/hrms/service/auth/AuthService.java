package com.talentx.hrms.service.auth;

import com.talentx.hrms.dto.auth.JwtResponse;
import com.talentx.hrms.dto.auth.LoginRequest;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.UserRole;
import com.talentx.hrms.repository.UserRepository;
import com.talentx.hrms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil,
                      UserDetailsServiceImpl userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Authenticate user and generate JWT token
     */
    public JwtResponse authenticate(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsernameWithRoles(userDetails.getUsername())
                .orElseThrow(() -> new BadCredentialsException("User not found in database"));

            validateUserAccount(user);

            String token = jwtUtil.generateToken(userDetails);
            user.recordSuccessfulLogin();
            userRepository.save(user);

            List<String> roles = user.getUserRoles().stream()
                .map(userRole -> userRole.getRole().getName())
                .collect(Collectors.toList());

            Instant expiresAt = Instant.now().plusMillis(jwtUtil.getExpirationTime());

            Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
            String orgName = user.getOrganization() != null ? user.getOrganization().getName() : null;
            return new JwtResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles,
                expiresAt,
                orgId,
                orgName
            );

        } catch (BadCredentialsException e) {
            handleFailedLogin(loginRequest.getUsername());
            throw e;
        } catch (Exception e) {
            handleFailedLogin(loginRequest.getUsername());
            throw new BadCredentialsException("Login failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Handle failed login attempt
     */
    private void handleFailedLogin(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.incrementFailedLoginAttempts();
            
            // Lock account after 5 failed attempts
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountLocked(true);
            }
            
            userRepository.save(user);
        }
    }

    /**
     * Logout user (invalidate token on client side)
     */
    public void logout() {
        SecurityContextHolder.clearContext();
    }

    /**
     * Get current authenticated user — organization eagerly loaded to prevent LazyInitializationException
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            // Use findByUsernameWithOrganization to eagerly load organization
            // This prevents LazyInitializationException when services call currentUser.getOrganization()
            return userRepository.findByUsernameWithOrganization(username)
                .orElseGet(() -> userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Current user not found")));
        }
        throw new RuntimeException("No authenticated user found");
    }

    /**
     * Get current user details
     */
    public UserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return (UserDetails) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Change user password
     */
    public void changePassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        
        // Validate new password
        validatePassword(newPassword);
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Timestamp.from(Instant.now()));
        user.setMustChangePassword(false);
        
        userRepository.save(user);
    }

    /**
     * Reset user password (admin function)
     */
    public void resetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        validatePassword(newPassword);
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Timestamp.from(Instant.now()));
        user.setMustChangePassword(true);
        user.resetFailedLoginAttempts();
        user.setAccountLocked(false);
        
        userRepository.save(user);
    }

    /**
     * Lock user account
     */
    public void lockAccount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setAccountLocked(true);
        userRepository.save(user);
    }

    /**
     * Unlock user account
     */
    public void unlockAccount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setAccountLocked(false);
        user.resetFailedLoginAttempts();
        userRepository.save(user);
    }

    /**
     * Validate user account status
     */
    private void validateUserAccount(User user) {
        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled");
        }
        
        if (!user.isAccountNonLocked()) {
            throw new BadCredentialsException("Account is locked");
        }
        
        if (!user.isAccountNonExpired()) {
            throw new BadCredentialsException("Account has expired");
        }
        
        if (!user.isCredentialsNonExpired()) {
            throw new BadCredentialsException("Credentials have expired");
        }
    }

    /**
     * Validate password strength
     */
    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        
        // Add more password validation rules as needed
        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);
        
        if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
            throw new IllegalArgumentException(
                "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
            );
        }
    }

    /**
     * Check if username is available
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    /**
     * Check if email is available
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    /**
     * Refresh JWT token
     */
    public JwtResponse refreshToken(String token) {
        if (jwtUtil.validateToken(token)) {
            String username = jwtUtil.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
            
            String newToken = jwtUtil.generateToken(userDetails);
            
            List<String> roles = user.getUserRoles().stream()
                .map(userRole -> userRole.getRole().getName())
                .collect(Collectors.toList());
            
            Instant expiresAt = Instant.now().plusMillis(jwtUtil.getExpirationTime());
            
            return new JwtResponse(
                newToken,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roles,
                expiresAt,
                user.getOrganization().getId(),
                user.getOrganization().getName()
            );
        }
        
        throw new BadCredentialsException("Invalid or expired token");
    }
}

