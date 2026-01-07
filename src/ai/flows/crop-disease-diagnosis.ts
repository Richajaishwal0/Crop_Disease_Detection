'use server';

/**
 * @fileOverview Crop disease diagnosis AI agent with ResNet integration.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
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
  diseaseName: z.string().describe('The name of the identified disease.'),
  confidence: z
    .number()
    .describe('The confidence level of the diagnosis (0-1).'),
  affectedSeverity: z.string().describe('The severity of the disease.'),
  immediateSteps: z.string().describe('The immediate steps to take.'),
  followUpSteps: z.string().describe('The follow-up steps to take.'),
  communityPostsLink: z
    .string()
    .describe('A link to community posts for the same disease.'),
  modelUsed: z.string().describe('The AI model used for diagnosis'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(
  input: DiagnoseCropDiseaseInput
): Promise<DiagnoseCropDiseaseOutput> {
  // Use ResNet model if requested
  if (input.useResNet) {
    try {
      // Extract base64 data from data URI
      const base64Data = input.photoDataUri.split(',')[1];
      const resnetResult = await diagnoseWithResNet({ imageBase64: base64Data });
      
      return {
        ...resnetResult,
        modelUsed: 'ResNet (Hugging Face)',
      };
    } catch (error) {
      console.error('ResNet diagnosis failed, falling back to Gemini:', error);
      // Fall back to Gemini if ResNet fails
    }
  }
  
  // Use Gemini model as fallback or default
  const geminiResult = await diagnoseCropDiseaseFlow(input);
  return {
    ...geminiResult,
    modelUsed: 'Gemini 2.5 Flash',
  };
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {schema: DiagnoseCropDiseaseInputSchema},
  output: {schema: DiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert in diagnosing crop diseases based on images.
  Given a photo of a crop, provide a diagnosis of potential diseases, along with recommended steps and a link to relevant community discussions.

  Photo: {{media url=photoDataUri}}

  Respond in JSON format.
  `,
});

export const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      modelUsed: 'Gemini 2.5 Flash',
    };
  }
);
