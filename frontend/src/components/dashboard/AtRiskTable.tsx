import React from 'react';

type RiskLevel = 'High' | 'Medium' | 'Low';

type RiskItem = {
  client: string;
  engagement: string;
  type: RiskLevel;
  owner: string;
};

type AtRiskTableProps = {
  riskItems?: RiskItem[];
};

export const AtRiskTable: React.FC<AtRiskTableProps> = ({ 
  riskItems = [
    {
      client: 'Global Bank Ltd',
      engagement: 'Assessment',
      type: 'High',
      owner: 'Jane Doe'
    },
    {
      client: 'Acme Corp',
      engagement: 'Consultation',
      type: 'Medium',
      owner: 'John Smith'
    }
  ] 
}) => {
  const getRiskClass = (riskLevel: RiskLevel) => {
    switch(riskLevel) {
      case 'High': return 'risk-high';
      case 'Medium': return 'risk-medium';
      case 'Low': return 'risk-low';
      default: return '';
    }
  };

  return (
    <div className="at-risk-section">
      <div className="section-header">
        <span>At-Risk Engagements</span>
      </div>
      
      <table className="risk-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Engagement</th>
            <th>Type</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {riskItems.map((item, index) => (
            <tr key={index}>
              <td>{item.client}</td>
              <td>{item.engagement}</td>
              <td className={getRiskClass(item.type)}>{item.type}</td>
              <td>{item.owner}</td>
              <td className="table-actions">View</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};