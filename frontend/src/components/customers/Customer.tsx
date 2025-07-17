import React, { useEffect, useState } from "react";
import { FaFilter, FaPlus, FaSearch } from "react-icons/fa";
import Sidebar from "../common/Sidebar";
import Profile from "../common/Profile";
import CustomerCard from "./CustomerCard";
import CustomerForm from "./CustomerForm";
import Modal from "../common/Modal";
import TypeaheadInput from "../common/TypeaheadInput";
import axios from 'axios';
import { listEngagements } from "../../services/engagementService";
import {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  autocompleteCustomerNames,
  listCustomers,
  searchCustomers,
} from "../../services/customerService";
import "./Customers.css";
import Header from '../common/Header';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  industry: string;
  industryColorClass: string;
  description: string;
  engagements: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  logo: string;
  status?: string;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});



const getIndustryColorClass = (industry: string): string => {
  switch (industry?.toLowerCase()) {
    case "technology":
    case "tech":
      return "tech";
    case "retail":
      return "retail";
    case "finance":
      return "finance";
    case "healthcare":
      return "healthcare";
    case "manufacturing":
      return "manufacturing";
    case "education":
      return "education";
    case "energy":
      return "energy";
    case "telecommunications":
    case "telecom":
      return "telecom";
    case "software":
      return "software";
    case "other":
      return "default";
    default:
      return "default";
  }
};

const formatLocation = (loc: any): any => ({
  address: loc?.address || "",
  city: loc?.city || "",
  state: loc?.state || "",
  zipCode: loc?.zipCode || "",
  country: loc?.country || "",
});

const normaliseCustomer = (data: any): Customer => ({
  ...data,
  id: data.id ?? data._id,
  location: {
    address: data.location?.address || "",
    city: data.location?.city || "",
    state: data.location?.state || "",
    zipCode: data.location?.zipCode || "",
    country: data.location?.country || "",
  },
  contactInfo: data.contactInfo || {
    phone: '',
    email: '',
    website: ''
  },
  logo: data.logo || '',
  status: data.status || "active",
});

const FilterDropdown = ({ onApply }: { onApply: (filters: any) => void }) => {
  const [filters, setFilters] = useState<any>({});

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: Record<string, string>) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <div className="filter-dropdown">
      <div className="filter-group">
        <label>Industry:</label>
        <select
          value={filters.industry || ''}
          onChange={(e) => handleFilterChange('industry', e.target.value)}
          className="filter-select"
        >
          <option value="">All Industries</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Retail">Retail</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Status:</label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Country:</label>
        <select
          value={filters.country || ''}
          onChange={(e) => handleFilterChange('country', e.target.value)}
          className="filter-select"
        >
          <option value="">All Countries</option>
          <option value="USA">USA</option>
          <option value="Canada">Canada</option>
          <option value="UK">UK</option>
        </select>
      </div>
      <div className="filter-group">
        <label>City:</label>
        <select
          value={filters.city || ''}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          className="filter-select"
        >
          <option value="">All Cities</option>
          <option value="New York">New York</option>
          <option value="London">London</option>
          <option value="Toronto">Toronto</option>
        </select>
      </div>
      <button onClick={handleApply} className="filter-button">
        Apply Filters
      </button>
    </div>
  );
};

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const [customersRaw, engagementsData] = await Promise.all([listCustomers(), listEngagements()]);
        // build counts by customerId
        const counts: Record<string, number> = {};
        engagementsData.forEach((e: any) => {
          const cid = e.customerId ?? (typeof e.customerIdObj === 'object' ? e.customerIdObj?.$oid : e.customerIdObj) ?? e.customerId;
          if (cid) counts[cid] = (counts[cid] || 0) + 1;
        });

        const mapped = customersRaw.map((cust: any) => ({
          id: cust.id ?? cust._id,

          name: cust.name,
          industry: cust.industry,
          industryColorClass: getIndustryColorClass(cust.industry),
          description: cust.description,
          engagements: counts[cust._id ?? cust.id] ?? 0,
          location: formatLocation(cust.location),
          contactInfo: cust.contactInfo || {
            phone: '',
            email: '',
            website: ''
          },
          logo: cust.logo || '',
          status: cust.status || "active",
        }));
        setCustomers(mapped);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleApplyFilters = async (filters: Record<string, string>) => {
    const validFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== "")
    );
    try {
      const response = await api.get('/api/customers', {
        params: validFilters
      });
      const data = response.data.map(normaliseCustomer);
      setCustomers(data);
    } catch (error) {
      console.error("Error applying filters:", error);
      alert("Error applying filters. Please try again.");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter text to search.");
      return;
    }
    try {
      const data = await searchCustomers({ query: searchQuery });
      setCustomers(data);
    } catch (error) {
      console.error("Error searching customers:", error);
      alert("Error searching customers. Please try again.");
    }
  };

  const handleCreateCustomer = async (customerData: any) => {
    try {
      const newCustomer = await createCustomer(customerData);
      setCustomers((prev) => [...prev, newCustomer]);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const handleUpdateCustomer = async (id: string, customerData: any) => {
    try {
      const updated = await updateCustomer(id, customerData);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleListAllClick = async () => {
    try {
      const [custs, engs] = await Promise.all([listCustomers(), listEngagements()]);
      const counts: Record<string, number> = {};
      engs.forEach((e: any) => {
        const cid = e.customerId ?? (typeof e.customerIdObj === 'object' ? e.customerIdObj?.$oid : e.customerIdObj) ?? e.customerId;
        if (cid) counts[cid] = (counts[cid] || 0) + 1;
      });
      const mapped = custs.map((cust: any) => ({
        id: cust._id,
        name: cust.name,
        industry: cust.industry || "N/A",
        industryColorClass: getIndustryColorClass(cust.industry),
        description: cust.description || "No description",
        engagements: counts[cust._id ?? cust.id] ?? 0,
        location: formatLocation(cust.location),
        contactInfo: cust.contactInfo || {
          phone: '',
          email: '',
          website: ''
        },
        logo: cust.logo || '',
        status: cust.status || "active",
      }));
      setCustomers(mapped);
    } catch (error) {
      console.error("Error listing all customers:", error);
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <Header
          title="Customers"
          onNewCustomerClick={() => setShowCreateForm(true)}
          onLogout={handleLogout}
        />

        <div className="customer-actions">
          <div className="customer-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name or ID..."
              aria-label="Search customers by name or ID"
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>

        {showCreateForm && (
          <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
            <CustomerForm
              onSubmit={handleCreateCustomer}
              onClose={() => setShowCreateForm(false)}
              initialData={undefined}
            />
          </Modal>
        )}

        <section className="customers-grid">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onUpdate={handleUpdateCustomer}
              onDelete={handleDelete}
            />
          ))}
        </section>
      </main>
    </div>
  );
};

export default CustomersPage;
