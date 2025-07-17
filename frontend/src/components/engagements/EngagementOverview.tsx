import React from "react";
import { MdOutlineDateRange } from "react-icons/md";
import { IoPricetagsOutline } from "react-icons/io5";
import { PiBuildingsDuotone } from "react-icons/pi";
import { IoPersonOutline } from "react-icons/io5";
import "./EngagementOverview.css";

interface ActionItem {
  id: number;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Completed" | "In Progress" | "Pending";
}

interface EngagementOverviewProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  actions: ActionItem[];
}

const EngagementOverview: React.FC<EngagementOverviewProps> = ({
  searchTerm,
  setSearchTerm,
  actions,
}) => {
  const filteredActions = actions.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="engagement-overview-section">
      <div className="card-row">
        <div className="info-card">
          <MdOutlineDateRange className="card-icon" />
          <div>
            <h3>Start Date</h3>
            <p>2024-01-15</p>
          </div>
        </div>
        <div className="info-card">
          <MdOutlineDateRange className="card-icon" />
          <div>
            <h3>End Date</h3>
            <p>2024-06-30</p>
          </div>
        </div>
        <div className="info-card">
          <IoPricetagsOutline className="card-icon" />
          <div>
            <h3>Type</h3>
            <p>Implementation</p>
          </div>
        </div>
        <div className="info-card">
          <PiBuildingsDuotone className="card-icon" />
          <div>
            <h3>MSA Ref</h3>
            <p>MSA-00421</p>
          </div>
        </div>
        <div className="info-card">
          <PiBuildingsDuotone className="card-icon" />
          <div>
            <h3>SOW Ref</h3>
            <p>SOW-2024-09</p>
          </div>
        </div>
        <div className="info-card">
          <IoPersonOutline className="card-icon" />
          <div>
            <h3>Status</h3>
            <p>In Progress</p>
          </div>
        </div>
      </div>

      <div className="action-items">
        <h2>Action Items</h2>
        {filteredActions.length === 0 ? (
          <p>No matching action items found.</p>
        ) : (
          <ul className="action-list">
            {filteredActions.map((item) => (
              <li key={item.id} className="action-item">
                <div className="action-header">
                  <strong>{item.description}</strong>
                  <span className={`status ${item.status.toLowerCase().replace(" ", "-")}`}>
                    {item.status}
                  </span>
                </div>
                <div className="priority">Priority: {item.priority}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default EngagementOverview;
