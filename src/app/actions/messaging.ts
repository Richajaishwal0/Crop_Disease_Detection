'use server';

import { getAdminFirestore } from '@/firebase/admin';

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

    const recipientType = senderType === 'farmer' ? 'expert' : 'farmer';
    await db.collection('notifications').add({
      userId: recipientType === 'expert' ? 'expert_1' : senderId,
      userType: recipientType,
      type: 'new_message',
      title: `New message from ${senderName}`,
      message: messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''),
      submissionId,
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

    return snapshot.docs
      .map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || d.data().timestamp }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching messages:', error);
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

    return snapshot.docs
      .map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || d.data().timestamp }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('notifications').doc(notificationId).update({ read: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

export async function createSubmissionNotification(
  farmerId: string,
  farmerName: string,
  submissionId: string
): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('notifications').add({
      userId: 'expert_1',
      userType: 'expert',
      type: 'new_submission',
      title: 'New Diagnosis Submission',
      message: `${farmerName} has submitted a diagnosis for expert review`,
      submissionId,
      timestamp: new Date(),
      read: false,
    });
  } catch (error) {
    console.error('Failed to create submission notification:', error);
  }
}

export async function createStatusUpdateNotification(
  farmerId: string,
  submissionId: string,
  status: 'approved' | 'rejected',
  expertFeedback?: string
): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('notifications').add({
      userId: farmerId,
      userType: 'farmer',
      type: 'status_update',
      title: `Diagnosis ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: expertFeedback || `Your diagnosis has been ${status} by an expert`,
      submissionId,
      timestamp: new Date(),
      read: false,
    });
  } catch (error) {
    console.error('Failed to create status update notification:', error);
  }
}
