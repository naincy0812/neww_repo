import React, { useEffect, useState, useCallback } from "react";
import { FaFilter, FaPlus, FaSearch } from "react-icons/fa";
import Sidebar from "../common/Sidebar";
import Profile from "../common/Profile";
import EngagementCard, { Engagement } from "./EngagementCard";
import EngagementForm from "./EngagementForm";
import Modal from "../common/Modal";
import { listEngagements, createEngagement, EngagementCreateInput } from "../../services/engagementService";
import "../customers/Customers.css"; // reuse styling

const getTypeColorClass = (type?: string): string => {
  if (!type) return "default";
  switch (type.toLowerCase()) {
    case "migration":
      return "tech";
    case "implementation":
      return "software";
    default:
      return "default";
  }
};

const EngagementsPage: React.FC = () => {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchEngagements = useCallback(async () => {
      try {
        const data = await listEngagements();
        const mapped = data.map((e: any) => ({
          ...e,
          id: e.id ?? (typeof e._id === 'object' ? e._id?.$oid : e._id) ?? e.engagementId,
        }));
        setEngagements(mapped);
      } catch (error) {
        console.error("Error fetching engagements:", error);
      }
    }, []); // moved comma here

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  // simple front-end filter helpers
  const handleDeleteLocal = (id: string) => {
    setEngagements((prev) => prev.filter((e) => e.id !== id && e._id !== id));
  };

  const filteredEngagements = engagements.filter((e) =>
    [e.id, e.name, e.type].some((field) =>
      (field || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleCreateEngagement = async (data: any) => {
    try {
      const payload: EngagementCreateInput = { customerId: (data as any).customerId || "", ...data } as EngagementCreateInput;
      const newEng = await createEngagement(payload);
      await fetchEngagements();
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        {/* -------- header -------- */}
        <header className="dashboard-header customers-header">
          <h1 className="dashboard-title">Engagements</h1>
          <div className="header-actions">
            <button className="header-btn" onClick={() => setShowCreateForm(true)}>
              <FaPlus /> New Engagement
            </button>
            <Profile />
          </div>
        </header>

        {/* search + optional filters */}
        <div className="customer-actions">
          <div className="customer-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search engagements by name or ID..."
              aria-label="Search engagements by name or ID"
            />
            <button onClick={() => setSearchQuery(searchQuery)}>Search</button>
          </div>
        </div>

        {showCreateForm && (
          <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)}>
            <EngagementForm onSubmit={handleCreateEngagement} onClose={() => setShowCreateForm(false)} />
          </Modal>
        )}

        {/* grid */}
        <section className="customers-grid">
          {filteredEngagements.map((eng) => (
            <EngagementCard key={eng.id} engagement={eng} onRefresh={fetchEngagements} onDelete={handleDeleteLocal} />
          ))}
        </section>
      </main>
    </div>
  );
};

export default EngagementsPage;
