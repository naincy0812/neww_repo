"use client";

import React, { useState, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./EngagementCard.css";
import Modal from "../common/Modal";
import EngagementForm from "./EngagementForm";
import { updateEngagement, deleteEngagement } from "../../services/engagementService";
import { uploadDocument } from "../../services/documentService";

export interface Engagement {
  id?: string;
  _id?: string;
  customerId?: string;
  name: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  owner?: string;
  summary?: string;
  documents?: {
    title: string;
    reference: string;
    value: string;
    dates: string;
  }[];
  // Optional detailed fields for MSA / SOW and description
  msa?: {
    reference?: string;
    value?: number;
    startDate?: string;
    endDate?: string;
  };
  sow?: {
    reference?: string;
    value?: number;
    startDate?: string;
    endDate?: string;
  };
  description?: string;
  status?: string;
  ryg_status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EngagementCardProps {
  engagement: Engagement;
  customerName?: string;
  onRefresh?: () => Promise<void> | void;
  onDelete?: (id: string) => void;
}

const typeColorMapping: Record<string, string> = {
  "Consultation": "consultation-color",
  "Assessment": "assessment-color",
  "Implementation": "implementation-color",
  "Other": "other-color",
};

const getTypeColorClass = (type: string): string => {
  return typeColorMapping[type] || "default-color";
};

const EngagementCard: React.FC<EngagementCardProps> = ({ engagement, customerName, onRefresh, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const skipNextNavRef = useRef(false);

  const navigate = useNavigate();

  const formatDate = (d?: string) => {
    try {
      console.log('Formatting date:', d);
      if (!d) return "-";
      const date = new Date(d);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', d);
        return "-";
      }
      const formatted = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  React.useEffect(() => {
    console.log('Engagement data:', {
      createdAt: engagement.createdAt,
      updatedAt: engagement.updatedAt
    });
    console.log('Engagement raw data:', engagement);
  }, [engagement]);

  React.useEffect(() => {
    console.log('Component mounted');
  }, []);

  const handleToggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    skipNextNavRef.current = true;
    setShowOptions(prev => !prev);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(false);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (
    data: any,
    msaFile?: File,
    sowFile?: File
  ) => {
    const updId = engagement.id ?? engagement._id;
    if (!updId) return;
    try {
      await updateEngagement(updId, data);
      if (msaFile) await uploadDocument(updId, msaFile, "msa");
      if (sowFile) await uploadDocument(updId, sowFile, "sow");
      await onRefresh?.();
      alert("Engagement updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update engagement");
    } finally {
      setShowEditForm(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this engagement?")) {
      const delId = engagement.id ?? engagement._id;
      if (!delId) return;
      try {
        await deleteEngagement(delId);
        await onRefresh?.();
        onDelete?.(delId);
      } catch (err) {
        alert("Failed to delete engagement");
      }
      if (delId) {
        onDelete?.(delId);
      }
    }
    setShowOptions(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (skipNextNavRef.current) {
      skipNextNavRef.current = false;
      return;
    }
    if (showOptions) return;
    // Navigate only if the click did NOT happen inside the ellipsis menu or dropdown
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest('[data-stop-nav]')) {
      return;
    }
    const destId = engagement.id ?? engagement._id;
    if (destId) {
      navigate(`/engagements/${destId}`);
    }
  };

  return (
    <>
      <article className="engagement-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
        <div className="card-action" data-stop-nav onClick={handleToggleOptions}>
          <FaEllipsisV size={12} color="#ef4444" data-stop-nav />
          {showOptions && (
            <div className="options-dropdown active" data-stop-nav>
              <button onClick={handleUpdate}>Update</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
        <h2 className="engagement-title">{engagement.name}</h2>
        <div className="badge-row">
          {engagement.type && <span className={`engagement-type ${getTypeColorClass(engagement.type)}`}>{engagement.type}</span>}
          {customerName && <span className="customer-name">{customerName}</span>}
          <span className={`status-dot ${engagement.status === 'inactive' ? 'status-dot-inactive' : engagement.status === 'paused' ? 'status-dot-yellow' : 'status-dot-active'}`}></span>
        </div>
        <dl className="engagement-details">
          {engagement.description && (
            <div className="detail-row">
              <dd>{engagement.description}</dd>
            </div>
          )}
          <div className="detail-row">
            <dt>Status:</dt>
            <dd>{engagement.ryg_status || 'green'}</dd>
          </div>
          <div className="detail-row">
            <dt>Created:</dt>
            <dd>{formatDate(engagement.createdAt)}</dd>
          </div>
          <div className="detail-row">
            <dt>Updated:</dt>
            <dd>{formatDate(engagement.updatedAt)}</dd>
          </div>
          <div className="detail-row">
            <dt>MSA:</dt>
            <dd>
              {engagement.msa ? (
                <div className="msa-info">
                  <p>Reference: {engagement.msa.reference}</p>
                  <p>Start: {formatDate(engagement.msa.startDate)}</p>
                  <p>End: {formatDate(engagement.msa.endDate)}</p>
                </div>
              ) : 'None'}
            </dd>
          </div>
          <div className="detail-row">
            <dt>SOW:</dt>
            <dd>
              {engagement.sow ? (
                <div className="sow-info">
                  <p>Reference: {engagement.sow.reference}</p>
                  <p>Start: {formatDate(engagement.sow.startDate)}</p>
                  <p>End: {formatDate(engagement.sow.endDate)}</p>
                </div>
              ) : 'None'}
            </dd>
          </div>
        </dl>

        {engagement.owner && (
          <div className="owner-row">
            <span className="owner-icon">👤</span>
            <span>{engagement.owner}</span>
          </div>
        )}

        <style>
          {`
          .industry-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 1rem;
          }

          .industry-pill {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
          }

          .status-dot-active {
            background-color: #22c55e;
          }

          .status-dot-inactive {
            background-color: #ef4444;
          }
        `}
        </style>
      </article>

      {showEditForm && (
        <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)}>
          <EngagementForm
            initialData={{
              name: engagement.name,
              type: engagement.type,
              description: engagement.description,
              status: engagement.status ?? "active",
              msa: engagement.msa ? { documents: [] } : undefined,
              sow: engagement.sow ? { documents: [] } : undefined,
            }}
            onSubmit={handleEditSubmit}
            onClose={() => setShowEditForm(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default EngagementCard;
