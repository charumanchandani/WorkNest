import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  EmployeeDashboard,
  EmployeesPage,
  EmployeeDetailPage,
  DepartmentsPage,
  DepartmentDetailPage,
  AttendancePage,
  AttendanceManagePage,
  LeavePage,
  LeaveManagePage,
} from '../pages';
import { AppLayout } from '../layouts';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest-only Auth Pages */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Authenticated Workspace Application Shell */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />

        {/* Phase 8 Leave Management */}
        <Route path="leave" element={<LeavePage />} />
        <Route
          path="leave/manage"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <LeaveManagePage />
            </ProtectedRoute>
          }
        />

        {/* Phase 7 Attendance Management */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route
          path="attendance/manage"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <AttendanceManagePage />
            </ProtectedRoute>
          }
        />

        {/* Phase 5 Employee Management (Admin & Manager) */}
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Phase 6 Departments & Organization Structure (Admin & Manager) */}
        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="departments/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <DepartmentDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
