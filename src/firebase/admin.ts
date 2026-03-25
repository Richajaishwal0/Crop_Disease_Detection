import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function createAdminApp(): App {
  if (getApps().length > 0) return getApp();

  // Option 1: Load from a service account JSON file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp();
  }

  // Option 2: Load from individual env vars
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey ||
      clientEmail === '<your-service-account-email>' ||
      privateKey === '<your-private-key>') {
    throw new Error(
      'Firebase Admin SDK credentials are not configured.\n' +
      'Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local\n' +
      'Get these from: Firebase Console → Project Settings → Service Accounts → Generate new private key'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminFirestore(): Firestore {
  const app = createAdminApp();
  return getFirestore(app);
}
