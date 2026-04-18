import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import skillApi, {
  SkillDTO,
  EmployeeSkillDTO,
  EmployeeSkillCreateDTO,
  EmployeeSkillUpdateDTO
} from '../../api/skillApi';
import { ProficiencyLevel } from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

interface RouteParams {
  employeeId: string;
  [key: string]: string | undefined;
}

const EmployeeSkillsPage: React.FC = () => {
  const { employeeId } = useParams<RouteParams>();
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkillDTO[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EmployeeSkillDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state for adding skill
  const [addFormData, setAddFormData] = useState<EmployeeSkillCreateDTO>({
    employeeId: Number(employeeId),
    skillId: 0,
    proficiencyLevel: ProficiencyLevel.BEGINNER
  });

  // Form state for editing skill
  const [editFormData, setEditFormData] = useState<EmployeeSkillUpdateDTO>({
    proficiencyLevel: ProficiencyLevel.BEGINNER
  });

  
  useEffect(() => {
    if (employeeId) {
      loadEmployeeSkills();
    }
  }, [employeeId, pagination.page, pagination.size]);

  const loadEmployeeSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await skillApi.getSkillsByEmployee(
        Number(employeeId),
        {
          page: pagination.page - 1,
          size: pagination.size
        }
      );
      setEmployeeSkills(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load employee skills');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSkills = async () => {
    try {
      const response = await skillApi.getSkills({
        page: 0,
        size: 100 // Load more skills for selection
      });
      setAvailableSkills(response.content);
    } catch (err: any) {
      console.error('Failed to load available skills:', err);
    }
  };

  const handleAddSkill = () => {
    loadAvailableSkills();
    setAddFormData({
      employeeId: Number(employeeId),
      skillId: 0,
      proficiencyLevel: ProficiencyLevel.BEGINNER
    });
    setIsAddModalOpen(true);
  };

  const handleEditSkill = (employeeSkill: EmployeeSkillDTO) => {
    setEditingSkill(employeeSkill);
    const updateData: EmployeeSkillUpdateDTO = {
      proficiencyLevel: employeeSkill.proficiencyLevel
    };
    if (employeeSkill.yearsOfExperience !== undefined) {
      updateData.yearsOfExperience = employeeSkill.yearsOfExperience;
    }
    if (employeeSkill.lastUsedYear !== undefined) {
      updateData.lastUsedYear = employeeSkill.lastUsedYear;
    }
    setEditFormData(updateData);
    setIsEditModalOpen(true);
  };

  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) {
      return;
    }

    try {
      await skillApi.deleteEmployeeSkill(id);
      loadEmployeeSkills();
    } catch (err: any) {
      setError(err.message || 'Failed to delete skill');
    }
  };

  const handleVerifySkill = async (id: number) => {
    try {
      // TODO: Get current user ID from auth context
      const currentUserId = 1;
      await skillApi.verifyEmployeeSkill(id, { verifiedBy: currentUserId });
      loadEmployeeSkills();
    } catch (err: any) {
      setError(err.message || 'Failed to verify skill');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (addFormData.skillId === 0) {
      setError('Please select a skill');
      return;
    }

    try {
      await skillApi.addEmployeeSkill(addFormData);
      setIsAddModalOpen(false);
      loadEmployeeSkills();
    } catch (err: any) {
      setError(err.message || 'Failed to add skill');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingSkill) return;

    try {
      await skillApi.updateEmployeeSkill(editingSkill.id, editFormData);
      setIsEditModalOpen(false);
      loadEmployeeSkills();
    } catch (err: any) {
      setError(err.message || 'Failed to update skill');
    }
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: name === 'skillId' || name === 'yearsOfExperience' || name === 'lastUsedYear'
        ? (value === '' ? undefined : Number(value))
        : value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' || name === 'lastUsedYear'
        ? (value === '' ? undefined : Number(value))
        : value
    }));
  };

  const getProficiencyColor = (level: ProficiencyLevel): string => {
    switch (level) {
      case ProficiencyLevel.BEGINNER:
        return '#ffc107';
      case ProficiencyLevel.INTERMEDIATE:
        return '#17a2b8';
      case ProficiencyLevel.ADVANCED:
        return '#28a745';
      case ProficiencyLevel.EXPERT:
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  const columns: ColumnDefinition<EmployeeSkillDTO>[] = [
    {
      key: 'skillId',
      header: 'Skill',
      render: (_, employeeSkill) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {employeeSkill.skill?.name || `Skill #${employeeSkill.skillId}`}
          </div>
          {employeeSkill.skill?.category && (
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
              {employeeSkill.skill.category}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'proficiencyLevel',
      header: 'Proficiency',
      sortable: true,
      render: (value) => (
        <span
          style={{
            padding: '4px 12px',
            backgroundColor: getProficiencyColor(value as ProficiencyLevel),
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {value}
        </span>
      )
    },
    {
      key: 'yearsOfExperience',
      header: 'Experience',
      render: (value) => value ? `${value} years` : '-'
    },
    {
      key: 'lastUsedYear',
      header: 'Last Used',
      render: (value) => value || '-'
    },
    {
      key: 'verifiedAt',
      header: 'Verification',
      render: (value, employeeSkill) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#28a745', fontSize: '16px' }}>✓</span>
          <span style={{ fontSize: '12px', color: '#6c757d' }}>
            Verified
          </span>
        </div>
      ) : (
        <button
          onClick={() => handleVerifySkill(employeeSkill.id)}
          style={{
            padding: '4px 8px',
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Verify
        </button>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, employeeSkill) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEditSkill(employeeSkill)}
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
            onClick={() => handleDeleteSkill(employeeSkill.id)}
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
            Remove
          </button>
        </div>
      )
    }
  ];

  // Calculate skill statistics
  const skillStats = {
    total: employeeSkills.length,
    verified: employeeSkills.filter(s => s.verifiedAt).length,
    byProficiency: {
      [ProficiencyLevel.BEGINNER]: employeeSkills.filter(s => s.proficiencyLevel === ProficiencyLevel.BEGINNER).length,
      [ProficiencyLevel.INTERMEDIATE]: employeeSkills.filter(s => s.proficiencyLevel === ProficiencyLevel.INTERMEDIATE).length,
      [ProficiencyLevel.ADVANCED]: employeeSkills.filter(s => s.proficiencyLevel === ProficiencyLevel.ADVANCED).length,
      [ProficiencyLevel.EXPERT]: employeeSkills.filter(s => s.proficiencyLevel === ProficiencyLevel.EXPERT).length
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Employee Skills</h1>
        <button
          onClick={handleAddSkill}
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
          + Add Skill
        </button>
      </div>

      {/* Skill Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Total Skills</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{skillStats.total}</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Verified Skills</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {skillStats.verified}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Expert Level</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
            {skillStats.byProficiency[ProficiencyLevel.EXPERT]}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Advanced Level</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {skillStats.byProficiency[ProficiencyLevel.ADVANCED]}
          </div>
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

      <DataTable
        data={employeeSkills}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Skill"
        size="md"
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="skillId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Skill *
            </label>
            <select
              id="skillId"
              name="skillId"
              value={addFormData.skillId}
              onChange={handleAddInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={0}>Select a skill...</option>
              {availableSkills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} {skill.category && `(${skill.category})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proficiencyLevel" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Proficiency Level *
            </label>
            <select
              id="proficiencyLevel"
              name="proficiencyLevel"
              value={addFormData.proficiencyLevel}
              onChange={handleAddInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={ProficiencyLevel.BEGINNER}>Beginner</option>
              <option value={ProficiencyLevel.INTERMEDIATE}>Intermediate</option>
              <option value={ProficiencyLevel.ADVANCED}>Advanced</option>
              <option value={ProficiencyLevel.EXPERT}>Expert</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="yearsOfExperience" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Years of Experience
              </label>
              <input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                max="50"
                value={addFormData.yearsOfExperience || ''}
                onChange={handleAddInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="lastUsedYear" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Last Used Year
              </label>
              <input
                id="lastUsedYear"
                name="lastUsedYear"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={addFormData.lastUsedYear || ''}
                onChange={handleAddInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
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
              Add Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Skill Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Skill"
        size="md"
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Skill
            </label>
            <div style={{
              padding: '8px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {editingSkill?.skill?.name || `Skill #${editingSkill?.skillId}`}
            </div>
          </div>

          <div>
            <label htmlFor="editProficiencyLevel" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Proficiency Level *
            </label>
            <select
              id="editProficiencyLevel"
              name="proficiencyLevel"
              value={editFormData.proficiencyLevel}
              onChange={handleEditInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={ProficiencyLevel.BEGINNER}>Beginner</option>
              <option value={ProficiencyLevel.INTERMEDIATE}>Intermediate</option>
              <option value={ProficiencyLevel.ADVANCED}>Advanced</option>
              <option value={ProficiencyLevel.EXPERT}>Expert</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="editYearsOfExperience" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Years of Experience
              </label>
              <input
                id="editYearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                max="50"
                value={editFormData.yearsOfExperience || ''}
                onChange={handleEditInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="editLastUsedYear" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Last Used Year
              </label>
              <input
                id="editLastUsedYear"
                name="lastUsedYear"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={editFormData.lastUsedYear || ''}
                onChange={handleEditInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
              Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeSkillsPage;