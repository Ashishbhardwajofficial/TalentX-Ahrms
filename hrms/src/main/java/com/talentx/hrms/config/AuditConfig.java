package com.talentx.hrms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration for audit logging functionality
 */
@Configuration
@EnableAspectJAutoProxy
@EnableAsync
public class AuditConfig {
    // Configuration for audit logging aspects and async processing
}

