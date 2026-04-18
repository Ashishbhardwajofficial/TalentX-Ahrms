// frontend/src/api/attendanceApi.ts
import apiClient from "./axiosClient";
import {
  AttendanceRecord,
  AttendanceStatus,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockAttendanceRecords, mockEmployees, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// ATTENDANCE API DTOs
// ============================================================================

/**
 * DTO for attendance record response
 */
export interface AttendanceRecordDTO {
  id: number;
  employeeId: number;
  employeeName?: string;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  status: AttendanceStatus;
  locationId?: number;
  checkInLocation?: string;
  checkOutLocation?: string;
  notes?: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  active?: boolean;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

/**
 * DTO for check-in request
 */
export interface AttendanceCheckInDTO {
  employeeId: number;
  checkInTime: string; // ISO datetime
  checkInLocation?: string | undefined;
  locationId?: number | undefined;
  notes?: string | undefined;
}

/**
 * DTO for check-out request
 */
export interface AttendanceCheckOutDTO {
  employeeId: number;        // used to find today's record on the backend
  attendanceRecordId?: number; // kept for mock mode backward compat
  checkOutTime: string; // ISO datetime
  checkOutLocation?: string | undefined;
  breakHours?: number | undefined;
  notes?: string | undefined;
}

/**
 * DTO for creating/updating attendance record
 */
export interface AttendanceRecordCreateDTO {
  employeeId: number;
  attendanceDate: string; // ISO date
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  status: AttendanceStatus;
  locationId?: number;
  checkInLocation?: string;
  checkOutLocation?: string;
  notes?: string;
}

/**
 * DTO for updating attendance record
 */
export interface AttendanceRecordUpdateDTO {
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  status?: AttendanceStatus;
  locationId?: number;
  checkInLocation?: string;
  checkOutLocation?: string;
  notes?: string;
  approvedBy?: number;
}

/**
 * Search parameters for attendance records
 */
export interface AttendanceSearchParams extends PaginationParams {
  employeeId?: number;
  departmentId?: number;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  status?: AttendanceStatus;
  locationId?: number;
  approvedBy?: number;
  search?: string;
}

/**
 * Attendance report response
 */
export interface AttendanceReportDTO {
  employeeId: number;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  totalHours: number;
  overtimeHours: number;
  averageHoursPerDay: number;
}

/**
 * Attendance summary statistics
 */
export interface AttendanceSummaryDTO {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  lateToday: number;
  averageAttendanceRate: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
}

// ============================================================================
// ATTENDANCE API CLIENT INTERFACE
// ============================================================================

/**
 * Interface for Attendance API client
 */
export interface AttendanceApiClient {
  // Check-in/Check-out operations
  checkIn(data: AttendanceCheckInDTO): Promise<AttendanceRecordDTO>;
  checkOut(data: AttendanceCheckOutDTO): Promise<AttendanceRecordDTO>;

  // CRUD operations
  getAttendanceRecords(params: AttendanceSearchParams): Promise<PaginatedResponse<AttendanceRecordDTO>>;
  getAttendanceRecord(id: number): Promise<AttendanceRecordDTO>;
  createAttendanceRecord(data: AttendanceRecordCreateDTO): Promise<AttendanceRecordDTO>;
  updateAttendanceRecord(id: number, data: AttendanceRecordUpdateDTO): Promise<AttendanceRecordDTO>;
  deleteAttendanceRecord(id: number): Promise<void>;

  // Employee-specific operations
  getEmployeeAttendance(employeeId: number, params?: AttendanceSearchParams): Promise<PaginatedResponse<AttendanceRecordDTO>>;
  getEmployeeAttendanceByDateRange(employeeId: number, startDate: string, endDate: string): Promise<AttendanceRecordDTO[]>;
  getTodayAttendance(employeeId: number): Promise<AttendanceRecordDTO | null>;

  // Reporting operations
  getAttendanceReport(params: AttendanceSearchParams): Promise<AttendanceReportDTO[]>;
  getAttendanceSummary(startDate?: string, endDate?: string): Promise<AttendanceSummaryDTO>;
  getDepartmentAttendance(departmentId: number, params?: AttendanceSearchParams): Promise<PaginatedResponse<AttendanceRecordDTO>>;

  // Approval operations
  approveAttendance(id: number, approverId: number): Promise<AttendanceRecordDTO>;
  bulkApproveAttendance(ids: number[], approverId: number): Promise<AttendanceRecordDTO[]>;
}

// ============================================================================
// ATTENDANCE API CLIENT IMPLEMENTATION
// ============================================================================

/**
 * Implementation of Attendance API client
 */
class AttendanceApiClientImpl implements AttendanceApiClient {
  private readonly ENDPOINTS = {
    BASE: '/attendance',
    BY_ID: (id: number) => `/attendance/${id}`,
    CHECK_IN: '/attendance/check-in',
    CHECK_OUT: '/attendance/check-out',
    EMPLOYEE: (employeeId: number) => `/attendance/employee/${employeeId}`,
    EMPLOYEE_DATE_RANGE: (employeeId: number) => `/attendance/employee/${employeeId}/date-range`,
    TODAY: (employeeId: number) => `/attendance/employee/${employeeId}/today`,
    REPORT: '/attendance/report',
    SUMMARY: '/attendance/summary',
    DEPARTMENT: (departmentId: number) => `/attendance/department/${departmentId}`,
    APPROVE: (id: number) => `/attendance/${id}/approve`,
    BULK_APPROVE: '/attendance/bulk-approve',
    RECORDS: '/attendance/records'
  } as const;

  /**
   * Check in an employee
   */
  async checkIn(data: AttendanceCheckInDTO): Promise<AttendanceRecordDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const employee = mockEmployees.find(e => e.id === data.employeeId);
      const today = new Date().toISOString().split('T')[0]!;

      const newRecord: AttendanceRecordDTO = {
        id: mockAttendanceRecords.length + 1,
        employeeId: data.employeeId,
        attendanceDate: today,
        status: "PRESENT" as AttendanceStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (employee?.fullName) newRecord.employeeName = employee.fullName;
      if (data.checkInTime) newRecord.checkInTime = data.checkInTime;
      if (data.locationId) newRecord.locationId = data.locationId;
      if (data.checkInLocation) newRecord.checkInLocation = data.checkInLocation;
      if (data.notes) newRecord.notes = data.notes;

      mockAttendanceRecords.push(newRecord);
      return newRecord;
    }

    // Backend expects: { employeeId, checkInTime: "HH:mm:ss", location, notes }
    const payload: Record<string, any> = {
      employeeId: data.employeeId,
    };
    if (data.checkInTime) {
      // Convert ISO datetime to LocalTime string "HH:mm:ss"
      const time = new Date(data.checkInTime);
      payload['checkInTime'] = time.toTimeString().substring(0, 8);
    }
    if (data.checkInLocation) payload['location'] = data.checkInLocation;
    if (data.notes) payload['notes'] = data.notes;

    return apiClient.post<AttendanceRecordDTO>(this.ENDPOINTS.CHECK_IN, payload);
  }

  /**
   * Check out an employee
   */
  async checkOut(data: AttendanceCheckOutDTO): Promise<AttendanceRecordDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const recordId = data.attendanceRecordId ?? data.employeeId;
      const index = mockAttendanceRecords.findIndex(r => r.id === recordId);
      if (index === -1) {
        throw new Error(`Attendance record with ID ${recordId} not found`);
      }

      const existing = mockAttendanceRecords[index];
      if (!existing) {
        throw new Error(`Attendance record with ID ${recordId} not found`);
      }

      let totalHours: number | undefined;
      if (existing.checkInTime) {
        const checkIn = new Date(existing.checkInTime);
        const checkOut = new Date(data.checkOutTime);
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        if (data.breakHours) totalHours -= data.breakHours;
      }

      const updated: AttendanceRecordDTO = {
        ...existing,
        checkOutTime: data.checkOutTime,
        ...(data.checkOutLocation && { checkOutLocation: data.checkOutLocation }),
        ...(data.breakHours !== undefined && { breakHours: data.breakHours }),
        ...(totalHours !== undefined && { totalHours }),
        ...(data.notes && { notes: data.notes }),
        updatedAt: new Date().toISOString()
      };

      mockAttendanceRecords[index] = updated;
      return updated;
    }

    // Backend expects: { employeeId, checkOutTime: "HH:mm:ss", location, notes }
    const payload: Record<string, any> = {
      employeeId: data.employeeId ?? data.attendanceRecordId,
    };
    if (data.checkOutTime) {
      const time = new Date(data.checkOutTime);
      payload['checkOutTime'] = time.toTimeString().substring(0, 8);
    }
    if (data.checkOutLocation) payload['location'] = data.checkOutLocation;
    if (data.notes) payload['notes'] = data.notes;

    return apiClient.post<AttendanceRecordDTO>(this.ENDPOINTS.CHECK_OUT, payload);
  }

  /**
   * Get paginated list of attendance records with filtering
   */
  async getAttendanceRecords(params: AttendanceSearchParams): Promise<PaginatedResponse<AttendanceRecordDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockAttendanceRecords];

      // Apply filters
      if (params.employeeId) {
        filtered = filtered.filter(r => r.employeeId === params.employeeId);
      }
      if (params.status) {
        filtered = filtered.filter(r => r.status === params.status);
      }
      if (params.startDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) >= new Date(params.startDate!));
      }
      if (params.endDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) <= new Date(params.endDate!));
      }
      if (params.locationId) {
        filtered = filtered.filter(r => r.locationId === params.locationId);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(r =>
          r.employeeName?.toLowerCase().includes(searchLower) ||
          r.notes?.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.get<PaginatedResponse<AttendanceRecordDTO>>(
      `${this.ENDPOINTS.RECORDS}?${queryParams}`
    );
    return this.normalizePage(response);
  }

  /**
   * Get single attendance record by ID
   */
  async getAttendanceRecord(id: number): Promise<AttendanceRecordDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const record = mockAttendanceRecords.find(r => r.id === id);
      if (!record) {
        throw new Error(`Attendance record with ID ${id} not found`);
      }
      return record;
    }

    // Real API call
    return this.normalizeRecord(await apiClient.get<AttendanceRecordDTO>(this.ENDPOINTS.BY_ID(id)));
  }

  /**
   * Create new attendance record
   */
  async createAttendanceRecord(data: AttendanceRecordCreateDTO): Promise<AttendanceRecordDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const employee = mockEmployees.find(e => e.id === data.employeeId);
      const newRecord: AttendanceRecordDTO = {
        id: mockAttendanceRecords.length + 1,
        employeeId: data.employeeId,
        ...(employee?.fullName && { employeeName: employee.fullName }),
        attendanceDate: data.attendanceDate,
        status: data.status,
        ...(data.checkInTime && { checkInTime: data.checkInTime }),
        ...(data.checkOutTime && { checkOutTime: data.checkOutTime }),
        ...(data.totalHours !== undefined && { totalHours: data.totalHours }),
        ...(data.overtimeHours !== undefined && { overtimeHours: data.overtimeHours }),
        ...(data.breakHours !== undefined && { breakHours: data.breakHours }),
        ...(data.locationId && { locationId: data.locationId }),
        ...(data.checkInLocation && { checkInLocation: data.checkInLocation }),
        ...(data.checkOutLocation && { checkOutLocation: data.checkOutLocation }),
        ...(data.notes && { notes: data.notes }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockAttendanceRecords.push(newRecord);
      return newRecord;
    }

    // Real API call
    return this.normalizeRecord(await apiClient.post<AttendanceRecordDTO>(this.ENDPOINTS.BASE, data));
  }

  /**
   * Update existing attendance record
   */
  async updateAttendanceRecord(id: number, data: AttendanceRecordUpdateDTO): Promise<AttendanceRecordDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockAttendanceRecords.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Attendance record with ID ${id} not found`);
      }

      const existing = mockAttendanceRecords[index];
      if (!existing) {
        throw new Error(`Attendance record with ID ${id} not found`);
      }

      const updated: AttendanceRecordDTO = {
        ...existing,
        ...(data.checkInTime && { checkInTime: data.checkInTime }),
        ...(data.checkOutTime && { checkOutTime: data.checkOutTime }),
        ...(data.totalHours !== undefined && { totalHours: data.totalHours }),
        ...(data.overtimeHours !== undefined && { overtimeHours: data.overtimeHours }),
        ...(data.breakHours !== undefined && { breakHours: data.breakHours }),
        ...(data.status && { status: data.status }),
        ...(data.locationId && { locationId: data.locationId }),
        ...(data.checkInLocation && { checkInLocation: data.checkInLocation }),
        ...(data.checkOutLocation && { checkOutLocation: data.checkOutLocation }),
        ...(data.notes && { notes: data.notes }),
        ...(data.approvedBy && { approvedBy: data.approvedBy }),
        updatedAt: new Date().toISOString()
      };

      mockAttendanceRecords[index] = updated;
      return updated;
    }

    // Real API call
    return this.normalizeRecord(await apiClient.put<AttendanceRecordDTO>(this.ENDPOINTS.BY_ID(id), data));
  }

  /**
   * Delete attendance record
   */
  async deleteAttendanceRecord(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockAttendanceRecords.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Attendance record with ID ${id} not found`);
      }
      mockAttendanceRecords.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get attendance records for a specific employee
   */
  async getEmployeeAttendance(
    employeeId: number,
    params: AttendanceSearchParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<AttendanceRecordDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = mockAttendanceRecords.filter(r => r.employeeId === employeeId);

      // Apply additional filters
      if (params.startDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) >= new Date(params.startDate!));
      }
      if (params.endDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) <= new Date(params.endDate!));
      }
      if (params.status) {
        filtered = filtered.filter(r => r.status === params.status);
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    const records = await apiClient.get<AttendanceRecordDTO[]>(
      `${this.ENDPOINTS.EMPLOYEE(employeeId)}?${queryParams}`
    );
    return this.arrayToPage(records, params.page || 0, params.size || 10);
  }

  /**
   * Get employee attendance for a specific date range
   */
  async getEmployeeAttendanceByDateRange(
    employeeId: number,
    startDate: string,
    endDate: string
  ): Promise<AttendanceRecordDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      return mockAttendanceRecords.filter(r =>
        r.employeeId === employeeId &&
        new Date(r.attendanceDate) >= new Date(startDate) &&
        new Date(r.attendanceDate) <= new Date(endDate)
      );
    }

    // Real API call
    const queryParams = this.buildQueryParams({ startDate, endDate });
    const records = await apiClient.get<AttendanceRecordDTO[]>(
      `${this.ENDPOINTS.EMPLOYEE_DATE_RANGE(employeeId)}?${queryParams}`
    );
    return records.map(record => this.normalizeRecord(record));
  }

  /**
   * Get today's attendance record for an employee
   */
  async getTodayAttendance(employeeId: number): Promise<AttendanceRecordDTO | null> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const today = new Date().toISOString().split('T')[0];
      const record = mockAttendanceRecords.find(r =>
        r.employeeId === employeeId &&
        r.attendanceDate === today
      );
      return record || null;
    }

    // Real API call — return null when no record exists for today
    try {
      const record = await apiClient.get<AttendanceRecordDTO | null>(this.ENDPOINTS.TODAY(employeeId));
      return record ? this.normalizeRecord(record) : null;
    } catch (error: any) {
      // Fallback: also handle 404 in case backend version doesn't have the fix yet
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get attendance report with statistics
   */
  async getAttendanceReport(params: AttendanceSearchParams): Promise<AttendanceReportDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockAttendanceRecords];

      // Apply filters
      if (params.employeeId) {
        filtered = filtered.filter(r => r.employeeId === params.employeeId);
      }
      if (params.startDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) >= new Date(params.startDate!));
      }
      if (params.endDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) <= new Date(params.endDate!));
      }

      // Group by employee and calculate statistics
      const employeeMap = new Map<number, AttendanceReportDTO>();

      filtered.forEach(record => {
        if (!employeeMap.has(record.employeeId)) {
          const employee = mockEmployees.find(e => e.id === record.employeeId);
          employeeMap.set(record.employeeId, {
            employeeId: record.employeeId,
            employeeName: record.employeeName || employee?.fullName || 'Unknown',
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            halfDays: 0,
            leaveDays: 0,
            totalHours: 0,
            overtimeHours: 0,
            averageHoursPerDay: 0
          });
        }

        const report = employeeMap.get(record.employeeId)!;
        report.totalDays++;

        if (record.status === "PRESENT") report.presentDays++;
        else if (record.status === "ABSENT") report.absentDays++;
        else if (record.status === "LATE") report.lateDays++;
        else if (record.status === "HALF_DAY") report.halfDays++;
        else if (record.status === "ON_LEAVE") report.leaveDays++;

        if (record.totalHours) report.totalHours += record.totalHours;
        if (record.overtimeHours) report.overtimeHours += record.overtimeHours;
      });

      // Calculate averages
      employeeMap.forEach(report => {
        if (report.presentDays > 0) {
          report.averageHoursPerDay = report.totalHours / report.presentDays;
        }
      });

      return Array.from(employeeMap.values());
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<AttendanceReportDTO[]>(
      `${this.ENDPOINTS.REPORT}?${queryParams}`
    );
  }

  /**
   * Get attendance summary statistics
   */
  async getAttendanceSummary(startDate?: string, endDate?: string): Promise<AttendanceSummaryDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockAttendanceRecords];

      // Apply date filters
      if (startDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) >= new Date(startDate));
      }
      if (endDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) <= new Date(endDate));
      }

      // Get today's records
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = filtered.filter(r => r.attendanceDate === today);

      // Calculate statistics
      const uniqueEmployees = new Set(filtered.map(r => r.employeeId));
      const presentToday = todayRecords.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
      const absentToday = todayRecords.filter(r => r.status === "ABSENT").length;
      const onLeaveToday = todayRecords.filter(r => r.status === "ON_LEAVE").length;
      const lateToday = todayRecords.filter(r => r.status === "LATE").length;

      const totalHoursWorked = filtered.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      const totalOvertimeHours = filtered.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

      const presentDays = filtered.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
      const totalDays = filtered.length;
      const averageAttendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        totalEmployees: uniqueEmployees.size,
        presentToday,
        absentToday,
        onLeaveToday,
        lateToday,
        averageAttendanceRate,
        totalHoursWorked,
        totalOvertimeHours
      };
    }

    // Real API call
    const queryParams = this.buildQueryParams({ startDate, endDate });
    return apiClient.get<AttendanceSummaryDTO>(
      `${this.ENDPOINTS.SUMMARY}?${queryParams}`
    );
  }

  /**
   * Get attendance records for a department
   */
  async getDepartmentAttendance(
    departmentId: number,
    params: AttendanceSearchParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<AttendanceRecordDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      // Get employees in the department
      const departmentEmployees = mockEmployees.filter(e => e.departmentId === departmentId);
      const employeeIds = departmentEmployees.map(e => e.id);

      let filtered = mockAttendanceRecords.filter(r => employeeIds.includes(r.employeeId));

      // Apply additional filters
      if (params.startDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) >= new Date(params.startDate!));
      }
      if (params.endDate) {
        filtered = filtered.filter(r => new Date(r.attendanceDate) <= new Date(params.endDate!));
      }
      if (params.status) {
        filtered = filtered.filter(r => r.status === params.status);
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.get<PaginatedResponse<AttendanceRecordDTO>>(
      `${this.ENDPOINTS.DEPARTMENT(departmentId)}?${queryParams}`
    );
    return this.normalizePage(response);
  }

  /**
   * Approve an attendance record
   */
  async approveAttendance(id: number, approverId: number): Promise<AttendanceRecordDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockAttendanceRecords.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Attendance record with ID ${id} not found`);
      }

      const existing = mockAttendanceRecords[index];
      if (!existing) {
        throw new Error(`Attendance record with ID ${id} not found`);
      }

      const updated: AttendanceRecordDTO = {
        ...existing,
        approvedBy: approverId,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockAttendanceRecords[index] = updated;
      return updated;
    }

    // Real API call
    return this.normalizeRecord(await apiClient.put<AttendanceRecordDTO>(
      this.ENDPOINTS.APPROVE(id),
      { approverId }
    ));
  }

  /**
   * Bulk approve multiple attendance records
   */
  async bulkApproveAttendance(ids: number[], approverId: number): Promise<AttendanceRecordDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const approved: AttendanceRecordDTO[] = [];

      ids.forEach(id => {
        const index = mockAttendanceRecords.findIndex(r => r.id === id);
        if (index !== -1) {
          const existing = mockAttendanceRecords[index];
          if (existing) {
            const updated: AttendanceRecordDTO = {
              ...existing,
              approvedBy: approverId,
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            mockAttendanceRecords[index] = updated;
            approved.push(updated);
          }
        }
      });

      return approved;
    }

    // Real API call
    const records = await apiClient.post<AttendanceRecordDTO[]>(
      this.ENDPOINTS.BULK_APPROVE,
      { ids, approverId }
    );
    return records.map(record => this.normalizeRecord(record));
  }

  /**
   * Build query parameters string from search params
   */
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }

  private normalizeRecord(record: AttendanceRecordDTO): AttendanceRecordDTO {
    return {
      ...record,
      active: record.active ?? true,
    };
  }

  private normalizePage(page: PaginatedResponse<AttendanceRecordDTO>): PaginatedResponse<AttendanceRecordDTO> {
    return {
      ...page,
      content: page.content.map(record => this.normalizeRecord(record)),
    };
  }

  private arrayToPage(records: AttendanceRecordDTO[], page: number, size: number): PaginatedResponse<AttendanceRecordDTO> {
    const normalized = records.map(record => this.normalizeRecord(record));
    const start = page * size;
    const end = start + size;
    return {
      content: normalized.slice(start, end),
      totalElements: normalized.length,
      totalPages: Math.ceil(normalized.length / size),
      last: end >= normalized.length,
      size,
      number: page,
      first: page === 0,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create and export singleton instance
const attendanceApi = new AttendanceApiClientImpl();

export default attendanceApi;

// Export the class for testing purposes
export { AttendanceApiClientImpl };
