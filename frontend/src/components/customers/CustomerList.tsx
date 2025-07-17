import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../../hooks/useCustomers';
import './CustomerList.css';
import CustomerCard from './CustomerCard';
import { Customer } from './CustomerCard';

interface CustomerListProps {
  customers: Customer[];
  onUpdate: (id: string, customerData: Partial<Customer>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const { isLoading, error } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    status: '',
    city: '',
    state: '',
    country: ''
  });

  // Search function that looks through multiple fields
  const searchCustomers = (customer: Customer) => {
    const searchLower = searchTerm.toLowerCase();
    const searchableFields = [
      customer.id,
      customer.name,
      customer.location.address,
      customer.contactInfo.website,
      customer.logo
    ].map(field => field?.toLowerCase() || '');
    return searchableFields.some(field => field.includes(searchLower));
  };

  // Filter function that checks all filter criteria
  const filterCustomers = (customer: Customer) => {
    const matchesIndustry = !filters.industry || customer.industry.toLowerCase().includes(filters.industry.toLowerCase());
    const matchesStatus = !filters.status || customer.status === filters.status;
    const matchesCity = !filters.city || customer.location.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesState = !filters.state || customer.location.state.toLowerCase().includes(filters.state.toLowerCase());
    const matchesCountry = !filters.country || customer.location.country?.toLowerCase().includes(filters.country.toLowerCase());
    
    return matchesIndustry && matchesStatus && matchesCity && matchesState && matchesCountry;
  };

  // Combine search and filter
  const filteredCustomers = customers?.filter(customer => 
    searchCustomers(customer) && filterCustomers(customer)
  ) || [];

  return (
    <div className="customer-list-container">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by ID, Name, Address, Website, Logo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Industry:</label>
          <select
            value={filters.industry}
            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
            className="filter-select"
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Education">Education</option>
            <option value="Energy">Energy</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Software">Software</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>City:</label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>State:</label>
          <input
            type="text"
            value={filters.state}
            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Country:</label>
          <input
            type="text"
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className="filter-input"
          />
        </div>
      </div>

      {/* Customer Cards */}
      <div className="customer-grid">
        {isLoading ? (
          <div className="loading">Loading customers...</div>
        ) : error ? (
          <div className="error">Error loading customers: {error.message}</div>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerList;