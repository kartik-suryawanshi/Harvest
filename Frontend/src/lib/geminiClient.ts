// Gemini AI Integration for HarvestIQ
// Provides intelligent agricultural recommendations based on user context

export interface GeminiContext {
  // User selected parameters
  selectedDistrict?: string;
  selectedCrop?: string;
  selectedSeason?: string;
  sowingDate?: string;
  
  // Soil parameters
  soilType?: string;
  soilPh?: string;
  soilOrganicMatter?: string;
  soilDrainage?: 'poor' | 'moderate' | 'good';
  
  // Weather data
  currentWeather?: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
  weeklyForecast?: Array<{
    day: string;
    temp: number;
    rain: number;
    humidity?: number;
  }>;
  
  // ML predictions
  yieldPrediction?: {
    value: string;
    confidence: number;
    vsHistorical: number;
  };
  riskAssessment?: {
    level: number;
    reason: string;
  };
  cropCycle?: {
    sowing_date: string;
    season_length_days: number;
    days_to_maturity: number;
    predicted_maturity_date: string;
    harvest_window: {
      start: string;
      end: string;
    };
    growth_stages: {
      [key: string]: {
        name: string;
        bbch_code: number;
        days_from_sowing: number;
        predicted_date: string;
      };
    };
  };
  irrigationSchedule?: Array<{
    week: string;
    action: string;
    amount?: string;
    reason: string;
  }>;
  waterSavings?: number;
  featureImportance?: Array<{
    name: string;
    impact: number;
  }>;
}

export interface GeminiRequest {
  prompt: string;
  context: GeminiContext;
  apiKey?: string;
}

export interface GeminiResponse {
  response: string;
  suggestions?: string[];
  relatedQuestions?: string[];
}

// Create context-aware prompt for Gemini
function createContextualPrompt(userPrompt: string, context: GeminiContext): string {
  const contextInfo = [];
  
  // Add location and crop info
  if (context.selectedDistrict) {
    contextInfo.push(`Location: ${context.selectedDistrict}`);
  }
  if (context.selectedCrop) {
    contextInfo.push(`Crop: ${context.selectedCrop}`);
  }
  if (context.selectedSeason) {
    contextInfo.push(`Season: ${context.selectedSeason}`);
  }
  if (context.sowingDate) {
    contextInfo.push(`Sowing Date: ${context.sowingDate}`);
  }
  
  // Add soil information
  if (context.soilType || context.soilPh || context.soilOrganicMatter || context.soilDrainage) {
    const soilInfo = ['Soil Profile:'];
    if (context.soilType) soilInfo.push(`Type: ${context.soilType}`);
    if (context.soilPh) soilInfo.push(`pH: ${context.soilPh}`);
    if (context.soilOrganicMatter) soilInfo.push(`Organic Matter: ${context.soilOrganicMatter}%`);
    if (context.soilDrainage) soilInfo.push(`Drainage: ${context.soilDrainage}`);
    contextInfo.push(soilInfo.join(', '));
  }
  
  // Add weather information
  if (context.currentWeather) {
    contextInfo.push(`Current Weather: ${context.currentWeather.temperature}°C, ${context.currentWeather.humidity}% humidity, ${context.currentWeather.conditions}`);
  }
  
  // Add prediction results
  if (context.yieldPrediction) {
    contextInfo.push(`Predicted Yield: ${context.yieldPrediction.value} t/ha (${context.yieldPrediction.confidence}% confidence)`);
  }
  if (context.riskAssessment) {
    contextInfo.push(`Risk Level: ${context.riskAssessment.level}% - ${context.riskAssessment.reason}`);
  }
  if (context.waterSavings) {
    contextInfo.push(`Water Savings: ${context.waterSavings}% vs baseline`);
  }
  
  // Add crop cycle information
  if (context.cropCycle) {
    contextInfo.push(`Crop Cycle: ${context.cropCycle.days_to_maturity} days to maturity, harvest window: ${context.cropCycle.harvest_window.start} to ${context.cropCycle.harvest_window.end}`);
  }
  
  const contextString = contextInfo.length > 0 ? `\n\nContext Information:\n${contextInfo.join('\n')}` : '';
  
  return `You are an expert agricultural advisor for HarvestIQ, an AI-powered farming decision support system. 

${contextString}

User Question: ${userPrompt}

Please provide a detailed, actionable response that:
1. Uses the provided context information to give specific recommendations
2. Considers soil conditions, weather patterns, and crop requirements
3. Provides practical farming advice
4. Suggests specific actions the farmer can take
5. Explains the reasoning behind your recommendations
6. Mentions any risks or considerations

Keep your response concise but comprehensive, focusing on practical agricultural advice.`;
}

// Fetch response from Gemini API via backend proxy
export async function fetchGeminiResponse(
  request: GeminiRequest,
  baseUrl?: string
): Promise<GeminiResponse> {
  const apiBase = baseUrl || (import.meta as any).env?.VITE_ML_API_URL || 'http://127.0.0.1:5000';
  
  try {
    const response = await fetch(`${apiBase}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: createContextualPrompt(request.prompt, request.context),
        apiKey: request.apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      response: data.response || 'Sorry, I could not generate a response at this time.',
      suggestions: data.suggestions || [],
      relatedQuestions: data.relatedQuestions || [],
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to demo response
    return getFallbackResponse(request.prompt, request.context);
  }
}

// Fallback responses when Gemini API is not available
function getFallbackResponse(prompt: string, context: GeminiContext): GeminiResponse {
  const lowerPrompt = prompt.toLowerCase();
  
  // Debug: Log context to help troubleshoot
  console.log('Gemini Context:', context);
  
  // Crop recommendation based on soil conditions - improved detection
  if (lowerPrompt.includes('crop') || lowerPrompt.includes('grow') || lowerPrompt.includes('plant') || lowerPrompt.includes('harvest') || lowerPrompt.includes('soil')) {
    const soilType = context.soilType?.toLowerCase() || '';
    const drainage = context.soilDrainage || '';
    const ph = parseFloat(context.soilPh || '6.5');
    const location = context.selectedDistrict || 'your location';
    const crop = context.selectedCrop || 'your selected crop';
    
    // Handle specific soil type questions even without context
    if (lowerPrompt.includes('clay')) {
      return {
        response: `🌾 Best Crops for Clay Soil:\n\nPrimary Recommendations:\n- Rice - Excellent choice! Clay soil's water retention is perfect for rice cultivation\n- Wheat - Performs well in clay soil with proper drainage\n- Sugarcane - Thrives in clay soil due to high water-holding capacity\n\nSecondary Options:\n- Barley - Good for clay soil\n- Oats - Tolerates clay soil well\n- Potatoes - Can grow in clay with proper preparation\n\nWhy Clay Soil is Good for These Crops:\n- High water retention reduces irrigation needs\n- Rich in nutrients and minerals\n- Good for root development\n- Reduces water stress during dry periods\n\nImportant Considerations:\n- Ensure proper drainage to prevent waterlogging\n- Add organic matter to improve soil structure\n- Monitor soil moisture levels\n- Consider raised beds for better drainage\n\nTo get personalized recommendations: Set your location, soil pH, and drainage conditions in the control panel!`,
        suggestions: [
          'How to improve clay soil drainage?',
          'What is the best pH for clay soil?',
          'How to prepare clay soil for planting?',
          'What fertilizers work best in clay soil?'
        ],
        relatedQuestions: [
          'How to test soil drainage?',
          'What is the best irrigation for clay soil?',
          'How to increase clay soil fertility?'
        ]
      };
    }
    
    if (lowerPrompt.includes('sandy')) {
      return {
        response: `🌾 Best Crops for Sandy Soil:\n\nPrimary Recommendations:\n- Groundnut (Peanuts) - Excellent choice! Sandy soil's drainage is perfect\n- Maize - Performs well in sandy soil with proper irrigation\n- Vegetables - Most vegetables thrive in well-drained sandy soil\n\nSecondary Options:\n- Sweet Potatoes - Love sandy soil\n- Carrots - Root vegetables do well in sandy soil\n- Onions - Good drainage prevents bulb rot\n\nWhy Sandy Soil is Good for These Crops:\n- Excellent drainage prevents waterlogging\n- Easy root penetration and development\n- Warms up quickly in spring\n- Reduces disease risk from excess moisture\n\nImportant Considerations:\n- Requires more frequent irrigation\n- Add organic matter to improve water retention\n- Monitor soil moisture closely\n- Consider mulching to retain moisture\n\nTo get personalized recommendations: Set your location, soil pH, and drainage conditions in the control panel!`,
        suggestions: [
          'How to improve sandy soil water retention?',
          'What is the best irrigation for sandy soil?',
          'How to add nutrients to sandy soil?',
          'What vegetables grow best in sandy soil?'
        ],
        relatedQuestions: [
          'How to test sandy soil fertility?',
          'What mulches work best for sandy soil?',
          'How to prevent sandy soil erosion?'
        ]
      };
    }
    
    if (lowerPrompt.includes('loam')) {
      return {
        response: `🌾 Best Crops for Loam Soil:\n\nPrimary Recommendations:\n- Most crops! - Loam is the ideal soil type\n- Wheat - Excellent choice for loam soil\n- Maize - Performs exceptionally well\n- Rice - Can be grown with proper water management\n- Vegetables - All types thrive in loam soil\n\nWhy Loam Soil is Ideal:\n- Perfect balance of sand, silt, and clay\n- Excellent water retention and drainage\n- Rich in nutrients and organic matter\n- Easy to work with\n- Supports healthy root development\n\nCrop Rotation Benefits:\n- Rotate between cereals, legumes, and vegetables\n- Maintains soil fertility naturally\n- Reduces pest and disease pressure\n- Improves soil structure over time\n\nTo get personalized recommendations: Set your location, soil pH, and drainage conditions in the control panel!`,
        suggestions: [
          'What is the best crop rotation for loam soil?',
          'How to maintain loam soil fertility?',
          'What is the best irrigation for loam soil?',
          'How to test loam soil nutrients?'
        ],
        relatedQuestions: [
          'How to improve loam soil structure?',
          'What fertilizers work best in loam soil?',
          'How to prevent loam soil compaction?'
        ]
      };
    }

    // If no soil information is provided, give general advice
    if (!context.soilType && !context.soilPh && !context.soilDrainage) {
      return {
        response: `🌾 Crop Selection Guide by Soil Type:\n\nClay Soil (High water retention):\n- Rice - Perfect match! Clay holds water well\n- Wheat - Good choice with proper drainage\n- Sugarcane - Thrives in clay soil\n\nSandy Soil (Good drainage):\n- Groundnut - Excellent choice\n- Maize - Performs well with irrigation\n- Vegetables - Most types do well\n\nLoam Soil (Ideal balance):\n- Most crops - Wheat, Maize, Rice, Vegetables\n- Perfect for crop rotation\n- Easiest to manage\n\nSilty Soil (Moderate retention):\n- Rice - Good water retention\n- Wheat - Performs well\n- Barley - Suitable choice\n\nTo get personalized recommendations:\n1. Set your location in the control panel\n2. Choose your soil type\n3. Set soil pH and drainage\n4. Generate a forecast for detailed advice!`,
        suggestions: [
          'What crops grow best in clay soil?',
          'What crops grow best in sandy soil?',
          'What crops grow best in loam soil?',
          'How to test my soil type?'
        ],
        relatedQuestions: [
          'How to improve soil drainage?',
          'What is the best soil pH for crops?',
          'How to prepare soil for planting?'
        ]
      };
    }
    
    let recommendation = '';
    let reasoning = '';
    
    if (soilType.includes('clay')) {
      recommendation = 'Rice, Wheat, or Sugarcane';
      reasoning = 'Clay soil retains water well, making it ideal for water-intensive crops like rice. The high water-holding capacity also supports wheat and sugarcane cultivation.';
    } else if (soilType.includes('sandy')) {
      recommendation = 'Groundnut, Maize, or Vegetables';
      reasoning = 'Sandy soil drains quickly, making it suitable for crops that prefer well-drained conditions. Groundnut, maize, and most vegetables thrive in sandy soils.';
    } else if (soilType.includes('loam')) {
      recommendation = 'Most crops including Wheat, Maize, Rice, and Vegetables';
      reasoning = 'Loam soil has the ideal balance of sand, silt, and clay, making it suitable for a wide variety of crops.';
    } else {
      recommendation = 'Wheat, Maize, or Pulses';
      reasoning = 'These crops are generally adaptable to various soil conditions and provide good yields.';
    }
    
    // Adjust based on pH
    if (ph < 6.0) {
      recommendation += ' (Note: Consider soil amendment for acidic conditions)';
    } else if (ph > 7.5) {
      recommendation += ' (Note: Consider soil amendment for alkaline conditions)';
    }
    
    // Adjust based on drainage
    if (drainage === 'poor') {
      recommendation = recommendation.replace('Rice', 'Rice (excellent choice)');
      reasoning += ' Poor drainage actually benefits rice cultivation.';
    } else if (drainage === 'good') {
      recommendation = recommendation.replace('Maize', 'Maize (excellent choice)');
      reasoning += ' Good drainage is beneficial for maize and other crops that don\'t tolerate waterlogging.';
    }
    
    return {
      response: `Based on your soil conditions in ${location} (${context.soilType || 'unknown type'}, pH ${context.soilPh || 'unknown'}, ${context.soilDrainage || 'unknown'} drainage), I recommend: ${recommendation}\n\nReasoning: ${reasoning}\n\nAdditional Considerations:\n- Monitor soil moisture levels regularly\n- Consider crop rotation for soil health\n- Test soil nutrients before planting\n- Adjust irrigation based on soil drainage characteristics\n- Consider local climate and market demand`,
      suggestions: [
        'What is the best planting time for these crops?',
        'How should I prepare the soil?',
        'What irrigation schedule should I follow?',
        'What are the expected yields?'
      ],
      relatedQuestions: [
        'How to improve soil fertility?',
        'What fertilizers should I use?',
        'How to manage pests and diseases?'
      ]
    };
  }
  
  // Irrigation advice
  if (lowerPrompt.includes('irrigation') || lowerPrompt.includes('water')) {
    const soilType = context.soilType?.toLowerCase() || '';
    const drainage = context.soilDrainage || '';
    
    let advice = '';
    if (soilType.includes('clay')) {
      advice = 'Clay soil retains water longer, so you can reduce irrigation frequency by 20-30%. Water deeply but less frequently to avoid waterlogging.';
    } else if (soilType.includes('sandy')) {
      advice = 'Sandy soil drains quickly, so you need more frequent irrigation. Water in smaller amounts but more often to maintain consistent moisture.';
    } else {
      advice = 'Loam soil has balanced water retention. Follow standard irrigation schedules but monitor soil moisture regularly.';
    }
    
    return {
      response: `Irrigation Recommendations:\n\n${advice}\n\nCurrent Schedule: ${context.irrigationSchedule?.length ? 'Your system recommends ' + context.irrigationSchedule.filter(s => s.action === 'Irrigate').length + ' irrigation sessions over 8 weeks.' : 'No schedule available.'}\n\nWater Savings: ${context.waterSavings || 0}% compared to traditional methods.\n\nTips:\n- Check soil moisture before irrigating\n- Water early morning or evening\n- Use mulching to retain moisture\n- Monitor weather forecasts`,
      suggestions: [
        'How to check soil moisture?',
        'What is the best time to irrigate?',
        'How to reduce water usage?'
      ]
    };
  }
  
  // Risk assessment
  if (lowerPrompt.includes('risk') || lowerPrompt.includes('problem')) {
    const riskLevel = context.riskAssessment?.level || 0;
    const riskReason = context.riskAssessment?.reason || 'No risk assessment available';
    
    let riskAdvice = '';
    if (riskLevel < 30) {
      riskAdvice = 'Low risk conditions. Continue with normal farming practices.';
    } else if (riskLevel < 70) {
      riskAdvice = 'Moderate risk. Monitor conditions closely and be prepared to take preventive measures.';
    } else {
      riskAdvice = 'High risk conditions. Take immediate preventive measures and consider alternative strategies.';
    }
    
    return {
      response: `Risk Assessment: ${riskLevel}% risk level\n\nCurrent Issues: ${riskReason}\n\nRecommendations: ${riskAdvice}\n\nPreventive Measures:\n- Monitor weather forecasts regularly\n- Check soil moisture levels\n- Inspect crops for signs of stress\n- Have contingency plans ready\n- Consider crop insurance`,
      suggestions: [
        'How to reduce risk?',
        'What preventive measures should I take?',
        'How to monitor crop health?'
      ]
    };
  }
  
  // Default response - provide helpful guidance
  const hasAnyContext = context.selectedDistrict || context.selectedCrop || context.soilType || context.soilPh;
  
  if (!hasAnyContext) {
    return {
      response: `I'd be happy to help you with agricultural advice! To provide the most accurate recommendations, please first set up your parameters:\n\n📋 Setup Steps:\n1. Select your location (district/region)\n2. Choose your crop (rice, wheat, maize, etc.)\n3. Set soil information (type, pH, drainage)\n4. Set sowing date\n5. Generate a forecast to get detailed data\n\n🌱 General Agricultural Tips:\n- Test your soil before planting\n- Choose crops suitable for your climate\n- Plan irrigation based on soil type\n- Monitor weather patterns\n- Consider crop rotation for soil health\n\n💡 Popular Questions:\n- "What crops grow best in clay soil?"\n- "How to improve soil drainage?"\n- "What is the best irrigation schedule?"\n- "How to increase crop yield?"`,
      suggestions: [
        'What crops should I grow?',
        'How to improve soil health?',
        'What is the best irrigation schedule?',
        'How to increase yield?'
      ],
      relatedQuestions: [
        'How to test soil type?',
        'What is the best soil for rice?',
        'How to prepare soil for planting?',
        'What fertilizers should I use?'
      ]
    };
  }
  
  // If some context is available, provide more specific guidance
  return {
    response: `I understand you're asking about "${prompt}". Based on your current setup (${context.selectedCrop || 'no crop selected'} in ${context.selectedDistrict || 'no location selected'}), I can help with agricultural advice!\n\nCurrent Context:\n- Location: ${context.selectedDistrict || 'Not set'}\n- Crop: ${context.selectedCrop || 'Not set'}\n- Soil Type: ${context.soilType || 'Not set'}\n- Soil pH: ${context.soilPh || 'Not set'}\n- Drainage: ${context.soilDrainage || 'Not set'}\n\nTo get more specific recommendations:\n1. Complete the missing parameters above\n2. Generate a forecast to get detailed predictions\n3. Ask me specific questions about your setup\n\nI can help with:\n- Crop selection based on soil conditions\n- Irrigation scheduling\n- Risk assessment\n- Yield optimization\n- Soil improvement techniques`,
    suggestions: [
      'What crops should I grow?',
      'How to improve soil health?',
      'What is the best irrigation schedule?',
      'How to increase yield?'
    ],
    relatedQuestions: [
      'How to test soil type?',
      'What is the best soil for rice?',
      'How to prepare soil for planting?',
      'What fertilizers should I use?'
    ]
  };
}

// Generate contextual suggestions based on current state
export function generateContextualSuggestions(context: GeminiContext): string[] {
  const suggestions = [];
  
  if (context.selectedCrop && context.soilType) {
    suggestions.push(`What is the best planting time for ${context.selectedCrop} in ${context.soilType} soil?`);
  }
  
  if (context.riskAssessment && context.riskAssessment.level > 50) {
    suggestions.push('How can I reduce the current risk level?');
  }
  
  if (context.irrigationSchedule) {
    suggestions.push('How can I optimize my irrigation schedule?');
  }
  
  if (context.yieldPrediction) {
    suggestions.push(`How can I increase my ${context.selectedCrop} yield beyond ${context.yieldPrediction.value} t/ha?`);
  }
  
  if (context.soilType) {
    suggestions.push(`How to improve ${context.soilType} soil fertility?`);
  }
  
  if (context.selectedSeason) {
    suggestions.push(`What are the best practices for ${context.selectedSeason} season farming?`);
  }
  
  return suggestions;
}
