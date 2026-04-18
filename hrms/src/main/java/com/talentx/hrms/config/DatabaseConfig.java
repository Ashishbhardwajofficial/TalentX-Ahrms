package com.talentx.hrms.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Properties;

/**
 * Database configuration class for HRMS application.
 * Configures MySQL database connection with HikariCP connection pooling,
 * JPA/Hibernate settings, and transaction management.
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.talentx.hrms.repository")
@EnableJpaAuditing
@EnableTransactionManagement
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String databaseUsername;

    @Value("${spring.datasource.password}")
    private String databasePassword;

    @Value("${spring.datasource.driver-class-name}")
    private String databaseDriverClassName;

    @Value("${spring.datasource.hikari.maximum-pool-size:20}")
    private int maximumPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minimumIdle;

    @Value("${spring.datasource.hikari.idle-timeout:300000}")
    private long idleTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:1200000}")
    private long maxLifetime;

    @Value("${spring.datasource.hikari.connection-timeout:20000}")
    private long connectionTimeout;

    @Value("${spring.datasource.hikari.leak-detection-threshold:60000}")
    private long leakDetectionThreshold;

    /**
     * Configures HikariCP DataSource with connection pooling settings.
     * HikariCP is a high-performance JDBC connection pool.
     *
     * @return configured HikariDataSource
     */
    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
        // Basic connection settings
        config.setJdbcUrl(databaseUrl);
        config.setUsername(databaseUsername);
        config.setPassword(databasePassword);
        config.setDriverClassName(databaseDriverClassName);
        
        // Connection pool settings
        config.setMaximumPoolSize(maximumPoolSize);
        config.setMinimumIdle(minimumIdle);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setConnectionTimeout(connectionTimeout);
        config.setLeakDetectionThreshold(leakDetectionThreshold);
        
        // Additional HikariCP optimizations
        config.setPoolName("HRMS-HikariCP");
        config.setConnectionTestQuery("SELECT 1");
        config.setAutoCommit(false);
        config.setTransactionIsolation("TRANSACTION_READ_COMMITTED");
        
        // MySQL specific settings
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("useLocalSessionState", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");
        config.addDataSourceProperty("cacheResultSetMetadata", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("elideSetAutoCommits", "true");
        config.addDataSourceProperty("maintainTimeStats", "false");
        
        return new HikariDataSource(config);
    }

    /**
     * Configures JPA EntityManagerFactory with Hibernate as the JPA provider.
     *
     * @param dataSource the configured DataSource
     * @return LocalContainerEntityManagerFactoryBean
     */
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.talentx.hrms.entity");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        vendorAdapter.setGenerateDdl(true);
        vendorAdapter.setShowSql(false);
        em.setJpaVendorAdapter(vendorAdapter);
        
        em.setJpaProperties(hibernateProperties());
        
        return em;
    }

    /**
     * Configures Hibernate-specific properties for optimal performance.
     *
     * @return Properties containing Hibernate configuration
     */
    private Properties hibernateProperties() {
        Properties properties = new Properties();
        
        // Basic Hibernate settings
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        properties.setProperty("hibernate.hbm2ddl.auto", "update");
        properties.setProperty("hibernate.show_sql", "false");
        properties.setProperty("hibernate.format_sql", "true");
        properties.setProperty("hibernate.use_sql_comments", "true");
        
        // Performance optimizations
        properties.setProperty("hibernate.jdbc.batch_size", "20");
        properties.setProperty("hibernate.order_inserts", "true");
        properties.setProperty("hibernate.order_updates", "true");
        properties.setProperty("hibernate.jdbc.batch_versioned_data", "true");
        properties.setProperty("hibernate.generate_statistics", "false");
        
        // Connection handling
        properties.setProperty("hibernate.connection.provider_disables_autocommit", "true");
        properties.setProperty("hibernate.query.fail_on_pagination_over_collection_fetch", "true");
        
        // Cache settings (disabled for now, can be enabled later with proper cache configuration)
        properties.setProperty("hibernate.cache.use_second_level_cache", "false");
        properties.setProperty("hibernate.cache.use_query_cache", "false");
        
        // Validation
        properties.setProperty("hibernate.validator.apply_to_ddl", "false");
        
        return properties;
    }

    /**
     * Configures JPA transaction manager.
     *
     * @param entityManagerFactory the configured EntityManagerFactory
     * @return PlatformTransactionManager
     */
    @Bean
    public PlatformTransactionManager transactionManager(LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory.getObject());
        return transactionManager;
    }
}

