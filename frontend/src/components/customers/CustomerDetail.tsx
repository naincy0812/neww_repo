import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Profile from "../common/Profile";
import EngagementCard, { Engagement } from "../engagements/EngagementCard";
import Modal from "../common/Modal";
import { createEngagement } from "../../services/engagementService";
import EngagementForm from "../engagements/EngagementForm";
import "./CustomerDetails.css";
import "../customers/Customers.css";
import { FaEllipsisV, FaFolderOpen, FaMapMarkerAlt, FaSearch, FaPlus, FaPhoneAlt, FaGlobe, FaIndustry, FaLaptop, FaBuilding, FaBriefcase, FaHospital, FaUniversity, FaShoppingCart, FaLeaf } from "react-icons/fa";

interface Location {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

interface Stakeholder {
  name: string;
  role: string;
}

interface Document {
  title: string;
  reference: string;
}

interface Customer {
  _id?: string;
  id?: string;
  name: string;
  industry?: string;
  location?: Location;
  contactInfo?: ContactInfo;
  logo?: string;
  status: "active" | "inactive";
  description?: string;
  createdAt: string;
  updatedAt?: string;
  stakeholders?: Stakeholder[];
  documents?: Document[];
}

// Simple dropdown component reused from customer list
const FilterDropdown = ({ onApply }: { onApply: (filters: any) => void }) => {
  const [filters, setFilters] = useState<any>({});
  const handleFilterChange = (key: string, value: string) => setFilters((prev: any) => ({ ...prev, [key]: value }));
  const handleApply = () => onApply(filters);
  return (
    <div className="filter-dropdown">
      <div className="filter-group">
        <label>Type:</label>
        <input
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="filter-input"
        />
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
      <button onClick={handleApply} className="filter-button">Apply Filters</button>
    </div>
  );
};

const CustomerSummaryCard = ({ engagements }: { engagements: Engagement[] }) => {
  const activeEngagements = engagements.filter(e => e.status === 'active').length;
  const totalEngagementValue = engagements.reduce((sum, e) => sum + (e.msa?.value || 0), 0);
  const engagementStatuses = {
    green: engagements.filter(e => e.ryg_status === 'green').length,
    yellow: engagements.filter(e => e.ryg_status === 'yellow').length,
    red: engagements.filter(e => e.ryg_status === 'red').length,
  };
  const msaExpiryDate = engagements.reduce((latest, e) => {
    const date = new Date(e.msa?.endDate || 0);
    return date > latest ? date : latest;
  }, new Date(0));

  return (
    <div className="card customer-summary">
      <h3>Customer Summary</h3>
      <div className="summary-item">
        <span>Active Engagements:</span>
        <span>{activeEngagements}</span>
      </div>
      <div className="summary-item">
        <span>Total Engagement Value:</span>
        <span>${totalEngagementValue.toLocaleString()}</span>
      </div>
      <div className="summary-item">
        <span>Engagement Status:</span>
        <span>Green ({engagementStatuses.green}), Yellow ({engagementStatuses.yellow}), Red ({engagementStatuses.red})</span>
      </div>
      <div className="summary-item">
        <span>MSA Expiry Date:</span>
        <span>{msaExpiryDate.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const StakeholdersCard = ({ stakeholders = [] }: { stakeholders?: Stakeholder[] }) => (
  <div className="card stakeholders">
    <h3>Key Stakeholders</h3>
    {stakeholders.length > 0 ? (
      <ul>
        {stakeholders.map((stakeholder, index) => (
          <li key={index}>{stakeholder.name} - {stakeholder.role}</li>
        ))}
      </ul>
    ) : (
      <p>No stakeholders found.</p>
    )}
  </div>
);

const DocumentsCard = ({ documents = [] }: { documents?: Document[] }) => (
  <div className="card documents">
    <h3>Documents</h3>
    {documents.length > 0 ? (
      <ul>
        {documents.map((document, index) => (
          <li key={index}>{document.title} - {document.reference}</li>
        ))}
      </ul>
    ) : (
      <p>No documents found.</p>
    )}
  </div>
);

const RecentEngagementsCard = ({ engagements }: { engagements: Engagement[] }) => {
  const recentEngagements = engagements.slice(-2).reverse();

  return (
    <div className="card recent-engagements">
      <h3>Recent Engagements</h3>
      {recentEngagements.length > 0 ? (
        <div>
          {recentEngagements.map((engagement, index) => (
            <EngagementCard key={engagement.id ?? engagement._id ?? index} engagement={engagement} />
          ))}
        </div>
      ) : (
        <p>No recent engagements found.</p>
      )}
    </div>
  );
};

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersState, setFiltersState] = useState<any>({});
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'technology':
        return <FaLaptop />;
      case 'construction':
        return <FaBuilding />;
      case 'finance':
        return <FaBriefcase />;
      case 'healthcare':
        return <FaHospital />;
      case 'education':
        return <FaUniversity />;
      case 'retail':
        return <FaShoppingCart />;
      case 'agriculture':
        return <FaLeaf />;
      // Add more cases as needed
      default:
        return <FaIndustry />;
    }
  };

  // fetch customer + engagements so child cards can refresh
  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      const customerRes = await fetch(`http://localhost:8000/api/customers/${id}`);
      if (!customerRes.ok) throw new Error("Failed to fetch customer");
      const customerData = await customerRes.json();
      setCustomer(customerData);

      const engagementRes = await fetch(`http://localhost:8000/api/engagements?customerId=${customerData._id}`);
      if (!engagementRes.ok) throw new Error("Failed to fetch engagements");
      const raw = await engagementRes.json();
      const mapped = raw.map((e: any) => ({ ...e, id: e.id ?? (typeof e._id === 'object' ? e._id?.$oid : e._id) ?? e.engagementId }));
      setEngagements(mapped);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [id, fetchAll]);

  const handleNewEngagement = () => {
    setShowCreateForm(true);
  };

  const handleCreateEngagement = async (data: any) => {
    if (!customer) return;

    console.log("[Engagement Creation] Current customer:", customer);

    const cleanNested = (obj: Record<string, any>) => {
      const cleaned: Record<string, any> = {};
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== null) cleaned[k] = v;
      });
      return cleaned;
    };

    // Always use customer._id if present, otherwise fallback to customer.id
    const customerId = customer._id ? String(customer._id) : (customer.id ? String(customer.id) : "");

    const payload: any = {
      customerId,
      name: data.name,
    };

    if (data.type) payload.type = data.type;
    if (data.status) payload.status = data.status;
    if (data.ryg_status) payload.ryg_status = data.ryg_status;
    if (data.description) payload.description = data.description;

    const msaClean = cleanNested(data.msa || {});
    if (Object.keys(msaClean).length) payload.msa = msaClean;

    const sowClean = cleanNested(data.sow || {});
    if (Object.keys(sowClean).length) payload.sow = sowClean;

    // Log the payload for debugging
    console.log("[Engagement Creation] Payload:", payload);

    try {
      const newEng = await createEngagement(payload);
      // Log the created engagement
      console.log("[Engagement Creation] Created engagement:", newEng);
      setShowCreateForm(false);
      // Refetch engagements for this customer
      if (customer?._id) {
        const engagementRes = await fetch(`http://localhost:8000/api/engagements?customerId=${customer._id}`);
        if (engagementRes.ok) {
          const raw = await engagementRes.json();
          const mapped = raw.map((e: any) => ({ ...e, id: e.id ?? (typeof e._id === 'object' ? e._id?.$oid : e._id) ?? e.engagementId }));
          setEngagements(mapped);
        }
      }
    } catch (err: any) {
      console.error("Error creating engagement", err);
      alert(err.message || "Failed to create engagement");
    }
  };


  const handleApplyFilters = (values: any) => {
    setFiltersState(values);
    setShowFilters(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const runSearch = () => {
    setSearchTerm(searchQuery.trim());
  };

  const handleNavClick = (section: string) => {
    setActiveSection(section);
  };

  if (loading) return <div className="loading">Loading customer details...</div>;
  if (!customer) return <div className="error">Customer not found</div>;

  console.log("Engagements from backend:", engagements);
  // Enhanced search like CustomerList: look through multiple engagement fields
  const searchMatches = (eng: Engagement) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    const fields = [
      eng.id ?? eng._id,
      eng.name,
      eng.type,
      eng.status,
      eng.description,
      eng.ryg_status,
      (eng.owner as unknown as string) || ""
    ].map((f) => (f ? String(f).toLowerCase() : ""));
    return fields.some((f) => f.includes(q));
  };

  const filteredEngagements = engagements.filter((eng) => {
    const matchesSearch = searchMatches(eng);
    const matchesType = filtersState.type ? eng.type === filtersState.type : true;
    const matchesStatus = filtersState.status ? eng.status === filtersState.status : true;
    return matchesSearch && matchesType && matchesStatus;
  });
  console.log("Filtered engagements:", filteredEngagements);

  if (customer.logo) {
    console.log('Customer logo URL:', customer.logo);
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="dashboard-header customers-header">
          <h1 className="dashboard-title">{customer.name}</h1>
          <div className="header-actions">
            <button className="header-btn" onClick={handleNewEngagement}>
              <FaPlus /> New Engagement
            </button>
            <Profile />
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="kpi-section summary-layout">
            <div className="summary-left">
              {customer.logo && (
                <>
                  <img src={customer.logo} alt="Logo" className="customer-logo" style={{ maxWidth: '100%', height: 'auto' }} />
                </>
              )}
              <ul className="summary-info">
                {customer.industry && (<li>{getIndustryIcon(customer.industry)} {customer.industry}</li>)}
                {(customer.location?.city || customer.location?.state) && (
                  <li><FaMapMarkerAlt /> {[customer.location?.city, customer.location?.state].filter(Boolean).join(", ")}</li>
                )}
                <li>
                  <FaFolderOpen /> {filteredEngagements.length} Engagement{filteredEngagements.length !== 1 ? 's' : ''}
                </li>
                {customer.contactInfo?.website && (
                  <li>
                    <a
                      href={customer.contactInfo.website.startsWith('http') ? customer.contactInfo.website : `https://${customer.contactInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="customer-link"
                    >
                      <FaGlobe /> {customer.contactInfo.website}
                    </a>
                  </li>
                )}
                {customer.contactInfo?.phone && (<li><FaPhoneAlt /> {customer.contactInfo.phone}</li>)}
              </ul>
            </div>

            <div className="summary-right">
              <div className="info-block">
                <h4>About</h4>
                <p>{customer.description || "No description provided."}</p>
              </div>
              <div className="info-block">
                <h4>Address</h4>
                <p>
                  {[customer.location?.address, customer.location?.city, customer.location?.state, customer.location?.zipCode]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>
            </div>
          </div>

          <nav className="customer-nav">
            <ul>
              <li><a href="#overview" onClick={() => handleNavClick('overview')} className={activeSection === 'overview' ? 'active' : ''}>Overview</a></li>
              <li><a href="#engagement" onClick={() => handleNavClick('engagement')} className={activeSection === 'engagement' ? 'active' : ''}>Engagement</a></li>
              <li><a href="#stakeholders" onClick={() => handleNavClick('stakeholders')} className={activeSection === 'stakeholders' ? 'active' : ''}>Stakeholders</a></li>
              <li><a href="#documents" onClick={() => handleNavClick('documents')} className={activeSection === 'documents' ? 'active' : ''}>Documents</a></li>
            </ul>
          </nav>

          {activeSection === 'overview' && (
            <div className="overview-section">
              <CustomerSummaryCard engagements={filteredEngagements} />
              <StakeholdersCard stakeholders={customer.stakeholders} />
              <RecentEngagementsCard engagements={filteredEngagements} />
            </div>
          )}
          {activeSection === 'engagement' && (
            <div id="engagement" className="engagements-section">
              <h2>Engagements ({filteredEngagements.length})</h2>
              <div className="engagement-grid">
                {filteredEngagements.length > 0 ? (
                  filteredEngagements.map((engagement, idx) => (
                    <EngagementCard
                      key={engagement.id ?? engagement._id ?? idx}
                      engagement={engagement}
                      onRefresh={fetchAll}
                      onDelete={(id) => setEngagements(prev => prev.filter(e => (e.id ?? e._id) !== id))}
                    />
                  ))
                ) : (
                  <p>No engagements found.</p>
                )}
              </div>
            </div>
          )}
          {activeSection === 'stakeholders' && (
            <div id="stakeholders" className="stakeholders-section">
              <h2>Stakeholders</h2>
              <StakeholdersCard stakeholders={customer.stakeholders} />
            </div>
          )}
          {activeSection === 'documents' && (
            <div id="documents" className="documents-section">
              <h2>Documents</h2>
              <DocumentsCard documents={customer.documents} />
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
        <EngagementForm
          key={customer?._id}
          onSubmit={handleCreateEngagement}
          onClose={() => setShowCreateForm(false)}
        />
      </Modal>
    </div>
  );
};

export default CustomerDetailsPage;
