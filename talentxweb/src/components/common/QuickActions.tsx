import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  color?: string;
}

export interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const navigate = useNavigate();

  const handleActionClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="quick-actions">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <div
            key={action.id}
            className="quick-action-card"
            onClick={() => handleActionClick(action.link)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleActionClick(action.link);
              }
            }}
          >
            <div className="quick-action-icon" style={{ color: action.color }}>
              {action.icon}
            </div>
            <div className="quick-action-content">
              <h4 className="quick-action-title">{action.title}</h4>
              <p className="quick-action-description">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
