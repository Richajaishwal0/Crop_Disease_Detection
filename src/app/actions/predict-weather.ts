'use server';

import {
  getWeatherAnalysis,
  type WeatherAnalysisOutput,
} from '@/ai/flows/weather-prediction';

export async function getWeatherAnalysisAction(
  location: string
): Promise<{
  success: boolean;
  data?: WeatherAnalysisOutput;
  error?: string;
}> {
  if (!location) {
    return { success: false, error: 'Location is required.' };
  }

  try {
    const result = await getWeatherAnalysis({ location });
    return { success: true, data: result };
  } catch (e: any) {
    console.error('Weather analysis action error:', e);
    return { success: false, error: e.message || 'Failed to get weather analysis. Please try a nearby city.' };
  }
}
