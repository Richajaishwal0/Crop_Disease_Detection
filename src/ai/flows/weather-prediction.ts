'use server';

/**
 * @fileOverview Real weather analysis and farming recommendations
 * using Open-Meteo (free) + Genkit (LLM only for advice).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/* =====================================================
   1️⃣ HELPERS (REAL WEATHER, NO LLM)
===================================================== */

// Geocode city → latitude & longitude
async function geocodeLocation(location: string) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      location
    )}&count=1&language=en&format=json`
  );

  if (!res.ok) {
    throw new Error('Failed to geocode location');
  }

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Location not found');
  }

  const place = data.results[0];

  return {
    resolvedLocation: `${place.name}, ${place.country}`,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

// Fetch current weather from Open-Meteo
async function fetchWeather(latitude: number, longitude: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch weather');
  }

  const data = await res.json();
  const current = data.current;

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    precipitationChance: current.precipitation > 0 ? 60 : 0,
    description: current.precipitation > 0 ? 'Rainy' : 'Clear / Cloudy',
  };
}

/* =====================================================
   2️⃣ INPUT / OUTPUT SCHEMAS
===================================================== */

const WeatherAnalysisInputSchema = z.object({
  location: z.string(),
});
export type WeatherAnalysisInput = z.infer<
  typeof WeatherAnalysisInputSchema
>;

const WeatherAnalysisOutputSchema = z.object({
  location: z.string(),
  forecast: z.object({
    temperature: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    description: z.string(),
    precipitationChance: z.number(),
  }),
  suitableActivities: z.array(z.string()),
  recommendedCropsForHarvest: z.array(z.string()),
  recommendations: z.array(
    z.object({
      category: z.string(),
      title: z.string(),
      tip: z.string(),
    })
  ),
});
export type WeatherAnalysisOutput = z.infer<
  typeof WeatherAnalysisOutputSchema
>;

/* =====================================================
   3️⃣ PUBLIC ACTION
===================================================== */

export async function getWeatherAnalysis(
  input: WeatherAnalysisInput
): Promise<WeatherAnalysisOutput> {
  return getWeatherAnalysisFlow(input);
}

/* =====================================================
   4️⃣ GENKIT FLOW (CORRECT DESIGN)
===================================================== */

export const getWeatherAnalysisFlow = ai.defineFlow(
  {
    name: 'getWeatherAnalysisFlow',
    inputSchema: WeatherAnalysisInputSchema,
    outputSchema: WeatherAnalysisOutputSchema,
  },
  async (input) => {
    /* ---------- STEP 1: REAL WEATHER (NO LLM) ---------- */
    const geo = await geocodeLocation(input.location);
    const weather = await fetchWeather(geo.latitude, geo.longitude);

    /* ---------- STEP 2: LLM ONLY FOR ADVICE ---------- */
    const prompt = `
You are an expert agricultural advisor.

Weather conditions:
- Location: ${geo.resolvedLocation}
- Temperature: ${weather.temperature} °C
- Humidity: ${weather.humidity} %
- Wind Speed: ${weather.windSpeed} km/h
- Description: ${weather.description}
- Chance of Rain: ${weather.precipitationChance} %

Based ONLY on this data:
1. Suggest 2–3 suitable farming activities.
2. Suggest 1–2 crops suitable for harvesting (or return an empty list).
3. Provide 2–3 farming recommendations.

Return STRICT JSON in this format:
{
  "suitableActivities": string[],
  "recommendedCropsForHarvest": string[],
  "recommendations": [
    { "category": string, "title": string, "tip": string }
  ]
}
`;

    const { output: advice } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      output: {
        schema: z.object({
          suitableActivities: z.array(z.string()),
          recommendedCropsForHarvest: z.array(z.string()),
          recommendations: z.array(
            z.object({
              category: z.string(),
              title: z.string(),
              tip: z.string(),
            })
          ),
        }),
      },
    });

    /* ---------- STEP 3: FINAL ASSEMBLY (NO NULLS) ---------- */
    return {
      location: geo.resolvedLocation,
      forecast: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        description: weather.description,
        precipitationChance: weather.precipitationChance,
      },
      suitableActivities: advice!.suitableActivities,
      recommendedCropsForHarvest: advice!.recommendedCropsForHarvest,
      recommendations: advice!.recommendations,
    };
  }
);
