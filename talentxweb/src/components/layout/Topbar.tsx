import React from 'react';

interface TopbarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, sidebarOpen }) => {
  return (
    <header style={{
      height: '60px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <button
        onClick={onMenuClick}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          marginRight: '20px'
        }}
      >
        ☰
      </button>
      <h1 style={{ margin: 0, fontSize: '20px', color: '#333' }}>TalentX HRMS</h1>
    </header>
  );
};

export default Topbar;