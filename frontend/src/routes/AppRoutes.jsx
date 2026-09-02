import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage, LoginPage, RegisterPage, AppPlaceholderPage } from '../pages';
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

      {/* Authenticated Verification Route */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppPlaceholderPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
