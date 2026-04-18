# Master of Computer Applications
## (Sem II) – A.Y. 2025–2026

---

# Project Report on
# TalentX: Human Resource Management System

---

**Submitted by:**

| Name | Division | Roll No. |
|------|----------|----------|
| Ashish Kumar Ray | Division B | 05 |


---

**Thakur College of Engineering and Technology, Kandivali(E), Mumbai – 400101**

**Date: 9th April, 2026**

**UNDER THE GUIDANCE OF:**
Mr. Amitanand Mishra
Assistant Professor
M.C.A. Department

---

---

## Introduction To Project

TalentX is a comprehensive, full-stack Human Resource Management System (HRMS) designed to digitize and automate the complete HR lifecycle of an organization. In today's fast-paced corporate environment, managing human resources manually is not only time-consuming but also error-prone and inefficient. TalentX addresses these challenges by providing a centralized, web-based platform that handles everything from employee onboarding to payroll processing, leave management, attendance tracking, performance reviews, recruitment, training, asset management, and compliance monitoring.

The system is built using modern technologies — **Spring Boot (Java 21)** on the backend and **React 18 with TypeScript** on the frontend — ensuring a scalable, secure, and responsive application. It follows a multi-tenant architecture, allowing multiple organizations to use the same platform with complete data isolation.

TalentX empowers HR teams, managers, and employees with role-based access to relevant modules, real-time notifications, audit logging, and comprehensive reporting — all through an intuitive web interface accessible from any device.

**Key Modules of TalentX:**
- Employee Management
- User & Role Management
- Attendance Tracking (Check-in / Check-out)
- Leave Management
- Payroll Processing & Payslip Generation
- Expense Management
- Asset Management & Assignment
- Benefits Enrollment
- Training Programs & Enrollments
- Performance Reviews & Goal Tracking
- Recruitment (Job Postings, Candidates, Interviews)
- Compliance Management
- Document Management
- Notifications & Audit Logs
- Dashboard & Analytics

---

## SYSTEM STUDY AND ANALYSIS

### Existing System

Most organizations, especially small and medium enterprises, rely on manual or semi-automated HR processes. These include maintaining physical registers, spreadsheets, and disconnected software tools for different HR functions. The existing manual system suffers from numerous limitations that reduce operational efficiency and increase the risk of errors.

### Disadvantages of Existing System

- Maintaining multiple registers and spreadsheets for different HR functions becomes extremely difficult and error-prone.
- Tracking employee information, attendance, leaves, and payroll across different files is cumbersome and time-consuming.
- It is difficult to retrieve a particular employee's records, leave history, or payroll details from a large collection of documents.
- Generating accurate payroll reports manually requires significant effort and is prone to calculation errors.
- There is no centralized system to track asset assignments, training progress, or performance reviews.
- Unauthorized access to sensitive employee data cannot be effectively controlled in a manual system.
- Real-time visibility into HR metrics such as attendance rates, pending approvals, and compliance status is not available.
- Onboarding new employees involves repetitive paperwork with no standardized digital workflow.

### Proposed System

TalentX is proposed as a complete digital replacement for the manual HR system. It provides a unified, web-based platform where all HR operations are managed through a secure, role-based interface. The system automates repetitive tasks, enforces business rules, and provides real-time insights through dashboards and reports.

### Advantages of Proposed System

- The system is GUI-based and highly user-friendly, allowing even non-technical HR staff to operate it effectively without any training.
- It is fully upgradeable — new modules and features can be added without disrupting existing functionality.
- The system is capable of generating comprehensive HR reports including payslips, attendance summaries, expense reports, and compliance checks.
- It maintains high speed and accuracy in all calculations including payroll, leave balances, and attendance hours.
- It solves all problems encountered in the previous manually handled system by providing a single source of truth for all HR data.
- It enforces database security through JWT-based authentication and role-based access control, restricting unauthorized access.
- Multi-tenant architecture ensures complete data isolation between different organizations using the platform.
- Real-time notifications keep employees and managers informed about approvals, deadlines, and important events.
- The system is platform-independent and accessible from any modern web browser on any device.

---

## PLANNING PHASE

### Feasibility Study

The feasibility study is undertaken to determine the possibility of developing a comprehensive digital HR management system to replace the existing manual processes. It helps to obtain an overview of the problem and determine whether a feasible solution exists within the given constraints of time, technology, and resources.

This project has been evaluated in the following areas of feasibility:

1. Operational Feasibility
2. Technical Feasibility
3. Economic Feasibility
4. Behavioral Feasibility
5. Resource Feasibility
6. Legal Feasibility
7. Schedule Feasibility

---

### OPERATIONAL FEASIBILITY

The current HR system in most organizations is manual, making the processing of large volumes of employee data a cumbersome and error-prone activity. Reports such as payslips, attendance summaries, and leave balances are difficult to prepare manually. Since HR staff and employees find difficulty operating a manual system, they have expressed the need for a computerized solution that simplifies their daily tasks.

The organization has evaluated operational and cultural issues to identify potential risks for the new system and has concluded that TalentX presents no operational risk that might prevent its effective use.

- The system is designed to be simple and intuitive, requiring minimal training for HR staff and employees.
- It does not involve complex operations — it handles straightforward data-oriented functions such as form submissions, approvals, and report generation.
- It provides an easy way to generate HR reports including payslips, attendance reports, expense summaries, and compliance checks.
- The role-based access control ensures that each user sees only the information and actions relevant to their role.

---

### TECHNICAL FEASIBILITY

TalentX leverages modern, widely-adopted technologies that are freely available and well-supported. The proposed system requires technology and infrastructure that can be readily obtained and maintained.

- **Backend:** Java 21 with Spring Boot 3.x — a mature, enterprise-grade framework with extensive community support.
- **Frontend:** React 18 with TypeScript — the most widely used frontend framework, ensuring a responsive and maintainable UI.
- **Database:** MySQL 8.x — a reliable, open-source relational database with strong performance characteristics.
- **Security:** Spring Security with JWT tokens — industry-standard authentication and authorization.
- **API Documentation:** Swagger/OpenAPI 3 — enables easy testing and integration.

The operating system and hardware have the technical capacity to host and run the proposed system. The system is platform-independent and can be deployed on any cloud provider (AWS, GCP, Azure) or on-premises server.

- The system can be expanded with new modules as organizational requirements grow.
- It is technically more secure than manual systems, with encrypted passwords, JWT authentication, and audit logging.
- The RESTful API architecture allows future integration with third-party systems such as accounting software or biometric devices.

---

### ECONOMIC FEASIBILITY

The economic feasibility of TalentX is primarily concerned with its cost-benefit analysis. The system is developed using open-source technologies, significantly reducing licensing costs.

- **Development Cost:** The primary cost is developer time. All frameworks, libraries, and tools used (Spring Boot, React, MySQL) are open-source and freely available.
- **Infrastructure Cost:** The system can be deployed on low-cost cloud instances or existing organizational servers.
- **Operational Savings:** By automating payroll, attendance, leave management, and compliance checks, the system saves significant HR staff time — estimated at 40% reduction in administrative workload.
- **Error Reduction:** Automated payroll calculations and leave balance tracking eliminate costly manual errors.
- **ROI:** The system pays for itself within the first quarter of deployment through time savings and error reduction.

The cost of developing this system is minimal compared to the long-term operational benefits it provides to the organization.

---

### BEHAVIORAL FEASIBILITY

In this feasibility study, the project was evaluated to determine whether the software interface is user-friendly enough for non-technical HR staff and employees to use effectively.

- The React-based frontend provides a clean, modern, and intuitive interface with clear navigation.
- Role-based dashboards ensure that each user sees only relevant information, reducing cognitive load.
- Form validations and error messages guide users through correct data entry.
- The system has been designed with accessibility in mind, ensuring usability across different user skill levels.

---

### RESOURCE FEASIBILITY

The project achieves resource feasibility as the development team has a proper understanding of the available time and required components.

- The development team consists of MCA students with proficiency in Java, Spring Boot, React, and MySQL.
- All required software tools and frameworks are freely available.
- The project does not require specialized hardware beyond standard development machines.
- Being part of the MCA semester project, the development timeline aligns with academic requirements without disrupting normal academic proceedings.

---

### LEGAL FEASIBILITY

The project is legally feasible because:

- It provides access only to authorized users through JWT-based authentication, complying with data security regulations.
- Employee data is stored securely with encrypted passwords and role-based access control.
- The system includes audit logging for all sensitive operations, ensuring accountability and compliance with data protection requirements.
- All open-source libraries used are licensed under permissive licenses (MIT, Apache 2.0) that allow commercial use.
- The multi-tenant architecture ensures complete data isolation between organizations, preventing unauthorized cross-organization data access.

---

### SCHEDULE FEASIBILITY

The project obeys schedule feasibility because of its timely completion within the stipulated time period. The development was organized into well-defined phases with clear milestones, ensuring systematic progress from planning to deployment.

---

### Milestones

| Sr No | Activity | Description | Period |
|-------|----------|-------------|--------|
| 1 | Planning | Deciding the project scope, technology stack (Spring Boot + React + MySQL), and module breakdown for the HRMS | 2–3 Days |
| 2 | Analysis | Gathering HR domain requirements — employee lifecycle, payroll rules, leave policies, attendance tracking, recruitment workflow | 8–10 Days |
| 3 | Designing | Designing database schema (35+ tables), REST API endpoints (150+), UI wireframes for all 20+ modules, ER diagram, UML diagrams | 15–20 Days |
| 4 | Coding | Implementing backend (Spring Boot controllers, services, repositories) and frontend (React pages, API clients, state management) | 30+ Days |
| 5 | Testing | Unit testing, API testing via Swagger, frontend integration testing, data validation, bug fixing | 5 Days |
| 6 | Implementation | Deploying the application, seeding initial data, configuring roles and permissions | 1 Day |
| 7 | Maintenance | Monitoring system performance, fixing post-deployment issues, adding enhancements | Ongoing |

---

### Fact Finding Techniques

Information plays a very important role in developing an HR management system. Acquiring accurate requirements is essential for building a system that truly addresses organizational needs. The following fact-finding techniques were employed during the requirements gathering phase:

**Observation:**
- The day-to-day HR operations of organizations were observed to understand the actual processes involved in employee management, attendance tracking, and payroll processing.
- This technique helped in understanding the complete HR lifecycle — from employee onboarding to exit management.
- Observation revealed pain points such as manual leave approval chains, error-prone payroll calculations, and lack of real-time visibility into HR metrics.

**Record Searching:**
- Existing HR documents such as employee registers, attendance sheets, payroll records, and leave application forms were studied.
- Analysis of these records helped in designing the database schema and identifying all required data fields.
- Study of payslip formats helped in designing the payroll module's output structure.

**Interviews:**
- HR managers, employees, and department heads were interviewed to understand their specific requirements and pain points.
- Interviews revealed the need for a self-service portal where employees can apply for leaves, submit expenses, and view their payslips without HR intervention.
- Manager interviews highlighted the need for approval workflows, team attendance visibility, and performance review tools.

**Questionnaires:**
- Structured questionnaires were distributed to HR staff and employees across different departments to collect quantitative data on system requirements.
- Questions covered topics such as frequency of leave applications, payroll processing time, asset tracking needs, and training management requirements.
- Responses helped prioritize module development and identify must-have vs. nice-to-have features.

**Document Searching:**
- Various HR policy documents, employment contracts, payroll calculation sheets, and compliance checklists were analyzed.
- This helped in understanding business rules such as leave entitlement policies, overtime calculation methods, and expense reimbursement limits.
- Study of existing reports helped in designing the system's reporting capabilities.

**Visits:**
- Multiple visits were made to HR departments to observe actual workflows and collect sample documents.
- These visits helped in validating the system design against real-world HR processes and identifying edge cases.

---

## FRONTEND AND BACKEND

### Front-End: React 18 with TypeScript

The frontend of TalentX is built using **React 18** with **TypeScript**, providing a modern, component-based, and type-safe user interface. React is the most widely used JavaScript library for building user interfaces, maintained by Meta and a large open-source community.

**Key Frontend Technologies:**

- **React 18** — Component-based UI library with hooks for state management
- **TypeScript** — Strongly typed superset of JavaScript, reducing runtime errors
- **Tailwind CSS** — Utility-first CSS framework for responsive design
- **Axios** — HTTP client for API communication with the backend
- **React Router** — Client-side routing for single-page application navigation
- **Context API** — Global state management for authentication and user data

**Frontend Architecture:**
The frontend follows a modular architecture where each HR module (Employees, Attendance, Payroll, etc.) has its own dedicated page component, API client, and TypeScript DTOs. The `axiosClient.ts` handles JWT token injection, error handling, and automatic logout on token expiry.

**Key Frontend Features:**
- Responsive design that works on desktop, tablet, and mobile
- Role-based UI — different menus and pages shown based on user role (ADMIN, HR, MANAGER, EMPLOYEE)
- Real-time form validation with user-friendly error messages
- DataTable component with pagination, sorting, and filtering
- Modal-based forms for creating and editing records
- Toast notifications for success/error feedback

---

### Back-End: Spring Boot 3.x with Java 21

The backend of TalentX is built using **Spring Boot 3.x** with **Java 21**, providing a robust, scalable, and secure REST API.

**Key Backend Technologies:**

- **Spring Boot 3.x** — Auto-configured, production-ready Java framework
- **Spring Security** — Authentication and authorization with JWT tokens
- **Spring Data JPA / Hibernate** — ORM for database operations
- **MySQL 8.x** — Relational database for persistent data storage
- **Swagger / OpenAPI 3** — Automatic API documentation and testing interface
- **Maven** — Build tool and dependency management
- **JWT (JSON Web Tokens)** — Stateless authentication mechanism

**Backend Architecture (Layered):**
- **Controller Layer** — REST endpoints handling HTTP requests/responses
- **Service Layer** — Business logic and transaction management
- **Repository Layer** — Spring Data JPA repositories for database operations
- **Entity Layer** — JPA entities mapped to database tables
- **DTO Layer** — Data Transfer Objects for request/response serialization
- **Security Layer** — JWT filter, authentication, and authorization

The backend exposes **150+ REST API endpoints** organized by module, all prefixed with `/api`. Every endpoint returns a standardized `ApiResponse<T>` wrapper.

---

## HARDWARE AND SOFTWARE REQUIREMENTS

### Hardware Requirements

| Component | Specification |
|-----------|--------------|
| Processor | Intel Core i5 / i7 (2.4 GHz or higher) |
| Memory (RAM) | 8 GB minimum, 16 GB recommended |
| Hard Disk | 256 GB SSD minimum |
| Network | Broadband Internet connection |
| Monitor | 1920 x 1080 Full HD display |
| Mouse | Standard USB Mouse |
| Keyboard | Standard 104-key Windows Keyboard |

### Software Requirements

| Category | Specification |
|----------|--------------|
| Operating System | Windows 10/11, macOS 12+, or Ubuntu 20.04+ |
| Backend Runtime | Java 21 (JDK) |
| Backend Framework | Spring Boot 3.4.0 |
| Frontend Runtime | Node.js 18+ |
| Frontend Framework | React 18 with TypeScript |
| Database | MySQL 8.x |
| Build Tool (Backend) | Apache Maven 3.6+ |
| Build Tool (Frontend) | npm / Create React App |
| IDE (Backend) | IntelliJ IDEA |
| IDE (Frontend) | Visual Studio Code |
| API Testing | Swagger UI / Postman |
| Version Control | Git / GitHub |
| Browser | Google Chrome 110+, Firefox 110+, Edge 110+ |

---

## SYSTEM DESIGN

### Gantt Chart

| Phase | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Week 6 | Week 7 | Week 8 |
|-------|--------|--------|--------|--------|--------|--------|--------|--------|
| Planning & Analysis | ████ | ████ | | | | | | |
| Database Design | | ████ | ████ | | | | | |
| Backend Development | | | ████ | ████ | ████ | | | |
| Frontend Development | | | | ████ | ████ | ████ | | |
| Integration & Testing | | | | | | ████ | ████ | |
| Deployment & Docs | | | | | | | ████ | ████ |

---

### E-R Diagram Description

The TalentX database consists of **35+ interrelated tables** organized around the central `employees` table.

**Core Entities:** `organizations`, `employees`, `users`, `departments`, `locations`

**HR Module Entities:** `attendance_records`, `leave_types`, `leave_requests`, `leave_balances`, `expenses`, `assets`, `asset_assignments`, `benefit_plans`, `employee_benefits`, `training_programs`, `training_enrollments`, `performance_review_cycles`, `performance_reviews`, `goals`, `payroll_runs`, `payroll_items`, `payslips`

**Recruitment Entities:** `job_postings`, `candidates`, `applications`, `interviews`

**Security & Audit Entities:** `roles`, `permissions`, `role_permissions`, `user_roles`, `audit_logs`, `system_notifications`

**Key Relationships:**
- One Organization → Many Employees, Departments, Roles
- One Employee → Many Attendance Records, Leave Requests, Expenses, Skills
- One Employee → One User Account
- One Payroll Run → Many Payslips (one per active employee)
- One Job Posting → Many Applications → Many Interviews

---

### UML Diagrams

#### Use Case Diagram

**Admin Use Cases:**
- Manage Organizations, Create/Update/Delete Employees, Manage Users and Roles
- Assign Permissions, Process Payroll, Generate Reports, View Audit Logs

**HR Manager Use Cases:**
- Onboard New Employees, Approve/Reject Leave Requests, Approve/Reject Expense Claims
- Manage Benefit Enrollments, Create Training Programs, Create Job Postings, Run Compliance Checks

**Manager Use Cases:**
- View Team Attendance, Approve Team Leave Requests, Conduct Performance Reviews
- Set and Track Employee Goals, Assign Assets to Team Members

**Employee Use Cases:**
- Apply for Leave, Submit Expense Claims, View Payslips
- Check-in / Check-out Attendance, Enroll in Training, Update Personal Profile

---

#### Sequence Diagram — Leave Request Approval Flow

```
Employee → Frontend: Submit Leave Request Form
Frontend → Backend API: POST /api/leave
Backend API → LeaveService: createLeaveRequest(dto)
LeaveService → LeaveRepository: save(leaveRequest)
LeaveRepository → MySQL: INSERT INTO leave_requests
MySQL → LeaveRepository: leaveRequest (id=23)
LeaveService → NotificationService: notify manager
Frontend → Employee: "Leave request submitted successfully"

Manager → Frontend: Click "Approve"
Frontend → Backend API: POST /api/leave/{id}/approve
Backend API → LeaveService: approveLeaveRequest(id, comments)
LeaveService → LeaveBalanceRepository: updateLeaveBalance()
LeaveService → NotificationService: notify employee
Frontend → Manager: "Leave request approved successfully"
```

---

#### State Diagram — Expense Claim Lifecycle

```
[SUBMITTED] → (Approve) → [APPROVED] → (Mark Paid) → [PAID]
[SUBMITTED] → (Reject)  → [REJECTED]
[APPROVED]  → (Reject)  → [REJECTED]
```

---

#### Activity Diagram — Payroll Processing Flow

```
Start → Create Payroll Run (DRAFT) → Validate Pay Period
→ Fetch All Active Employees
→ For Each Employee: Calculate Salary + Deductions + Taxes → Generate Payslip
→ Calculate Payroll Totals → Status: CALCULATED
→ HR Approves → Status: APPROVED
→ Payslips Available to Employees → End
```

---

### Menu Tree

```
TalentX HRMS
├── Dashboard
├── Employees
│   ├── Employee List
│   └── Add Employee
├── Attendance
│   ├── Check-In / Check-Out
│   └── Attendance Records
├── Leave Management
│   ├── Apply for Leave
│   ├── Pending Approvals
│   └── Leave Calendar
├── Payroll
│   ├── Payroll Runs
│   ├── Process Payroll
│   └── Payslips
├── Expenses
│   ├── Submit Expense
│   └── Expense Approvals
├── Assets
│   ├── Asset Inventory
│   └── Asset Assignments
├── Benefits
├── Training
├── Performance
│   ├── Review Cycles
│   ├── Performance Reviews
│   └── Goals
├── Recruitment
│   ├── Job Postings
│   ├── Candidates
│   └── Interviews
├── Compliance
├── Documents
├── Settings
│   ├── User Management
│   ├── Role & Permissions
│   └── Departments
└── Notifications
```

---

### Database Design

**employees table**

| Column | Type | Description |
|--------|------|-------------|
| employee_id | BIGINT PK | Auto-increment primary key |
| organization_id | BIGINT FK | Reference to organizations |
| employee_number | VARCHAR(255) UNIQUE | Unique employee identifier |
| first_name | VARCHAR(255) | Employee first name |
| last_name | VARCHAR(255) | Employee last name |
| work_email | VARCHAR(255) | Official work email |
| job_title | VARCHAR(255) | Current job title |
| employment_status | ENUM | ACTIVE, INACTIVE, TERMINATED, ON_LEAVE |
| salary_amount | DECIMAL(15,2) | Monthly salary |
| hire_date | DATE | Date of joining |
| department_id | BIGINT FK | Reference to departments |

**leave_requests table**

| Column | Type | Description |
|--------|------|-------------|
| leave_request_id | BIGINT PK | Auto-increment primary key |
| employee_id | BIGINT FK | Reference to employees |
| leave_type_id | BIGINT FK | Reference to leave_types |
| start_date | DATE | Leave start date |
| end_date | DATE | Leave end date |
| total_days | DECIMAL(5,2) | Calculated leave duration |
| status | ENUM | PENDING, APPROVED, REJECTED, CANCELLED |
| reason | TEXT | Employee's reason for leave |

**payroll_runs table**

| Column | Type | Description |
|--------|------|-------------|
| payroll_run_id | BIGINT PK | Auto-increment primary key |
| organization_id | BIGINT FK | Reference to organizations |
| name | VARCHAR(255) | Payroll run name |
| pay_period_start | DATE | Start of pay period |
| pay_period_end | DATE | End of pay period |
| status | ENUM | DRAFT, CALCULATED, APPROVED, PAID |
| total_gross_pay | DECIMAL(15,2) | Total gross salary |
| total_net_pay | DECIMAL(15,2) | Total net salary after deductions |
| employee_count | INT | Number of employees in this run |

---

## SYSTEM CODING CONVENTION

### Backend (Java / Spring Boot)
- **Package Naming:** `com.talentx.hrms.<layer>.<module>`
- **Class Naming:** PascalCase (e.g., `EmployeeController`, `LeaveService`)
- **Method Naming:** camelCase (e.g., `createEmployee()`, `approveLeaveRequest()`)
- **REST Endpoints:** Lowercase with hyphens (e.g., `/api/leave-requests`)
- **DTOs:** Suffix with DTO or Request/Response (e.g., `EmployeeDTO`, `LeaveRequestCreateDTO`)
- **Transactions:** `@Transactional` on all service methods that modify data
- **Error Handling:** Global `@ControllerAdvice` with standardized `ApiResponse<T>` wrapper
- **Validation:** Jakarta Bean Validation (`@NotNull`, `@NotBlank`, `@Size`)

### Frontend (React / TypeScript)
- **Component Naming:** PascalCase (e.g., `EmployeeListPage`, `DataTable`)
- **File Naming:** PascalCase for components, camelCase for utilities
- **Interface Naming:** PascalCase with descriptive suffix (e.g., `EmployeeDTO`)
- **Hook Naming:** Prefix with `use` (e.g., `useAuth`, `useToast`)
- **Null Safety:** Optional chaining (`?.`) and nullish coalescing (`??`) for all nullable fields

### Database
- **Table Naming:** snake_case plural (e.g., `employees`, `leave_requests`)
- **Column Naming:** snake_case (e.g., `employee_id`, `first_name`)
- **Primary Keys:** `<table_singular>_id` (e.g., `employee_id`)
- **Enums:** UPPER_SNAKE_CASE values (e.g., `FULL_TIME`, `PENDING`)

---

## TEST CASES

| Test Case ID | Test Case Name | Test Case Description | Test Steps | Expected Result | Actual Result | Module | Status (P/F) | Priority |
|---|---|---|---|---|---|---|---|---|
| TC-001 | Admin Login - Valid | Verify successful login with valid credentials | Enter username: admin, password: Admin@123, click Login | Login successful, redirect to dashboard | Login Successful | Login | Pass | High |
| TC-002 | Admin Login - Invalid Password | Verify error on wrong password | Enter wrong password, click Login | Error "Invalid credentials" | Error displayed | Login | Pass | High |
| TC-003 | Admin Login - Empty Fields | Verify validation on empty form | Click Login without credentials | Error "Fields are required" | Validation error | Login | Pass | High |
| TC-004 | Create Employee - Valid | Verify employee creation | Fill all mandatory fields, submit | Employee created with unique number | Employee created (id=29) | Employee | Pass | High |
| TC-005 | Create Employee - Duplicate Number | Verify duplicate rejection | Enter existing employee number | Error "Employee number already exists" | Error displayed | Employee | Pass | High |
| TC-006 | Create Employee - Missing Fields | Verify validation | Submit without first name | Error "First name is required" | Validation error | Employee | Pass | High |
| TC-007 | Submit Leave Request - Valid | Verify leave submission | Select type, dates, reason, submit | Leave created with PENDING status | Leave created (id=23) | Leave | Pass | High |
| TC-008 | Submit Leave - Past Date | Verify past date rejection | Enter past start date | Error "Cannot apply for leave in the past" | Error displayed | Leave | Pass | Medium |
| TC-009 | Approve Leave Request | Verify manager approval | Click Approve on pending leave | Status changes to APPROVED | Status = APPROVED | Leave | Pass | High |
| TC-010 | Reject Leave Request | Verify rejection with reason | Click Reject, enter reason | Status changes to REJECTED | Status = REJECTED | Leave | Pass | High |
| TC-011 | Attendance Check-In | Verify check-in recording | Click Check-In, confirm location | Record created with PRESENT status | Record created (id=45) | Attendance | Pass | High |
| TC-012 | Attendance Check-Out | Verify check-out and hours | Click Check-Out after check-in | Check-out time and total hours recorded | Total hours = 10.08 | Attendance | Pass | High |
| TC-013 | Submit Expense - Valid | Verify expense submission | Fill type, amount, date, submit | Expense created with SUBMITTED status | Expense created (id=20) | Expense | Pass | High |
| TC-014 | Approve Expense | Verify HR approval | Click Approve on submitted expense | Status changes to APPROVED | Status = APPROVED | Expense | Pass | High |
| TC-015 | Mark Expense Paid | Verify payment recording | Click Mark Paid on approved expense | Status changes to PAID with payment date | Status = PAID | Expense | Pass | High |
| TC-016 | Create Asset | Verify asset creation | Enter type, tag, serial number, submit | Asset created with AVAILABLE status | Asset created (id=17) | Asset | Pass | High |
| TC-017 | Assign Asset | Verify asset assignment | Select asset and employee, submit | Asset status = ASSIGNED, record created | Assignment created (id=33) | Asset | Pass | High |
| TC-018 | Return Asset | Verify asset return | Click Return, set return date | Asset status = AVAILABLE, date recorded | Status = AVAILABLE | Asset | Pass | High |
| TC-019 | Create Payroll Run | Verify payroll creation | Enter pay period, description, submit | Payroll run created with DRAFT status | Payroll created (id=11) | Payroll | Pass | High |
| TC-020 | Process Payroll | Verify payslip generation | Click Process on DRAFT payroll | Status = CALCULATED, payslips generated | 27 payslips generated | Payroll | Pass | High |
| TC-021 | Approve Payroll | Verify payroll approval | Click Approve on CALCULATED payroll | Status changes to APPROVED | Status = APPROVED | Payroll | Pass | High |
| TC-022 | Create Training Program | Verify training creation | Fill title, type, method, submit | Training program created | Program created (id=15) | Training | Pass | High |
| TC-023 | Enroll in Training | Verify enrollment | Select program and employee, submit | Enrollment created with ENROLLED status | Enrollment created (id=13) | Training | Pass | High |
| TC-024 | Create Performance Review | Verify review creation | Select cycle, employee, reviewer, submit | Review created with NOT_STARTED status | Review created (id=13) | Performance | Pass | High |
| TC-025 | Update Goal Progress | Verify progress update | Set percentage and status, submit | Goal progress updated | Progress = 50%, IN_PROGRESS | Performance | Pass | High |
| TC-026 | Create Job Posting | Verify job posting | Fill title, requirements, submit | Job posting created with DRAFT status | Posting created (id=15) | Recruitment | Pass | High |
| TC-027 | Create Candidate | Verify candidate creation | Fill candidate details, submit | Candidate profile created | Candidate created (id=14) | Recruitment | Pass | High |
| TC-028 | Run Compliance Check | Verify compliance check | Select rule, click Run | Check executed and result stored | Check created (id=14) | Compliance | Pass | High |
| TC-029 | Create Notification | Verify notification delivery | Create notification for user | Notification visible in user panel | Notification created (id=22) | Notification | Pass | Medium |
| TC-030 | Role-Based Access Control | Verify EMPLOYEE cannot access admin | Login as employee, access /settings/users | 403 Forbidden | 403 returned | Security | Pass | High |

---

## FUTURE ENHANCEMENT

1. **Mobile Application** — Native iOS and Android apps using React Native for on-the-go HR management.
2. **Biometric Integration** — Fingerprint and face recognition for automated attendance marking.
3. **AI-Powered Analytics** — Machine learning for predicting employee attrition and recommending training.
4. **Advanced Payroll** — Multi-currency payroll, variable pay, and country-specific tax calculations.
5. **Employee Self-Service Portal** — Digital document submission, e-signatures, and automated onboarding.
6. **Accounting Software Integration** — Direct integration with Tally, QuickBooks, and SAP.
7. **Video Interview Module** — Built-in video conferencing for remote interviews.
8. **Learning Management System (LMS)** — Course content hosting, quizzes, and certifications.
9. **Advanced BI Dashboard** — Interactive dashboards with drill-down and custom report builder.
10. **Multi-Language Support** — Hindi, Marathi, Tamil, and other regional languages.
11. **Chatbot Assistant** — AI-powered HR chatbot for employee queries.
12. **Blockchain Document Verification** — Tamper-proof digital certificates for training and employment.

---

## CONCLUSION

From the above project, we conclude that TalentX — the Human Resource Management System — successfully demonstrates that a comprehensive, digital HR platform can significantly improve organizational efficiency, accuracy, and employee satisfaction compared to traditional manual HR processes.

The system was developed using modern, industry-standard technologies — **Spring Boot 3.x** for the backend and **React 18 with TypeScript** for the frontend — ensuring a scalable, secure, and maintainable application. The **MySQL 8.x** database with 35+ tables handles all HR data with proper relational integrity.

**Key achievements of the TalentX project:**
- Successfully implemented **20+ HR modules** covering the complete employee lifecycle.
- Built a **multi-tenant architecture** supporting multiple organizations with complete data isolation.
- Implemented **role-based access control** with 5 roles and 47 granular permissions.
- Developed **150+ REST API endpoints** with standardized request/response formats.
- Achieved **end-to-end data flow** — all data inserted through the frontend is correctly stored in the database.
- Implemented **automated payroll processing** generating payslips for all active employees in one click.
- Built **real-time notifications** and **complete audit logging** for all sensitive operations.

The system is capable of being implemented in real-world organizations of any size. TalentX proves that computerized work is significantly better than manual work in terms of speed, accuracy, security, and scalability. It minimizes the risk of data loss, maintains the integrity of HR records, and empowers organizations to make data-driven HR decisions.

---

## BIBLIOGRAPHY

### Official Documentation
- Spring Boot Documentation — https://docs.spring.io/spring-boot/docs/current/reference/html/
- React Documentation — https://react.dev/
- Spring Security Reference — https://docs.spring.io/spring-security/reference/
- MySQL 8.0 Reference Manual — https://dev.mysql.com/doc/refman/8.0/en/
- TypeScript Handbook — https://www.typescriptlang.org/docs/

### Online Resources
- Spring Data JPA Guide — https://spring.io/guides/gs/accessing-data-jpa/
- JWT Authentication — https://jwt.io/introduction
- Tailwind CSS Documentation — https://tailwindcss.com/docs
- Swagger / OpenAPI 3 — https://swagger.io/specification/
- React Router Documentation — https://reactrouter.com/

### Reference Books
- Craig Walls, *"Spring in Action, 6th Edition"* — Manning Publications
- Marijn Haverbeke, *"Eloquent JavaScript"* — No Starch Press
- Robert C. Martin, *"Clean Code"* — Prentice Hall
- Ramez Elmasri & Shamkant Navathe, *"Fundamentals of Database Systems"* — Pearson
- Roger S. Pressman, *"Software Engineering: A Practitioner's Approach"* — McGraw-Hill

### Tools Used
- IntelliJ IDEA — https://www.jetbrains.com/idea/
- Visual Studio Code — https://code.visualstudio.com/
- Postman API Testing — https://www.postman.com/
- MySQL Workbench — https://www.mysql.com/products/workbench/
- GitHub — https://github.com/

---

*End of Report*

---
**Thakur College of Engineering and Technology**
**MCA Department — Semester II — A.Y. 2025–2026**
**Project: TalentX Human Resource Management System**
