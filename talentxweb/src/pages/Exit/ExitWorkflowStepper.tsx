import React from 'react';
import { EmployeeExitDTO } from '../../api/exitApi';
import { ExitStatus } from '../../types';

interface ExitWorkflowStepperProps {
  exit: EmployeeExitDTO;
}

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  date?: string | undefined;
}

const ExitWorkflowStepper: React.FC<ExitWorkflowStepperProps> = ({ exit }) => {
  const getWorkflowSteps = (exit: EmployeeExitDTO): WorkflowStep[] => {
    const steps: WorkflowStep[] = [
      {
        id: 1,
        title: 'Exit Initiated',
        description: 'Employee has submitted resignation and exit request',
        status: 'completed',
        date: exit.createdAt
      },
      {
        id: 2,
        title: 'Manager Review',
        description: 'Manager reviews and approves/rejects the exit request',
        status: exit.status === ExitStatus.INITIATED ? 'active' :
          exit.status === ExitStatus.WITHDRAWN ? 'pending' : 'completed',
        date: exit.status !== ExitStatus.INITIATED && exit.status !== ExitStatus.WITHDRAWN ? exit.createdAt : undefined
      },
      {
        id: 3,
        title: 'Exit Checklist',
        description: 'Complete all exit-related tasks and handovers',
        status: exit.status === ExitStatus.APPROVED ? 'active' :
          exit.status === ExitStatus.COMPLETED ? 'completed' : 'pending'
      },
      {
        id: 4,
        title: 'Final Settlement',
        description: 'Process final salary, benefits, and documentation',
        status: exit.status === ExitStatus.COMPLETED ? 'completed' : 'pending'
      },
      {
        id: 5,
        title: 'Exit Completed',
        description: 'Employee exit process completed successfully',
        status: exit.status === ExitStatus.COMPLETED ? 'completed' : 'pending'
      }
    ];

    // Handle withdrawn status
    if (exit.status === ExitStatus.WITHDRAWN) {
      return [
        steps[0]!,
        {
          id: 2,
          title: 'Exit Withdrawn',
          description: 'Exit request has been withdrawn by employee or manager',
          status: 'completed',
          date: exit.createdAt
        }
      ];
    }

    return steps;
  };

  const getStepIcon = (status: 'completed' | 'active' | 'pending', stepNumber: number) => {
    const baseStyle = {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      color: 'white'
    };

    switch (status) {
      case 'completed':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#28a745' }}>
            ✓
          </div>
        );
      case 'active':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#007bff' }}>
            {stepNumber}
          </div>
        );
      case 'pending':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#6c757d' }}>
            {stepNumber}
          </div>
        );
      default:
        return (
          <div style={{ ...baseStyle, backgroundColor: '#6c757d' }}>
            {stepNumber}
          </div>
        );
    }
  };

  const getStatusColor = (status: ExitStatus) => {
    switch (status) {
      case ExitStatus.INITIATED:
        return '#ffc107';
      case ExitStatus.APPROVED:
        return '#28a745';
      case ExitStatus.WITHDRAWN:
        return '#6c757d';
      case ExitStatus.COMPLETED:
        return '#007bff';
      default:
        return '#6c757d';
    }
  };

  const steps = getWorkflowSteps(exit);

  return (
    <div style={{ padding: '20px' }}>
      {/* Exit Summary */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '24px',
        border: `2px solid ${getStatusColor(exit.status)}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Exit Request Summary</h3>
          <span style={{
            padding: '4px 12px',
            backgroundColor: getStatusColor(exit.status),
            color: 'white',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {exit.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <strong>Employee ID:</strong> EMP-{exit.employeeId}
          </div>
          <div>
            <strong>Resignation Date:</strong> {exit.resignationDate ? new Date(exit.resignationDate).toLocaleDateString() : '-'}
          </div>
          <div>
            <strong>Last Working Day:</strong> {exit.lastWorkingDay ? new Date(exit.lastWorkingDay).toLocaleDateString() : '-'}
          </div>
          <div>
            <strong>Submitted:</strong> {new Date(exit.createdAt).toLocaleDateString()}
          </div>
        </div>

        {exit.exitReason && (
          <div style={{ marginTop: '12px' }}>
            <strong>Exit Reason:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontStyle: 'italic' }}>
              {exit.exitReason}
            </p>
          </div>
        )}
      </div>

      {/* Workflow Steps */}
      <div style={{ position: 'relative' }}>
        <h3 style={{ marginBottom: '24px', color: '#333' }}>Exit Workflow Progress</h3>

        {steps.map((step, index) => (
          <div key={step.id} style={{ display: 'flex', marginBottom: '24px', position: 'relative' }}>
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '32px',
                width: '2px',
                height: '40px',
                backgroundColor: step.status === 'completed' ? '#28a745' : '#dee2e6'
              }} />
            )}

            {/* Step Icon */}
            <div style={{ marginRight: '16px', zIndex: 1 }}>
              {getStepIcon(step.status, step.id)}
            </div>

            {/* Step Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{
                  margin: 0,
                  color: step.status === 'active' ? '#007bff' : step.status === 'completed' ? '#28a745' : '#6c757d',
                  fontSize: '16px'
                }}>
                  {step.title}
                </h4>
                {step.date && (
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>
                    {new Date(step.date).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p style={{
                margin: 0,
                color: '#666',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {step.description}
              </p>

              {/* Additional info for active steps */}
              {step.status === 'active' && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#1976d2'
                }}>
                  <strong>Action Required:</strong> This step is currently in progress
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Exit Checklist for Approved Status */}
      {exit.status === ExitStatus.APPROVED && (
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#856404' }}>Exit Checklist</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#856404' }}>
            Please ensure all the following items are completed before marking the exit as complete:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
            <li>Return all company assets (laptop, ID card, access cards)</li>
            <li>Complete knowledge transfer documentation</li>
            <li>Handover ongoing projects and responsibilities</li>
            <li>Update bank details for final settlement</li>
            <li>Complete exit interview</li>
            <li>Clear pending expenses and reimbursements</li>
            <li>Update emergency contact information</li>
          </ul>
        </div>
      )}

      {/* Completion Message */}
      {exit.status === ExitStatus.COMPLETED && (
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          border: '1px solid #c3e6cb',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#155724' }}>Exit Process Completed</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
            The employee exit process has been successfully completed. All necessary documentation and handovers have been finalized.
          </p>
        </div>
      )}

      {/* Withdrawal Message */}
      {exit.status === ExitStatus.WITHDRAWN && (
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f8d7da',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#721c24' }}>Exit Request Withdrawn</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#721c24' }}>
            This exit request has been withdrawn and is no longer active.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExitWorkflowStepper;