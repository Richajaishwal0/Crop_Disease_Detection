'use server';

import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

export async function followUser(currentUserId: string, targetUserId: string) {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    const [currentUserDoc, targetUserDoc] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(targetUserRef)
    ]);
    
    const currentFollowing = currentUserDoc.data()?.following || [];
    const targetFollowers = targetUserDoc.data()?.followers || [];
    
    if (!currentFollowing.includes(targetUserId)) {
      currentFollowing.push(targetUserId);
    }
    if (!targetFollowers.includes(currentUserId)) {
      targetFollowers.push(currentUserId);
    }
    
    await Promise.all([
      updateDoc(currentUserRef, { following: currentFollowing }),
      updateDoc(targetUserRef, { followers: targetFollowers })
    ]);
    
    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: 'Failed to follow user' };
  }
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    const [currentUserDoc, targetUserDoc] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(targetUserRef)
    ]);
    
    const currentFollowing = (currentUserDoc.data()?.following || []).filter((id: string) => id !== targetUserId);
    const targetFollowers = (targetUserDoc.data()?.followers || []).filter((id: string) => id !== currentUserId);
    
    await Promise.all([
      updateDoc(currentUserRef, { following: currentFollowing }),
      updateDoc(targetUserRef, { followers: targetFollowers })
    ]);
    
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: 'Failed to unfollow user' };
  }
}
