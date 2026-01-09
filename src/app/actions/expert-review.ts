'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
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

const { firestore } = initializeFirebase();

export async function clearAllExpertData(): Promise<{ success: boolean; error?: string }> {
  try {
    // Clear diagnosis submissions
    const submissionsSnapshot = await getDocs(collection(firestore, 'diagnosisSubmissions'));
    const submissionDeletes = submissionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    // Clear notifications
    const notificationsSnapshot = await getDocs(collection(firestore, 'notifications'));
    const notificationDeletes = notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    // Clear messages
    const messagesSnapshot = await getDocs(collection(firestore, 'messages'));
    const messageDeletes = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    await Promise.all([...submissionDeletes, ...notificationDeletes, ...messageDeletes]);
    
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
): Promise<{
  success: boolean;
  submissionId?: string;
  error?: string;
}> {
  try {
    const submission = {
      farmerId,
      farmerName,
      diagnosis,
      imageData,
      submittedAt: new Date(),
      status: 'pending' as const
    };

    const docRef = await addDoc(collection(firestore, 'diagnosisSubmissions'), submission);

    // Create notification
    await addDoc(collection(firestore, 'notifications'), {
      userId: 'expert_1',
      userType: 'expert',
      type: 'new_submission',
      title: 'New Diagnosis Submission',
      message: `${farmerName} has submitted a diagnosis for expert review`,
      submissionId: docRef.id,
      timestamp: new Date(),
      read: false
    });

    return {
      success: true,
      submissionId: docRef.id
    };
  } catch (error) {
    console.error('Failed to submit diagnosis for review:', error);
    return {
      success: false,
      error: 'Failed to submit diagnosis for expert review'
    };
  }
}

export async function getPendingDiagnoses(): Promise<any[]> {
  try {
    // Simple query without orderBy to avoid index requirement
    const snapshot = await getDocs(collection(firestore, 'diagnosisSubmissions'));
    const diagnoses = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || data.submittedAt
      };
    });
    // Sort in memory instead
    return diagnoses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    return [];
  }
}

export async function getNotifications(
  userId: string,
  userType: 'farmer' | 'expert'
): Promise<any[]> {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(firestore, 'notifications'),
      where('userId', '==', userId),
      where('userType', '==', userType)
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      };
    });
    // Sort in memory instead
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
    await addDoc(collection(firestore, 'messages'), {
      submissionId,
      senderId,
      senderName,
      senderType,
      message: messageText,
      timestamp: new Date(),
      read: false
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getMessages(submissionId: string): Promise<any[]> {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(firestore, 'messages'),
      where('submissionId', '==', submissionId)
    );
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      };
    });
    // Sort in memory instead
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  try {
    const notificationRef = doc(firestore, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(userId: string, userType: 'farmer' | 'expert'): Promise<{ success: boolean }> {
  try {
    const q = query(
      collection(firestore, 'notifications'),
      where('userId', '==', userId),
      where('userType', '==', userType),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(doc => updateDoc(doc.ref, { read: true }));
    await Promise.all(updates);
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return { success: false };
  }
}

export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  try {
    await deleteDoc(doc(firestore, 'notifications', notificationId));
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
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const submissionRef = doc(firestore, 'diagnosisSubmissions', submissionId);
    await updateDoc(submissionRef, {
      status,
      expertFeedback: expertFeedback || ''
    });

    // Get submission to create notification
    const submissions = await getPendingDiagnoses();
    const submission = submissions.find(s => s.id === submissionId);
    
    if (submission) {
      await addDoc(collection(firestore, 'notifications'), {
        userId: submission.farmerId,
        userType: 'farmer',
        type: 'status_update',
        title: `Diagnosis ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: expertFeedback || `Your diagnosis has been ${status} by an expert`,
        submissionId,
        timestamp: new Date(),
        read: false
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update diagnosis status:', error);
    return {
      success: false,
      error: 'Failed to update diagnosis status'
    };
  }
}