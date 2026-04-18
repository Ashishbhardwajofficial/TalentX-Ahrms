import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  return (
    <main id="main-content" className={`dashboard-main ${className}`} role="main">
      <div className="main-content-wrapper">
        {children}
      </div>
    </main>
  );
};

export default MainContent;
