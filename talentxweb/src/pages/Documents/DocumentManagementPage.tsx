import React, { useState, useEffect } from 'react';
import documentApi, {
  DocumentDTO,
  DocumentUploadDTO,
  DocumentUpdateDTO,
  DocumentSearchParams
} from '../../api/documentApi';
import { DocumentType } from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import DocumentUploader from '../../components/documents/DocumentUploader';
import { FileText, Zap, Shield, Activity, Search, Filter, Trash2, Edit2, Download, Eye, CheckCircle2, Clock, AlertCircle, Mail, Phone, MapPin, ChevronRight, MoreVertical, XCircle, FilePlus, ExternalLink } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import EnhancedStatCard from '../../components/cards/EnhancedStatCard';
import { useAuth } from '../../hooks/useAuth';

const DocumentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentDTO | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentDTO | null>(null);
  const [signingDocument, setSigningDocument] = useState<DocumentDTO | null>(null);
  const [expiringDocuments, setExpiringDocuments] = useState<DocumentDTO[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Search/Filter state
  const [searchParams, setSearchParams] = useState<DocumentSearchParams>({
    page: 0,
    size: 10,
    organizationId: orgId,
    search: '',
    signedStatus: 'ALL'
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState<DocumentUpdateDTO>({
    title: '',
    description: '',
    isConfidential: false,
    requiresSignature: false,
    issueDate: '',
    expiryDate: '',
    isPublic: false
  });


  useEffect(() => {
    loadDocuments();
    loadExpiringDocuments();
  }, [searchParams.page, searchParams.size]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentApi.getDocuments({
        ...searchParams,
        page: pagination.page - 1 // Backend uses 0-based indexing
      });
      setDocuments((response.content || []).filter(Boolean));
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadExpiringDocuments = async () => {
    try {
      const expiring = await documentApi.getExpiringDocuments(1, 30); // Documents expiring in 30 days
      setExpiringDocuments(expiring);
    } catch (err: any) {
      console.error('Failed to load expiring documents:', err);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    loadDocuments();
    loadExpiringDocuments();
  };

  const handleEdit = (document: DocumentDTO) => {
    setEditingDocument(document);
    setEditFormData({
      title: document.title,
      description: document.description || '',
      documentType: document.documentType,
      isConfidential: document.isConfidential,
      requiresSignature: document.requiresSignature,
      issueDate: document.issueDate || '',
      expiryDate: document.expiryDate || '',
      isPublic: document.isPublic
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentApi.deleteDocument(id);
      loadDocuments();
      loadExpiringDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const handlePreview = (document: DocumentDTO) => {
    setPreviewDocument(document);
    setIsPreviewModalOpen(true);
  };

  const handleDownload = async (document: DocumentDTO) => {
    try {
      const blob = await documentApi.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download document');
    }
  };

  const handleSignDocument = (document: DocumentDTO) => {
    setSigningDocument(document);
    setIsSignModalOpen(true);
  };

  const handleSignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingDocument) return;

    try {
      await documentApi.signDocument({
        documentId: signingDocument.id,
        signatureMethod: 'ELECTRONIC'
      });
      setIsSignModalOpen(false);
      setSigningDocument(null);
      loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to sign document');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument) return;

    try {
      setError(null);
      await documentApi.updateDocument(editingDocument.id, editFormData);
      setIsEditModalOpen(false);
      setEditingDocument(null);
      loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to update document');
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? undefined : value)
    }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadDocuments();
  };

  const handleFilterChange = (key: keyof DocumentSearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const metrics = [
    { title: 'Total Inventory', value: documents.length, icon: <FileText />, status: 'info' as const },
    { title: 'Active Protocol', value: pagination.total, icon: <Zap />, status: 'info' as const, trend: { direction: 'up', value: 12, label: 'Yield' } as const },
    { title: 'Confidential', value: documents.filter(d => d != null && d.isConfidential).length, icon: <Shield />, status: 'warning' as const },
    { title: 'Storage Load', value: '4.2 GB', icon: <Activity />, status: 'success' as const }
  ];

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isExpiringSoon = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const columns: ColumnDefinition<DocumentDTO>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, doc) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>{doc.fileName}</div>
        </div>
      )
    },
    {
      key: 'documentType',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: '#e7f3ff',
          color: '#004085',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'fileSize',
      header: 'Size',
      render: (value) => formatFileSize(value)
    },
    {
      key: 'expiryDate',
      header: 'Expiry',
      sortable: true,
      render: (value, doc) => {
        if (!value) return '-';
        const expired = isExpired(value);
        const expiring = isExpiringSoon(value);

        return (
          <div style={{
            color: expired ? '#dc3545' : expiring ? '#ffc107' : '#28a745',
            fontWeight: expired || expiring ? 'bold' : 'normal'
          }}>
            {formatDate(value)}
            {expired && ' ⚠️'}
            {!expired && expiring && ' ⏰'}
          </div>
        );
      }
    },
    {
      key: 'signedAt',
      header: 'Signature',
      render: (value, doc) => {
        if (!doc.requiresSignature) {
          return <span style={{ color: '#6c757d' }}>N/A</span>;
        }
        return value ? (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#d4edda',
            color: '#155724',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            ✓ Signed
          </span>
        ) : (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Pending
          </span>
        );
      }
    },
    {
      key: 'isConfidential',
      header: 'Confidential',
      render: (value) => value ? (
        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>🔒 Yes</span>
      ) : (
        <span style={{ color: '#6c757d' }}>No</span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, document) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handlePreview(document)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Preview"
          >
            👁️ View
          </button>
          <button
            onClick={() => handleDownload(document)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Download"
          >
            ⬇️ Download
          </button>
          {document.requiresSignature && !document.signedAt && (
            <button
              onClick={() => handleSignDocument(document)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ffc107',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Sign Document"
            >
              ✍️ Sign
            </button>
          )}
          <button
            onClick={() => handleEdit(document)}
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
            onClick={() => handleDelete(document.id)}
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
        <h1>Document Management</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
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
          + Upload Document
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, i) => (
          <EnhancedStatCard key={i} {...m} isLoading={loading} />
        ))}
      </div>

      {/* Expiry Warnings */}
      {expiringDocuments.length > 0 && (
        <div className="premium-card p-6 bg-warning-50/10 border-warning-200 mb-8">
          <div className="flex items-center gap-2 text-warning-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest">Expiry Protocol Warnings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expiringDocuments.slice(0, 3).map(doc => (
              <div key={doc.id} className="p-4 rounded-2xl bg-white dark:bg-secondary-900 shadow-sm border border-secondary-100 dark:border-secondary-800">
                <div className="text-xs font-black text-secondary-900 dark:text-white uppercase truncate">{doc.title}</div>
                <div className="text-[10px] font-bold text-secondary-400 mt-1">Expiring: {formatDate(doc.expiryDate)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Search and Filter */}
      <div style={{
        padding: '16px',
        marginBottom: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
              Search
            </label>
            <input
              type="text"
              value={searchParams.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, description, or filename..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
              Document Type
            </label>
            <select
              value={searchParams.documentType || ''}
              onChange={(e) => handleFilterChange('documentType', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">All Types</option>
              {Object.values(DocumentType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
              Signature Status
            </label>
            <select
              value={searchParams.signedStatus || 'ALL'}
              onChange={(e) => handleFilterChange('signedStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="ALL">All</option>
              <option value="SIGNED">Signed</option>
              <option value="UNSIGNED">Unsigned</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Search
          </button>
        </div>
      </div>

      <DataTable
        data={documents}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
        size="lg"
      >
        <DocumentUploader
          organizationId={1} // TODO: Get from context/auth
          onUploadSuccess={handleUploadSuccess}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Document"
        size="md"
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={editFormData.title}
              onChange={handleEditInputChange}
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
            <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={editFormData.description}
              onChange={handleEditInputChange}
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="documentType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Document Type
              </label>
              <select
                id="documentType"
                name="documentType"
                value={editFormData.documentType || ''}
                onChange={handleEditInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                {Object.values(DocumentType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expiryDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Expiry Date
              </label>
              <input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={editFormData.expiryDate}
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

          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isConfidential"
                checked={editFormData.isConfidential}
                onChange={handleEditInputChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Confidential</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="requiresSignature"
                checked={editFormData.requiresSignature}
                onChange={handleEditInputChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Requires Signature</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isPublic"
                checked={editFormData.isPublic}
                onChange={handleEditInputChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Public</span>
            </label>
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

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={previewDocument ? previewDocument.title : 'Document Preview'}
        size="lg"
      >
        {previewDocument && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <strong>Type:</strong> {previewDocument.documentType}
                </div>
                <div>
                  <strong>Version:</strong> {previewDocument.version}
                </div>
                <div>
                  <strong>File Size:</strong> {formatFileSize(previewDocument.fileSize)}
                </div>
                <div>
                  <strong>File Type:</strong> {previewDocument.fileType || 'N/A'}
                </div>
                <div>
                  <strong>Uploaded:</strong> {formatDate(previewDocument.createdAt)}
                </div>
                <div>
                  <strong>Expiry:</strong> {formatDate(previewDocument.expiryDate)}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Description:</strong> {previewDocument.description || 'No description'}
                </div>
              </div>
            </div>

            <div style={{
              width: '100%',
              height: '500px',
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Document Preview</h4>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '14px', maxWidth: '400px' }}>
                Preview functionality requires integration with a document viewer library.
                For now, you can download the document to view it.
              </p>
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={() => handleDownload(previewDocument)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Download Document
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Sign Document Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Sign Document"
        size="md"
      >
        {signingDocument && (
          <form onSubmit={handleSignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '12px' }}>{signingDocument.title}</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                {signingDocument.description || 'No description available'}
              </p>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffc107',
              color: '#856404'
            }}>
              <strong>⚠️ Important:</strong> By signing this document, you acknowledge that you have read and agree to its contents.
              This action will be recorded with your user ID and timestamp.
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#e9ecef',
              borderRadius: '8px',
              border: '2px dashed #adb5bd',
              textAlign: 'center',
              minHeight: '150px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>✍️</div>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                Digital signature will be applied electronically
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsSignModalOpen(false)}
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
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sign Document
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DocumentManagementPage;
