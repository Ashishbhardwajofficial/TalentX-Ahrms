import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LocationManagementPage from '../LocationManagementPage';
import locationApi from '../../../api/locationApi';

// Mock the locationApi
jest.mock('../../../api/locationApi');

describe('LocationManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page title', async () => {
    (locationApi.getLocations as jest.Mock).mockResolvedValue({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 10
    });

    render(<LocationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Location Management')).toBeInTheDocument();
    });
  });

  it('should render create location button', async () => {
    (locationApi.getLocations as jest.Mock).mockResolvedValue({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 10
    });

    render(<LocationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Create Location')).toBeInTheDocument();
    });
  });

  it('should load locations on mount', async () => {
    const mockLocations = [
      {
        id: 1, organizationId: 1, name: 'New York Office',
        city: 'New York', stateProvince: 'NY', country: 'USA',
        isHeadquarters: true, isActive: true,
        createdAt: '2024-01-01', updatedAt: '2024-01-01'
      }
    ];

    (locationApi.getLocations as jest.Mock).mockResolvedValue({
      content: mockLocations, totalElements: 1, totalPages: 1, number: 0, size: 10
    });

    render(<LocationManagementPage />);

    await waitFor(() => {
      expect(locationApi.getLocations).toHaveBeenCalledWith({
        page: 0, size: 10, organizationId: 1
      });
    });
  });

  it('should display location data in table', async () => {
    const mockLocations = [
      {
        id: 1, organizationId: 1, name: 'New York Office',
        city: 'New York', stateProvince: 'NY', country: 'USA',
        timezone: 'America/New_York', isHeadquarters: true, isActive: true,
        createdAt: '2024-01-01', updatedAt: '2024-01-01'
      }
    ];

    (locationApi.getLocations as jest.Mock).mockResolvedValue({
      content: mockLocations, totalElements: 1, totalPages: 1, number: 0, size: 10
    });

    render(<LocationManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('New York Office')).toBeInTheDocument();
    });
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('NY')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
  });
});
