import { Engagement } from "../components/engagements/EngagementCard";

const API_BASE = "http://localhost:8000/api/engagements";

export async function listEngagements(): Promise<Engagement[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to list engagements");
  const engagements = await res.json();
  console.log('Raw API response:', engagements);
  return engagements.map((eng: Engagement) => ({
    ...eng,
    createdAt: typeof eng.createdAt === 'string' ? new Date(eng.createdAt).toISOString() : null,
    updatedAt: typeof eng.updatedAt === 'string' ? new Date(eng.updatedAt).toISOString() : null
  }));
}

export interface EngagementCreateInput {
  customerId: string;
  name: string;
  type?: string;
  status?: string;
  ryg_status?: string;
  description?: string;
  msa?: {
    reference?: string;
    value?: number;
    startDate?: string;
    endDate?: string;
    documents?: string[];
  };
  sow?: {
    reference?: string;
    value?: number;
    startDate?: string;
    endDate?: string;
    documents?: string[];
  };
}

export async function createEngagement(data: EngagementCreateInput): Promise<Engagement> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to create engagement");
  }
  return res.json();
}

export async function updateEngagement(id: string, data: Partial<Engagement>): Promise<Engagement> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to update engagement");
  }
  return res.json();
}

export async function deleteEngagement(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete engagement");
}
