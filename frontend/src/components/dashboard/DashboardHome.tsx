import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { KPICard } from './KPICard';
import { StatusChart } from './StatusChart'; // Optional usage
import { ActivityFeed } from './ActivityFeed';
import { AtRiskTable } from './AtRiskTable';
import Sidebar from "../common/Sidebar";
import Profile from '../common/Profile';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import CustomerForm from '../customers/CustomerForm';
import { Customer } from '../customers/CustomerCard';
import { createCustomer } from '../../services/customerService';
import Header from '../common/Header';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [engagementCount, setEngagementCount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          fetch("http://localhost:8000/api/customers"),
          fetch("http://localhost:8000/api/engagements"),
        ]);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCustomerCount(cData.length);
        }
        if (eRes.ok) {
          const eData = await eRes.json();
          setEngagementCount(eData.length);
        }
      } catch (err) {
        console.error("Failed to fetch counts", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const handleAddCustomer = () => {
    setCustomerCount(prev => (prev ?? 0) + 1);
  };

  const handleAddEngagement = () => {
    setEngagementCount(prev => (prev ?? 0) + 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNewCustomer = () => {
    setCustomerCount(prev => (prev ?? 0) + 1);
    alert('New customer form would open here');
  };

  const handleViewActivity = () => {
    alert('Navigating to full activity view');
  };

  const handleViewDeadlines = () => {
    alert('Navigating to deadlines view');
  };

  const handleLogout = () => {
    alert('Logout functionality would go here');
    console.log('User logged out');
  };

  const handleCreateCustomer = async (customerData: Partial<Customer>) => {
    try {
      const newCustomer = await createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  // Define a mapping from engagement types to color classes
  const typeColorMapping: Record<string, string> = {
    "Consultation": "consultation-color",
    "Assessment": "assessment-color",
    "Implementation": "implementation-color",
    "Other": "other-color",
  };

  // Function to get the color class based on the engagement type
  const getTypeColorClass = (type: string): string => {
    return typeColorMapping[type] || "default-color";
  };



  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <Header
          title="Dashboard"
          onNewCustomerClick={() => setShowCreateForm(true)}
          onLogout={handleLogout}
        />

        <div className="customer-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            // value={searchQuery}
            // onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name or ID..."
            aria-label="Search customers by name or ID"
          />
          <button >Search</button>
        </div>

          <div className="dashboard-grid">
            {/* KPI Cards */}
            <div className="first-container">
              <div className="left-section">
                {isLoading ? (
                  <div className="kpi-section loading-pulse">
                    <div className="section-header">
                      <span>Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="first-container-left">
                      <div className="kpi-section-dashboard" style={{ cursor: 'pointer' }} onClick={() => navigate('/customers')}>
                        <div className="section-header">
                          <span>Total Customers</span>
                        </div>
                        <div className="kpi-value">{customerCount ?? '-'}</div>
                      </div>

                      <div className="kpi-section-dashboard" style={{ cursor: 'pointer' }} onClick={() => navigate('/engagements')}>
                        <div className="section-header">
                          <span>Total Engagements</span>
                        </div>
                        <div className="kpi-value">{engagementCount ?? '-'}</div>
                      </div>
                    </div>
                  </>
                )}

                {/* Activity Feed */}
                <div className="activity-section">
                  <div className="activity-header">
                    <div className="section-header">
                      <span>Recent Activity</span>
                    </div>
                    <span className="view-all" onClick={handleViewActivity}>View all activity</span>
                  </div>

                  <div className="activity-item">
                    <div className="user-avatar" style={{ backgroundColor: '#ec4899' }}>SJ</div>
                    <div className="activity-content">
                      <div className="activity-text">
                        Sarah Johnson added a new report to <span className="company-name">Acme Corp</span>: Cloud Migration
                      </div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="user-avatar" style={{ backgroundColor: '#3b82f6' }}>DK</div>
                    <div className="activity-content">
                      <div className="activity-text">
                        David Kim updated status for <span className="company-name">TechStart</span>: CRM implementation to Yellow
                      </div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="user-avatar" style={{ backgroundColor: '#f59e0b' }}>AL</div>
                    <div className="activity-content">
                      <div className="activity-text">
                        Amanda Lee added a new stakeholder to <span className="company-name">Security Audit</span>
                      </div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Chart */}
              <div className="status-chart-section">
                <div className="section-header">
                  <span>Engagement Status</span>
                  <div className="add-icon">+</div>
                </div>
                <div className="chart-container">
                  <div className="status-chart">
                    {/* Placeholder – replace with real chart later */}
                    <div className="status-label">Status</div>
                  </div>
                </div>
                <div className="status-indicators">
                  <div className="status-indicator">
                    <div className="indicator-dot" style={{ backgroundColor: '#10b981' }}></div>
                    <span className="indicator-label">Good</span>
                    <span className="indicator-count">45 systems</span>
                  </div>
                  <div className="status-indicator">
                    <div className="indicator-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span className="indicator-label">Warning</span>
                    <span className="indicator-count">30 systems</span>
                  </div>
                  <div className="status-indicator">
                    <div className="indicator-dot" style={{ backgroundColor: '#ef4444' }}></div>
                    <span className="indicator-label">Critical</span>
                    <span className="indicator-count">25 systems</span>
                  </div>
                </div>
              </div>
            </div>
        



          {/* Deadlines */}
          <div className="deadlines-section">
            <div className="activity-header">
              <div className="section-header">
                <span>Upcoming Deadlines</span>
              </div>
              <span className="view-all" onClick={handleViewDeadlines}>View all deadlines</span>
            </div>

            <div className="deadline-item">Quarterly Reporting Submission - Due Tomorrow</div>
            <div className="deadline-item">MSA Renewal</div>
            <div className="deadline-item">Project Kickoff: Phase 2 Completion</div>
            <div className="deadline-item">Stakeholder Review Meeting</div>
          </div>

          {/* At-Risk Engagements */}
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
                <tr>
                  <td>Global Bank Ltd</td>
                  <td>Assessment</td>
                  <td className={`risk-high ${getTypeColorClass("Assessment")}`}>High</td>
                  <td>Jane Doe</td>
                  <td className="table-actions">View</td>
                </tr>
                <tr>
                  <td>Acme Corp</td>
                  <td>Consultation</td>
                  <td className={`risk-medium ${getTypeColorClass("Consultation")}`}>Medium</td>
                  <td>John Smith</td>
                  <td className="table-actions">View</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Creating Customer */}
        {
          showCreateForm && (
            <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
              <CustomerForm
                onSubmit={handleCreateCustomer}
                onClose={() => setShowCreateForm(false)}
                initialData={undefined}
              />
            </Modal>
          )
        }
      </main >
    </div >
  );
};

export default DashboardHome;
