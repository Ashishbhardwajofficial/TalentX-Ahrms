import React, { useState, useEffect } from 'react';
import documentApi, { DocumentDTO } from '../../../api/documentApi';
import { FileText, Download, ExternalLink, Search, Plus } from 'lucide-react';
import Button from '../../common/Button';
import LoadingSpinner from '../../common/LoadingSpinner';

interface EmployeeDocumentsProps {
    employeeId: number;
}

const EmployeeDocuments: React.FC<EmployeeDocumentsProps> = ({ employeeId }) => {
    const [documents, setDocuments] = useState<DocumentDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDocuments();
    }, [employeeId]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentApi.getDocumentsByEmployee(employeeId);
            setDocuments(response.content);
        } catch (err: any) {
            console.error('Error loading documents:', err);
            setError(err.message || 'Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (docId: number, fileName: string) => {
        try {
            const blob = await documentApi.downloadDocument(docId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-secondary-900">Documents</h3>
                <Button size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Upload Document
                </Button>
            </div>

            {error ? (
                <div className="bg-danger-50 text-danger-700 p-4 rounded-lg border border-danger-100">
                    {error}
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-12 bg-secondary-50 rounded-xl border border-dashed border-secondary-300">
                    <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">No documents found for this employee</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow group"
                        >
                            <div className="bg-primary-50 text-primary-600 p-3 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-secondary-900 truncate">{doc.title}</h4>
                                <p className="text-xs text-secondary-500 mt-0.5">{doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                <div className="flex gap-3 mt-3">
                                    <button
                                        onClick={() => handleDownload(doc.id, doc.fileName)}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </button>
                                    <button className="text-secondary-500 hover:text-secondary-700 text-sm font-medium flex items-center gap-1.5">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeDocuments;
