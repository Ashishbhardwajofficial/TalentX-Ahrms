import React, { useState, useEffect } from 'react';
import holidayApi, {
  HolidayDTO,
  HolidayCreateDTO,
  HolidayUpdateDTO,
  HolidaySearchParams,
  HolidayCalendarDTO
} from '../../api/holidayApi';
import { HolidayType } from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

const HolidayManagementPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [holidays, setHolidays] = useState<HolidayDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayDTO | null>(null);
  const [holidayCalendar, setHolidayCalendar] = useState<HolidayCalendarDTO | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Filter state
  const [filters, setFilters] = useState<HolidaySearchParams>({
    page: 0,
    size: 10,
    organizationId: orgId,
    year: new Date().getFullYear(),
    search: ''
  });

  // Holiday form state
  const [holidayFormData, setHolidayFormData] = useState<HolidayCreateDTO>({
    organizationId: orgId,
    holidayDate: new Date().toISOString().substring(0, 10),
    name: '',
    holidayType: HolidayType.COMPANY,
    isOptional: false
  });


  useEffect(() => {
    loadHolidays();
  }, [pagination.page, pagination.size, filters]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchParams: HolidaySearchParams = {
        ...filters,
        page: pagination.page - 1,
        size: pagination.size
      };
      const response = await holidayApi.getHolidays(searchParams);
      setHolidays(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const loadHolidayCalendar = async (year: number) => {
    try {
      setLoading(true);
      const calendar = await holidayApi.getHolidayCalendar(year, 1);
      setHolidayCalendar(calendar);
    } catch (err: any) {
      setError(err.message || 'Failed to load holiday calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHoliday = () => {
    setEditingHoliday(null);
    setHolidayFormData({
      organizationId: orgId,
      holidayDate: new Date().toISOString().substring(0, 10),
      name: '',
      holidayType: HolidayType.COMPANY,
      isOptional: false
    });
    setIsHolidayModalOpen(true);
  };

  const handleEditHoliday = (holiday: HolidayDTO) => {
    setEditingHoliday(holiday);
    setHolidayFormData({
      organizationId: holiday.organizationId,
      holidayDate: holiday.holidayDate,
      name: holiday.name,
      holidayType: holiday.holidayType,
      isOptional: holiday.isOptional
    });
    setIsHolidayModalOpen(true);
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      await holidayApi.deleteHoliday(id);
      loadHolidays();
    } catch (err: any) {
      setError(err.message || 'Failed to delete holiday');
    }
  };

  const handleViewCalendar = async () => {
    setSelectedYear(new Date().getFullYear());
    await loadHolidayCalendar(new Date().getFullYear());
    setIsCalendarModalOpen(true);
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingHoliday) {
        const updateData: HolidayUpdateDTO = {
          holidayDate: holidayFormData.holidayDate,
          name: holidayFormData.name,
          holidayType: holidayFormData.holidayType,
          isOptional: holidayFormData.isOptional
        };
        await holidayApi.updateHoliday(editingHoliday.id, updateData);
      } else {
        await holidayApi.createHoliday(holidayFormData);
      }
      setIsHolidayModalOpen(false);
      loadHolidays();
    } catch (err: any) {
      setError(err.message || 'Failed to save holiday');
    }
  };

  const handleHolidayInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setHolidayFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) :
        name === 'isOptional' ? (value === '' ? undefined : value === 'true') :
          name === 'holidayType' ? (value === '' ? undefined : value as HolidayType) :
            value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleYearChange = async (newYear: number) => {
    setSelectedYear(newYear);
    await loadHolidayCalendar(newYear);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHolidayTypeColor = (type: HolidayType): string => {
    switch (type) {
      case HolidayType.NATIONAL:
        return '#dc3545'; // Red
      case HolidayType.OPTIONAL:
        return '#ffc107'; // Yellow
      case HolidayType.COMPANY:
        return '#28a745'; // Green
      default:
        return '#6c757d'; // Gray
    }
  };

  const getHolidayTypeIcon = (type: HolidayType): string => {
    switch (type) {
      case HolidayType.NATIONAL:
        return '🏛️';
      case HolidayType.OPTIONAL:
        return '⭐';
      case HolidayType.COMPANY:
        return '🏢';
      default:
        return '📅';
    }
  };

  const holidayColumns: ColumnDefinition<HolidayDTO>[] = [
    {
      key: 'name',
      header: 'Holiday Name',
      sortable: true
    },
    {
      key: 'holidayDate',
      header: 'Date',
      sortable: true,
      render: (value) => formatDate(value as string)
    },
    {
      key: 'holidayType',
      header: 'Type',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: getHolidayTypeColor(value as HolidayType),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {getHolidayTypeIcon(value as HolidayType)}
          {value}
        </span>
      )
    },
    {
      key: 'isOptional',
      header: 'Optional',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value ? '#fff3cd' : '#d4edda',
          color: value ? '#856404' : '#155724',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => new Date(value as string).toLocaleDateString()
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, holiday) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEditHoliday(holiday)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteHoliday(holiday.id)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Holiday Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleViewCalendar}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📅 View Calendar
          </button>
          <button
            onClick={handleCreateHoliday}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            + Add Holiday
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <label htmlFor="search" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Search
          </label>
          <input
            id="search"
            name="search"
            type="text"
            value={filters.search || ''}
            onChange={handleFilterChange}
            placeholder="Search holidays..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label htmlFor="year" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Year
          </label>
          <select
            id="year"
            name="year"
            value={filters.year || ''}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="holidayType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Holiday Type
          </label>
          <select
            id="holidayType"
            name="holidayType"
            value={filters.holidayType || ''}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">All Types</option>
            <option value={HolidayType.NATIONAL}>🏛️ National</option>
            <option value={HolidayType.OPTIONAL}>⭐ Optional</option>
            <option value={HolidayType.COMPANY}>🏢 Company</option>
          </select>
        </div>

        <div>
          <label htmlFor="isOptional" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Optional Status
          </label>
          <select
            id="isOptional"
            name="isOptional"
            value={filters.isOptional === undefined ? '' : filters.isOptional.toString()}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">All</option>
            <option value="false">Mandatory</option>
            <option value="true">Optional</option>
          </select>
        </div>
      </div>

      <DataTable
        data={holidays}
        columns={holidayColumns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Holiday Form Modal */}
      <Modal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
        size="md"
      >
        <form onSubmit={handleHolidaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Holiday Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={holidayFormData.name}
              onChange={handleHolidayInputChange}
              required
              placeholder="e.g., New Year's Day, Independence Day"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label htmlFor="holidayDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Holiday Date *
            </label>
            <input
              id="holidayDate"
              name="holidayDate"
              type="date"
              value={holidayFormData.holidayDate}
              onChange={handleHolidayInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label htmlFor="holidayType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Holiday Type *
            </label>
            <select
              id="holidayType"
              name="holidayType"
              value={holidayFormData.holidayType}
              onChange={handleHolidayInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={HolidayType.NATIONAL}>🏛️ National Holiday</option>
              <option value={HolidayType.OPTIONAL}>⭐ Optional Holiday</option>
              <option value={HolidayType.COMPANY}>🏢 Company Holiday</option>
            </select>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              National: Government declared holidays • Optional: Employees can choose to observe • Company: Organization specific holidays
            </p>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isOptional"
                checked={holidayFormData.isOptional}
                onChange={handleHolidayInputChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold' }}>Optional Holiday</span>
            </label>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px', marginLeft: '26px' }}>
              Employees can choose whether to observe this holiday
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsHolidayModalOpen(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {editingHoliday ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Holiday Calendar Modal */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title="Holiday Calendar"
        size="lg"
      >
        {holidayCalendar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Year Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => handleYearChange(selectedYear - 1)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← {selectedYear - 1}
              </button>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                {selectedYear}
              </h2>
              <button
                onClick={() => handleYearChange(selectedYear + 1)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {selectedYear + 1} →
              </button>
            </div>

            {/* Calendar Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                  {holidayCalendar.totalHolidays}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>Total Holidays</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  {holidayCalendar.nationalHolidays}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>🏛️ National</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                  {holidayCalendar.optionalHolidays}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>⭐ Optional</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {holidayCalendar.companyHolidays}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>🏢 Company</div>
              </div>
            </div>

            {/* Holiday List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {holidayCalendar.holidays.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {holidayCalendar.holidays
                    .sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime())
                    .map(holiday => (
                      <div
                        key={holiday.id}
                        style={{
                          padding: '12px',
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                            {holiday.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6c757d' }}>
                            {formatDate(holiday.holidayDate)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: getHolidayTypeColor(holiday.holidayType),
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {getHolidayTypeIcon(holiday.holidayType)}
                            {holiday.holidayType}
                          </span>
                          {holiday.isOptional && (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#fff3cd',
                              color: '#856404',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              Optional
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>No Holidays Found</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    No holidays have been configured for {selectedYear}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HolidayManagementPage;