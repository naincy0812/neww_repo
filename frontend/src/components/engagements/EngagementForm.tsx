import React, { useState } from "react";
import "./EngagementForm.css";

interface DocumentField {
  documents: string[];
  reference?: string;
  value?: number;
  startDate?: string;
  endDate?: string;
}

interface FormData {
  name: string;
  type?: string;
  status?: string;
  description?: string;
  msa?: DocumentField;
  sow?: DocumentField;
  [key: string]: any;
}

interface EngagementFormProps {
  onSubmit: (data: FormData, msaFile?: File, sowFile?: File) => Promise<void> | void;
  onClose: () => void;
  initialData?: Partial<FormData>;
}

const EngagementForm: React.FC<EngagementFormProps> = ({ onSubmit, onClose, initialData }) => {
  const defaultData: FormData = {
    name: "",
    type: "",
    status: "active",
    description: "",
    msa: { documents: [], reference: "", value: 0, startDate: "", endDate: "" },
    sow: { documents: [], reference: "", value: 0, startDate: "", endDate: "" },
  };

  const [formData, setFormData] = useState<FormData>({ ...defaultData, ...initialData });
  const [msaFile, setMsaFile] = useState<File | undefined>();
  const [sowFile, setSowFile] = useState<File | undefined>();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    if (field) {
      // If field exists, update nested object
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      // Otherwise, update top-level field
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, section: "msa" | "sow") => {
    const file = e.target.files?.[0];
    if (section === "msa") setMsaFile(file);
    if (section === "sow") setSowFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    const submissionData = {
      ...formData,
      msa: formData.msa?.reference || formData.msa?.value || formData.msa?.startDate || formData.msa?.endDate ? formData.msa : undefined,
      sow: formData.sow?.reference || formData.sow?.value || formData.sow?.startDate || formData.sow?.endDate ? formData.sow : undefined,
    };
    try {
      await onSubmit(submissionData, msaFile, sowFile);
      alert("Engagement created successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to create engagement");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="engagement-form">
      {/* Basic Info */}
      <div className="form-field">
        <label>Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="form-field">
        <label>Type</label>
        <select name="type" value={formData.type || ""} onChange={handleChange}>
          <option value="">Select Type</option>
          <option value="Migration">Migration</option>
          <option value="Implementation">Implementation</option>
          <option value="Consulting">Consulting</option>
          <option value="Support">Support</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* MSA Section */}
      <h3>MSA Details</h3>
      <div className="form-field">
        <label>Reference</label>
        <input name="msa.reference" value={formData.msa?.reference || ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>Value</label>
        <input type="number" name="msa.value" value={formData.msa?.value || 0} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>Start Date</label>
        <input type="date" name="msa.startDate" value={formData.msa?.startDate || ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>End Date</label>
        <input type="date" name="msa.endDate" value={formData.msa?.endDate || ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>Upload MSA Document</label>
        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" onChange={(e) => handleFileChange(e, 'msa')} />
      </div>

      {/* SOW Section */}
      <h3>SOW Details</h3>
      <div className="form-field">
        <label>Reference</label>
        <input name="sow.reference" value={formData.sow?.reference || ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>Value</label>
        <input type="number" name="sow.value" value={formData.sow?.value || 0} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>Start Date</label>
        <input type="date" name="sow.startDate" value={formData.sow?.startDate || ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>End Date</label>
        <input type="date" name="sow.endDate" value={formData.sow?.endDate || ""} onChange={handleChange} />
      </div>
      <div className="form-field">
        <label>Upload SOW Document</label>
        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" onChange={(e) => handleFileChange(e, 'sow')} />
      </div>

      {/* Status */}
      <div className="form-field" style={{ gridColumn: 'span 2' }}>
        <label>Status</label>
        <select name="status" value={formData.status || "active"} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Description */}
      <div className="form-field full">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          style={{ resize: 'vertical', maxHeight: '180px', overflowY: 'auto' }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        style={{
          backgroundColor: '#8b5cf6',
          color: '#fff',
          gridColumn: 'span 2',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'background-color 0.3s ease',
        }}
      >
        {initialData ? 'Update Engagement' : 'Create Engagement'}
      </button>
      <style>
        {`
          .status-toggle-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .status-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .status-active {
            background-color: #22c55e;
            color: white;
          }
          .status-inactive {
            background-color: #ef4444;
            color: white;
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
    </form>
  );
};

export default EngagementForm;
