import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Spinner } from '../components/ui';

export const PublicOnlyRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <Spinner size="lg" label="Checking session..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicOnlyRoute;
