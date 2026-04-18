package com.talentx.hrms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();

        log.debug("JWT Filter processing request: {} {}", request.getMethod(), requestPath);

        if (authorizationHeader == null) {
            log.debug("No Authorization header present for: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        if (!authorizationHeader.startsWith("Bearer ")) {
            log.warn("Authorization header does not start with 'Bearer ' for: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authorizationHeader.substring(7);
        String username = null;

        try {
            username = jwtUtil.extractUsername(jwt);
            log.debug("Extracted username '{}' from JWT for: {}", username, requestPath);
        } catch (Exception e) {
            log.error("Error extracting username from JWT token for {}: {}", requestPath, e.getMessage());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication set for user '{}' on: {}", username, requestPath);
                } else {
                    log.warn("JWT token validation failed for user '{}' on: {}", username, requestPath);
                }
            } catch (Exception e) {
                log.error("Error validating JWT token for user '{}' on {}: {}", username, requestPath, e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Context path is /api, so full URIs are /api/auth/login etc.
        boolean skip = path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.equals("/api/auth/check-username")
                || path.equals("/api/auth/check-email")
                || path.startsWith("/api/swagger-ui")
                || path.startsWith("/api/v3/api-docs")
                || path.equals("/api/actuator/health")
                || path.startsWith("/api/recruitment/jobs/public");
        if (skip) {
            log.debug("Skipping JWT filter for public path: {}", path);
        }
        return skip;
    }
}

