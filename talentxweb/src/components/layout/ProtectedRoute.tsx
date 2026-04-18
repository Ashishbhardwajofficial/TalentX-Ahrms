import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  fallbackPath = '/login'
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner overlay message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    // TODO: Implement permission checking when role permissions are available
    // For now, allow access if user has any roles
    const hasAnyRole = user.roles.length > 0;

    if (!hasAnyRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;