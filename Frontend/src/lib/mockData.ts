// Export types so components that depend on them don't break
export interface SoilProfile {
  type: string; // e.g., Loam, Clay Loam, Sandy Loam
  ph: number; // e.g., 6.5
  organicMatterPct: number; // percent
  drainage: 'poor' | 'moderate' | 'good';
}

export interface ForecastData {
  currentWeather: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
  riskAssessment: {
    level: number;
    reason: string;
  };
  weatherTrend: Array<{
    day: string;
    rainfall: number;
    temperature: number;
  }>;
  weeklyForecast: Array<{
    day: string;
    temp: number;
    rain: number;
    conditionIcon?: string; 
  }>;
  yieldPrediction: {
    value: string;
    confidence: number;
    vsHistorical: number;
  };
  featureImportance: Array<{
    name: string;
    impact: number;
  }>;
  explanation: string;
  irrigationSchedule: Array<{
    week: string;
    action: string;
    amount?: string;
    reason: string;
  }>;
  waterSavings: number;
  soilProfile: SoilProfile;
  llmIrrigation?: {
    schedule: any[];
    notes?: string;
  };
}

export const mockApiCall = (
  district: string,
  crop: string,
  season: string,
  scenario: string,
  soilType?: string,
  soilPH?: string,
  organicMatter?: string,
  drainage?: string
): Promise<ForecastData> => {
  return new Promise((_, reject) => {
    // We intentionally reject this mock call. 
    // The application should NEVER fall back to this mock data.
    // If the ML service is down, the User must be notified rather than 
    // seeing hardcoded data that pretends the application succeeded.
    setTimeout(() => {
        reject(new Error("Unable to reach the Machine Learning Forecasting Service. Please ensure the backend is running."));
    }, 1000); 
  });
};