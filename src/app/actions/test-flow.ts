'use server';

import { submitDiagnosisForReview, getPendingDiagnoses } from './expert-review';
import { getNotifications } from './messaging';

// Test function to verify the complete flow
export async function testSubmissionFlow() {
  console.log('=== TESTING SUBMISSION FLOW ===');
  
  // Test submission
  const testDiagnosis = {
    diseaseName: 'Test Disease',
    affectedSeverity: 'High' as const,
    confidence: 0.85,
    immediateSteps: 'Test immediate steps',
    followUpSteps: 'Test follow-up steps',
    communityPostsLink: 'https://test.com',
    modelUsed: 'Test Model'
  };

  const result = await submitDiagnosisForReview(
    'test_farmer_123',
    'Test Farmer',
    testDiagnosis,
    'data:image/jpeg;base64,test'
  );

  console.log('Submission result:', result);

  // Test getting pending diagnoses
  const pending = await getPendingDiagnoses();
  console.log('Pending diagnoses:', pending.length);

  // Test getting notifications for expert
  const notifications = await getNotifications('expert_1', 'expert');
  console.log('Expert notifications:', notifications.length);

  return {
    submissionSuccess: result.success,
    pendingCount: pending.length,
    notificationCount: notifications.length,
    submissionId: result.submissionId
  };
}