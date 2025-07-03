import { MedicalDocumentResponse } from '@/types/medical';

const API_BASE_URL = 'https://med-ai.up.railway.app';

export const medAiApi = {
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  },

  async processDocument(documentUrl: string): Promise<MedicalDocumentResponse> {
    const response = await fetch(`${API_BASE_URL}/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ document_url: documentUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  }
};