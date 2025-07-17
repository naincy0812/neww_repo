import React, { useState, useRef, useEffect } from "react";
import './CustomerCard.css';
import { FaEllipsisV, FaFolderOpen, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomerForm from "./CustomerForm";
import Modal from "../common/Modal";

export interface Customer {
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

export interface CustomerCardProps {
  customer: Customer;
  onUpdate: (id: string, customerData: Partial<Customer>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onUpdate,
  onDelete,
}) => {
  const { id, name, industry, industryColorClass, description, engagements: engagementsCount, location } = customer;
  const engagementsSafe = typeof engagementsCount === 'number' && !Number.isNaN(engagementsCount) ? engagementsCount : 0;
  const { address = '', city = '', state = '', zipCode = '', country = '' } = location || {};
  const fullAddress = [
    address || '',
    city || '',
    state || '',
    zipCode ? `${zipCode} ` : '',
    country || ''
  ].filter(Boolean).join(', ').trim();

  // Calculate dynamic maximum address length based on screen size
  const MAX_ADDRESS_LENGTH_LARGE = 20;
  const MAX_ADDRESS_LENGTH_SMALL = 10;
  const [maxAddressLength, setMaxAddressLength] = useState(window.innerWidth > 600 ? MAX_ADDRESS_LENGTH_LARGE : MAX_ADDRESS_LENGTH_SMALL);

  useEffect(() => {
    const handleResize = () => {
      setMaxAddressLength(window.innerWidth > 600 ? MAX_ADDRESS_LENGTH_LARGE : MAX_ADDRESS_LENGTH_SMALL);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const truncatedAddress = fullAddress.length > maxAddressLength
    ? `${fullAddress.substring(0, maxAddressLength)}...`
    : fullAddress;

  // Truncate engagement text if needed
  const MAX_ENGAGEMENT_LENGTH = 10;
  const truncatedEngagements = `${engagementsSafe} engagement${engagementsSafe !== 1 && "s"}`;
  const truncatedEngagementsText = truncatedEngagements.length > MAX_ENGAGEMENT_LENGTH
    ? `${truncatedEngagements.substring(0, MAX_ENGAGEMENT_LENGTH)}...`
    : truncatedEngagements;

  const [showOptions, setShowOptions] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();
  const skipNextNavRef = useRef(false);

  const handleToggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    skipNextNavRef.current = true;
    setShowOptions(prev => !prev);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    skipNextNavRef.current = true;
    setShowUpdateModal(true);
    setShowOptions(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    skipNextNavRef.current = true;
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await onDelete(id);
    }
    setShowOptions(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (skipNextNavRef.current) {
      skipNextNavRef.current = false;
      return;
    }
    if (showOptions) return;
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest('[data-stop-nav]')) {
      return;
    }
    navigate(`/customers/${id}`);
  };

  return (
    <article className="customer-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <div className="card-action" data-stop-nav onClick={handleToggleOptions}>
        <FaEllipsisV size={12} color="#ef4444" data-stop-nav />
        {showOptions && (
          <div className="options-dropdown active" data-stop-nav>
            <button onClick={handleUpdate}>Update</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>

      <h3>{name}</h3>

      <div className="industry-badge">
        <span className={`industry-pill ${industryColorClass}`}>{industry}</span>
        <span className={`status-dot ${customer.status === 'active' ? 'status-dot-active' : 'status-dot-inactive'}`}></span>
      </div>

      <div className="description-container">
        <p className="customer-desc">{description}</p>
      </div>

      <div className="customer-meta">
        <div className="meta-item left">
          <FaFolderOpen size={16} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
          {truncatedEngagementsText}
        </div>
        {truncatedAddress && (
          <div className="meta-item right">
            <FaMapMarkerAlt size={16} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
            {truncatedAddress}
          </div>
        )}
      </div>

      {showUpdateModal && (
        <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
          <CustomerForm
            initialData={customer}
            onSubmit={async (updatedData: Partial<Customer>) => {
              await onUpdate(id, updatedData);
              setShowUpdateModal(false);
            }}
            onClose={() => setShowUpdateModal(false)}
          />
        </Modal>
      )}
    </article>
  );
};

export default CustomerCard;
