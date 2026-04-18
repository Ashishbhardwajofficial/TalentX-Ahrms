package com.talentx.hrms.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Jackson configuration to handle:
 * 1. Hibernate lazy proxy serialization (prevents LazyInitializationException)
 * 2. Java 8 date/time types (LocalDate, Instant, etc.)
 */
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // ── Hibernate6Module ──────────────────────────────────────────────────
        // Serializes uninitialized lazy proxies as null instead of crashing.
        // This is the fix for: LazyInitializationException during JSON serialization
        Hibernate6Module hibernate6Module = new Hibernate6Module();
        // FORCE_LAZY_LOADING = false (default) — don't trigger lazy loads during serialization
        hibernate6Module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, false);
        // Serialize uninitialized lazy proxies as null
        hibernate6Module.configure(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS, true);
        mapper.registerModule(hibernate6Module);

        // ── JavaTimeModule ────────────────────────────────────────────────────
        // Handles LocalDate, LocalDateTime, Instant, etc.
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return mapper;
    }
}
