import React from 'react';
import { BenefitPlanDTO } from '../../api/benefitApi';

interface BenefitPlanCardProps {
  plan: BenefitPlanDTO;
  onEnroll: () => void;
  isEnrolled?: boolean;
}

const BenefitPlanCard: React.FC<BenefitPlanCardProps> = ({ plan, onEnroll, isEnrolled = false }) => {
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPlanType = (planType: string) => {
    return planType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCostFrequency = (frequency: string) => {
    return frequency.replace(/_/g, ' ').toLowerCase();
  };

  const getTotalCost = () => {
    const employeeCost = plan.employeeCost || 0;
    const employerCost = plan.employerCost || 0;
    return employeeCost + employerCost;
  };

  const getCardBorderColor = () => {
    if (isEnrolled) return '#28a745'; // Green for enrolled
    if (!plan.isActive) return '#6c757d'; // Gray for inactive
    return '#007bff'; // Blue for available
  };

  return (
    <div style={{
      border: `2px solid ${getCardBorderColor()}`,
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative',
      opacity: plan.isActive ? 1 : 0.7
    }}>
      {/* Status Badge */}
      {isEnrolled && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ENROLLED
        </div>
      )}

      {!plan.isActive && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          INACTIVE
        </div>
      )}

      {/* Plan Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          margin: '0 0 8px 0',
          color: '#333',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {plan.name}
        </h3>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#e9ecef',
          color: '#495057',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {formatPlanType(plan.planType)}
        </div>
      </div>

      {/* Plan Description */}
      {plan.description && (
        <p style={{
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.4',
          marginBottom: '16px'
        }}>
          {plan.description}
        </p>
      )}

      {/* Provider */}
      {plan.provider && (
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: '500'
          }}>
            Provider: {plan.provider}
          </span>
        </div>
      )}

      {/* Cost Breakdown */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '6px',
        marginBottom: '16px'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          color: '#333'
        }}>
          Cost Breakdown ({formatCostFrequency(plan.costFrequency)})
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Employee Cost:</span>
            <span style={{ fontWeight: 'bold', color: '#dc3545' }}>
              {formatCurrency(plan.employeeCost)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666' }}>Employer Cost:</span>
            <span style={{ fontWeight: 'bold', color: '#28a745' }}>
              {formatCurrency(plan.employerCost)}
            </span>
          </div>

          <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #dee2e6' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Total Plan Cost:</span>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {formatCurrency(getTotalCost())}
            </span>
          </div>
        </div>
      </div>

      {/* Effective Dates */}
      {(plan.effectiveDate || plan.expiryDate) && (
        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
          {plan.effectiveDate && (
            <div>Effective: {new Date(plan.effectiveDate).toLocaleDateString()}</div>
          )}
          {plan.expiryDate && (
            <div>Expires: {new Date(plan.expiryDate).toLocaleDateString()}</div>
          )}
        </div>
      )}

      {/* Enrollment Button */}
      <button
        onClick={onEnroll}
        disabled={isEnrolled || !plan.isActive}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isEnrolled ? '#6c757d' :
            !plan.isActive ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isEnrolled || !plan.isActive ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          if (!isEnrolled && plan.isActive) {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }
        }}
        onMouseOut={(e) => {
          if (!isEnrolled && plan.isActive) {
            e.currentTarget.style.backgroundColor = '#007bff';
          }
        }}
      >
        {isEnrolled ? 'Already Enrolled' :
          !plan.isActive ? 'Plan Inactive' : 'Enroll Now'}
      </button>

      {/* Additional Info */}
      {plan.isActive && !isEnrolled && (
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          Click to enroll and select coverage options
        </div>
      )}
    </div>
  );
};

export default BenefitPlanCard;