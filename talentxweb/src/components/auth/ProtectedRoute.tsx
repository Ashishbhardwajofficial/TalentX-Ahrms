import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import './AuthComponents.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: {
    resource: string;
    action: string;
  };
  fallbackPath?: string;
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * - Redirects unauthenticated users to login
 * - Optionally checks for specific roles or permissions
 * - Shows loading state while authentication is being verified
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, loading, user, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner />
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role-based access if required
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="protected-route-unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have the required role ({requiredRole}) to access this page.</p>
        <p>Current user: {user?.username}</p>
        <p>Available roles: {user?.roles.map(role => role.name).join(', ')}</p>
      </div>
    );
  }

  // Check permission-based access if required
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return (
      <div className="protected-route-unauthorized">
        <h2>Access Denied</h2>
        <p>
          You don't have the required permission ({requiredPermission.action} on {requiredPermission.resource})
          to access this page.
        </p>
        <p>Current user: {user?.username}</p>
      </div>
    );
  }

  // User is authenticated and authorized, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;