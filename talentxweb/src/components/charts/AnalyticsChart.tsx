import React from 'react';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface AnalyticsChartProps {
  title?: string;
  data: ChartData[];
  type?: 'bar' | 'pie' | 'line';
  height?: number;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  data,
  type = 'bar',
  height = 300
}) => {
  // Simple bar chart implementation
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const renderBarChart = () => (
    <div className="flex items-end justify-between gap-2 h-full pt-4 pb-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
          <div className="w-full relative flex-1 flex items-end justify-center">
            <div
              className="w-full max-w-[40px] rounded-t-lg transition-all duration-500 hover:opacity-90 relative group-hover:scale-y-105 origin-bottom"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || '#4f46e5'
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-secondary-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {item.value}
              </div>
            </div>
          </div>
          <div className="text-xs text-secondary-500 font-medium truncate w-full text-center">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="flex items-center gap-8 h-full">
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              // Should use a library for real pie charts, but keeping this simple structure clean
              return null;
            })}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-sm text-secondary-500">Total</span>
            <span className="text-xl font-bold text-secondary-900">{total}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                  />
                  <span className="text-sm text-secondary-600 font-medium group-hover:text-secondary-900 transition-colors">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-secondary-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-secondary-900">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col w-full">
      {title && <h3 className="text-lg font-semibold text-secondary-900 mb-4">{title}</h3>}
      <div className="flex-1 min-h-0 relative">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && (
          <div className="flex items-center justify-center h-full bg-secondary-50 rounded-lg border border-dashed border-secondary-300 text-secondary-400">
            Line chart visualization coming soon
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;