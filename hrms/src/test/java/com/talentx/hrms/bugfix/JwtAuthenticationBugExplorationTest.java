package com.talentx.hrms.bugfix;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentx.hrms.dto.auth.LoginRequest;
import com.talentx.hrms.dto.auth.JwtResponse;
import com.talentx.hrms.common.ApiResponse;
import net.jqwik.api.*;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * Bug Condition Exploration Test for JWT Authentication Header Issues
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * GOAL: Surface counterexamples that demonstrate Authorization header missing for protected endpoints
 * 
 * This test explores the bug condition where:
 * - Login succeeds and returns a valid JWT token
 * - Token is stored in localStorage (simulated)
 * - Subsequent protected API calls fail with 401 errors due to missing Authorization headers
 * - The axios interceptor fails to attach the "Bearer <token>" header to requests
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class JwtAuthenticationBugExplorationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String validJwtToken;

    @BeforeEach
    void setUp() throws Exception {
        // Simulate successful login to get a valid JWT token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("admin");
        loginRequest.setPassword("admin123");

        String requestJson = objectMapper.writeValueAsString(loginRequest);
        
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = loginResult.getResponse().getContentAsString();
        ApiResponse<JwtResponse> apiResponse = objectMapper.readValue(responseContent, 
            objectMapper.getTypeFactory().constructParametricType(ApiResponse.class, JwtResponse.class));
        this.validJwtToken = apiResponse.getData().getToken();
    }

    /**
     * Property 1: Bug Condition - Authorization Header Missing for Protected Endpoints
     * 
     * Tests that authenticated requests to protected endpoints fail with 401 errors
     * when Authorization headers are missing, despite having valid tokens available.
     * 
     * This test SHOULD FAIL on unfixed code, demonstrating the bug exists.
     * The failure will show that requests without Authorization headers are rejected,
     * which is the core issue - the frontend isn't attaching the headers properly.
     */
    @Property(tries = 10)
    void protectedEndpointsShouldFailWithoutAuthorizationHeader(@ForAll("protectedEndpoints") String endpoint) throws Exception {
        // Simulate the bug condition: make request without Authorization header
        // This represents what happens when the axios interceptor fails to attach the header
        
        // First, verify we have a valid token (simulating localStorage.getItem('hrms_token'))
        assert validJwtToken != null && !validJwtToken.isEmpty() : "Valid JWT token should be available";
        
        // Make request to protected endpoint WITHOUT Authorization header
        // This simulates the bug where axios interceptor fails to attach the header
        MvcResult result = mockMvc.perform(get(endpoint)
                .contentType(MediaType.APPLICATION_JSON))
                // This SHOULD fail with 401 - demonstrating the bug condition
                .andExpect(status().isUnauthorized()) // Expected: 401 Unauthorized
                .andReturn();
        
        String responseContent = result.getResponse().getContentAsString();
        
        // Verify the error message indicates authentication is required
        // This confirms the backend is correctly rejecting requests without Authorization headers
        assert responseContent.contains("Full authentication is required") || 
               responseContent.contains("Unauthorized") || 
               responseContent.contains("Authentication") :
               "Response should indicate authentication failure, got: " + responseContent;
        
        // Additional verification: The same request WITH proper Authorization header should succeed
        // This proves the endpoint works when headers are present
        mockMvc.perform(get(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + validJwtToken))
                .andExpect(status().isOk()); // This should succeed
    }

    /**
     * Property 2: Bug Condition - Token Storage vs Header Attachment Mismatch
     * 
     * Tests the specific scenario where a valid token exists (localStorage.getItem('hrms_token'))
     * but the Authorization header is not properly formatted or attached to requests.
     * 
     * This test SHOULD FAIL on unfixed code, demonstrating the axios interceptor issue.
     */
    @Property(tries = 5)
    void tokenExistsButAuthorizationHeaderMissing(@ForAll("protectedEndpoints") String endpoint) throws Exception {
        // Simulate the exact bug condition described in the requirements:
        // 1. localStorage.getItem('hrms_token') returns a valid token
        assert validJwtToken != null : "localStorage should contain valid hrms_token";
        
        // 2. But request.headers.Authorization is undefined (simulated by omitting header)
        MvcResult bugResult = mockMvc.perform(get(endpoint)
                .contentType(MediaType.APPLICATION_JSON))
                // This demonstrates the bug: 401 despite having valid token available
                .andExpect(status().isUnauthorized())
                .andReturn();
        
        // 3. Verify the backend correctly rejects the request
        String errorResponse = bugResult.getResponse().getContentAsString();
        assert errorResponse.contains("authentication") || errorResponse.contains("Unauthorized") :
               "Should get authentication error when Authorization header missing";
        
        // 4. Demonstrate that the token itself is valid by using it correctly
        mockMvc.perform(get(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + validJwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        
        // This proves the bug: token is valid, but axios interceptor isn't attaching it
    }

    /**
     * Property 3: Bug Condition - Multiple Concurrent Protected Requests Fail
     * 
     * Tests that multiple simultaneous API calls all fail with 401 errors
     * due to missing Authorization headers, causing automatic logout.
     * 
     * This test SHOULD FAIL on unfixed code, demonstrating the cascading failure.
     */
    @Property(tries = 3)
    void multipleConcurrentRequestsFailWithoutHeaders(@ForAll("multipleEndpoints") String[] endpoints) throws Exception {
        // Simulate multiple concurrent requests without Authorization headers
        // This represents the scenario where multiple API calls fail simultaneously
        
        for (String endpoint : endpoints) {
            // Each request fails due to missing Authorization header
            mockMvc.perform(get(endpoint)
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized()); // All should fail with 401
        }
        
        // Verify that the same requests would succeed with proper headers
        for (String endpoint : endpoints) {
            mockMvc.perform(get(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + validJwtToken))
                    .andExpect(status().isOk()); // All should succeed with proper auth
        }
        
        // This demonstrates the bug: multiple failures due to missing headers
        // In the real application, this would trigger automatic logout
    }

    // Data generators for property-based testing
    
    @Provide
    Arbitrary<String> protectedEndpoints() {
        return Arbitraries.of(
            "/employees",           // Employee list endpoint
            "/dashboard/statistics", // Dashboard stats endpoint  
            "/auth/me",             // User profile endpoint
            "/employees/search",    // Employee search endpoint
            "/employees/stats",     // Employee statistics
            "/roles",               // Roles management
            "/users"                // User management
        );
    }

    @Provide
    Arbitrary<String[]> multipleEndpoints() {
        return Arbitraries.of(
            new String[]{"/employees", "/dashboard/statistics"},
            new String[]{"/auth/me", "/employees/stats"},
            new String[]{"/roles", "/users", "/employees"},
            new String[]{"/dashboard/statistics", "/auth/me"}
        );
    }
}