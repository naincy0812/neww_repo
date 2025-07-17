import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import EngagementForm from "./EngagementForm";
import { createEngagement, EngagementCreateInput } from "../../services/engagementService";
import { uploadDocument } from "../../services/documentService";
import Sidebar from "../common/Sidebar";
import Profile from "../common/Profile";
import { FaPlus, FaSearch } from "react-icons/fa";
import { PiBuildingsDuotone } from "react-icons/pi";
import { IoPricetagsOutline, IoPersonOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { useParams } from "react-router-dom";
import "./EngagementPage.css";
import "../customers/CustomerDetails.css";

interface Engagement {
  name: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  description?: string;
  customerId?: string;
  msa?: {
    reference?: string;
    value?: string | number;
    start?: string;
    end?: string;
    startDate?: string;
    endDate?: string;
  };
  sow?: {
    reference?: string;
    value?: string | number;
    start?: string;
    end?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface Customer {
  id: string;
  name: string;
  industry?: string;
  status?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location?: {
    city?: string;
    state?: string;
    address?: string;
  };
}

interface ActionItem {
  id: number;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Completed" | "In Progress" | "Pending";
}

const EngagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'reports' | 'ratecard' | 'actions'>('overview');
  const { id } = useParams<{ id: string }>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);

  // Helper to load the specific engagement that was clicked
  const loadEngagement = async () => {
    if (!id) return;
    try {
      // 1. Fetch the engagement itself by its ID (taken from the route param)
      const res = await fetch(`http://localhost:8000/api/engagements/${id}`);
      if (!res.ok) throw new Error("Failed to fetch engagement");
      const engagementData = await res.json();

      // 2. Store a streamlined copy in state for rendering
      setEngagement({
        name: engagementData.name || engagementData.engagementName || "Unnamed Engagement",
        startDate: engagementData.start_date || engagementData.startDate,
        endDate: engagementData.end_date || engagementData.endDate,
        type: engagementData.type,
        description: engagementData.description,
        customerId: engagementData.customerId,
        msa: engagementData.msa,
        sow: engagementData.sow,
      });

      // 3. Fetch the related customer so we can show its name
      if (engagementData.customerId) {
        const cres = await fetch(`http://localhost:8000/api/customers/${engagementData.customerId}`);
        if (cres.ok) {
          const cust = await cres.json();
          setCustomer(cust);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // when the route param (engagement id) changes, (re)load fresh data
  useEffect(() => {
    loadEngagement();
  }, [id]);


  useEffect(() => {
    // Mock action items
    setActions([
      {
        id: 1,
        description: "Kickoff meeting with stakeholders",
        priority: "High",
        status: "In Progress",
      },
      {
        id: 2,
        description: "Finalize SOW",
        priority: "Medium",
        status: "Pending",
      },
      {
        id: 3,
        description: "Complete onboarding docs",
        priority: "Low",
        status: "Completed",
      },
    ]);
  }, []);

  return (
    <div className="engagement-container">
      <Sidebar />
      <main className="engagement-main">
        <header className="dashboard-header">
          <h1 className="dashboard-title">{engagement?.name || "Engagement Details"}</h1>
          <div className="header-actions">
            <button className="new-engagement-btn" onClick={() => setShowCreateForm(true)}>
              <FaPlus /> New Engagement
            </button>
            <Profile />
          </div>

        </header>


        <div className="engagement-grid">
          {engagement ? (
            <div className="engagement-section engagement-card-wrapper">
              <div className="engagement-content-columns">
                <div className="engagement-summary-box">
                  <div className="summary-left">
                    <div className="row-icon">
                      <PiBuildingsDuotone className="icon" />
                      <span>{customer?.name || "Customer Name"}</span>
                    </div>
                    <div className="row-icon">
                      <IoPricetagsOutline className="icon" />
                      <span className="engagement-type">{engagement.type || "General"}</span>
                    </div>
                    <div className="row-icon">
                      <MdOutlineDateRange className="icon" />
                      <span>
                        Start: {engagement.startDate ? new Date(engagement.startDate).toDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="row-icon">
                      <MdOutlineDateRange className="icon" />
                      <span>
                        End: {engagement.endDate ? new Date(engagement.endDate).toDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="row-icon">
                      <IoPersonOutline className="icon" />
                    </div>
                  </div>
                </div>

                <div className="engagement-detail-box">
                  <h3>Master Service Agreement</h3>
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>MSA Reference</th>
                        <th>MSA Value</th>
                        <th>MSA Start</th>
                        <th>MSA End</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{engagement.msa?.reference || "N/A"}</td>
                        <td>{engagement.msa?.value || "N/A"}</td>
                        <td>{engagement?.msa?.start ? new Date(engagement.msa.start).toDateString() : engagement?.msa?.startDate ? new Date(engagement.msa.startDate).toDateString() : "N/A"}</td>
                        <td>{engagement?.msa?.end ? new Date(engagement.msa.end).toDateString() : engagement?.msa?.endDate ? new Date(engagement.msa.endDate).toDateString() : "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Statement of Work</h3>
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>SOW Reference</th>
                        <th>SOW Value</th>
                        <th>SOW Start</th>
                        <th>SOW End</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{engagement.sow?.reference || "N/A"}</td>
                        <td>{engagement.sow?.value || "N/A"}</td>
                        <td>{engagement?.sow?.start ? new Date(engagement.sow.start).toDateString() : engagement?.sow?.startDate ? new Date(engagement.sow.startDate).toDateString() : "N/A"}</td>
                        <td>{engagement?.sow?.end ? new Date(engagement.sow.end).toDateString() : engagement?.sow?.endDate ? new Date(engagement.sow.endDate).toDateString() : "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Description</h3>
                  <p className="engagement-desc">{engagement.description || "No description available."}</p>
                </div>
              </div>
            </div>
          ) : null}
          {false && (
            <div className="engagement-section engagement-card-wrapper">
              <h2 className="section-header">Documents</h2>
              <p className="placeholder">Documents view coming soon.</p>
            </div>
          )}
          {false && (
            <div className="engagement-section engagement-card-wrapper">
              <h2 className="section-header">Reports</h2>
              <p className="placeholder">Reports view coming soon.</p>
            </div>
          )}
          {false && (
            <div className="engagement-section engagement-card-wrapper">
              <h2 className="section-header">Rate Card</h2>
              <p className="placeholder">Rate card view coming soon.</p>
            </div>
          )}
          {false && (
            <div className="engagement-section engagement-card-wrapper">
              {/* existing recent-actions block */}
            </div>
          )}
          <nav className="engagement-tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            
            <button
              className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
            <button
              className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
            <button
              className={`tab ${activeTab === 'ratecard' ? 'active' : ''}`}
              onClick={() => setActiveTab('ratecard')}
            >
              Rate Card
            </button>
            <button
              className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              Action Items
            </button>
          </nav>

          {/* --- Tab Content Below Nav --- */}

          {activeTab === 'documents' && (
            <div className="engagement-section engagement-card-wrapper">
              <h2 className="section-header">Documents</h2>
              <p className="placeholder">Documents view coming soon.</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="engagement-section engagement-card-wrapper">
              <h2 className="section-header">Reports</h2>
              <p className="placeholder">Reports view coming soon.</p>
            </div>
          )}

          {activeTab === 'ratecard' && (
            <div className="engagement-section engagement-card-wrapper">
              <h2 className="section-header">Rate Card</h2>
              <p className="placeholder">Rate card view coming soon.</p>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="engagement-section engagement-card-wrapper">
              <h2 className="section-header">Action Items</h2>
              <p className="placeholder">Action items view coming soon.</p>
            </div>
          )}


          {activeTab === 'overview' && (
            <div className="progress-stakeholder-section engagement-card-wrapper">
            <div className="engagement-section">
              <h2 className="section-header">Engagement Progress</h2>
              <div className="progress-block">
                <label>Overall Completion</label>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "80%" }}></div>
                </div>
                <label>Documentation</label>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "45%" }}></div>
                </div>
                <label>Implementation</label>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "60%" }}></div>
                </div>
              </div>
            </div>

            <div className="engagement-section">
              <h2 className="section-header">Key Stakeholders</h2>
              <div className="stakeholder">
                <div className="avatar">JD</div>
                <div className="info">
                  <div className="name">John Doe</div>
                  <div className="role">Project Lead</div>
                </div>
              </div>
              <div className="stakeholder">
                <div className="avatar">JS</div>
                <div className="info">
                  <div className="name">Jane Smith</div>
                  <div className="role">CTO</div>
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'overview' && (
          <div className="engagement-section recent-actions">
            <div className="recent-header">
              <h2 className="section-header">Recent Action Items</h2>
              <div className="action-controls">
                <input
                  type="text"
                  className="action-search"
                  placeholder="Search action"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select className="filter-select">
                  <option>All Priorities</option>
                </select>
                <select className="filter-select">
                  <option>All Statuses</option>
                </select>

                <button className="add-action-btn">+ Add Action Item</button>
              </div>
            </div>

            <div className="action-header-row">
              <div className="col description">Description</div>
              <div className="col owner">Owner</div>
              <div className="col due-date">Due Date</div>
              <div className="col priority">Priority</div>
              <div className="col status">Status</div>
              <div className="col actions">Actions</div>
            </div>

            {actions.map((action) => (
              <div className="action-item" key={action.id}>
                <div className="col description">{action.description}</div>
                <div className="col owner">
                  <div className="avatar">SJ</div>
                  <div className="name">Sarah Johnson</div>
                </div>
                <div className="col due-date">
                  <div className="date">May 5, 2023</div>
                  <div className="overdue">Overdue by 752 days</div>
                </div>
                <div className={`col priority ${action.priority.toLowerCase()}`}>{action.priority}</div>
                <div className={`col status ${action.status.toLowerCase().replace(" ", "-")}`}>
                  {action.status}
                </div>
                <div className="col actions action-icons">
                  <span className="icon">✎</span>
                  <span className="icon">⋮</span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      {showCreateForm && (
          <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
            <EngagementForm
              onSubmit={async (data, msaFile, sowFile) => {
                try {
                  const payload: EngagementCreateInput = { customerId: id ?? "", ...data } as EngagementCreateInput;
                    if (!payload.msa || !payload.msa.documents?.length) delete (payload as any).msa;
                    if (!payload.sow || !payload.sow.documents?.length) delete (payload as any).sow;
                  const created = await createEngagement(payload);
                  const engagementId = (created as any)._id || (created as any).id;
                  if (engagementId) {
                    try {
                      if (msaFile) await uploadDocument(engagementId, msaFile, "msa");
                      if (sowFile) await uploadDocument(engagementId, sowFile, "sow");
                    } catch (err) {
                      console.error("Document upload failed", err);
                      alert("Engagement created, but uploading document(s) failed.");
                    }
                  }
                  await loadEngagement();
                } catch (err) {
                  console.error(err);
                  alert("Failed to create engagement");
                } finally {
                  setShowCreateForm(false);
                }
              }}
              onClose={() => setShowCreateForm(false)}
            />
          </Modal>
        )}
      </main>
    </div>
  );
};

export default EngagementPage;
