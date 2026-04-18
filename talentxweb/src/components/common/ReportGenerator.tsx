import React, { useState } from 'react';
import {
  ReportDefinition,
  ReportFormat,
  ReportParameter,
  ReportRequest
} from '../../api/reportingApi';
import Button from './Button';
import FormField from './FormField';

export interface ReportGeneratorProps {
  report: ReportDefinition;
  onGenerate: (request: ReportRequest) => Promise<void>;
  loading?: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  report,
  onGenerate,
  loading = false
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateParameters = (): boolean => {
    const newErrors: Record<string, string> = {};

    report.parameters.forEach(param => {
      if (param.required && !parameters[param.name]) {
        newErrors[param.name] = `${param.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateParameters()) {
      return;
    }

    const request: ReportRequest = {
      reportId: report.id,
      parameters,
      format
    };

    await onGenerate(request);
  };

  const renderParameterInput = (param: ReportParameter) => {
    const value = parameters[param.name] || param.defaultValue || '';
    const error = errors[param.name];

    const baseProps = {
      label: param.label,
      name: param.name,
      value,
      required: param.required,
      ...(error ? { error } : {})
    };

    switch (param.type) {
      case 'select':
        return (
          <FormField
            {...baseProps}
            type="select"
            onChange={(value) => handleParameterChange(param.name, value)}
            options={param.options || []}
          />
        );

      case 'date':
        return (
          <FormField
            {...baseProps}
            type="date"
            onChange={(value) => handleParameterChange(param.name, value)}
          />
        );

      case 'dateRange':
        return (
          <div className="date-range-field">
            <FormField
              label={`${param.label} - Start`}
              name={`${param.name}_start`}
              type="date"
              value={parameters[`${param.name}_start`] || ''}
              onChange={(value) => handleParameterChange(`${param.name}_start`, value)}
              required={param.required}
              {...(error ? { error } : {})}
            />
            <FormField
              label={`${param.label} - End`}
              name={`${param.name}_end`}
              type="date"
              value={parameters[`${param.name}_end`] || ''}
              onChange={(value) => handleParameterChange(`${param.name}_end`, value)}
              required={param.required}
            />
          </div>
        );

      case 'number':
        return (
          <FormField
            {...baseProps}
            type="number"
            onChange={(value) => handleParameterChange(param.name, value)}
          />
        );

      case 'text':
      default:
        return (
          <FormField
            {...baseProps}
            type="text"
            onChange={(value) => handleParameterChange(param.name, value)}
          />
        );
    }
  };

  return (
    <div className="report-generator">
      <div className="report-header">
        <h3>{report.name}</h3>
        <p className="report-description">{report.description}</p>
      </div>

      <div className="report-parameters">
        {report.parameters.map(param => (
          <div key={param.name} className="parameter-field">
            {renderParameterInput(param)}
          </div>
        ))}
      </div>

      <div className="report-format">
        <label className="format-label">Export Format:</label>
        <div className="format-options">
          {Object.values(ReportFormat).map(fmt => (
            <label key={fmt} className="format-option">
              <input
                type="radio"
                name="format"
                value={fmt}
                checked={format === fmt}
                onChange={(e) => setFormat(e.target.value as ReportFormat)}
              />
              <span>{fmt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="report-actions">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          variant="primary"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </div>
  );
};

export default ReportGenerator;
