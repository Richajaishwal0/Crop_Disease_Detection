'use server';

/**
 * @fileOverview Crop disease diagnosis and plant identification AI agent with ResNet integration.
 *
 * - diagnoseCropDisease - A function that handles plant identification and disease diagnosis.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { diagnoseWithResNet } from './resnet-disease-diagnosis';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  useResNet: z.boolean().optional().describe('Whether to use ResNet model for more accurate diagnosis'),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  plantName: z.string().describe('Common name of the identified plant/crop (e.g., Tomato, Corn / Maize, Potato, Apple, Chilli Pepper, Wheat, Rice, Cotton, etc.).'),
  scientificName: z.string().describe('Botanical / Latin scientific name of the plant (e.g., Solanum lycopersicum, Zea mays).'),
  plantCategory: z.string().describe('Plant category or family (e.g., Solanaceous Vegetable, Cereal Grain, Fruit Crop, Legume, Cash Crop).'),
  plantDescription: z.string().describe('Comprehensive, educational overview of this plant: native region, ideal growing conditions (climate, temperature, soil type), growing cycle, and agricultural importance.'),
  isHealthy: z.boolean().describe('Whether the plant leaf is healthy and free of disease.'),
  diseaseName: z.string().describe('The name of the identified disease or "Healthy Plant" if healthy.'),
  confidence: z
    .number()
    .describe('The confidence level of the diagnosis (0-1).'),
  affectedSeverity: z.string().describe('The severity of the disease (None, Low, Moderate, High, Severe).'),
  cause: z.string().describe('The primary cause of the disease (fungal, bacterial, viral, nutritional deficiency, pest infestation, or healthy).'),
  weatherConditions: z.string().describe('Weather conditions that favor this disease or ideal weather for healthy growth.'),
  symptoms: z.string().describe('Detailed symptoms visible on the leaf or description of healthy plant vigor.'),
  immediateSteps: z.string().describe('The immediate steps to take for treatment or continued healthy care.'),
  followUpSteps: z.string().describe('The follow-up steps for plant recovery and maintenance.'),
  organicTreatment: z.string().describe('Organic treatment methods (natural remedies, bio-pesticides, neem oil, etc.).'),
  chemicalTreatment: z.string().describe('Chemical treatment options including specific pesticides and fungicides with active ingredient names.'),
  preventiveMeasures: z.string().describe('Preventive measures to avoid future outbreaks or maintain plant health.'),
  communityPostsLink: z
    .string()
    .describe('A link to community posts for the same disease or plant.'),
  modelUsed: z.string().describe('The AI model used for diagnosis'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(
  input: DiagnoseCropDiseaseInput
): Promise<DiagnoseCropDiseaseOutput> {
  // Use ResNet model if explicitly requested
  if (input.useResNet) {
    try {
      const base64Data = input.photoDataUri.split(',')[1];
      const resnetResult = await diagnoseWithResNet({ imageBase64: base64Data });
      
      return {
        plantName: 'Agricultural Crop',
        scientificName: 'Plantae',
        plantCategory: 'Crop Plant',
        plantDescription: 'Identified crop plant specimen analyzed for pathological symptoms and agricultural health.',
        isHealthy: resnetResult.diseaseName.toLowerCase().includes('healthy'),
        cause: 'Pathological infection or environmental stress',
        weatherConditions: 'High humidity or moisture conducive to leaf pathogens',
        symptoms: 'Discoloration, lesions, or irregular spotting observed on leaf tissue',
        organicTreatment: 'Apply neem oil extract (5ml/L) or biological bio-fungicide spray',
        chemicalTreatment: 'Broad-spectrum copper-based fungicide or approved pesticide if severity increases',
        preventiveMeasures: 'Ensure proper crop spacing, drip irrigation, and avoid overhead watering.',
        ...resnetResult,
        modelUsed: 'ResNet (Hugging Face)',
      };
    } catch (error) {
      console.error('ResNet diagnosis failed, falling back to Gemini:', error);
    }
  }
  
  // Use multimodal Gemini with multi-model fallback and retry
  return await diagnoseCropDiseaseWithFallback(input);
}

const DIAGNOSIS_SYSTEM_PROMPT = `You are an expert agronomist, botanist, and plant pathologist.
Given a photo of a crop leaf:

1. FIRST, identify the plant precisely:
   - Common plant name (e.g., Tomato, Corn / Maize, Potato, Apple, Chilli Pepper, Wheat, Rice, Cotton, Cucumber, Grapevine, etc.)
   - Botanical / scientific name (e.g., Solanum lycopersicum)
   - Plant category (e.g., Solanaceous Vegetable, Cereal Grain, Fruit Crop, Legume, Cash Crop)
   - Comprehensive plant information: ideal soil (loamy, sandy, clay), optimal climate & temperature range, growing season, and key agricultural tips.

2. SECOND, diagnose the health status and any disease or pest infestation:
   - Whether the plant is healthy or infected (isHealthy boolean)
   - Specific disease name (or "Healthy Plant (No Disease Detected)" if clean)
   - Confidence score (0 to 1)
   - Severity (None, Low, Moderate, High, Severe)
   - Underlying cause (fungal, bacterial, viral, nutritional deficiency, pest, or healthy)
   - Weather / environmental conditions related to the disease
   - Visible symptoms on the leaf
   - Immediate treatment steps
   - Follow-up care
   - Organic & biological cures (herbal, neem, trichoderma, compost tea)
   - Chemical treatments (specific fungicides / pesticides with formulations)
   - Long-term preventive measures

Provide practical, structured, and farmer-friendly advice.`;

async function diagnoseCropDiseaseWithFallback(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  const modelsToTry = [
    'googleai/gemini-2.0-flash',
    'googleai/gemini-1.5-flash',
    'googleai/gemini-2.5-flash',
    'googleai/gemini-1.5-pro',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.generate({
          model: modelName as any,
          prompt: [
            { text: DIAGNOSIS_SYSTEM_PROMPT },
            { media: { url: input.photoDataUri } },
          ],
          output: { schema: DiagnoseCropDiseaseOutputSchema },
        });

        if (response.output) {
          const cleanModelName = modelName.replace('googleai/gemini-', 'Gemini ').replace('-flash', ' Flash').replace('-pro', ' Pro');
          return {
            ...response.output,
            modelUsed: cleanModelName,
          };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Diagnosis] Attempt ${attempt} with ${modelName} failed:`, err?.message || err);
        // If 503 Service Unavailable or rate limited, delay briefly and retry/switch
        await new Promise(resolve => setTimeout(resolve, 800 * attempt));
      }
    }
  }

  // Backup fallback using ResNet classifier if all Gemini models are throttled
  try {
    console.warn('[AI Diagnosis] Gemini models exhausted, invoking ResNet fallback...');
    const base64Data = input.photoDataUri.split(',')[1];
    const resnetResult = await diagnoseWithResNet({ imageBase64: base64Data });
    return {
      plantName: 'Agricultural Crop',
      scientificName: 'Plantae',
      plantCategory: 'Crop Plant',
      plantDescription: 'Identified crop plant specimen analyzed for pathological symptoms and agricultural health.',
      isHealthy: resnetResult.diseaseName.toLowerCase().includes('healthy'),
      cause: 'Pathological infection or environmental stress',
      weatherConditions: 'High humidity or moisture conducive to leaf pathogens',
      symptoms: 'Discoloration, lesions, or irregular spotting observed on leaf tissue',
      organicTreatment: 'Apply neem oil extract (5ml/L) or biological bio-fungicide spray',
      chemicalTreatment: 'Broad-spectrum copper-based fungicide or approved pesticide if severity increases',
      preventiveMeasures: 'Ensure proper crop spacing, drip irrigation, and avoid overhead watering.',
      ...resnetResult,
      modelUsed: 'ResNet (Backup Model)',
    };
  } catch (resnetError) {
    console.error('[AI Diagnosis] All fallback models failed:', lastError);
    throw new Error(
      lastError?.message?.includes('503') || lastError?.message?.includes('demand')
        ? 'AI servers are temporarily busy due to high demand. Please try uploading the leaf image again in a few seconds.'
        : (lastError?.message || 'Crop disease diagnosis failed. Please try again.')
    );
  }
}

export const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    return await diagnoseCropDiseaseWithFallback(input);
  }
);

