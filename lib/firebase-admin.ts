import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: any = null;

try {
  if (getApps().length > 0) {
    adminApp = getApp();
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-ai-growth-hub';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (clientEmail && privateKey && projectId) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = initializeApp({
        projectId,
      });
    }
  }
} catch (err) {
  console.warn('[FirebaseAdmin] Initialization warning:', err);
}

export const adminDb: ReturnType<typeof getFirestore> = adminApp ? getFirestore(adminApp) : ({} as any);
export const adminAuth: ReturnType<typeof getAuth> = adminApp ? getAuth(adminApp) : ({} as any);
export default adminApp;

