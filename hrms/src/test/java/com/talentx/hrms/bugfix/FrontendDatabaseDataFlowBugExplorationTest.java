package com.talentx.hrms.bugfix;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentx.hrms.dto.employee.EmployeeRequest;
import com.talentx.hrms.dto.role.RoleRequest;
import com.talentx.hrms.dto.user.UserRequest;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import net.jqwik.api.*;
import net.jqwik.api.lifecycle.BeforeProperty;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
 * 
 * Bug Condition Exploration Test for Frontend-Database Data Flow Issues
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * GOAL: Surface counterexamples that demonstrate data persistence failures and CORS issues
 * 
 * This test explores the bug conditions reported:
 * - Internal server errors in user management from system settings sidebar
 * - Internal server errors in roles & permissions
 * - Frontend-to-database pipeline failures
 * - CORS preflight request failures
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class FrontendDatabaseDataFlowBugExplorationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Test setup - this will run before each property test
    }

    /**
     * Property 1: Bug Condition - Data Persistence Failure Detection
     * 
     * Tests employee creation through the frontend-to-database pipeline.
     * This test SHOULD FAIL on unfixed code, demonstrating the bug exists.
     */
    @Property(tries = 5) // Reduced scope for faster execution
    @WithMockUser(roles = {"ADMIN"})
    void employeeCreationShouldPersistToDatabase(@ForAll("validEmployeeData") EmployeeRequest employeeRequest) throws Exception {
        // Attempt to create employee via REST API (simulating frontend request)
        String requestJson = objectMapper.writeValueAsString(employeeRequest);
        
        MvcResult result = mockMvc.perform(post("/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isCreated()) // This should pass but may fail due to bug
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.employeeNumber").value(employeeRequest.getEmployeeNumber()))
                .andReturn();
        
        // Verify data was actually persisted by retrieving it
        String responseContent = result.getResponse().getContentAsString();
        // Extract employee ID from response for verification
        // This verification step will likely fail due to data persistence issues
        
        // Additional verification: Check if employee can be retrieved
        mockMvc.perform(get("/employees")
                .param("employeeNumber", employeeRequest.getEmployeeNumber()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isNotEmpty());
    }

    /**
     * Property 2: Bug Condition - User Management Internal Server Error Detection
     * 
     * Tests user creation and management operations that trigger internal server errors.
     * This test SHOULD FAIL on unfixed code, demonstrating the user management bug.
     */
    @Property(tries = 3) // Reduced scope for faster execution
    @WithMockUser(roles = {"ADMIN"})
    void userManagementShouldNotCauseInternalServerError(@ForAll("validUserData") UserRequest userRequest) throws Exception {
        // Attempt user creation (this often triggers internal server errors)
        String requestJson = objectMapper.writeValueAsString(userRequest);
        
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isCreated()) // This will likely fail with 500 Internal Server Error
                .andExpect(jsonPath("$.success").value(true));
        
        // Attempt to retrieve users list (system settings sidebar functionality)
        mockMvc.perform(get("/users")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk()) // This will likely fail with 500 Internal Server Error
                .andExpect(jsonPath("$.success").value(true));
    }

    /**
     * Property 3: Bug Condition - Roles & Permissions Internal Server Error Detection
     * 
     * Tests role management operations that trigger internal server errors.
     * This test SHOULD FAIL on unfixed code, demonstrating the roles & permissions bug.
     */
    @Property(tries = 3) // Reduced scope for faster execution
    @WithMockUser(roles = {"ADMIN"})
    void rolesPermissionsShouldNotCauseInternalServerError(@ForAll("validRoleData") RoleRequest roleRequest) throws Exception {
        // Attempt role creation
        String requestJson = objectMapper.writeValueAsString(roleRequest);
        
        mockMvc.perform(post("/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isCreated()) // This will likely fail with 500 Internal Server Error
                .andExpect(jsonPath("$.success").value(true));
        
        // Attempt to retrieve roles list
        mockMvc.perform(get("/roles"))
                .andExpect(status().isOk()) // This will likely fail with 500 Internal Server Error
                .andExpect(jsonPath("$.success").value(true));
    }

    /**
     * Property 4: Bug Condition - CORS Preflight Request Failure Detection
     * 
     * Tests CORS preflight requests that should return proper headers but fail.
     * This test SHOULD FAIL on unfixed code, demonstrating CORS configuration issues.
     */
    @Property(tries = 2) // Reduced scope for faster execution
    void corsPreflightShouldReturnProperHeaders(@ForAll("corsOrigins") String origin) throws Exception {
        // Send OPTIONS request (CORS preflight)
        mockMvc.perform(options("/employees")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk()) // This will likely fail due to CORS misconfiguration
                .andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(header().exists("Access-Control-Allow-Methods"))
                .andExpect(header().exists("Access-Control-Allow-Headers"));
    }

    // Data generators for property-based testing
    
    @Provide
    Arbitrary<EmployeeRequest> validEmployeeData() {
        return Combinators.combine(
            Arbitraries.strings().alpha().ofMinLength(3).ofMaxLength(10),
            Arbitraries.strings().alpha().ofMinLength(2).ofMaxLength(20),
            Arbitraries.strings().alpha().ofMinLength(2).ofMaxLength(20),
            Arbitraries.strings().numeric().ofLength(6),
            Arbitraries.of(EmploymentStatus.ACTIVE, EmploymentStatus.PROBATION),
            Arbitraries.of(EmploymentType.FULL_TIME, EmploymentType.PART_TIME),
            Arbitraries.longs().between(1L, 10L)
        ).as((firstName, lastName, email, empNum, status, type, orgId) -> {
            EmployeeRequest request = new EmployeeRequest();
            request.setFirstName(firstName);
            request.setLastName(lastName);
            request.setWorkEmail(email + "@company.com");
            request.setEmployeeNumber("EMP" + empNum);
            request.setEmploymentStatus(status);
            request.setEmploymentType(type);
            request.setHireDate(LocalDate.now());
            request.setOrganizationId(orgId);
            return request;
        });
    }

    @Provide
    Arbitrary<UserRequest> validUserData() {
        return Combinators.combine(
            Arbitraries.strings().alpha().ofMinLength(3).ofMaxLength(15),
            Arbitraries.strings().alpha().ofMinLength(5).ofMaxLength(20),
            Arbitraries.strings().alpha().ofMinLength(8).ofMaxLength(20),
            Arbitraries.longs().between(1L, 10L)
        ).as((username, email, password, orgId) -> {
            UserRequest request = new UserRequest();
            request.setUsername(username);
            request.setEmail(email + "@company.com");
            request.setPassword(password + "123!");
            request.setOrganizationId(orgId);
            return request;
        });
    }

    @Provide
    Arbitrary<RoleRequest> validRoleData() {
        return Combinators.combine(
            Arbitraries.strings().alpha().ofMinLength(3).ofMaxLength(20),
            Arbitraries.strings().alpha().ofMinLength(10).ofMaxLength(50),
            Arbitraries.longs().between(1L, 10L)
        ).as((name, description, orgId) -> {
            RoleRequest request = new RoleRequest();
            request.setName("ROLE_" + name.toUpperCase());
            request.setDescription(description + " role");
            request.setOrganizationId(orgId);
            return request;
        });
    }

    @Provide
    Arbitrary<String> corsOrigins() {
        return Arbitraries.of(
            "http://localhost:3000",
            "http://localhost:8080",
            "https://app.company.com",
            "https://admin.company.com"
        );
    }
}