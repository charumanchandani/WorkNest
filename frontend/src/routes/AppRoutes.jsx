import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  EmployeeDashboard,
} from '../pages';
import { AppLayout } from '../layouts';
import { Spinner } from '../components/ui/Spinner';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

// Lazy-loaded routes for performance & bundle optimization
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AIAssistantPage = lazy(() => import('../pages/AIAssistantPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage'));
const AnnouncementsPage = lazy(() => import('../pages/AnnouncementsPage'));
const AnnouncementDetailPage = lazy(() => import('../pages/AnnouncementDetailPage'));
const AnnouncementsManagePage = lazy(() => import('../pages/AnnouncementsManagePage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const TaskDetailPage = lazy(() => import('../pages/TaskDetailPage'));
const TasksManagePage = lazy(() => import('../pages/TasksManagePage'));
const LeavePage = lazy(() => import('../pages/LeavePage'));
const LeaveManagePage = lazy(() => import('../pages/LeaveManagePage'));
const AttendancePage = lazy(() => import('../pages/AttendancePage'));
const AttendanceManagePage = lazy(() => import('../pages/AttendanceManagePage'));
const EmployeesPage = lazy(() => import('../pages/EmployeesPage'));
const EmployeeDetailPage = lazy(() => import('../pages/EmployeeDetailPage'));
const DepartmentsPage = lazy(() => import('../pages/DepartmentsPage'));
const DepartmentDetailPage = lazy(() => import('../pages/DepartmentDetailPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full" aria-busy="true">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" className="text-primary-600 dark:text-primary-400" />
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading workspace module...</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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

          {/* Phase 14 User Profile */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Phase 14 Account & System Settings */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Phase 13 AI Assistance Hub */}
          <Route path="ai-assistant" element={<AIAssistantPage />} />

          {/* Phase 12 Analytics Dashboard */}
          <Route path="analytics" element={<AnalyticsPage />} />

          {/* Phase 12 Operational Reports */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Phase 11 In-App Notifications Center */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Phase 10 Document Vault */}
          <Route path="documents" element={<DocumentsPage />} />

          {/* Phase 10 Company Announcements */}
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
          <Route
            path="announcements/manage"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AnnouncementsManagePage />
              </ProtectedRoute>
            }
          />

          {/* Phase 9 Task Management */}
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route
            path="tasks/manage"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <TasksManagePage />
              </ProtectedRoute>
            }
          />

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
    </Suspense>
  );
};

export default AppRoutes;

