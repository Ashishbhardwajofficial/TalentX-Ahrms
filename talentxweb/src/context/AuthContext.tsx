import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, JwtResponse } from '../types';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = (): void => {
      try {
        const token = StorageService.getToken();
        const user = StorageService.getUser();

        if (token && user) {
          // Validate token expiration here if needed
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        StorageService.clearAll();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth-logout event from axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log('Auth logout event received');
      StorageService.clearAll();
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Always use real AuthService - remove mock login for production testing
      console.log('[AuthContext] Attempting login with real API...');
      const response = await AuthService.login(credentials);
      console.log('[AuthContext] Login response received:', {
        hasToken: !!response.token,
        username: response.username,
        roles: response.roles
      });

      // Backend returns flat JwtResponse, construct User object from it
      const user: User = {
        id: response.userId,
        organizationId: response.organizationId,
        email: response.email,
        username: response.username,
        isActive: true,
        isVerified: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationName: response.organizationName,
        roles: response.roles.map((roleName, index) => ({
          id: index + 1,
          name: roleName,
          isActive: true,
          assignedAt: new Date().toISOString(),
        })),
      };

      // Store tokens and user data
      console.log('[AuthContext] Storing token with key: hrms_token');
      StorageService.setToken(response.token);
      if (response.refreshToken) {
        StorageService.setRefreshToken(response.refreshToken);
      }
      StorageService.setUser(user);

      // Verify token was stored
      const storedToken = StorageService.getToken();
      console.log('[AuthContext] Token stored successfully:', !!storedToken);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: user,
          token: response.token,
        },
      });
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout API endpoint
      await AuthService.logout();

      // Clear storage
      StorageService.clearAll();

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear storage even if API call fails
      StorageService.clearAll();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh token function - uses current token to get a new one
  const refreshToken = async (): Promise<void> => {
    try {
      const currentToken = StorageService.getToken();
      if (!currentToken) {
        throw new Error('No token available for refresh');
      }

      // Use real AuthService for token refresh (sends current token in header)
      const response = await AuthService.refreshToken(currentToken);

      // Backend returns flat JwtResponse, construct User object from it
      const user: User = {
        id: response.userId,
        organizationId: response.organizationId,
        email: response.email,
        username: response.username,
        isActive: true,
        isVerified: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationName: response.organizationName,
        roles: response.roles.map((roleName, index) => ({
          id: index + 1,
          name: roleName,
          isActive: true,
          assignedAt: new Date().toISOString(),
        })),
      };

      // Update stored tokens and user data
      StorageService.setToken(response.token);
      if (response.refreshToken) {
        StorageService.setRefreshToken(response.refreshToken);
      }
      StorageService.setUser(user);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: user,
          token: response.token,
        },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  // Mock login function (to be replaced with real API call)
  const mockLogin = async (credentials: LoginRequest): Promise<JwtResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (credentials.username === 'admin' && credentials.password === 'password') {
      return {
        token: 'mock-jwt-token',
        type: 'Bearer',
        userId: 1,
        username: 'admin',
        email: 'admin@talentx.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['ADMIN'],
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        organizationId: 1,
        organizationName: 'TalentX',
      };
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};