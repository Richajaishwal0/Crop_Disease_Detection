"use server";

/**
 * @fileOverview Real weather analysis and farming recommendations
 * using Open-Meteo (free) + Genkit (LLM for advice & intelligent geocoding fallback).
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";

/* =====================================================
   1️⃣ HELPERS (ROBUST GEOCODING & REAL WEATHER)
   ===================================================== */

// Comprehensive Dictionary of Indian States, Union Territories & Major Agricultural Hubs
const KNOWN_LOCATIONS: Record<string, { name: string; lat: number; lon: number; country: string }> = {
  // Indian States & UTs
  tamilnadu: { name: "Tamil Nadu", lat: 11.1271, lon: 78.6569, country: "India" },
  "tamil nadu": { name: "Tamil Nadu", lat: 11.1271, lon: 78.6569, country: "India" },
  tn: { name: "Tamil Nadu", lat: 11.1271, lon: 78.6569, country: "India" },
  maharashtra: { name: "Maharashtra", lat: 19.7515, lon: 75.7139, country: "India" },
  mh: { name: "Maharashtra", lat: 19.7515, lon: 75.7139, country: "India" },
  karnataka: { name: "Karnataka", lat: 15.3173, lon: 75.7139, country: "India" },
  kerala: { name: "Kerala", lat: 10.8505, lon: 76.2711, country: "India" },
  andhrapradesh: { name: "Andhra Pradesh", lat: 15.9129, lon: 79.7400, country: "India" },
  "andhra pradesh": { name: "Andhra Pradesh", lat: 15.9129, lon: 79.7400, country: "India" },
  andhra: { name: "Andhra Pradesh", lat: 15.9129, lon: 79.7400, country: "India" },
  ap: { name: "Andhra Pradesh", lat: 15.9129, lon: 79.7400, country: "India" },
  telangana: { name: "Telangana", lat: 18.1124, lon: 79.0193, country: "India" },
  ts: { name: "Telangana", lat: 18.1124, lon: 79.0193, country: "India" },
  uttarpradesh: { name: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, country: "India" },
  "uttar pradesh": { name: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, country: "India" },
  up: { name: "Uttar Pradesh", lat: 26.8467, lon: 80.9462, country: "India" },
  madhyapradesh: { name: "Madhya Pradesh", lat: 22.9734, lon: 78.6569, country: "India" },
  "madhya pradesh": { name: "Madhya Pradesh", lat: 22.9734, lon: 78.6569, country: "India" },
  mp: { name: "Madhya Pradesh", lat: 22.9734, lon: 78.6569, country: "India" },
  punjab: { name: "Punjab", lat: 31.1471, lon: 75.3412, country: "India" },
  haryana: { name: "Haryana", lat: 29.0588, lon: 76.0856, country: "India" },
  rajasthan: { name: "Rajasthan", lat: 27.0238, lon: 74.2179, country: "India" },
  gujarat: { name: "Gujarat", lat: 22.2587, lon: 71.1924, country: "India" },
  westbengal: { name: "West Bengal", lat: 22.9868, lon: 87.8550, country: "India" },
  "west bengal": { name: "West Bengal", lat: 22.9868, lon: 87.8550, country: "India" },
  bengal: { name: "West Bengal", lat: 22.9868, lon: 87.8550, country: "India" },
  bihar: { name: "Bihar", lat: 25.0961, lon: 85.3131, country: "India" },
  odisha: { name: "Odisha", lat: 20.9517, lon: 85.0985, country: "India" },
  orissa: { name: "Odisha", lat: 20.9517, lon: 85.0985, country: "India" },
  assam: { name: "Assam", lat: 26.2006, lon: 92.9376, country: "India" },
  jharkhand: { name: "Jharkhand", lat: 23.6102, lon: 85.2799, country: "India" },
  chhattisgarh: { name: "Chhattisgarh", lat: 21.2787, lon: 81.8661, country: "India" },
  uttarakhand: { name: "Uttarakhand", lat: 30.0668, lon: 79.0193, country: "India" },
  himachal: { name: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, country: "India" },
  "himachal pradesh": { name: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, country: "India" },
  goa: { name: "Goa", lat: 15.2993, lon: 74.1240, country: "India" },
  
  // Major Agricultural & Metro Cities
  chennai: { name: "Chennai", lat: 13.0827, lon: 80.2707, country: "India" },
  coimbatore: { name: "Coimbatore", lat: 11.0168, lon: 76.9558, country: "India" },
  madurai: { name: "Madurai", lat: 9.9252, lon: 78.1198, country: "India" },
  trichy: { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047, country: "India" },
  salem: { name: "Salem", lat: 11.6643, lon: 78.1460, country: "India" },
  thanjavur: { name: "Thanjavur", lat: 10.7870, lon: 79.1378, country: "India" },
  mumbai: { name: "Mumbai", lat: 19.0760, lon: 72.8777, country: "India" },
  pune: { name: "Pune", lat: 18.5204, lon: 73.8567, country: "India" },
  nagpur: { name: "Nagpur", lat: 21.1458, lon: 79.0882, country: "India" },
  nashik: { name: "Nashik", lat: 19.9975, lon: 73.7898, country: "India" },
  delhi: { name: "New Delhi", lat: 28.6139, lon: 77.2090, country: "India" },
  "new delhi": { name: "New Delhi", lat: 28.6139, lon: 77.2090, country: "India" },
  newdelhi: { name: "New Delhi", lat: 28.6139, lon: 77.2090, country: "India" },
  bengaluru: { name: "Bengaluru", lat: 12.9716, lon: 77.5946, country: "India" },
  bangalore: { name: "Bengaluru", lat: 12.9716, lon: 77.5946, country: "India" },
  hyderabad: { name: "Hyderabad", lat: 17.3850, lon: 78.4867, country: "India" },
  kolkata: { name: "Kolkata", lat: 22.5726, lon: 88.3639, country: "India" },
  ahmedabad: { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, country: "India" },
  jaipur: { name: "Jaipur", lat: 26.9124, lon: 75.7873, country: "India" },
  lucknow: { name: "Lucknow", lat: 26.8467, lon: 80.9462, country: "India" },
  chandigarh: { name: "Chandigarh", lat: 30.7333, lon: 76.7794, country: "India" },
  bhopal: { name: "Bhopal", lat: 23.2599, lon: 77.4126, country: "India" },
  patna: { name: "Patna", lat: 25.5941, lon: 85.1376, country: "India" },
  indore: { name: "Indore", lat: 22.7196, lon: 75.8577, country: "India" },
  ludhiana: { name: "Ludhiana", lat: 30.9010, lon: 75.8573, country: "India" },
  surat: { name: "Surat", lat: 21.1702, lon: 72.8311, country: "India" },
  varanasi: { name: "Varanasi", lat: 25.3176, lon: 82.9739, country: "India" },
  amritsar: { name: "Amritsar", lat: 31.6340, lon: 74.8723, country: "India" },
};

// Robust Multi-Stage Geocoding
async function geocodeLocation(rawLocation: string): Promise<{
  resolvedLocation: string;
  latitude: number;
  longitude: number;
}> {
  const trimmed = rawLocation.trim();

  // 1. Direct coordinate format (e.g., "18.5204, 73.8567")
  const coordRegex = /^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/;
  const coordMatch = trimmed.match(coordRegex);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return {
        resolvedLocation: `Coordinates (${lat.toFixed(3)}, ${lon.toFixed(3)})`,
        latitude: lat,
        longitude: lon,
      };
    }
  }

  // 2. Normalize and check dictionary (e.g. "TamilNadu" -> "tamilnadu" / "tamil nadu")
  const unspaced = trimmed.toLowerCase().replace(/[\s\-_]/g, '');
  const normalized = trimmed.toLowerCase().replace(/([a-z])([A-Z])/g, '$1 $2').trim();

  if (KNOWN_LOCATIONS[unspaced]) {
    const found = KNOWN_LOCATIONS[unspaced];
    return {
      resolvedLocation: `${found.name}, ${found.country}`,
      latitude: found.lat,
      longitude: found.lon,
    };
  }

  if (KNOWN_LOCATIONS[normalized]) {
    const found = KNOWN_LOCATIONS[normalized];
    return {
      resolvedLocation: `${found.name}, ${found.country}`,
      latitude: found.lat,
      longitude: found.lon,
    };
  }

  // 3. Search Open-Meteo with multiple query variations
  const variations = [
    trimmed,
    trimmed.replace(/([a-z])([A-Z])/g, '$1 $2'), // "TamilNadu" -> "Tamil Nadu"
    trimmed.split(',')[0].trim(),
    trimmed.replace(/[^a-zA-Z0-9\s]/g, ' ').trim(),
  ];

  for (const q of variations) {
    if (!q) continue;
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=5&language=en&format=json`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const place = data.results[0];
          return {
            resolvedLocation: `${place.name}${place.admin1 ? `, ${place.admin1}` : ''}, ${place.country || 'Global'}`,
            latitude: place.latitude,
            longitude: place.longitude,
          };
        }
      }
    } catch {
      // Continue to next strategy
    }
  }

  // 4. Intelligent AI Geocoding Fallback via Gemini
  try {
    const aiGeoPrompt = `You are a geolocation engine. Convert this location query: "${rawLocation}" into latitude and longitude coordinates.
If it's an Indian state (e.g. Tamil Nadu, Maharashtra), return the central geographic coordinates of that state.
Respond strictly in JSON matching the schema.`;

    const aiRes = await ai.generate({
      prompt: aiGeoPrompt,
      output: {
        schema: z.object({
          name: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          country: z.string(),
        }),
      },
    });

    if (aiRes.output && aiRes.output.latitude && aiRes.output.longitude) {
      return {
        resolvedLocation: `${aiRes.output.name}, ${aiRes.output.country || 'India'}`,
        latitude: aiRes.output.latitude,
        longitude: aiRes.output.longitude,
      };
    }
  } catch (aiErr) {
    console.warn('AI Geocoding fallback warning:', aiErr);
  }

  // 5. Ultimate Fallback to India Center
  return {
    resolvedLocation: `${trimmed}, India`,
    latitude: 20.5937,
    longitude: 78.9629,
  };
}

// Fetch current real-time weather from Open-Meteo
async function fetchWeather(latitude: number, longitude: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&timezone=auto`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch weather from forecast server');
    }

    const data = await res.json();
    const current = data.current;

    const code = current?.weather_code ?? 0;
    let description = 'Clear Sky';
    if (code >= 1 && code <= 3) description = 'Partly Cloudy';
    else if (code >= 45 && code <= 48) description = 'Foggy / Hazy';
    else if (code >= 51 && code <= 67) description = 'Light Rain / Drizzle';
    else if (code >= 80 && code <= 99) description = 'Showers / Thunderstorm';

    return {
      temperature: current?.temperature_2m ?? 30,
      humidity: current?.relative_humidity_2m ?? 65,
      windSpeed: current?.wind_speed_10m ?? 14,
      precipitationChance: (current?.precipitation && current.precipitation > 0) ? 75 : 15,
      description,
    };
  } catch (err) {
    console.error('Weather fetch error:', err);
    return {
      temperature: 30,
      humidity: 65,
      windSpeed: 12,
      precipitationChance: 15,
      description: 'Partly Cloudy',
    };
  }
}

/* =====================================================
   2️⃣ INPUT / OUTPUT SCHEMAS
   ===================================================== */

const WeatherAnalysisInputSchema = z.object({
  location: z.string().describe('City name, district, state, or coordinates (e.g., TamilNadu, Nashik, Pune, Delhi)'),
});
export type WeatherAnalysisInput = z.infer<typeof WeatherAnalysisInputSchema>;

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
export type WeatherAnalysisOutput = z.infer<typeof WeatherAnalysisOutputSchema>;

/* =====================================================
   3️⃣ PUBLIC ACTION
   ===================================================== */

export async function getWeatherAnalysis(
  input: WeatherAnalysisInput
): Promise<WeatherAnalysisOutput> {
  return getWeatherAnalysisFlow(input);
}

/* =====================================================
   4️⃣ GENKIT FLOW
   ===================================================== */

export const getWeatherAnalysisFlow = ai.defineFlow(
  {
    name: 'getWeatherAnalysisFlow',
    inputSchema: WeatherAnalysisInputSchema,
    outputSchema: WeatherAnalysisOutputSchema,
  },
  async (input) => {
    /* ---------- STEP 1: REAL WEATHER WITH ROBUST RESOLUTION ---------- */
    const geo = await geocodeLocation(input.location);
    const weather = await fetchWeather(geo.latitude, geo.longitude);

    /* ---------- STEP 2: LLM ADVICE ---------- */
    const prompt = `
You are an expert agricultural meteorologist and agronomist.

Real-time Meteorological Conditions for ${geo.resolvedLocation}:
- Location: ${geo.resolvedLocation}
- Temperature: ${weather.temperature} °C
- Humidity: ${weather.humidity} %
- Wind Speed: ${weather.windSpeed} km/h
- Sky Condition: ${weather.description}
- Chance of Rain: ${weather.precipitationChance} %

Provide customized agronomic recommendations for farmers in ${geo.resolvedLocation}:
1. 2–4 suitable farming field operations (irrigation, spraying safety, fertilizer timing, tilling).
2. 1–3 crops currently suitable for harvest or active care in this region.
3. 3 practical agricultural tips categorized into "Irrigation", "Crop Protection", and "Field Operations".

Respond strictly in JSON format matching the schema.
`;

    try {
      const response = await ai.generate({
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

      const advice = response.output;

      return {
        location: geo.resolvedLocation,
        forecast: weather,
        suitableActivities: advice?.suitableActivities || [
          'Irrigate early morning to prevent moisture loss',
          'Inspect crops for fungal symptoms under high humidity',
          'Conduct weeding and soil mulching',
        ],
        recommendedCropsForHarvest: advice?.recommendedCropsForHarvest || [
          'Paddy / Rice',
          'Sugarcane',
          'Vegetables',
        ],
        recommendations: advice?.recommendations || [
          {
            category: 'Irrigation',
            title: 'Water Management',
            tip: 'Optimize drip irrigation according to current humidity and evapotranspiration.',
          },
          {
            category: 'Crop Protection',
            title: 'Spray Precautions',
            tip: 'Avoid spraying pesticides when wind speeds exceed 15 km/h.',
          },
          {
            category: 'Field Operations',
            title: 'Soil Care',
            tip: 'Favorable conditions for routine weeding and canopy maintenance.',
          },
        ],
      };
    } catch (llmError) {
      console.error('LLM advice generation error:', llmError);
      return {
        location: geo.resolvedLocation,
        forecast: weather,
        suitableActivities: [
          'Monitor soil moisture levels',
          'Check drainage channels',
          'Schedule regular foliar nutrition',
        ],
        recommendedCropsForHarvest: ['Paddy', 'Vegetables', 'Groundnut'],
        recommendations: [
          {
            category: 'Irrigation',
            title: 'Smart Watering',
            tip: 'Optimize water application according to current relative humidity.',
          },
          {
            category: 'Crop Protection',
            title: 'Pest Surveillance',
            tip: 'Regular scouting recommended during current temperature cycle.',
          },
        ],
      };
    }
  }
);
