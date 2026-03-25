'use server';

import { getAdminFirestore } from '@/firebase/admin';

export async function followUser(currentUserId: string, targetUserId: string) {
  try {
    const db = getAdminFirestore();
    const [currentUserDoc, targetUserDoc] = await Promise.all([
      db.collection('users').doc(currentUserId).get(),
      db.collection('users').doc(targetUserId).get(),
    ]);

    const currentFollowing: string[] = currentUserDoc.data()?.following || [];
    const targetFollowers: string[] = targetUserDoc.data()?.followers || [];

    if (!currentFollowing.includes(targetUserId)) currentFollowing.push(targetUserId);
    if (!targetFollowers.includes(currentUserId)) targetFollowers.push(currentUserId);

    await Promise.all([
      db.collection('users').doc(currentUserId).update({ following: currentFollowing }),
      db.collection('users').doc(targetUserId).update({ followers: targetFollowers }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: 'Failed to follow user' };
  }
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
  try {
    const db = getAdminFirestore();
    const [currentUserDoc, targetUserDoc] = await Promise.all([
      db.collection('users').doc(currentUserId).get(),
      db.collection('users').doc(targetUserId).get(),
    ]);

    const currentFollowing = (currentUserDoc.data()?.following || []).filter((id: string) => id !== targetUserId);
    const targetFollowers = (targetUserDoc.data()?.followers || []).filter((id: string) => id !== currentUserId);

    await Promise.all([
      db.collection('users').doc(currentUserId).update({ following: currentFollowing }),
      db.collection('users').doc(targetUserId).update({ followers: targetFollowers }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: 'Failed to unfollow user' };
  }
}
