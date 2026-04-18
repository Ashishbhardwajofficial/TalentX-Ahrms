import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { ComplianceCheck, ComplianceCheckStatus, ComplianceSeverity } from '../types';
import complianceApi, { ComplianceCheckDTO, ComplianceOverviewResponse } from '../api/complianceApi';
import { useAuthContext } from './AuthContext';

// Compliance state interface
interface ComplianceState {
  violations: ComplianceCheckDTO[];
  overview: ComplianceOverviewResponse | null;
  criticalViolations: ComplianceCheckDTO[];
  highViolations: ComplianceCheckDTO[];
  unresolvedCount: number;
  complianceScore: number;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  alertsEnabled: boolean;
}

// Compliance actions
type ComplianceAction =
  | { type: 'COMPLIANCE_LOADING' }
  | { type: 'VIOLATIONS_SUCCESS'; payload: ComplianceCheckDTO[] }
  | { type: 'OVERVIEW_SUCCESS'; payload: ComplianceOverviewResponse }
  | { type: 'CRITICAL_VIOLATIONS_SUCCESS'; payload: ComplianceCheckDTO[] }
  | { type: 'HIGH_VIOLATIONS_SUCCESS'; payload: ComplianceCheckDTO[] }
  | { type: 'VIOLATION_RESOLVED'; payload: number }
  | { type: 'NEW_VIOLATION'; payload: ComplianceCheckDTO }
  | { type: 'COMPLIANCE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ALERTS_ENABLED'; payload: boolean }
  | { type: 'RESET_COMPLIANCE' };

// Compliance context interface
export interface ComplianceContextType extends ComplianceState {
  loadViolations: () => Promise<void>;
  loadOverview: () => Promise<void>;
  loadCriticalViolations: () => Promise<void>;
  loadHighViolations: () => Promise<void>;
  resolveViolation: (violationId: number, resolutionNotes: string) => Promise<void>;
  refreshCompliance: () => Promise<void>;
  clearError: () => void;
  enableAlerts: () => void;
  disableAlerts: () => void;
  resetCompliance: () => void;
  getViolationsByEmployee: (employeeId: number) => Promise<ComplianceCheckDTO[]>;
  runComplianceCheck: (employeeId?: number, ruleIds?: number[]) => Promise<ComplianceCheckDTO[]>;
}

// Initial state
const initialState: ComplianceState = {
  violations: [],
  overview: null,
  criticalViolations: [],
  highViolations: [],
  unresolvedCount: 0,
  complianceScore: 100,
  loading: false,
  error: null,
  lastUpdated: null,
  alertsEnabled: true,
};

// Compliance reducer
const complianceReducer = (state: ComplianceState, action: ComplianceAction): ComplianceState => {
  switch (action.type) {
    case 'COMPLIANCE_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'VIOLATIONS_SUCCESS':
      return {
        ...state,
        violations: action.payload,
        unresolvedCount: action.payload.filter(v => !v.resolved).length,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    case 'OVERVIEW_SUCCESS':
      const overview = action.payload;
      const totalChecks = overview.totalChecks || 1; // Avoid division by zero
      const complianceScore = Math.round((overview.compliantChecks / totalChecks) * 100);

      return {
        ...state,
        overview,
        complianceScore,
        unresolvedCount: overview.unresolvedViolations,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    case 'CRITICAL_VIOLATIONS_SUCCESS':
      return {
        ...state,
        criticalViolations: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case 'HIGH_VIOLATIONS_SUCCESS':
      return {
        ...state,
        highViolations: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case 'VIOLATION_RESOLVED':
      return {
        ...state,
        violations: state.violations.map(violation =>
          violation.id === action.payload
            ? { ...violation, resolved: true, resolvedAt: new Date().toISOString() }
            : violation
        ),
        criticalViolations: state.criticalViolations.map(violation =>
          violation.id === action.payload
            ? { ...violation, resolved: true, resolvedAt: new Date().toISOString() }
            : violation
        ),
        highViolations: state.highViolations.map(violation =>
          violation.id === action.payload
            ? { ...violation, resolved: true, resolvedAt: new Date().toISOString() }
            : violation
        ),
        unresolvedCount: Math.max(0, state.unresolvedCount - 1),
        lastUpdated: new Date().toISOString(),
      };
    case 'NEW_VIOLATION':
      const newViolation = action.payload;
      const updatedViolations = [newViolation, ...state.violations];
      const updatedCritical = newViolation.severity === 'CRITICAL'
        ? [newViolation, ...state.criticalViolations]
        : state.criticalViolations;
      const updatedHigh = newViolation.severity === 'HIGH'
        ? [newViolation, ...state.highViolations]
        : state.highViolations;

      return {
        ...state,
        violations: updatedViolations,
        criticalViolations: updatedCritical,
        highViolations: updatedHigh,
        unresolvedCount: newViolation.resolved ? state.unresolvedCount : state.unresolvedCount + 1,
        lastUpdated: new Date().toISOString(),
      };
    case 'COMPLIANCE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_ALERTS_ENABLED':
      return {
        ...state,
        alertsEnabled: action.payload,
      };
    case 'RESET_COMPLIANCE':
      return initialState;
    default:
      return state;
  }
};

// Create context
const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

// Compliance provider props
interface ComplianceProviderProps {
  children: ReactNode;
  organizationId?: number;
}

// Compliance provider component
export const ComplianceProvider: React.FC<ComplianceProviderProps> = ({
  children,
  organizationId
}) => {
  const [state, dispatch] = useReducer(complianceReducer, initialState);
  const { user, isAuthenticated } = useAuthContext();

  // Get organization ID from user or props
  const orgId = organizationId || user?.organizationId;

  // Initialize compliance data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && orgId) {
      refreshCompliance();
    } else {
      dispatch({ type: 'RESET_COMPLIANCE' });
    }
  }, [isAuthenticated, user, orgId]);

  // Auto-refresh compliance data every 10 minutes
  useEffect(() => {
    if (state.alertsEnabled && isAuthenticated && user && orgId) {
      const interval = setInterval(() => {
        loadOverview();
        loadCriticalViolations();
        loadHighViolations();
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.alertsEnabled, isAuthenticated, user, orgId]);

  // Load violations function
  const loadViolations = useCallback(async (): Promise<void> => {
    if (!orgId) {
      return;
    }

    dispatch({ type: 'COMPLIANCE_LOADING' });

    try {
      const response = await complianceApi.getUnresolvedViolations(orgId, {
        page: 0,
        size: 50,
        sort: 'severity',
        direction: 'desc'
      });

      dispatch({
        type: 'VIOLATIONS_SUCCESS',
        payload: response.content,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load violations';
      dispatch({
        type: 'COMPLIANCE_ERROR',
        payload: errorMessage,
      });
    }
  }, [orgId]);

  // Load overview function
  const loadOverview = useCallback(async (): Promise<void> => {
    if (!orgId) {
      return;
    }

    try {
      const overview = await complianceApi.getComplianceOverview(orgId);

      dispatch({
        type: 'OVERVIEW_SUCCESS',
        payload: overview,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load compliance overview';
      dispatch({
        type: 'COMPLIANCE_ERROR',
        payload: errorMessage,
      });
    }
  }, [orgId]);

  // Load critical violations function
  const loadCriticalViolations = useCallback(async (): Promise<void> => {
    if (!orgId) {
      return;
    }

    try {
      const response = await complianceApi.getChecks({
        organizationId: orgId,
        severity: ComplianceSeverity.CRITICAL,
        resolved: false,
        page: 0,
        size: 20,
        sort: 'checkDate',
        direction: 'desc'
      });

      dispatch({
        type: 'CRITICAL_VIOLATIONS_SUCCESS',
        payload: response.content,
      });
    } catch (error) {
      // Silently fail for critical violations to avoid disrupting UX
      console.error('Failed to load critical violations:', error);
    }
  }, [orgId]);

  // Load high violations function
  const loadHighViolations = useCallback(async (): Promise<void> => {
    if (!orgId) {
      return;
    }

    try {
      const response = await complianceApi.getChecks({
        organizationId: orgId,
        severity: ComplianceSeverity.HIGH,
        resolved: false,
        page: 0,
        size: 20,
        sort: 'checkDate',
        direction: 'desc'
      });

      dispatch({
        type: 'HIGH_VIOLATIONS_SUCCESS',
        payload: response.content,
      });
    } catch (error) {
      // Silently fail for high violations to avoid disrupting UX
      console.error('Failed to load high violations:', error);
    }
  }, [orgId]);

  // Resolve violation function
  const resolveViolation = async (violationId: number, resolutionNotes: string): Promise<void> => {
    try {
      await complianceApi.resolveViolation(violationId, { resolutionNotes });

      dispatch({
        type: 'VIOLATION_RESOLVED',
        payload: violationId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resolve violation';
      dispatch({
        type: 'COMPLIANCE_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Get violations by employee function
  const getViolationsByEmployee = async (employeeId: number): Promise<ComplianceCheckDTO[]> => {
    try {
      const response = await complianceApi.getEmployeeChecks(employeeId, {
        page: 0,
        size: 50,
        sort: 'checkDate',
        direction: 'desc'
      });

      return response.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load employee violations';
      dispatch({
        type: 'COMPLIANCE_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Run compliance check function
  const runComplianceCheck = async (employeeId?: number, ruleIds?: number[]): Promise<ComplianceCheckDTO[]> => {
    if (!orgId) {
      throw new Error('Organization ID not available');
    }

    try {
      const results = await complianceApi.runComplianceCheck({
        organizationId: orgId,
        ...(employeeId && { employeeId }),
        ...(ruleIds && { ruleIds }),
      });

      // Add new violations to state
      results.forEach(result => {
        if (result.status !== 'COMPLIANT') {
          dispatch({
            type: 'NEW_VIOLATION',
            payload: result,
          });
        }
      });

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run compliance check';
      dispatch({
        type: 'COMPLIANCE_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Refresh compliance function
  const refreshCompliance = async (): Promise<void> => {
    await Promise.all([
      loadViolations(),
      loadOverview(),
      loadCriticalViolations(),
      loadHighViolations(),
    ]);
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Enable alerts function
  const enableAlerts = (): void => {
    dispatch({ type: 'SET_ALERTS_ENABLED', payload: true });
  };

  // Disable alerts function
  const disableAlerts = (): void => {
    dispatch({ type: 'SET_ALERTS_ENABLED', payload: false });
  };

  // Reset compliance function
  const resetCompliance = (): void => {
    dispatch({ type: 'RESET_COMPLIANCE' });
  };

  const contextValue: ComplianceContextType = {
    ...state,
    loadViolations,
    loadOverview,
    loadCriticalViolations,
    loadHighViolations,
    resolveViolation,
    refreshCompliance,
    clearError,
    enableAlerts,
    disableAlerts,
    resetCompliance,
    getViolationsByEmployee,
    runComplianceCheck,
  };

  return (
    <ComplianceContext.Provider value={contextValue}>
      {children}
    </ComplianceContext.Provider>
  );
};

// Custom hook to use compliance context
export const useComplianceContext = (): ComplianceContextType => {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error('useComplianceContext must be used within a ComplianceProvider');
  }
  return context;
};