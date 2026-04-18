import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header onMenuToggle={handleSidebarToggle} />
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <MainContent>{children}</MainContent>
    </div>
  );
};

export default DashboardLayout;
