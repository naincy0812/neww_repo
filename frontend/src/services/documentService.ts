const API_BASE = "http://localhost:8000/api/documents";

export interface DocumentUploadResponse {
  _id: string;
  engagementId: string;
  filename: string;
  contentType: string;
  path: string;
  uploadedAt: string;
  size: number;
}

/**
 * Upload a single document file and associate it with an engagement.
 * Note: backend expects the query param `engagementId` and a multipart/form-data body with field `file`.
 */
export async function uploadDocument(engagementId: string, file: File, fileType: string = "other"): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload?engagementId=${encodeURIComponent(engagementId)}&fileType=${encodeURIComponent(fileType)}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to upload document");
  }

  return res.json();
}
