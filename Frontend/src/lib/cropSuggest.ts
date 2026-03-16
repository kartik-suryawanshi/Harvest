export interface CropSuggestionRequest {
  soilType: string;
  ph: string; // keep string to match inputs; parse in service if needed
  organicMatterPct?: string;
  drainage: 'poor' | 'moderate' | 'good' | string;
  location?: string;
  crop?: string;
}

export interface CropSuggestionResponse {
  crops: string[];
  rationale?: string;
}

export async function getCropSuggestion(req: CropSuggestionRequest): Promise<CropSuggestionResponse> {
  const ML_URL = import.meta.env.VITE_ML_API_URL || 'http://127.0.0.1:5000';
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  try {
    const prompt = `Based on the following soil characteristics, recommend the top 3 best crops to grow.
      Location: ${req.location || 'India'}
      Soil Type: ${req.soilType}
      pH level: ${req.ph}
      Drainage: ${req.drainage}
      Organic Matter: ${req.organicMatterPct ? `${req.organicMatterPct}%` : 'Unknown'}
      
      Respond STRICTLY in JSON format with exactly two keys:
      1. "crops": an array of 3 strings (the crop names)
      2. "rationale": a brief 2-sentence explanation of why these crops suit the soil.
    `;

    const response = await fetch(`${ML_URL}/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, apiKey: GEMINI_API_KEY })
    });

    if (!response.ok) {
       throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Attempt to parse the AI's response text as JSON
    try {
      let rawText = data.response || '';
      if (rawText.includes('```json')) {
         rawText = rawText.split('```json')[1].split('```')[0].trim();
      } else if (rawText.includes('```')) {
         rawText = rawText.split('```')[1].split('```')[0].trim();
      }
      
      const parsed = JSON.parse(rawText);
      return {
        crops: Array.isArray(parsed.crops) && parsed.crops.length > 0 ? parsed.crops : ['Wheat', 'Rice', 'Maize'],
        rationale: parsed.rationale || 'AI suggested these crops based on your precise soil profile.'
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
      return {
        crops: ['Wheat', 'Rice', 'Maize'], 
        rationale: data.response || `Based on soil type: ${req.soilType}, pH: ${req.ph}`
      };
    }
  } catch (error) {
    console.error('Crop suggestion fetch failed:', error);
    return {
      crops: ['Wheat', 'Rice', 'Maize'],
      rationale: `Service unavailable. Based generally on ${req.soilType} soil.`
    };
  }
}

