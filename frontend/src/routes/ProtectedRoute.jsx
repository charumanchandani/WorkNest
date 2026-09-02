import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Spinner, Alert, Button } from '../components/ui';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
        <Spinner size="lg" label="Restoring session..." />
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // RBAC verification
  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="max-w-md w-full p-6 rounded-xl border border-destructive/30 bg-card space-y-4 text-center">
          <Alert
            variant="destructive"
            title="Access Restricted (403 Forbidden)"
          >
            Your current role (<strong>{user?.role}</strong>) does not have permission to access this module.
          </Alert>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
