export interface ResidueRecommendationRequest {
  crop: string;
  condition: string;
  livestock: boolean;
  goal: string;
  lang?: string;
}


export interface ResidueRecommendationResponse {
  primary_method: string;
  alternatives: string[];
  benefit_key: string;
  steps_key: string;
}

export async function getResidueRecommendation(body: ResidueRecommendationRequest, baseUrl?: string): Promise<ResidueRecommendationResponse> {
  const apiBase = baseUrl || (import.meta as any).env?.VITE_ML_API_URL || 'http://127.0.0.1:5000';
  const res = await fetch(`${apiBase}/residue/recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ML API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
