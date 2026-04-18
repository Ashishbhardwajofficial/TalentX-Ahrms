import React, { useState, useEffect } from 'react';
import locationApi, {
  LocationDTO,
  LocationCreateDTO,
  LocationUpdateDTO
} from '../../api/locationApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

const LocationManagementPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationDTO | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<LocationCreateDTO>({
    organizationId: orgId,
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    timezone: '',
    isHeadquarters: false
  });

  const loadLocations = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationApi.getLocations({
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size,
        organizationId: orgId
      });
      setLocations(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleCreate = () => {
    setEditingLocation(null);
    setFormData({
      organizationId: orgId,
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: '',
      timezone: '',
      isHeadquarters: false
    });
    setIsModalOpen(true);
  };

  const handleEdit = (location: LocationDTO) => {
    setEditingLocation(location);
    setFormData({
      organizationId: location.organizationId,
      name: location.name,
      addressLine1: location.addressLine1 || '',
      addressLine2: location.addressLine2 || '',
      city: location.city || '',
      stateProvince: location.stateProvince || '',
      postalCode: location.postalCode || '',
      country: location.country || '',
      timezone: location.timezone || '',
      isHeadquarters: location.isHeadquarters
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      await locationApi.deleteLocation(id);
      loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete location');
    }
  };

  const handleViewOnMap = (location: LocationDTO) => {
    setSelectedLocation(location);
    setShowMap(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingLocation) {
        const updateData: LocationUpdateDTO = {
          name: formData.name
        };

        // Only include optional fields if they have values
        if (formData.addressLine1) updateData.addressLine1 = formData.addressLine1;
        if (formData.addressLine2) updateData.addressLine2 = formData.addressLine2;
        if (formData.city) updateData.city = formData.city;
        if (formData.stateProvince) updateData.stateProvince = formData.stateProvince;
        if (formData.postalCode) updateData.postalCode = formData.postalCode;
        if (formData.country) updateData.country = formData.country;
        if (formData.timezone) updateData.timezone = formData.timezone;
        updateData.isHeadquarters = formData.isHeadquarters;

        await locationApi.updateLocation(editingLocation.id, updateData);
      } else {
        await locationApi.createLocation(formData);
      }
      setIsModalOpen(false);
      loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to save location');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? undefined : value)
    }));
  };

  const formatAddress = (location: LocationDTO): string => {
    const parts = [
      location.addressLine1,
      location.addressLine2,
      location.city,
      location.stateProvince,
      location.postalCode,
      location.country
    ].filter(Boolean);
    return parts.join(', ') || '-';
  };

  const getMapUrl = (location: LocationDTO): string => {
    const address = formatAddress(location);
    // Using Google Maps embed URL
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(address)}`;
  };

  const columns: ColumnDefinition<LocationDTO>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true
    },
    {
      key: 'city',
      header: 'City',
      sortable: true
    },
    {
      key: 'stateProvince',
      header: 'State/Province',
      sortable: true
    },
    {
      key: 'country',
      header: 'Country',
      sortable: true
    },
    {
      key: 'timezone',
      header: 'Timezone'
    },
    {
      key: 'isHeadquarters',
      header: 'Headquarters',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value ? '#d4edda' : '#f8f9fa',
          color: value ? '#155724' : '#6c757d',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value ? '#d4edda' : '#f8d7da',
          color: value ? '#155724' : '#721c24',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, location) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleViewOnMap(location)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="View on Map"
          >
            📍 Map
          </button>
          <button
            onClick={() => handleEdit(location)}
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
            onClick={() => handleDelete(location.id)}
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
        <h1>Location Management</h1>
        <button
          onClick={handleCreate}
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
          + Create Location
        </button>
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

      <DataTable
        data={locations}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLocation ? 'Edit Location' : 'Create Location'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Location Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., New York Office"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="addressLine1" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Address Line 1
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                value={formData.addressLine1}
                onChange={handleInputChange}
                placeholder="Street address"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="addressLine2" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Address Line 2
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                value={formData.addressLine2}
                onChange={handleInputChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="city" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., New York"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="stateProvince" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                State/Province
              </label>
              <input
                id="stateProvince"
                name="stateProvince"
                type="text"
                value={formData.stateProvince}
                onChange={handleInputChange}
                placeholder="e.g., NY"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="postalCode" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Postal Code
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="e.g., 10001"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="country" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Country
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g., United States"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="timezone" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value="">Select Timezone</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isHeadquarters"
                  checked={formData.isHeadquarters}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold' }}>Mark as Headquarters</span>
              </label>
              <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px', marginLeft: '26px' }}>
                This location will be designated as the organization's headquarters
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              {editingLocation ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Map Visualization Modal */}
      <Modal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        title={selectedLocation ? `${selectedLocation.name} - Location Map` : 'Location Map'}
        size="lg"
      >
        {selectedLocation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                {selectedLocation.name}
              </h3>
              <div style={{ fontSize: '14px', color: '#495057', lineHeight: '1.6' }}>
                {selectedLocation.addressLine1 && (
                  <div>{selectedLocation.addressLine1}</div>
                )}
                {selectedLocation.addressLine2 && (
                  <div>{selectedLocation.addressLine2}</div>
                )}
                <div>
                  {[selectedLocation.city, selectedLocation.stateProvince, selectedLocation.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </div>
                {selectedLocation.country && (
                  <div style={{ fontWeight: 'bold', marginTop: '4px' }}>
                    {selectedLocation.country}
                  </div>
                )}
                {selectedLocation.timezone && (
                  <div style={{ marginTop: '8px', color: '#6c757d' }}>
                    <strong>Timezone:</strong> {selectedLocation.timezone}
                  </div>
                )}
              </div>
            </div>

            {/* Map Placeholder */}
            <div style={{
              width: '100%',
              height: '400px',
              backgroundColor: '#e9ecef',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #adb5bd',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Map Integration</h4>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '14px', maxWidth: '400px' }}>
                To enable map visualization, integrate with a mapping service like Google Maps, Mapbox, or OpenStreetMap.
                Add your API key to display the location on an interactive map.
              </p>
              <div style={{ marginTop: '16px' }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(selectedLocation))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '14px'
                  }}
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Alternative: Simple iframe embed (requires API key) */}
            {/* Uncomment and add your Google Maps API key to use
            <iframe
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '8px' }}
              loading="lazy"
              allowFullScreen
              src={getMapUrl(selectedLocation)}
            />
            */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LocationManagementPage;
