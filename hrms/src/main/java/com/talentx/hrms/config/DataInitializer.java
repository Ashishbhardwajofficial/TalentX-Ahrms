package com.talentx.hrms.config;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.Role;
import com.talentx.hrms.entity.security.UserRole;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.RoleRepository;
import com.talentx.hrms.repository.UserRepository;
import com.talentx.hrms.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${data.initializer.enabled:true}")
    private boolean initializerEnabled;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!initializerEnabled) {
            System.out.println("=== DataInitializer: Disabled for testing ===");
            return;
        }

        System.out.println("=== DataInitializer: Checking seed data ===");

        // Check if admin user already exists
        if (userRepository.findByUsername("admin").isPresent()) {
            System.out.println("Admin user already exists. Skipping seed data.");
            return;
        }

        System.out.println("Creating seed data...");

        // 1. Create Organization
        Organization org = organizationRepository.findById(1L).orElseGet(() -> {
            System.out.println("Creating organization...");
            Organization newOrg = new Organization();
            newOrg.setName("TalentX Demo");
            newOrg.setLegalName("TalentX Demo Pvt Ltd");
            newOrg.setIndustry("Technology");
            newOrg.setIsActive(true);
            return organizationRepository.save(newOrg);
        });
        System.out.println("Organization ID: " + org.getId());

        // 2. Create ADMIN Role
        Role adminRole = roleRepository.findByOrganizationAndCode(org, "ADMIN").orElseGet(() -> {
            System.out.println("Creating ADMIN role...");
            Role role = new Role();
            role.setOrganization(org);
            role.setName("ADMIN");
            role.setCode("ADMIN");
            role.setDescription("System Administrator with full access");
            role.setIsSystemRole(true);
            return roleRepository.save(role);
        });
        System.out.println("Role ID: " + adminRole.getId());

        // 3. Create Admin User
        System.out.println("Creating admin user...");
        User adminUser = new User();
        adminUser.setOrganization(org);
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@talentx.com");
        adminUser.setPasswordHash(passwordEncoder.encode("Admin@123"));
        adminUser.setFirstName("System");
        adminUser.setLastName("Administrator");
        adminUser.setIsActive(true);
        adminUser.setIsVerified(true);
        adminUser.setAccountLocked(false);
        adminUser.setAccountExpired(false);
        adminUser.setCredentialsExpired(false);
        adminUser.setMustChangePassword(false);
        adminUser = userRepository.save(adminUser);
        System.out.println("User ID: " + adminUser.getId());

        // 4. Assign ADMIN role to user
        System.out.println("Assigning ADMIN role to user...");
        UserRole userRole = new UserRole();
        userRole.setUser(adminUser);
        userRole.setRole(adminRole);
        userRole.setIsPrimaryRole(true);
        userRoleRepository.save(userRole);

        System.out.println("=== Seed data created successfully! ===");
        System.out.println("Login credentials:");
        System.out.println("  Username: admin");
        System.out.println("  Password: Admin@123");
    }
}
