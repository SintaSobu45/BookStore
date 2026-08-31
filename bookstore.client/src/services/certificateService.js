import { API_BASE_URL } from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // നിങ്ങളുടെ ടോക്കൺ കീ നാമം
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// 1. Get Candidates
export const getCertificateCandidates = async () => {
  const response = await fetch(`${API_BASE_URL}/api/Certificate/candidates`, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch candidates");
  }
  return result.data;
};

// 2. Bulk Generate Certificates
export const bulkGenerateCertificates = async (storyPoetryIds) => {
  const response = await fetch(`${API_BASE_URL}/api/Certificate/bulk-generate`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storyPoetryIds }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to generate certificates");
  }
  return result.data;
};

// 3. Send Generated Certificate PDF
export const sendCertificatePdf = async (certificateId, pdfBlob, fileName) => {
  const formData = new FormData();
  formData.append(
    "certificatePdf",
    pdfBlob,
    fileName || `Certificate-${certificateId}.pdf`
  );

  const response = await fetch(
    `${API_BASE_URL}/api/Certificate/${certificateId}/send`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to send certificate PDF");
  }
  return result.data;
};