// Test file for Gemini integration
// This can be used to test the Gemini client functionality

import { fetchGeminiResponse, GeminiContext } from './geminiClient';

// Test function to verify Gemini integration
export async function testGeminiIntegration() {
  const testContext: GeminiContext = {
    selectedDistrict: 'Pune',
    selectedCrop: 'Rice',
    selectedSeason: 'Kharif',
    sowingDate: '2025-07-01',
    soilType: 'Clay',
    soilPh: '6.4',
    soilOrganicMatter: '2.1',
    soilDrainage: 'moderate',
    currentWeather: {
      temperature: 32,
      humidity: 78,
      conditions: 'Partly Cloudy'
    },
    yieldPrediction: {
      value: '4.2',
      confidence: 87,
      vsHistorical: 8
    },
    riskAssessment: {
      level: 25,
      reason: 'Favorable conditions with adequate rainfall expected'
    }
  };

  try {
    console.log('Testing Gemini integration...');
    
    const response = await fetchGeminiResponse({
      prompt: 'What crops should I grow in my soil?',
      context: testContext,
      apiKey: undefined // Test without API key to use fallback
    });

    console.log('Response:', response.response);
    console.log('Suggestions:', response.suggestions);
    console.log('Related Questions:', response.relatedQuestions);
    
    return response;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Example usage:
// testGeminiIntegration().then(console.log).catch(console.error);
