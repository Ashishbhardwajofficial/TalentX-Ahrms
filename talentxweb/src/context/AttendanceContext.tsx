import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import attendanceApi, { AttendanceRecordDTO, AttendanceCheckInDTO, AttendanceCheckOutDTO } from '../api/attendanceApi';
import { useAuthContext } from './AuthContext';

// Attendance state interface
interface AttendanceState {
  currentAttendance: AttendanceRecordDTO | null;
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number;
  status: AttendanceStatus | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Attendance actions
type AttendanceAction =
  | { type: 'ATTENDANCE_LOADING' }
  | { type: 'ATTENDANCE_SUCCESS'; payload: AttendanceRecordDTO | null }
  | { type: 'CHECK_IN_SUCCESS'; payload: AttendanceRecordDTO }
  | { type: 'CHECK_OUT_SUCCESS'; payload: AttendanceRecordDTO }
  | { type: 'ATTENDANCE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_ATTENDANCE' };

// Attendance context interface
export interface AttendanceContextType extends AttendanceState {
  checkIn: (location?: string, locationId?: number, notes?: string) => Promise<void>;
  checkOut: (notes?: string, breakHours?: number) => Promise<void>;
  refreshAttendance: () => Promise<void>;
  clearError: () => void;
  resetAttendance: () => void;
}

// Initial state
const initialState: AttendanceState = {
  currentAttendance: null,
  isCheckedIn: false,
  checkInTime: null,
  checkOutTime: null,
  totalHours: 0,
  status: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Attendance reducer
const attendanceReducer = (state: AttendanceState, action: AttendanceAction): AttendanceState => {
  switch (action.type) {
    case 'ATTENDANCE_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'ATTENDANCE_SUCCESS':
      const attendance = action.payload;
      return {
        ...state,
        currentAttendance: attendance,
        isCheckedIn: attendance ? !!attendance.checkInTime && !attendance.checkOutTime : false,
        checkInTime: attendance?.checkInTime || null,
        checkOutTime: attendance?.checkOutTime || null,
        totalHours: attendance?.totalHours || 0,
        status: attendance?.status || null,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    case 'CHECK_IN_SUCCESS':
      return {
        ...state,
        currentAttendance: action.payload,
        isCheckedIn: true,
        checkInTime: action.payload.checkInTime || null,
        checkOutTime: null,
        totalHours: 0,
        status: action.payload.status,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    case 'CHECK_OUT_SUCCESS':
      return {
        ...state,
        currentAttendance: action.payload,
        isCheckedIn: false,
        checkInTime: action.payload.checkInTime || null,
        checkOutTime: action.payload.checkOutTime || null,
        totalHours: action.payload.totalHours || 0,
        status: action.payload.status,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    case 'ATTENDANCE_ERROR':
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
    case 'RESET_ATTENDANCE':
      return initialState;
    default:
      return state;
  }
};

// Create context
const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Attendance provider props
interface AttendanceProviderProps {
  children: ReactNode;
}

// Attendance provider component
export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);
  const { user, isAuthenticated } = useAuthContext();

  // Initialize attendance state when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshAttendance();
    } else {
      dispatch({ type: 'RESET_ATTENDANCE' });
    }
  }, [isAuthenticated, user]);

  // Auto-refresh attendance every 5 minutes when checked in
  useEffect(() => {
    if (state.isCheckedIn && isAuthenticated && user) {
      const interval = setInterval(() => {
        refreshAttendance();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.isCheckedIn, isAuthenticated, user]);

  // Check in function
  const checkIn = async (location?: string, locationId?: number, notes?: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    dispatch({ type: 'ATTENDANCE_LOADING' });

    try {
      const checkInData: AttendanceCheckInDTO = {
        employeeId: user.id,
        checkInTime: new Date().toISOString(),
        checkInLocation: location,
        locationId,
        notes,
      };

      const response = await attendanceApi.checkIn(checkInData);

      dispatch({
        type: 'CHECK_IN_SUCCESS',
        payload: response,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Check-in failed';
      dispatch({
        type: 'ATTENDANCE_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Check out function
  const checkOut = async (notes?: string, breakHours?: number): Promise<void> => {
    if (!user || !state.currentAttendance) {
      throw new Error('No active attendance record found');
    }

    dispatch({ type: 'ATTENDANCE_LOADING' });

    try {
      const checkOutData: AttendanceCheckOutDTO = {
        employeeId: state.currentAttendance.employeeId,
        attendanceRecordId: state.currentAttendance.id,
        checkOutTime: new Date().toISOString(),
        notes,
        breakHours,
      };

      const response = await attendanceApi.checkOut(checkOutData);

      dispatch({
        type: 'CHECK_OUT_SUCCESS',
        payload: response,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Check-out failed';
      dispatch({
        type: 'ATTENDANCE_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Refresh attendance function
  const refreshAttendance = async (): Promise<void> => {
    if (!user) {
      return;
    }

    dispatch({ type: 'ATTENDANCE_LOADING' });

    try {
      const todayAttendance = await attendanceApi.getTodayAttendance(user.id);

      dispatch({
        type: 'ATTENDANCE_SUCCESS',
        payload: todayAttendance,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh attendance';
      dispatch({
        type: 'ATTENDANCE_ERROR',
        payload: errorMessage,
      });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Reset attendance function
  const resetAttendance = (): void => {
    dispatch({ type: 'RESET_ATTENDANCE' });
  };

  const contextValue: AttendanceContextType = {
    ...state,
    checkIn,
    checkOut,
    refreshAttendance,
    clearError,
    resetAttendance,
  };

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};

// Custom hook to use attendance context
export const useAttendanceContext = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendanceContext must be used within an AttendanceProvider');
  }
  return context;
};