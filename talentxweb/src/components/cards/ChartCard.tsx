import React, { useState } from 'react';

export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  menuItems?: Array<{ label: string; onClick: () => void }>;
  legend?: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  menuItems,
  legend,
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`bg-white rounded-xl p-0 shadow-soft border border-secondary-200 overflow-hidden h-full flex flex-col ${className}`}>
      <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
        <h3 className="text-secondary-900 font-semibold">{title}</h3>

        {menuItems && menuItems.length > 0 && (
          <div className="relative">
            <button
              className="p-1 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 transition-colors"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Chart options"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-100 py-1 z-20 animate-fade-in origin-top-right">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                      onClick={() => {
                        item.onClick();
                        setShowMenu(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {children}
      </div>

      {legend && (
        <div className="px-6 py-3 bg-secondary-50 border-t border-secondary-100 text-sm text-secondary-600">
          {legend}
        </div>
      )}
    </div>
  );
};

export default ChartCard;
