# TalentX HRMS — Human Resource Management System

> A full-stack, enterprise-grade HR platform built to simplify how organizations manage their people, processes, and productivity.

---

## What is TalentX?

TalentX is a complete **Human Resource Management System (HRMS)** that gives organizations a single platform to manage everything from hiring to retirement. Whether you're a 10-person startup or a 10,000-person enterprise, TalentX scales with you.

Built with **Spring Boot** on the backend and **React** on the frontend, it's fast, secure, and ready to deploy.

---

## Why TalentX Matters

HR teams today are buried in spreadsheets, disconnected tools, and manual processes. TalentX solves this by bringing every HR function under one roof:

- A manager in Mumbai can approve a leave request in seconds
- An HR admin in London can run payroll for 500 employees in one click
- An employee in New York can submit an expense claim from their phone
- A recruiter in Singapore can track 50 candidates across 10 job openings simultaneously

**The result:** Less admin work, fewer errors, happier employees, and better business decisions backed by real data.

---

## Modules at a Glance

| Module | What it does |
|---|---|
| 👥 Employee Management | Full employee lifecycle — onboarding to exit |
| 🏢 Organization & Departments | Multi-org, multi-department, multi-location support |
| ⏰ Attendance | Clock-in/out, overtime, work-from-home tracking |
| 🌴 Leave Management | Leave types, balances, requests, approvals |
| 💰 Payroll | Salary runs, payslips, deductions, tax |
| 📊 Performance | Review cycles, goals, ratings, feedback |
| 🎓 Training | Programs, enrollments, completion tracking |
| 💼 Recruitment | Job postings, candidates, interviews, offers |
| 🏥 Benefits | Health, dental, retirement plan enrollment |
| 🖥️ Asset Management | Laptops, phones, ID cards — assign and track |
| 🧾 Expenses | Submit, approve, reject, and pay expense claims |
| 📄 Documents | Contracts, certificates, policies — all in one place |
| 🔔 Notifications | Real-time alerts for approvals, deadlines, updates |
| 🛡️ Compliance | Rules, checks, jurisdiction-based compliance tracking |
| 📈 Audit Logs | Every action tracked — who did what and when |
| 🔐 Roles & Permissions | Fine-grained access control per user |

---

## Tech Stack

**Backend**
- Java 21 + Spring Boot 3.x
- Spring Security + JWT authentication
- MySQL 8.x
- Hibernate / JPA
- Swagger / OpenAPI 3

**Frontend**
- React 18 + TypeScript
- Tailwind CSS
- Axios

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- MySQL 8.x
- Maven 3.6+

---

### 1. Database Setup

```sql
CREATE DATABASE talentx;
```

Then import the schema:

```bash
mysql -u root -p talentx < Database/Dump20260410.sql
```

---

### 2. Backend Setup

```bash
cd hrms
```

Update `src/main/resources/application.properties` if your DB credentials differ:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/talentx
spring.datasource.username=root
spring.datasource.password=root
```

Start the backend:

```bash
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080/api`

API docs (Swagger): `http://localhost:8080/api/swagger-ui.html`

---

### 3. Frontend Setup

```bash
cd talentxweb
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

### 4. First Login (Demo Credentials)

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin@123` |
| Organization | TalentX Technologies |

> The `DataInitializer` automatically creates this admin account on first startup if it doesn't exist.

---

## Demo Walkthrough

Here's a quick tour of what you can do right after logging in:

### Step 1 — Dashboard
You land on the dashboard showing live stats: active employees, pending leaves, upcoming payroll, open job positions, and recent activity.

### Step 2 — Add an Employee
Go to **Employees → Add Employee**. Fill in personal details, job title, department, salary, and manager. The employee gets a unique employee number automatically.

### Step 3 — Assign a Role
Go to **Settings → User Management**. Create a user account for the employee and assign them a role (Employee, Manager, HR, Admin).

### Step 4 — Submit a Leave Request
Log in as the employee. Go to **Leave → Apply Leave**. Select leave type, dates, and reason. The manager gets notified instantly.

### Step 5 — Approve the Leave
Log in as the manager. Go to **Leave → Pending Approvals**. Review and approve. The employee's leave balance updates automatically.

### Step 6 — Run Payroll
Go to **Payroll → Run Payroll**. Select the pay period, review employee salaries, and process. Payslips are generated for every employee.

### Step 7 — Track an Asset
Go to **Assets → Asset Management**. Add a laptop. Then go to **Assets → Assignments** and assign it to an employee with an assignment date.

### Step 8 — Submit an Expense
As an employee, go to **Expenses → Submit Expense**. Enter amount, type (Travel, Food, etc.), date, and upload a receipt. HR approves and marks it as paid.

### Step 9 — Post a Job
Go to **Recruitment → Job Postings**. Create a new opening with title, department, salary range, and description. Add candidates and schedule interviews.

### Step 10 — View Audit Logs
Go to **Audit Logs**. Every action in the system — logins, approvals, data changes — is recorded here with timestamp, user, and details.

---

## Project Structure

```
TalentX/
├── hrms/                          # Spring Boot backend
│   └── src/main/java/com/talentx/hrms/
│       ├── config/                # Security, JWT, CORS, Swagger
│       ├── controller/            # REST API endpoints (per module)
│       ├── service/               # Business logic (per module)
│       ├── entity/                # JPA entities
│       ├── dto/                   # Request/Response DTOs
│       ├── repository/            # Spring Data JPA repositories
│       ├── mapper/                # Entity ↔ DTO mappers
│       └── common/                # Shared utilities, exceptions
│
├── talentxweb/                    # React frontend
│   └── src/
│       ├── api/                   # Axios API clients (per module)
│       ├── pages/                 # Page components (per module)
│       ├── components/            # Shared UI components
│       ├── hooks/                 # Custom React hooks
│       ├── types/                 # TypeScript types
│       └── services/              # Auth, storage services
│
└── Database/
    └── Dump20260410.sql           # MySQL schema
```

---

## API Overview

All endpoints are prefixed with `/api` and require a JWT Bearer token (except login).

```
POST   /api/auth/login
POST   /api/auth/register

GET    /api/employees
POST   /api/employees
GET    /api/employees/{id}

GET    /api/assets
POST   /api/assets
POST   /api/assets/{id}/assign
POST   /api/assets/{id}/return

GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/{id}/approve
PUT    /api/expenses/{id}/reject
PUT    /api/expenses/{id}/pay

GET    /api/leave/requests
POST   /api/leave/requests
PUT    /api/leave/requests/{id}/approve

GET    /api/payroll/runs
POST   /api/payroll/runs

GET    /api/recruitment/job-postings
POST   /api/recruitment/job-postings

... (full docs at /api/swagger-ui.html)
```

---

## Security Model

- **JWT tokens** — issued on login, expire in 24 hours
- **Role-based access** — ADMIN, HR, MANAGER, EMPLOYEE, RECRUITER
- **Per-endpoint authorization** — `@PreAuthorize` on every controller method
- **Multi-tenant** — each organization's data is fully isolated by `organization_id`
- **Audit trail** — every write operation is logged automatically

---

## Real-World Impact

| Problem | TalentX Solution |
|---|---|
| HR spends 40% of time on admin tasks | Automates leave, payroll, attendance, expenses |
| Employees don't know their leave balance | Self-service portal with real-time balances |
| Payroll errors cost companies millions | Structured payroll runs with validation |
| Compliance violations go unnoticed | Built-in compliance rules and automated checks |
| Hiring is slow and disorganized | End-to-end recruitment pipeline in one place |
| Asset loss due to poor tracking | Full asset lifecycle with assignment history |
| No visibility into workforce data | Dashboard with live analytics across all modules |

---

## License

MIT License — free to use, modify, and distribute.

---

> Built with ❤️ by the TalentX team. Empowering HR teams to focus on people, not paperwork.
