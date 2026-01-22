'use server';

import { translateText } from '@/ai/flows/translate-text';
import type { DiagnoseCropDiseaseOutput } from '@/ai/flows/crop-disease-diagnosis';

export async function translateDiagnosis(
  diagnosis: DiagnoseCropDiseaseOutput,
  targetLanguage: string
): Promise<DiagnoseCropDiseaseOutput> {
  if (targetLanguage === 'en') {
    return diagnosis;
  }

  const languageMap: Record<string, string> = {
    hi: 'Hindi',
  };

  const targetLang = languageMap[targetLanguage];
  if (!targetLang) return diagnosis;

  try {
    const textToTranslate = `
Disease Name: ${diagnosis.diseaseName}
Severity: ${diagnosis.affectedSeverity}
Cause: ${diagnosis.cause}
Weather Conditions: ${diagnosis.weatherConditions}
Symptoms: ${diagnosis.symptoms}
Immediate Steps: ${diagnosis.immediateSteps}
Follow-up Steps: ${diagnosis.followUpSteps}
Organic Treatment: ${diagnosis.organicTreatment}
Chemical Treatment: ${diagnosis.chemicalTreatment}
Preventive Measures: ${diagnosis.preventiveMeasures}
`;

    const translated = await translateText({ text: textToTranslate, targetLanguage: targetLang });
    
    const lines = translated.translatedText.split('\n').filter(l => l.trim());
    const extractValue = (prefix: string) => {
      const line = lines.find(l => l.includes(prefix));
      return line ? line.split(':').slice(1).join(':').trim() : '';
    };

    return {
      ...diagnosis,
      diseaseName: extractValue('Disease Name') || diagnosis.diseaseName,
      affectedSeverity: extractValue('Severity') || diagnosis.affectedSeverity,
      cause: extractValue('Cause') || diagnosis.cause,
      weatherConditions: extractValue('Weather Conditions') || diagnosis.weatherConditions,
      symptoms: extractValue('Symptoms') || diagnosis.symptoms,
      immediateSteps: extractValue('Immediate Steps') || diagnosis.immediateSteps,
      followUpSteps: extractValue('Follow-up Steps') || diagnosis.followUpSteps,
      organicTreatment: extractValue('Organic Treatment') || diagnosis.organicTreatment,
      chemicalTreatment: extractValue('Chemical Treatment') || diagnosis.chemicalTreatment,
      preventiveMeasures: extractValue('Preventive Measures') || diagnosis.preventiveMeasures,
    };
  } catch (error) {
    console.error('Translation failed:', error);
    return diagnosis;
  }
}
