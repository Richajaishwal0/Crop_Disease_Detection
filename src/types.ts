import { Timestamp } from "firebase/firestore";

export type UserProfile = {
    id: string;
    uid: string;
    displayName: string;
    username: string;
    email: string;
    photoURL?: string;
    createdAt: Timestamp;
    role: 'admin' | 'moderator' | 'farmer' | 'user' | 'expert';
    region: string;
    isVerified: boolean;
    followers?: string[];
    following?: string[];
    specialization?: string;
}
