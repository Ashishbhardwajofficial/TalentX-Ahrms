import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import './AuthComponents.css';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * PublicRoute component for routes that should only be accessible to unauthenticated users
 * - Redirects authenticated users to dashboard or specified path
 * - Shows loading state while authentication is being verified
 * - Typically used for login, register, and other auth-related pages
 */
const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectPath = '/dashboard'
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="public-route-loading">
        <LoadingSpinner />
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // User is not authenticated, render the public content
  return <>{children}</>;
};

export default PublicRoute;