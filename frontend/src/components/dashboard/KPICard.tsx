import React from 'react';

type KPICardProps = {
  title: string;
  value: string | number;
};

export const KPICard: React.FC<KPICardProps> = ({ title, value }) => {
  return (
    <div className="kpi-section">
      <div className="section-header">
        <span>{title}</span>
        <div className="add-icon">+</div>
      </div>
      <div className="kpi-value">{value}</div>
    </div>
  );
};