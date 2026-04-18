// frontend/src/api/holidayApi.ts
import apiClient from "./axiosClient";
import {
  Holiday,
  HolidayType,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockHolidays, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// HOLIDAY API DTOs
// ============================================================================

/**
 * DTO for holiday response
 */
export interface HolidayDTO {
  id: number;
  organizationId: number;
  holidayDate: string; // ISO date
  name: string;
  holidayType: HolidayType;
  isOptional: boolean;
  createdAt: string;
}

/**
 * DTO for creating a holiday
 */
export interface HolidayCreateDTO {
  organizationId: number;
  holidayDate: string; // ISO date
  name: string;
  holidayType: HolidayType;
  isOptional: boolean;
}

/**
 * DTO for updating a holiday
 */
export interface HolidayUpdateDTO {
  holidayDate?: string; // ISO date
  name?: string;
  holidayType?: HolidayType;
  isOptional?: boolean;
}

/**
 * Search parameters for holidays
 */
export interface HolidaySearchParams extends PaginationParams {
  organizationId?: number;
  year?: number;
  month?: number;
  holidayType?: HolidayType;
  isOptional?: boolean;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  search?: string;
}

/**
 * Holiday calendar response for a specific year
 */
export interface HolidayCalendarDTO {
  year: number;
  holidays: HolidayDTO[];
  totalHolidays: number;
  nationalHolidays: number;
  optionalHolidays: number;
  companyHolidays: number;
}

// ============================================================================
// HOLIDAY API CLIENT INTERFACE
// ============================================================================

/**
 * Interface for Holiday API client
 */
export interface HolidayApiClient {
  // CRUD operations
  getHolidays(params: HolidaySearchParams): Promise<PaginatedResponse<HolidayDTO>>;
  getHoliday(id: number): Promise<HolidayDTO>;
  createHoliday(data: HolidayCreateDTO): Promise<HolidayDTO>;
  updateHoliday(id: number, data: HolidayUpdateDTO): Promise<HolidayDTO>;
  deleteHoliday(id: number): Promise<void>;

  // Calendar operations
  getHolidayCalendar(year: number, organizationId?: number): Promise<HolidayCalendarDTO>;
  getHolidaysByDateRange(startDate: string, endDate: string, organizationId?: number): Promise<HolidayDTO[]>;
  getUpcomingHolidays(organizationId?: number, limit?: number): Promise<HolidayDTO[]>;

  // Utility operations
  isHoliday(date: string, organizationId?: number): Promise<boolean>;
  getHolidaysByType(holidayType: HolidayType, organizationId?: number): Promise<HolidayDTO[]>;
}

// ============================================================================
// HOLIDAY API CLIENT IMPLEMENTATION
// ============================================================================

/**
 * Implementation of Holiday API client
 */
class HolidayApiClientImpl implements HolidayApiClient {
  private readonly ENDPOINTS = {
    BASE: '/holidays',
    BY_ID: (id: number) => `/holidays/${id}`,
    CALENDAR: (year: number) => `/holidays/calendar/${year}`,
    DATE_RANGE: '/holidays/date-range',
    UPCOMING: '/holidays/upcoming',
    IS_HOLIDAY: '/holidays/is-holiday',
    BY_TYPE: (type: HolidayType) => `/holidays/type/${type}`
  } as const;

  /**
   * Get paginated list of holidays with filtering
   */
  async getHolidays(params: HolidaySearchParams): Promise<PaginatedResponse<HolidayDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockHolidays];

      // Apply filters
      if (params.organizationId) {
        filtered = filtered.filter(h => h.organizationId === params.organizationId);
      }
      if (params.year) {
        filtered = filtered.filter(h => new Date(h.holidayDate).getFullYear() === params.year);
      }
      if (params.month) {
        filtered = filtered.filter(h => new Date(h.holidayDate).getMonth() + 1 === params.month);
      }
      if (params.holidayType) {
        filtered = filtered.filter(h => h.holidayType === params.holidayType);
      }
      if (params.isOptional !== undefined) {
        filtered = filtered.filter(h => h.isOptional === params.isOptional);
      }
      if (params.startDate && params.endDate) {
        filtered = filtered.filter(h => {
          const date = new Date(h.holidayDate);
          return date >= new Date(params.startDate!) && date <= new Date(params.endDate!);
        });
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(h => h.name.toLowerCase().includes(searchLower));
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<HolidayDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single holiday by ID
   */
  async getHoliday(id: number): Promise<HolidayDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const holiday = mockHolidays.find(h => h.id === id);
      if (!holiday) {
        throw new Error(`Holiday with ID ${id} not found`);
      }
      return holiday;
    }

    // Real API call
    return apiClient.get<HolidayDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new holiday
   */
  async createHoliday(data: HolidayCreateDTO): Promise<HolidayDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newHoliday: HolidayDTO = {
        id: mockHolidays.length + 1,
        ...data,
        createdAt: new Date().toISOString()
      };
      mockHolidays.push(newHoliday);
      return newHoliday;
    }

    // Real API call
    return apiClient.post<HolidayDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing holiday
   */
  async updateHoliday(id: number, data: HolidayUpdateDTO): Promise<HolidayDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockHolidays.findIndex(h => h.id === id);
      if (index === -1) {
        throw new Error(`Holiday with ID ${id} not found`);
      }

      const existingHoliday = mockHolidays[index];
      if (!existingHoliday) {
        throw new Error(`Holiday with ID ${id} not found`);
      }

      const updated: HolidayDTO = {
        ...existingHoliday
      };

      if (data.holidayDate !== undefined) updated.holidayDate = data.holidayDate;
      if (data.name !== undefined) updated.name = data.name;
      if (data.holidayType !== undefined) updated.holidayType = data.holidayType;
      if (data.isOptional !== undefined) updated.isOptional = data.isOptional;

      mockHolidays[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<HolidayDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete holiday
   */
  async deleteHoliday(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockHolidays.findIndex(h => h.id === id);
      if (index === -1) {
        throw new Error(`Holiday with ID ${id} not found`);
      }
      mockHolidays.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get holiday calendar for a specific year
   */
  async getHolidayCalendar(year: number, organizationId?: number): Promise<HolidayCalendarDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = mockHolidays.filter(h => new Date(h.holidayDate).getFullYear() === year);

      if (organizationId) {
        filtered = filtered.filter(h => h.organizationId === organizationId);
      }

      return {
        year,
        holidays: filtered,
        totalHolidays: filtered.length,
        nationalHolidays: filtered.filter(h => h.holidayType === 'NATIONAL').length,
        optionalHolidays: filtered.filter(h => h.isOptional).length,
        companyHolidays: filtered.filter(h => h.holidayType === 'COMPANY').length
      };
    }

    // Real API call
    const queryParams = this.buildQueryParams({ organizationId });
    return apiClient.get<HolidayCalendarDTO>(
      `${this.ENDPOINTS.CALENDAR(year)}?${queryParams}`
    );
  }

  /**
   * Get holidays within a specific date range
   */
  async getHolidaysByDateRange(
    startDate: string,
    endDate: string,
    organizationId?: number
  ): Promise<HolidayDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = mockHolidays.filter(h => {
        const date = new Date(h.holidayDate);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });

      if (organizationId) {
        filtered = filtered.filter(h => h.organizationId === organizationId);
      }

      return filtered;
    }

    // Real API call
    const queryParams = this.buildQueryParams({ startDate, endDate, organizationId });
    return apiClient.get<HolidayDTO[]>(
      `${this.ENDPOINTS.DATE_RANGE}?${queryParams}`
    );
  }

  /**
   * Get upcoming holidays
   */
  async getUpcomingHolidays(organizationId?: number, limit: number = 5): Promise<HolidayDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const today = new Date();
      let filtered = mockHolidays.filter(h => new Date(h.holidayDate) >= today);

      if (organizationId) {
        filtered = filtered.filter(h => h.organizationId === organizationId);
      }

      return filtered.sort((a, b) =>
        new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime()
      ).slice(0, limit);
    }

    // Real API call
    const queryParams = this.buildQueryParams({ organizationId, limit });
    return apiClient.get<HolidayDTO[]>(
      `${this.ENDPOINTS.UPCOMING}?${queryParams}`
    );
  }

  /**
   * Check if a specific date is a holiday
   */
  async isHoliday(date: string, organizationId?: number): Promise<boolean> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = mockHolidays.filter(h => h.holidayDate === date);

      if (organizationId) {
        filtered = filtered.filter(h => h.organizationId === organizationId);
      }

      return filtered.length > 0;
    }

    // Real API call
    const queryParams = this.buildQueryParams({ date, organizationId });
    const response = await apiClient.get<{ isHoliday: boolean }>(
      `${this.ENDPOINTS.IS_HOLIDAY}?${queryParams}`
    );
    return response.isHoliday;
  }

  /**
   * Get holidays by type
   */
  async getHolidaysByType(holidayType: HolidayType, organizationId?: number): Promise<HolidayDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = mockHolidays.filter(h => h.holidayType === holidayType);

      if (organizationId) {
        filtered = filtered.filter(h => h.organizationId === organizationId);
      }

      return filtered;
    }

    // Real API call
    const queryParams = this.buildQueryParams({ organizationId });
    return apiClient.get<HolidayDTO[]>(
      `${this.ENDPOINTS.BY_TYPE(holidayType)}?${queryParams}`
    );
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
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create and export singleton instance
const holidayApi = new HolidayApiClientImpl();

export default holidayApi;

// Export the class for testing purposes
export { HolidayApiClientImpl };
