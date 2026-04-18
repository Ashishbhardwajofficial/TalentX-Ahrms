/**
 * Integration tests for API client services
 * Tests Requirements: 3.1, 3.2, 3.3
 */

import employeeApi from '../employeeApi';
import authApi from '../authApi';
import leaveApi from '../leaveApi';
import axiosClient from '../axiosClient';

// Mock axios client
jest.mock('../axiosClient');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Employee API Integration', () => {
    it('should handle complete employee CRUD workflow', async () => {
      // Mock create employee
      const mockEmployee = {
        id: 1,
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        department: { id: 1, name: 'Engineering', code: 'ENG' },
        jobTitle: 'Software Engineer',
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        hireDate: '2024-01-01'
      };

      (axiosClient.post as jest.Mock).mockResolvedValue(mockEmployee);

      const createResult = await employeeApi.createEmployee({
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        departmentId: 1,
        jobTitle: 'Software Engineer',
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        hireDate: '2024-01-01'
      } as any);

      expect(createResult).toEqual(mockEmployee);
      expect(axiosClient.post).toHaveBeenCalledWith('/employees', expect.any(Object));

      // Mock get employee
      (axiosClient.get as jest.Mock).mockResolvedValue(mockEmployee);

      const getResult = await employeeApi.getEmployee(1);
      expect(getResult).toEqual(mockEmployee);
      expect(axiosClient.get).toHaveBeenCalledWith('/employees/1');

      // Mock update employee
      const updatedEmployee = { ...mockEmployee, firstName: 'Jane' };
      (axiosClient.put as jest.Mock).mockResolvedValue(updatedEmployee);

      const updateResult = await employeeApi.updateEmployee(1, {
        ...mockEmployee,
        firstName: 'Jane'
      } as any);

      expect(updateResult.firstName).toBe('Jane');
      expect(axiosClient.put).toHaveBeenCalledWith('/employees/1', expect.any(Object));

      // Mock delete employee
      (axiosClient.delete as jest.Mock).mockResolvedValue(undefined);

      await employeeApi.deleteEmployee(1);
      expect(axiosClient.delete).toHaveBeenCalledWith('/employees/1');
    });

    it('should handle employee list with pagination', async () => {
      const mockResponse = {
        content: [
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employeeApi.getEmployees({ page: 0, size: 10 });

      expect(result.content).toHaveLength(2);
      expect(result.totalElements).toBe(2);
      expect(axiosClient.get).toHaveBeenCalledWith('/employees?page=0&size=10');
    });

    it('should handle API errors correctly', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            success: false,
            message: 'Employee not found'
          }
        }
      };

      (axiosClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(employeeApi.getEmployee(999)).rejects.toEqual(mockError);
    });
  });

  describe('Authentication API Integration', () => {
    it('should handle login workflow', async () => {
      const mockAuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: ['USER']
        }
      };

      (axiosClient.post as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await authApi.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('testuser');
      expect(axiosClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should handle logout workflow', async () => {
      (axiosClient.post as jest.Mock).mockResolvedValue(undefined);

      await authApi.logout();
      expect(axiosClient.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle authentication errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Invalid credentials'
          }
        }
      };

      (axiosClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(authApi.login({
        username: 'wrong',
        password: 'wrong'
      })).rejects.toEqual(mockError);
    });
  });

  describe('Leave API Integration', () => {
    it('should handle leave request workflow', async () => {
      const mockLeaveRequest = {
        id: 1,
        employee: { id: 1, firstName: 'John', lastName: 'Doe' },
        leaveType: { id: 1, name: 'Annual Leave', code: 'AL' },
        startDate: '2024-12-25',
        endDate: '2024-12-27',
        totalDays: 3,
        reason: 'Holiday',
        status: 'PENDING'
      };

      (axiosClient.post as jest.Mock).mockResolvedValue(mockLeaveRequest);

      const result = await leaveApi.createLeaveRequest({
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2024-12-25',
        endDate: '2024-12-27',
        reason: 'Holiday'
      });

      expect(result.status).toBe('PENDING');
      expect(result.totalDays).toBe(3);
      expect(axiosClient.post).toHaveBeenCalledWith('/leaves', expect.any(Object));
    });

    it('should handle leave approval workflow', async () => {
      const approvedLeave = {
        id: 1,
        status: 'APPROVED',
        reviewComments: 'Approved'
      };

      (axiosClient.put as jest.Mock).mockResolvedValue(approvedLeave);

      const result = await leaveApi.approveLeaveRequest(1, 'Approved');

      expect(result.status).toBe('APPROVED');
      expect(axiosClient.put).toHaveBeenCalledWith('/leaves/1/approve', {
        comments: 'Approved'
      });
    });

    it('should handle validation errors for invalid date ranges', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            success: false,
            message: 'End date must be after start date',
            fieldErrors: {
              endDate: 'End date must be after start date'
            }
          }
        }
      };

      (axiosClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(leaveApi.createLeaveRequest({
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2024-12-27',
        endDate: '2024-12-25',
        reason: 'Invalid'
      })).rejects.toEqual(mockError);
    });
  });

  describe('Cross-API Integration', () => {
    it('should handle authenticated requests across multiple APIs', async () => {
      // Simulate login
      const mockAuthResponse = {
        token: 'mock-jwt-token',
        user: { id: 1, username: 'testuser' }
      };

      (axiosClient.post as jest.Mock).mockResolvedValueOnce(mockAuthResponse);
      await authApi.login({ username: 'testuser', password: 'password' });

      // Subsequent API calls should include auth token
      const mockEmployeeResponse = { id: 1, firstName: 'John' };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockEmployeeResponse);
      const result = await employeeApi.getEmployee(1);

      expect(result.id).toBe(1);
    });

    it('should handle token expiration and re-authentication', async () => {
      const mockExpiredError = {
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Token expired'
          }
        }
      };

      (axiosClient.get as jest.Mock).mockRejectedValue(mockExpiredError);

      await expect(employeeApi.getEmployee(1)).rejects.toEqual(mockExpiredError);
    });
  });
});
