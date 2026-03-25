'use server';

import { getAdminFirestore } from '@/firebase/admin';
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

export async function clearAllExpertData(): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getAdminFirestore();

    const [submissionsSnap, notificationsSnap, messagesSnap] = await Promise.all([
      db.collection('diagnosisSubmissions').get(),
      db.collection('notifications').get(),
      db.collection('messages').get(),
    ]);

    const deletes = [
      ...submissionsSnap.docs.map(d => d.ref.delete()),
      ...notificationsSnap.docs.map(d => d.ref.delete()),
      ...messagesSnap.docs.map(d => d.ref.delete()),
    ];

    await Promise.all(deletes);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear expert data:', error);
    return { success: false, error: 'Failed to clear expert data' };
  }
}

export async function submitDiagnosisForReview(
  farmerId: string,
  farmerName: string,
  diagnosis: DiagnoseCropDiseaseOutput,
  imageData: string
): Promise<{ success: boolean; submissionId?: string; error?: string }> {
  try {
    const db = getAdminFirestore();

    const submission = {
      farmerId,
      farmerName,
      diagnosis,
      imageData,
      submittedAt: new Date(),
      status: 'pending' as const,
    };

    const docRef = await db.collection('diagnosisSubmissions').add(submission);

    await db.collection('notifications').add({
      userId: 'expert_1',
      userType: 'expert',
      type: 'new_submission',
      title: 'New Diagnosis Submission',
      message: `${farmerName} has submitted a diagnosis for expert review`,
      submissionId: docRef.id,
      timestamp: new Date(),
      read: false,
    });

    return { success: true, submissionId: docRef.id };
  } catch (error) {
    console.error('Failed to submit diagnosis for review:', error);
    return { success: false, error: 'Failed to submit diagnosis for expert review' };
  }
}

export async function getPendingDiagnoses(): Promise<any[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('diagnosisSubmissions').get();
    const diagnoses = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || data.submittedAt,
      };
    });
    return diagnoses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    return [];
  }
}

export async function getNotifications(userId: string, userType: 'farmer' | 'expert'): Promise<any[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('userType', '==', userType)
      .get();

    const notifications = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      };
    });
    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function sendMessage(
  submissionId: string,
  senderId: string,
  senderName: string,
  senderType: 'farmer' | 'expert',
  messageText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getAdminFirestore();
    await db.collection('messages').add({
      submissionId,
      senderId,
      senderName,
      senderType,
      message: messageText,
      timestamp: new Date(),
      read: false,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getMessages(submissionId: string): Promise<any[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('messages')
      .where('submissionId', '==', submissionId)
      .get();

    const messages = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      };
    });
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  try {
    const db = getAdminFirestore();
    await db.collection('notifications').doc(notificationId).update({ read: true });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(userId: string, userType: 'farmer' | 'expert'): Promise<{ success: boolean }> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('userType', '==', userType)
      .where('read', '==', false)
      .get();

    await Promise.all(snapshot.docs.map(d => d.ref.update({ read: true })));
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return { success: false };
  }
}

export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  try {
    const db = getAdminFirestore();
    await db.collection('notifications').doc(notificationId).delete();
    return { success: true };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return { success: false };
  }
}

export async function updateDiagnosisStatus(
  submissionId: string,
  status: 'approved' | 'rejected',
  expertFeedback?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getAdminFirestore();

    await db.collection('diagnosisSubmissions').doc(submissionId).update({
      status,
      expertFeedback: expertFeedback || '',
    });

    const submissions = await getPendingDiagnoses();
    const submission = submissions.find(s => s.id === submissionId);

    if (submission) {
      await db.collection('notifications').add({
        userId: submission.farmerId,
        userType: 'farmer',
        type: 'status_update',
        title: `Diagnosis ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: expertFeedback || `Your diagnosis has been ${status} by an expert`,
        submissionId,
        timestamp: new Date(),
        read: false,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update diagnosis status:', error);
    return { success: false, error: 'Failed to update diagnosis status' };
  }
}
