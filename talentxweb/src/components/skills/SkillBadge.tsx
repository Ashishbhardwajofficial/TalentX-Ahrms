import React from 'react';
import { ProficiencyLevel } from '../../types';

export interface SkillBadgeProps {
  skillName: string;
  proficiencyLevel: ProficiencyLevel;
  isVerified?: boolean;
  verifiedAt?: string;
  verifiedBy?: number;
  yearsOfExperience?: number;
  lastUsedYear?: number;
  category?: string;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onClick?: () => void;
  className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  skillName,
  proficiencyLevel,
  isVerified = false,
  verifiedAt,
  verifiedBy,
  yearsOfExperience,
  lastUsedYear,
  category,
  size = 'medium',
  showDetails = false,
  onClick,
  className = ''
}) => {
  // Get proficiency level color
  const getProficiencyColor = (level: ProficiencyLevel): string => {
    switch (level) {
      case ProficiencyLevel.BEGINNER:
        return '#ffc107'; // Yellow
      case ProficiencyLevel.INTERMEDIATE:
        return '#17a2b8'; // Teal
      case ProficiencyLevel.ADVANCED:
        return '#28a745'; // Green
      case ProficiencyLevel.EXPERT:
        return '#6f42c1'; // Purple
      default:
        return '#6c757d'; // Gray
    }
  };

  // Get size-specific dimensions and styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: '11px',
          padding: '4px 8px',
          iconSize: '12px',
          gap: '4px',
          borderRadius: '8px'
        };
      case 'large':
        return {
          fontSize: '14px',
          padding: '8px 16px',
          iconSize: '16px',
          gap: '8px',
          borderRadius: '16px'
        };
      default: // medium
        return {
          fontSize: '12px',
          padding: '6px 12px',
          iconSize: '14px',
          gap: '6px',
          borderRadius: '12px'
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const proficiencyColor = getProficiencyColor(proficiencyLevel);

  // Format proficiency level for display
  const formatProficiencyLevel = (level: ProficiencyLevel): string => {
    return level.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get proficiency level icon
  const getProficiencyIcon = (level: ProficiencyLevel): string => {
    switch (level) {
      case ProficiencyLevel.BEGINNER:
        return '●';
      case ProficiencyLevel.INTERMEDIATE:
        return '●●';
      case ProficiencyLevel.ADVANCED:
        return '●●●';
      case ProficiencyLevel.EXPERT:
        return '●●●●';
      default:
        return '○';
    }
  };

  // Build tooltip content
  const getTooltipContent = (): string => {
    const parts = [
      `Skill: ${skillName}`,
      `Proficiency: ${formatProficiencyLevel(proficiencyLevel)}`
    ];

    if (category) {
      parts.push(`Category: ${category}`);
    }

    if (yearsOfExperience) {
      parts.push(`Experience: ${yearsOfExperience} years`);
    }

    if (lastUsedYear) {
      parts.push(`Last used: ${lastUsedYear}`);
    }

    if (isVerified && verifiedAt) {
      parts.push(`Verified: ${new Date(verifiedAt).toLocaleDateString()}`);
    }

    return parts.join('\n');
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizeStyles.gap,
    padding: sizeStyles.padding,
    backgroundColor: proficiencyColor,
    color: 'white',
    borderRadius: sizeStyles.borderRadius,
    fontSize: sizeStyles.fontSize,
    fontWeight: 'bold',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    userSelect: 'none',
    border: 'none',
    outline: 'none'
  };

  const hoverStyle: React.CSSProperties = onClick ? {
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  } : {};

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`skill-badge ${className}`}
      style={badgeStyle}
      onClick={onClick}
      title={getTooltipContent()}
      onMouseEnter={(e) => {
        if (onClick) {
          Object.assign(e.currentTarget.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Skill Name */}
      <span className="skill-name">
        {skillName}
      </span>

      {/* Proficiency Level Indicator */}
      <span
        className="proficiency-indicator"
        style={{
          fontSize: sizeStyles.iconSize,
          opacity: 0.9,
          letterSpacing: '-1px'
        }}
        title={`Proficiency: ${formatProficiencyLevel(proficiencyLevel)}`}
      >
        {getProficiencyIcon(proficiencyLevel)}
      </span>

      {/* Verification Indicator */}
      {isVerified && (
        <span
          className="verification-indicator"
          style={{
            fontSize: sizeStyles.iconSize,
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: sizeStyles.iconSize,
            height: sizeStyles.iconSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1'
          }}
          title={`Verified${verifiedAt ? ` on ${new Date(verifiedAt).toLocaleDateString()}` : ''}`}
        >
          ✓
        </span>
      )}

      {/* Details Section (only shown when showDetails is true) */}
      {showDetails && (
        <div
          className="skill-details"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            marginTop: '4px',
            minWidth: '200px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {skillName}
          </div>

          {category && (
            <div style={{ color: '#6c757d', marginBottom: '2px' }}>
              Category: {category}
            </div>
          )}

          <div style={{ marginBottom: '2px' }}>
            Proficiency: {formatProficiencyLevel(proficiencyLevel)}
          </div>

          {yearsOfExperience && (
            <div style={{ marginBottom: '2px' }}>
              Experience: {yearsOfExperience} years
            </div>
          )}

          {lastUsedYear && (
            <div style={{ marginBottom: '2px' }}>
              Last used: {lastUsedYear}
            </div>
          )}

          {isVerified ? (
            <div style={{ color: '#28a745', fontSize: '10px' }}>
              ✓ Verified{verifiedAt && ` on ${new Date(verifiedAt).toLocaleDateString()}`}
            </div>
          ) : (
            <div style={{ color: '#ffc107', fontSize: '10px' }}>
              ⚠ Not verified
            </div>
          )}
        </div>
      )}
    </Component>
  );
};

export default SkillBadge;