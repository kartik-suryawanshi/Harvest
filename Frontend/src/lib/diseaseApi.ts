const ML_API = import.meta.env.VITE_ML_API_URL || 'http://127.0.0.1:5000';

export interface DiseasePredictionResult {
  disease: string;
  confidence: number;
  crop: string;
  treatment: string;
  fertilizer: string;
  severity: 'High' | 'Medium' | 'Low' | 'None';
  healthy: boolean;
}

export async function predictDisease(imageFile: File, cropName: string): Promise<DiseasePredictionResult> {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('crop_name', cropName);

  try {
    const res = await fetch(`${ML_API}/disease-predict`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Prediction failed');
    }

    return await res.json();
  } catch (error) {
    console.error('Disease prediction API error:', error);
    throw error;
  }
}
