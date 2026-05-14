'use server';

import { aiAssistedActivityLogging } from '@/ai/flows/ai-assisted-activity-logging-flow';
import type { AiAssistedActivityLoggingInput, AiAssistedActivityLoggingOutput } from '@/ai/flows/ai-assisted-activity-logging-flow';
import { emissionFactors } from '@/lib/emission-factors';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';

export type AnalyzedActivity = AiAssistedActivityLoggingOutput & {
  co2e: number;
};

/**
 * Validates the API key by performing a minimal "ping" to the Gemini model.
 */
export async function validateApiKey(): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return { success: false, message: 'API Key is missing from environment.' };
  }

  try {
    const { text } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: 'Respond with the word "Connected" if you can hear me.',
      config: { maxOutputTokens: 5 }
    });

    if (text && text.toLowerCase().includes('connected')) {
      return { success: true, message: 'Successfully connected to Google AI.' };
    }
    return { success: false, message: 'API returned an unexpected response.' };
  } catch (error: any) {
    const errorStr = error.message || String(error);
    if (errorStr.includes('429')) {
      return { success: false, message: 'Quota Exceeded (429): The key is valid but your free tier limit is full.' };
    } else if (errorStr.includes('401') || errorStr.includes('403')) {
      return { success: false, message: 'Invalid Key (401/403): The provided API key is incorrect or restricted.' };
    }
    return { success: false, message: `Connection failed: ${errorStr.substring(0, 100)}` };
  }
}

/**
 * Calculates emissions based on the structured AI output and local database.
 */
function calculateEmissions(item: AiAssistedActivityLoggingOutput): number {
  const searchName = item.itemName.toLowerCase().trim();
  
  const factor = emissionFactors.find(f => 
    f.id.toLowerCase() === searchName || 
    f.name.toLowerCase() === searchName ||
    searchName.includes(f.name.toLowerCase()) ||
    f.name.toLowerCase().includes(searchName)
  );

  if (!factor) return 0;

  let quantity = item.quantity;
  if (item.unit === 'g' && factor.unit === 'kg') quantity /= 1000;
  if (item.unit === 'kg' && factor.unit === 'g') quantity *= 1000;
  if (item.unit === 'mile' && factor.unit === 'km') quantity *= 1.60934;
  if (item.unit === 'km' && factor.unit === 'mile') quantity /= 1.60934;
  
  const result = quantity * factor.value;
  return parseFloat(result.toFixed(3));
}

export async function analyzeActivity(input: AiAssistedActivityLoggingInput): Promise<{ success: true, data: AnalyzedActivity } | { success: false, error: string }> {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return { success: false, error: 'API Key Missing: Please check your .env configuration.' };
    }

    const aiResult = await aiAssistedActivityLogging(input);
    
    if (!aiResult) {
      return { success: false, error: 'AI Error: The model returned an empty response.' };
    }

    const co2e = calculateEmissions(aiResult);

    return { 
      success: true, 
      data: { ...aiResult, co2e } 
    };
  } catch (error: any) {
    const errorStr = error.message || String(error);
    console.error('[GenAI Error]:', errorStr);
    
    let errorMessage = 'An error occurred during AI analysis.';
    
    if (errorStr.includes('429')) {
      errorMessage = 'Rate Limit (429): Your account quota is exhausted. Please wait or check your Google AI console.';
    } else if (errorStr.includes('401') || errorStr.includes('403')) {
      errorMessage = 'Invalid Key (401/403): The provided API key is rejected by Google.';
    } else if (errorStr.includes('503')) {
      errorMessage = 'Service Busy (503): Google servers are currently overloaded.';
    } else {
      errorMessage = `API Error: ${errorStr.split('\n')[0].substring(0, 150)}`;
    }

    return { 
      success: false, 
      error: errorMessage 
    };
  }
}