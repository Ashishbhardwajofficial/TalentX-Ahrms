import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import MainLayout from '../components/layout/MainLayout';

// Auth components
import { ProtectedRoute, PublicRoute } from '../components/auth';

// Page components
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
// import DashboardPage from '../pages/Dashboard/DashboardPage'; // Old dashboard
import EnhancedDashboardPage from '../pages/Dashboard/EnhancedDashboardPage'; // New enhanced dashboard

// Employee Management
import EmployeeListPage from '../pages/Employees/EmployeeListPage';
import EmployeeCreatePage from '../pages/Employees/EmployeeCreatePage';
import EmployeeEditPage from '../pages/Employees/EmployeeEditPage';
import EmployeeDetailPage from '../pages/Employees/EmployeeDetailPage';

// Organization Management
import OrganizationSettingsPage from '../pages/Settings/OrganizationSettingsPage';
import DepartmentManagementPage from '../pages/Settings/DepartmentManagementPage';
import LocationManagementPage from '../pages/Settings/LocationManagementPage';

// User & Access Management
import UserManagementPage from '../pages/Settings/UserManagementPage';
import RolePermissionPage from '../pages/Settings/RolePermissionPage';

// Attendance & Time
import AttendancePage from '../pages/Attendance/AttendancePage';
import ShiftManagementPage from '../pages/Settings/ShiftManagementPage';
import HolidayManagementPage from '../pages/Settings/HolidayManagementPage';

// Leave & Payroll
import LeaveRequestsPage from '../pages/Leave/LeaveRequestsPage';
import PayrollRunsPage from '../pages/Payroll/PayrollRunsPage';
import PayslipPage from '../pages/Payroll/PayslipPage';
import TaxDeclarationPage from '../pages/Payroll/TaxDeclarationPage';

// Document & Compliance
import DocumentManagementPage from '../pages/Documents/DocumentManagementPage';
import ComplianceDashboardPage from '../pages/Compliance/ComplianceDashboardPage';

// Performance & Development
import PerformanceReviewPage from '../pages/Performance/PerformanceReviewPage';
import GoalsManagementPage from '../pages/Performance/GoalsManagementPage';
import SkillsManagementPage from '../pages/Skills/SkillsManagementPage';
import EmployeeSkillsPage from '../pages/Skills/EmployeeSkillsPage';
import TrainingProgramsPage from '../pages/Training/TrainingProgramsPage';
import TrainingEnrollmentPage from '../pages/Training/TrainingEnrollmentPage';

// Benefits & Assets
import BenefitsManagementPage from '../pages/Benefits/BenefitsManagementPage';
import BenefitsEnrollmentPage from '../pages/Benefits/BenefitsEnrollmentPage';
import AssetsManagementPage from '../pages/Assets/AssetsManagementPage';
import AssetAssignmentPage from '../pages/Assets/AssetAssignmentPage';

// Expenses & Lifecycle
import ExpenseManagementPage from '../pages/Expenses/ExpenseManagementPage';
import ExitManagementPage from '../pages/Exit/ExitManagementPage';

// User Profile
import ProfilePage from '../pages/Profile/ProfilePage';

// System & Reports
import AuditLogPage from '../pages/AuditLog/AuditLogPage';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import JobPostingsPage from '../pages/Recruitment/JobPostingsPage';
import InterviewSchedulingPage from '../pages/Recruitment/InterviewSchedulingPage';
import CandidateEvaluationPage from '../pages/Recruitment/CandidateEvaluationPage';
import ReportsPage from '../pages/Reports/ReportsPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<EnhancedDashboardPage />} />

          {/* Employee Management */}
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/new" element={<EmployeeCreatePage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="employees/:id/edit" element={<EmployeeEditPage />} />

          {/* Organization Management */}
          <Route path="organizations" element={<OrganizationSettingsPage />} />
          <Route path="departments" element={<DepartmentManagementPage />} />
          <Route path="locations" element={<LocationManagementPage />} />

          {/* User & Access Management */}
          <Route path="users" element={<UserManagementPage />} />
          <Route path="roles" element={<RolePermissionPage />} />

          {/* Attendance & Time */}
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="shifts" element={<ShiftManagementPage />} />
          <Route path="holidays" element={<HolidayManagementPage />} />

          {/* Leave & Payroll */}
          <Route path="leave" element={<LeaveRequestsPage />} />
          <Route path="payroll" element={<PayrollRunsPage />} />
          <Route path="payroll/runs" element={<PayrollRunsPage />} />
          <Route path="payroll/payslips" element={<PayslipPage />} />
          <Route path="payroll/tax-declaration" element={<TaxDeclarationPage />} />

          {/* Document & Compliance */}
          <Route path="documents" element={<DocumentManagementPage />} />
          <Route path="compliance" element={<ComplianceDashboardPage />} />

          {/* Performance & Development */}
          <Route path="performance" element={<PerformanceReviewPage />} />
          <Route path="goals" element={<GoalsManagementPage />} />
          <Route path="skills" element={<SkillsManagementPage />} />
          <Route path="skills/employees" element={<EmployeeSkillsPage />} />
          <Route path="training" element={<TrainingProgramsPage />} />
          <Route path="training/enrollments" element={<TrainingEnrollmentPage />} />

          {/* Benefits & Assets */}
          <Route path="benefits" element={<BenefitsManagementPage />} />
          <Route path="benefits/enrollments" element={<BenefitsEnrollmentPage />} />
          <Route path="assets" element={<AssetsManagementPage />} />
          <Route path="assets/assignments" element={<AssetAssignmentPage />} />

          {/* Expenses & Lifecycle */}
          <Route path="expenses" element={<ExpenseManagementPage />} />
          <Route path="exits" element={<ExitManagementPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* System & Reports */}
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Recruitment */}
          <Route path="recruitment" element={<JobPostingsPage />} />
          <Route path="recruitment/interviews" element={<InterviewSchedulingPage />} />
          <Route path="recruitment/candidates" element={<CandidateEvaluationPage />} />

          {/* Settings (Legacy routes for backward compatibility) */}
          <Route path="settings" element={<OrganizationSettingsPage />} />
          <Route path="settings/departments" element={<DepartmentManagementPage />} />
          <Route path="settings/locations" element={<LocationManagementPage />} />
          <Route path="settings/users" element={<UserManagementPage />} />
          <Route path="settings/roles" element={<RolePermissionPage />} />
          <Route path="settings/shifts" element={<ShiftManagementPage />} />
          <Route path="settings/holidays" element={<HolidayManagementPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;