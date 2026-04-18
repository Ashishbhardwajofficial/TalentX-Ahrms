# HRMS Backend - Human Resource Management System

A comprehensive Human Resource Management System built with Spring Boot, providing complete HR functionality for organizations.

## Features

### Core Modules
- **Organization Management** - Multi-tenant organization setup
- **User Management** - User accounts with role-based access
- **Employee Management** - Complete employee lifecycle management
- **Department Management** - Hierarchical department structure
- **Location Management** - Multi-location support

### HR Modules
- **Attendance Management** - Check-in/out, time tracking
- **Leave Management** - Leave types, balances, requests, approvals
- **Payroll Management** - Salary processing, payslips
- **Performance Management** - Reviews, goals, feedback
- **Training Management** - Training programs and tracking
- **Recruitment** - Job postings, candidates, interviews
- **Document Management** - Employee document storage
- **Asset Management** - Company asset tracking
- **Expense Management** - Employee expense claims

### System Features
- **Authentication & Authorization** - JWT-based security
- **Audit Logging** - Complete activity tracking
- **Notifications** - Multi-channel notifications
- **Reporting** - Comprehensive HR reports
- **File Upload** - Document and image handling
- **Email Integration** - Automated email notifications

## Technology Stack

- **Backend**: Spring Boot 3.x
- **Database**: MySQL 8.x
- **Security**: Spring Security with JWT
- **Documentation**: Swagger/OpenAPI 3
- **Build Tool**: Maven
- **Java Version**: 21

## Dependencies

- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Boot Starter Validation
- Spring Boot Starter Mail
- MySQL Connector
- JWT (jsonwebtoken)
- Swagger/OpenAPI
- MapStruct
- Apache POI (Excel)
- iText (PDF)
- Lombok

## Getting Started

### Prerequisites
- Java 21 or higher
- MySQL 8.x
- Maven 3.6+

### Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE hrms_db;
```

2. Update database credentials in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hrms_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Running the Application
1. Clone the repository
2. Navigate to project directory
3. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080/hrms`

### API Documentation
Access Swagger UI at: `http://localhost:8080/hrms/swagger-ui.html`

## Project Structure

```
src/main/java/com/TalentX/hrms/
├── entity/          # JPA entities
├── repository/      # Data access layer
├── service/         # Business logic layer
├── service/impl/    # Service implementations
├── controller/      # REST controllers
├── dto/            # Data transfer objects
├── config/         # Configuration classes
├── security/       # Security components
├── exception/      # Exception handling
├── util/           # Utility classes
├── validation/     # Custom validators
└── enums/          # Enum definitions
```

## Configuration

### Application Properties
Key configuration properties:
- Database connection
- JWT settings
- File upload limits
- Email configuration
- Swagger settings

### Security
- JWT-based authentication
- Role-based authorization
- Password encryption with BCrypt

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/{id}` - Get organization
- `PUT /api/organizations/{id}` - Update organization

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/{id}` - Get employee details
- `PUT /api/employees/{id}` - Update employee

(Additional endpoints for all modules...)

## Development

### Code Style
- Follow Java naming conventions
- Use Lombok for boilerplate code
- Implement proper exception handling
- Add comprehensive logging

### Testing
Run tests with:
```bash
mvn test
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.