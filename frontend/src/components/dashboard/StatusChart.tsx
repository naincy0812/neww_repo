import React from 'react';

type StatusIndicator = {
  color: string;
  label: string;
  count: string;
};

type StatusChartProps = {
  indicators?: StatusIndicator[];
};

export const StatusChart: React.FC<StatusChartProps> = ({ 
  indicators = [
    { color: '#10b981', label: 'Good', count: '45 systems' },
    { color: '#f59e0b', label: 'Warning', count: '30 systems' },
    { color: '#ef4444', label: 'Critical', count: '25 systems' }
  ] 
}) => {
  return (
    <div className="status-chart-section">
      <div className="section-header">
        <span>Engagement Status</span>
        <div className="add-icon">+</div>
      </div>
      <div className="chart-container">
        <div className="status-chart">
          {/* This would be replaced with an actual chart component */}
          <div className="status-label">Status</div>
        </div>
      </div>
      <div className="status-indicators">
        {indicators.map((indicator, index) => (
          <div className="status-indicator" key={index}>
            <div 
              className="indicator-dot" 
              style={{ backgroundColor: indicator.color }}
            ></div>
            <span className="indicator-label">{indicator.label}</span>
            <span className="indicator-count">{indicator.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};