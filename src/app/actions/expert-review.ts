'use server';

import type { DiagnoseCropDiseaseOutput } from '@/ai/flows/crop-disease-diagnosis';

interface DiagnosisSubmission {
  id: string;
  farmerId: string;
  farmerName: string;
  diagnosis: DiagnoseCropDiseaseOutput;
  imageData: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  expertFeedback?: string;
}

// Global storage that persists during server runtime
global.diagnosisSubmissions = global.diagnosisSubmissions || [];
global.notifications = global.notifications || [];

export async function submitDiagnosisForReview(
  farmerId: string,
  farmerName: string,
  diagnosis: DiagnoseCropDiseaseOutput,
  imageData: string
): Promise<{
  success: boolean;
  submissionId?: string;
  error?: string;
}> {
  try {
    const submission: DiagnosisSubmission = {
      id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      farmerId,
      farmerName,
      diagnosis,
      imageData,
      submittedAt: new Date(),
      status: 'pending'
    };

    global.diagnosisSubmissions.push(submission);

    // Create notification
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'expert_1',
      userType: 'expert',
      type: 'new_submission',
      title: 'New Diagnosis Submission',
      message: `${farmerName} has submitted a diagnosis for expert review`,
      submissionId: submission.id,
      timestamp: new Date(),
      read: false
    };

    global.notifications.push(notification);

    return {
      success: true,
      submissionId: submission.id
    };
  } catch (error) {
    console.error('Failed to submit diagnosis for review:', error);
    return {
      success: false,
      error: 'Failed to submit diagnosis for expert review'
    };
  }
}

export async function getPendingDiagnoses(): Promise<DiagnosisSubmission[]> {
  return (global.diagnosisSubmissions || []);
}

export async function getAllDiagnoses(): Promise<DiagnosisSubmission[]> {
  return (global.diagnosisSubmissions || []);
}

export async function getNotifications(
  userId: string,
  userType: 'farmer' | 'expert'
): Promise<any[]> {
  return (global.notifications || [])
    .filter(n => n.userId === userId && n.userType === userType)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function sendMessage(
  submissionId: string,
  senderId: string,
  senderName: string,
  senderType: 'farmer' | 'expert',
  messageText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    global.messages = global.messages || [];
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submissionId,
      senderId,
      senderName,
      senderType,
      message: messageText,
      timestamp: new Date(),
      read: false
    };

    global.messages.push(message);

    // Create notification for recipient
    const submission = (global.diagnosisSubmissions || []).find(d => d.id === submissionId);
    const recipientId = senderType === 'expert' ? submission?.farmerId : 'expert_1';
    const recipientType = senderType === 'expert' ? 'farmer' : 'expert';
    
    // Don't create notifications for messages - they appear in Messages section
    // const notification = {
    //   id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    //   userId: recipientId,
    //   userType: recipientType,
    //   type: 'new_message',
    //   title: `New message from ${senderName}`,
    //   message: messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''),
    //   submissionId,
    //   timestamp: new Date(),
    //   read: false
    // };

    // global.notifications.push(notification);

    return { success: true };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getMessages(submissionId: string): Promise<any[]> {
  return (global.messages || [])
    .filter(m => m.submissionId === submissionId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function updateDiagnosisStatus(
  submissionId: string,
  status: 'approved' | 'rejected',
  expertFeedback?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const submission = (global.diagnosisSubmissions || []).find(d => d.id === submissionId);
    if (!submission) {
      return {
        success: false,
        error: 'Diagnosis submission not found'
      };
    }

    submission.status = status;
    submission.expertFeedback = expertFeedback;

    // Create notification for farmer
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: submission.farmerId,
      userType: 'farmer',
      type: 'status_update',
      title: `Diagnosis ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: expertFeedback || `Your diagnosis has been ${status} by an expert`,
      submissionId,
      timestamp: new Date(),
      read: false
    };

    global.notifications.push(notification);

    return { success: true };
  } catch (error) {
    console.error('Failed to update diagnosis status:', error);
    return {
      success: false,
      error: 'Failed to update diagnosis status'
    };
  }
}