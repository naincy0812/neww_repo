import React, { useState } from 'react';
import EngagementCard, { Engagement } from './EngagementCard';
import './EngagementList.css';

interface EngagementListProps {
  engagements: Engagement[];
  onUpdate?: (id: string, data: Partial<Engagement>) => void;
  onDelete?: (id: string) => void;
}

const EngagementList: React.FC<EngagementListProps> = ({ engagements, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '' });

  const searchEngagements = (e: Engagement) => {
    const term = searchTerm.toLowerCase();
    return (
      (e.id ? e.id.toLowerCase() : '').includes(term) ||
      e.name.toLowerCase().includes(term) ||
      (e.type ?? '').toLowerCase().includes(term)
    );
  };

  const filterEngagements = (e: Engagement) => {
    const typeOk = !filters.type || (e.type ?? '').toLowerCase().includes(filters.type.toLowerCase());
    const statusOk = !filters.status || (e.ryg_status ?? '') === filters.status;
    return typeOk && statusOk;
  };

  const data = engagements.filter(e => searchEngagements(e) && filterEngagements(e));

  return (
    <div className="engagement-list-container">
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search engagements..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Type:</label>
          <input
            type="text"
            value={filters.type}
            onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

      </div>

      <div className="engagement-grid">
        {data.map(e => (
          <EngagementCard key={e.id} engagement={e} />
        ))}
      </div>
    </div>
  );
};

export default EngagementList;
