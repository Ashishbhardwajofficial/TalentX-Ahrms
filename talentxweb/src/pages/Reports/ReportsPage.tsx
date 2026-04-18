import React, { useEffect, useState } from 'react';
import reportingApi, {
  ReportDefinition,
  ReportCategory,
  ReportRequest,
  ReportFormat
} from '../../api/reportingApi';
import employeeApi, { EmployeeSearchParams } from '../../api/employeeApi';
import ReportGenerator from '../../components/common/ReportGenerator';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'ALL'>('ALL');

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const availableReports = await reportingApi.getAvailableReports();
        setReports(availableReports);
      } catch (err: any) {
        console.error('Error loading reports:', err);
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handleGenerateReport = async (request: ReportRequest) => {
    try {
      setGenerating(true);
      setError(null);

      // Handle different report types
      let blob: Blob;

      switch (request.reportId) {
        case 'employee-roster':
          const employeeParams: EmployeeSearchParams = {
            page: 0,
            size: 1000, // Large number to get all employees
            ...request.parameters
          };
          blob = await employeeApi.exportEmployees(employeeParams);
          break;
        case 'leave-summary':
          blob = await reportingApi.exportLeaveRequests(request.parameters);
          break;
        case 'payroll-summary':
          blob = await reportingApi.exportPayrollData(request.parameters);
          break;
        default:
          // Try to generate report through generic endpoint
          const result = await reportingApi.generateReport(request);
          if (result.downloadUrl) {
            window.open(result.downloadUrl, '_blank');
            setSelectedReport(null);
            return;
          }
          throw new Error('Report generation not supported for this report type');
      }

      // Download the blob
      downloadBlob(blob, `${request.reportId}-${Date.now()}.${request.format.toLowerCase()}`);
      setSelectedReport(null);
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleQuickExport = async (type: 'employees' | 'leaves' | 'payroll') => {
    try {
      setGenerating(true);
      setError(null);

      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'employees':
          blob = await employeeApi.exportEmployees({ page: 0, size: 1000 });
          filename = `employees-${Date.now()}.csv`;
          break;
        case 'leaves':
          blob = await reportingApi.exportLeaveRequests({});
          filename = `leave-requests-${Date.now()}.csv`;
          break;
        case 'payroll':
          blob = await reportingApi.exportPayrollData({});
          filename = `payroll-${Date.now()}.csv`;
          break;
      }

      downloadBlob(blob, filename);
    } catch (err: any) {
      console.error('Error exporting data:', err);
      setError(err.message || 'Failed to export data');
    } finally {
      setGenerating(false);
    }
  };

  const filteredReports = selectedCategory === 'ALL'
    ? reports
    : reports.filter(r => r.category === selectedCategory);

  if (loading) {
    return <LoadingSpinner message="Loading reports..." overlay />;
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Generate and export various reports for your organization</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Quick Export Actions */}
      <div className="quick-exports">
        <h2>Quick Exports</h2>
        <div className="export-buttons">
          <button
            className="export-btn export-btn-primary"
            onClick={() => handleQuickExport('employees')}
            disabled={generating}
          >
            <span className="export-icon">👥</span>
            <span>Export Employees</span>
          </button>
          <button
            className="export-btn export-btn-success"
            onClick={() => handleQuickExport('leaves')}
            disabled={generating}
          >
            <span className="export-icon">📅</span>
            <span>Export Leave Requests</span>
          </button>
          <button
            className="export-btn export-btn-warning"
            onClick={() => handleQuickExport('payroll')}
            disabled={generating}
          >
            <span className="export-icon">💰</span>
            <span>Export Payroll Data</span>
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="report-categories">
        <h2>Available Reports</h2>
        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Reports
          </button>
          {Object.values(ReportCategory).map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {filteredReports.length === 0 ? (
          <div className="no-reports">
            <p>No reports available in this category</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-card-header">
                <h3>{report.name}</h3>
                <span className="report-category">{report.category}</span>
              </div>
              <p className="report-card-description">{report.description}</p>
              <button
                className="report-card-btn"
                onClick={() => setSelectedReport(report)}
              >
                Generate Report
              </button>
            </div>
          ))
        )}
      </div>

      {/* Report Generator Modal */}
      {selectedReport && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.name}
        >
          <ReportGenerator
            report={selectedReport}
            onGenerate={handleGenerateReport}
            loading={generating}
          />
        </Modal>
      )}
    </div>
  );
};

export default ReportsPage;
