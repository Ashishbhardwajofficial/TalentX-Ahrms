import React, { useState, useRef, useCallback } from 'react';
import documentApi, { DocumentUploadDTO } from '../../api/documentApi';
import { DocumentType } from '../../types';

interface DocumentUploaderProps {
  organizationId: number;
  employeeId?: number;
  onUploadSuccess: (document: any) => void;
  onCancel: () => void;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  organizationId,
  employeeId,
  onUploadSuccess,
  onCancel,
  maxFileSize = 10, // 10MB default
  allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ]
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<DocumentUploadDTO, 'file' | 'organizationId' | 'employeeId'>>({
    documentType: DocumentType.OTHER,
    title: '',
    description: '',
    isConfidential: false,
    requiresSignature: false,
    issueDate: '',
    expiryDate: '',
    isPublic: false
  });

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`;
    }

    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      // Auto-populate title from filename if not set
      if (!formData.title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExtension }));
      }
    }
  }, [formData.title, maxFileSize, allowedFileTypes]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      // Auto-populate title from filename if not set
      if (!formData.title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExtension }));
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a document title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadData: DocumentUploadDTO = {
        ...formData,
        organizationId,
        employeeId,
        file: selectedFile
      };

      // Simulate upload progress (in real implementation, this would come from axios progress callback)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await documentApi.uploadDocument(uploadData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Small delay to show 100% progress
      setTimeout(() => {
        onUploadSuccess(result);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileTypeIcon = (file: File): string => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return '📽️';
    return '📎';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* File Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#007bff' : selectedFile ? '#28a745' : '#ccc'}`,
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f0f8ff' : selectedFile ? '#f8fff8' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedFileTypes.join(',')}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '48px' }}>{getFileTypeIcon(selectedFile)}</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#28a745' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                {formatFileSize(selectedFile.size)} • {selectedFile.type}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setFormData(prev => ({ ...prev, title: '' }));
              }}
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '48px', color: '#6c757d' }}>📁</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#495057', marginBottom: '8px' }}>
                {dragActive ? 'Drop file here' : 'Drag & drop file here'}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '12px' }}>
                or click to browse files
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                Max file size: {maxFileSize}MB
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                Supported: PDF, Word, Images, Text files
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '0 0 6px 6px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#007bff',
                width: `${uploadProgress}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Document Metadata Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Document Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter document title"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter document description (optional)"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label htmlFor="documentType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Document Type *
          </label>
          <select
            id="documentType"
            name="documentType"
            value={formData.documentType}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {Object.values(DocumentType).map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
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
            value={formData.expiryDate}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label htmlFor="issueDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Issue Date
          </label>
          <input
            id="issueDate"
            name="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Document Options */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Document Options</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isConfidential"
              checked={formData.isConfidential}
              onChange={handleInputChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 'bold' }}>🔒 Confidential Document</span>
          </label>
          <p style={{ fontSize: '12px', color: '#6c757d', marginLeft: '26px', marginTop: '-8px' }}>
            Restrict access to authorized personnel only
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="requiresSignature"
              checked={formData.requiresSignature}
              onChange={handleInputChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 'bold' }}>✍️ Requires Digital Signature</span>
          </label>
          <p style={{ fontSize: '12px', color: '#6c757d', marginLeft: '26px', marginTop: '-8px' }}>
            Document must be signed before it's considered complete
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: 'bold' }}>🌐 Public Document</span>
          </label>
          <p style={{ fontSize: '12px', color: '#6c757d', marginLeft: '26px', marginTop: '-8px' }}>
            Document can be accessed by all organization members
          </p>
        </div>
      </div>

      {/* Upload Progress Display */}
      {uploading && (
        <div style={{
          padding: '16px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          border: '1px solid #b3d7ff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '20px' }}>⏳</div>
            <span style={{ fontWeight: 'bold', color: '#004085' }}>
              Uploading... {uploadProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#cce7ff',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#007bff',
                width: `${uploadProgress}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedFile || uploading || !formData.title.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!selectedFile || uploading || !formData.title.trim()) ? 'not-allowed' : 'pointer',
            opacity: (!selectedFile || uploading || !formData.title.trim()) ? 0.6 : 1
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
};

export default DocumentUploader;