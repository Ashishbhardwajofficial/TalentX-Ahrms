import React, { useState, useEffect } from 'react';
import skillApi, {
  SkillDTO,
  SkillCreateDTO,
  SkillUpdateDTO,
  SkillCategoryResponse,
  SkillCategoryWithCount
} from '../../api/skillApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const SkillsManagementPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillDTO[]>([]);
  const [categories, setCategories] = useState<SkillCategoryWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDTO | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<SkillCreateDTO>({
    name: '',
    category: '',
    description: ''
  });

  
  useEffect(() => {
    loadSkills();
    loadCategories();
  }, [pagination.page, pagination.size, selectedCategory, searchQuery]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size
      };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const response = await skillApi.getSkills(params);
      setSkills(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await skillApi.getSkillCategories();
      // Convert string[] to SkillCategoryWithCount[] by counting skills in each category
      const categoriesWithCount: SkillCategoryWithCount[] = categoriesData.map(category => ({
        category,
        count: skills.filter(s => s.category === category).length
      }));
      setCategories(categoriesWithCount);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreate = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (skill: SkillDTO) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category ?? '',
      description: skill.description ?? ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      await skillApi.deleteSkill(id);
      loadSkills();
    } catch (err: any) {
      setError(err.message || 'Failed to delete skill');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingSkill) {
        const updateData: SkillUpdateDTO = {
          name: formData.name
        };
        if (formData.category) updateData.category = formData.category;
        if (formData.description) updateData.description = formData.description;
        await skillApi.updateSkill(editingSkill.id, updateData);
      } else {
        await skillApi.createSkill(formData);
      }
      setIsModalOpen(false);
      loadSkills();
      loadCategories(); // Refresh categories in case a new one was added
    } catch (err: any) {
      setError(err.message || 'Failed to save skill');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadSkills();
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns: ColumnDefinition<SkillDTO>[] = [
    {
      key: 'name',
      header: 'Skill Name',
      sortable: true,
      render: (value) => (
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {value}
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => value ? (
        <span
          style={{
            padding: '4px 8px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {value}
        </span>
      ) : (
        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Uncategorized</span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => value ? (
        <div style={{
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {value}
        </div>
      ) : (
        <span style={{ color: '#6c757d', fontStyle: 'italic' }}>No description</span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, skill) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(skill)}
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
            onClick={() => handleDelete(skill.id)}
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
        <h1>Skills Management</h1>
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
          + Create Skill
        </button>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="search" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Search Skills
            </label>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description..."
                style={{
                  flex: '1',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </form>
          </div>

          <div style={{ minWidth: '200px' }}>
            <label htmlFor="categoryFilter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Filter by Category
            </label>
            <select
              id="categoryFilter"
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {(selectedCategory || searchQuery) && (
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Category Summary */}
        {categories.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>Skill Categories</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryFilter(cat.category)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: selectedCategory === cat.category ? '#007bff' : '#f8f9fa',
                    color: selectedCategory === cat.category ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {cat.category} ({cat.count})
                </button>
              ))}
            </div>
          </div>
        )}
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
        data={skills}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Create Skill'}
        size="md"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Skill Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., JavaScript, Project Management, Communication"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g., Technical, Soft Skills, Leadership"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>
              Leave empty for uncategorized skills
            </small>
          </div>

          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the skill..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
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
              {editingSkill ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillsManagementPage;