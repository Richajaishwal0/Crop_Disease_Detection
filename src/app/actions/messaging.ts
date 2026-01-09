'use server';

interface Message {
  id: string;
  submissionId: string;
  senderId: string;
  senderName: string;
  senderType: 'farmer' | 'expert';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Notification {
  id: string;
  userId: string;
  userType: 'farmer' | 'expert';
  type: 'new_submission' | 'expert_response' | 'status_update' | 'new_message';
  title: string;
  message: string;
  submissionId?: string;
  timestamp: Date;
  read: boolean;
}

// Persistent storage using localStorage (for demo)
const getStoredNotifications = (): Notification[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

const saveNotifications = (notifs: Notification[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('notifications', JSON.stringify(notifs));
  }
};

// Mock storage
let messages: Message[] = [];
let notifications: Notification[] = [];

export async function sendMessage(
  submissionId: string,
  senderId: string,
  senderName: string,
  senderType: 'farmer' | 'expert',
  messageText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submissionId,
      senderId,
      senderName,
      senderType,
      message: messageText,
      timestamp: new Date(),
      read: false
    };

    messages.push(message);

    // Create notification for recipient
    const recipientType = senderType === 'farmer' ? 'expert' : 'farmer';
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: recipientType === 'expert' ? 'expert_1' : senderId,
      userType: recipientType,
      type: 'new_message',
      title: `New message from ${senderName}`,
      message: messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''),
      submissionId,
      timestamp: new Date(),
      read: false
    };

    notifications.push(notification);

    return { success: true };
  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getMessages(submissionId: string): Promise<Message[]> {
  return messages
    .filter(m => m.submissionId === submissionId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export async function getNotifications(
  userId: string,
  userType: 'farmer' | 'expert'
): Promise<Notification[]> {
  notifications = getStoredNotifications();
  return notifications
    .filter(n => n.userId === userId && n.userType === userType)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
}

export async function createSubmissionNotification(
  farmerId: string,
  farmerName: string,
  submissionId: string
): Promise<void> {
  notifications = getStoredNotifications();
  
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: 'expert_1',
    userType: 'expert',
    type: 'new_submission',
    title: 'New Diagnosis Submission',
    message: `${farmerName} has submitted a diagnosis for expert review`,
    submissionId,
    timestamp: new Date(),
    read: false
  };

  notifications.push(notification);
  saveNotifications(notifications);
}

export async function createStatusUpdateNotification(
  farmerId: string,
  submissionId: string,
  status: 'approved' | 'rejected',
  expertFeedback?: string
): Promise<void> {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: farmerId,
    userType: 'farmer',
    type: 'status_update',
    title: `Diagnosis ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: expertFeedback || `Your diagnosis has been ${status} by an expert`,
    submissionId,
    timestamp: new Date(),
    read: false
  };

  notifications.push(notification);
}