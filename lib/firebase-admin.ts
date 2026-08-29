import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: any = null;
let adminDb: any = null;
let adminAuth: any = null;

export function initFirebaseAdmin() {
  if (adminApp && adminDb) {
    return { adminApp, adminDb, adminAuth };
  }

  try {
    if (getApps().length > 0) {
      adminApp = getApp();
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (privateKey) {
        privateKey = privateKey.trim();
        // Remove surrounding quotes if added in Vercel environment variables
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
          privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        // Normalize literal escaped \n to actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      if (clientEmail && privateKey && projectId) {
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else if (projectId) {
        // Fallback for Google Cloud environments with default credentials
        adminApp = initializeApp({ projectId });
      }
    }

    if (adminApp) {
      adminDb = getFirestore(adminApp);
      try {
        // Configure Firestore to automatically ignore undefined properties
        adminDb.settings({ ignoreUndefinedProperties: true });
      } catch (e) {
        // Settings may already have been configured
      }
      adminAuth = getAuth(adminApp);
    }
  } catch (err) {
    console.warn('[FirebaseAdmin] Initialization warning:', err);
  }

  return { adminApp, adminDb, adminAuth };
}

// Initial attempt
initFirebaseAdmin();

export { adminDb, adminAuth, adminApp };
export default adminApp;
