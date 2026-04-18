import { useAuthContext } from '../context/AuthContext';
import { LoginRequest } from '../types';

// Custom hook that provides authentication functionality
export const useAuth = () => {
  const context = useAuthContext();

  // Enhanced login with error handling
  const loginWithErrorHandling = async (credentials: LoginRequest): Promise<void> => {
    try {
      await context.login(credentials);
    } catch (error) {
      // Error is already handled in the context, just re-throw
      throw error;
    }
  };

  // Enhanced logout with error handling
  const logoutWithErrorHandling = async (): Promise<void> => {
    try {
      await context.logout();
    } catch (error) {
      // Error is already handled in the context, just re-throw
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (roleName: string): boolean => {
    if (!context.user?.roles) return false;
    return context.user.roles.some(role => role.name === roleName);
  };

  // Check if user has specific permission
  const hasPermission = (resource: string, action: string): boolean => {
    if (!context.user?.roles) return false;

    // TODO: Implement permission checking when role permissions are available
    // For now, return true if user has any active roles
    return context.user.roles.some(role => role.isActive);
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  // Check if user is manager or above
  const isManager = (): boolean => {
    return hasRole('MANAGER') || hasRole('HR') || isAdmin();
  };

  // Get user's full name
  const getUserFullName = (): string => {
    if (!context.user) return '';
    return context.user.username || context.user.email || 'Unknown User';
  };

  // Get user's initials
  const getUserInitials = (): string => {
    if (!context.user) return '';
    const name = context.user.username || context.user.email || 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return {
    // State
    user: context.user,
    token: context.token,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    error: context.error,

    // Actions
    login: loginWithErrorHandling,
    logout: logoutWithErrorHandling,
    clearError: context.clearError,
    refreshToken: context.refreshToken,

    // Utility functions
    hasRole,
    hasPermission,
    isAdmin,
    isManager,
    getUserFullName,
    getUserInitials,
  };
};