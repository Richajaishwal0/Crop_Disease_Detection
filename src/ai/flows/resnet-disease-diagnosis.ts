'use server';

/**
 * @fileOverview Plant disease diagnosis using standard pretrained ResNet model.
 * 
 * This implementation uses a pretrained ResNet model from Hugging Face for 
 * crop disease classification without relying on hardcoded disease databases.
 */

import { pipeline } from '@xenova/transformers';
import { z } from 'zod';

const ResNetDiagnosisInputSchema = z.object({
  imageBase64: z.string().describe('Base64 encoded image of the crop'),
});

export type ResNetDiagnosisInput = z.infer<typeof ResNetDiagnosisInputSchema>;

const ResNetDiagnosisOutputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified disease'),
  confidence: z.number().describe('The confidence level of the diagnosis (0-1)'),
  affectedSeverity: z.string().describe('The severity of the disease'),
  immediateSteps: z.string().describe('The immediate steps to take'),
  followUpSteps: z.string().describe('The follow-up steps to take'),
  communityPostsLink: z.string().describe('A link to community posts for the same disease'),
});

export type ResNetDiagnosisOutput = z.infer<typeof ResNetDiagnosisOutputSchema>;

let resnetClassifier: any = null;

/**
 * Initialize the pretrained ResNet model for image classification
 */
async function getResNetClassifier() {
  if (!resnetClassifier) {
    try {
      // Load standard pretrained ResNet model from Hugging Face
      resnetClassifier = await pipeline(
        'image-classification',
        'microsoft/resnet-50',
        { device: 'cpu' }
      );
    } catch (error) {
      console.error('Failed to load ResNet model:', error);
      throw new Error('ResNet model initialization failed');
    }
  }
  return resnetClassifier;
}

/**
 * Analyze disease severity based on model confidence and prediction
 */
function analyzeSeverity(prediction: string, confidence: number): string {
  if (confidence < 0.3) return 'Uncertain';
  if (prediction.toLowerCase().includes('healthy')) return 'None';
  if (confidence > 0.8) return 'High';
  if (confidence > 0.6) return 'Moderate';
  return 'Low';
}

/**
 * Generate treatment recommendations based on model prediction
 */
function generateTreatmentRecommendations(prediction: string, confidence: number) {
  const isHealthy = prediction.toLowerCase().includes('healthy');
  const isUncertain = confidence < 0.4;
  
  if (isHealthy) {
    return {
      immediate: 'Continue regular monitoring and maintenance',
      followUp: 'Maintain current care practices and environmental conditions'
    };
  }
  
  if (isUncertain) {
    return {
      immediate: 'Conduct closer inspection of plant symptoms',
      followUp: 'Consider consulting agricultural expert for accurate diagnosis'
    };
  }
  
  return {
    immediate: 'Isolate affected plants and assess spread of symptoms',
    followUp: 'Apply appropriate treatment based on identified condition and monitor progress'
  };
}

/**
 * Main ResNet-based disease diagnosis function
 */
export async function diagnoseWithResNet(
  input: ResNetDiagnosisInput
): Promise<ResNetDiagnosisOutput> {
  try {
    const model = await getResNetClassifier();
    
    // Prepare image data for ResNet model
    const imageData = `data:image/jpeg;base64,${input.imageBase64}`;
    
    // Run ResNet inference
    const predictions = await model(imageData);
    
    if (!predictions || predictions.length === 0) {
      throw new Error('ResNet model returned no predictions');
    }
    
    // Extract top prediction from ResNet output
    const topPrediction = predictions[0];
    const rawLabel = topPrediction.label;
    const confidence = topPrediction.score;
    
    // Process ResNet prediction for plant disease context
    const diseaseName = rawLabel.replace(/_/g, ' ').toLowerCase();
    const severity = analyzeSeverity(rawLabel, confidence);
    const treatments = generateTreatmentRecommendations(rawLabel, confidence);
    
    return {
      diseaseName: formatPredictionLabel(diseaseName),
      confidence: Math.round(confidence * 100) / 100,
      affectedSeverity: severity,
      immediateSteps: treatments.immediate,
      followUpSteps: treatments.followUp,
      communityPostsLink: `/community?search=${encodeURIComponent(diseaseName)}`,
    };
    
  } catch (error) {
    console.error('ResNet diagnosis error:', error);
    
    return {
      diseaseName: 'Analysis Unavailable',
      confidence: 0,
      affectedSeverity: 'Unknown',
      immediateSteps: 'ResNet model analysis failed. Please retry with a clearer image.',
      followUpSteps: 'Ensure proper lighting and focus on affected plant areas for better results.',
      communityPostsLink: '/community',
    };
  }
}

/**
 * Format prediction labels for display
 */
function formatPredictionLabel(label: string): string {
  return label
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}