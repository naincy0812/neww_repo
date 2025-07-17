import React, { useState } from 'react';

interface FormData {
  id?: string;
  name: string;
  industry: string;
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
  status: string;
  description: string;
}

interface CustomerFormProps {
  onSubmit: (customerData: Partial<FormData>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<FormData>;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onClose, initialData }) => {
  const defaultData: FormData = {
    id: '',
    name: '',
    industry: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contactInfo: {
      phone: '',
      email: '',
      website: '',
    },
    logo: '',
    status: 'active',
    description: '',
  };

  const mergedData: FormData = {
    ...defaultData,
    ...initialData,
    location: {
      ...defaultData.location,
      ...(initialData?.location ?? {})
    },
    contactInfo: {
      ...defaultData.contactInfo,
      ...(initialData?.contactInfo ?? {})
    }
  };

  const [formData, setFormData] = useState<FormData>(mergedData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const processedValue = type === 'number' ? Number(value) : value;  
    if (name.includes('location.') || name.includes('contactInfo.')) {
      const [section, key] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as 'location' | 'contactInfo'],
          [key]: processedValue,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure name is provided
      if (!formData.name) {
        alert('Name is required');
        return;
      }
      // Simple client-side validation
      if (formData.contactInfo.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
        alert('Please enter a valid e-mail address');
        return;
      }
      if (formData.contactInfo.website &&
          !/^https?:\/\/.+/i.test(formData.contactInfo.website)) {
        alert('Please enter a full URL starting with http:// or https://');
        return;
      }
      const filteredData = Object.entries(formData).reduce((acc: Record<string, any>, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Filter nested objects
          const nestedFiltered = Object.entries(value).reduce((nestedAcc: Record<string, any>, [nestedKey, nestedValue]) => {
            if (nestedValue) nestedAcc[nestedKey] = nestedValue;
            return nestedAcc;
          }, {});
          if (Object.keys(nestedFiltered).length > 0) acc[key] = nestedFiltered;
        } else if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const payload = formData.id ? { id: formData.id, ...filteredData } : filteredData;

      await onSubmit(payload as Partial<FormData>);

      if (formData.id) {
        alert('Customer updated successfully!');
      } else {
        alert('Customer created successfully!');
      }
      onClose(); // Close the modal after creation
    } catch (error: any) {
      if (error.response && error.response.status === 422 && Array.isArray(error.response.data?.detail)) {
        const msgs = error.response.data.detail
          .map((d: any) => `${d.loc.join('.') } – ${d.msg}`)
          .join('\n');
        alert(`Please fix the following:\n${msgs}`);
      } else if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unexpected error occurred. Please check your input and try again.');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginTop: '60px',
        maxHeight: 'calc(100vh - 160px)',
        overflowY: 'auto',
        marginLeft: '20px',
        marginRight: '20px',
        width: '600px',
        maxWidth: '100%',
        padding: '0 10px',
        position: 'relative',
      }}
    >
      <style>
        {`
            display: block;
            font-size: 0.9rem;
          }
          input, select, textarea {
            width: 100%;
            max-width: 100%;
            font-size: 0.9rem;
            padding: 12px;
          }
        `}
      </style>
      <style>
        {`
          form::-webkit-scrollbar {
            width: 12px;
          }
          form::-webkit-scrollbar-track {
            background: #1e293b;
          }
          form::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
          }
          form::-webkit-scrollbar-thumb:hover {
            background: #475569;
          }
          form::-webkit-scrollbar-button {
            background: #1e293b;
            width: 12px;
          }
          form::-webkit-scrollbar-button:start:decrement,
          form::-webkit-scrollbar-button:end:increment {
            background: #1e293b;
            width: 12px;
            height: 20px;
            display: block;
            border-radius: 2px;
            transition: background-color 0.2s;
          }
          form::-webkit-scrollbar-button:start:decrement:hover,
          form::-webkit-scrollbar-button:end:increment:hover {
            background: #334155;
          }
          form::-webkit-scrollbar-button:start:decrement {
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 3 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: center;
          }
          form::-webkit-scrollbar-button:end:increment {
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 15 12 21 18 15'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: center;
          }
        `}
      </style>
      <label htmlFor="name" style={{ color: '#fff' }}>Name</label>
      <input
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="industry" style={{ color: '#fff' }}>Industry</label>
      <select
        id="industry"
        name="industry"
        value={formData.industry}
        onChange={handleChange}
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      >
        <option value="">Select Industry</option>
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
      <label htmlFor="address" style={{ color: '#fff' }}>Address</label>
      <input
        id="address"
        name="location.address"
        value={formData.location.address}
        onChange={handleChange}
        placeholder="Address"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="city" style={{ color: '#fff' }}>City</label>
      <input
        id="city"
        name="location.city"
        value={formData.location.city}
        onChange={handleChange}
        placeholder="City"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="state" style={{ color: '#fff' }}>State</label>
      <input
        id="state"
        name="location.state"
        value={formData.location.state}
        onChange={handleChange}
        placeholder="State"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="zipCode" style={{ color: '#fff' }}>Zip Code</label>
      <input
        id="zipCode"
        name="location.zipCode"
        type="text"
        value={formData.location.zipCode}
        onChange={handleChange}
        placeholder="Zip Code"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="country" style={{ color: '#fff' }}>Country</label>
      <input
        id="country"
        name="location.country"
        type="text"
        value={formData.location.country}
        onChange={handleChange}
        placeholder="Country"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="phone" style={{ color: '#fff' }}>Phone</label>
      <input
        id="phone"
        name="contactInfo.phone"
        value={formData.contactInfo.phone}
        onChange={handleChange}
        placeholder="Phone"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="email" style={{ color: '#fff' }}>Email</label>
      <input
        id="email"
        name="contactInfo.email"
        type="email"
        value={formData.contactInfo.email}
        onChange={handleChange}
        placeholder="Email"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="website" style={{ color: '#fff' }}>Website</label>
      <input
        id="website"
        name="contactInfo.website"
        type="url"
        pattern="https?://.*"
        value={formData.contactInfo.website}
        onChange={handleChange}
        placeholder="Website (https://…)"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="logo" style={{ color: '#fff' }}>Logo URL</label>
      <input
        id="logo"
        name="logo"
        value={formData.logo}
        onChange={handleChange}
        placeholder="Logo URL"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
      <label htmlFor="status" style={{ color: '#fff' }}>Status</label>
      <select
        id="status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        style={{
          width: '100%',
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
          <option value="active" style={{ color: '#059669' }}>
            <span className="status-dot status-dot-active" />
            Active
          </option>
          <option value="inactive" style={{ color: '#dc2626' }}>
            <span className="status-dot status-dot-inactive" />
            Inactive
          </option>
        </select>
      <label htmlFor="description" style={{ color: '#fff' }}>Description</label>
      <textarea
        className="modal-textarea"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '8px',
          resize: 'vertical',
          maxHeight: '180px',
          overflowY: 'auto',
        }}
      />
      <style>
        {`
          .status-container {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
          }
          .status-dot-active {
            background-color: #059669;
          }
          .status-dot-inactive {
            background-color: '#dc2626';
          }

          select {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1rem;
          }
        `}
      </style>
      <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          type="submit"
          style={{
            backgroundColor: '#8b5cf6',
            minWidth: '120px',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.3s ease',
          }}
        >
          {initialData ? 'Update Customer' : 'Create Customer'}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            backgroundColor: '#334155',
            minWidth: '120px',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.3s ease',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
