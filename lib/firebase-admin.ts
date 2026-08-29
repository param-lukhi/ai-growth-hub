let adminApp: any = null;
let adminDb: any = null;
let adminAuth: any = null;
let _initialized = false;

export function initFirebaseAdmin() {
  // Already initialized — return cached instances
  if (_initialized) {
    return { adminApp, adminDb, adminAuth };
  }
  _initialized = true;

  try {
    const {
      initializeApp,
      getApps,
      getApp,
      cert
    } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const { getAuth } = require('firebase-admin/auth');

    if (getApps().length > 0) {
      adminApp = getApp();
    } else {
      const projectId =
        process.env.FIREBASE_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (privateKey) {
        privateKey = privateKey.trim();
        // Remove surrounding quotes added by some env editors
        if (
          (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
          (privateKey.startsWith("'") && privateKey.endsWith("'"))
        ) {
          privateKey = privateKey.substring(1, privateKey.length - 1);
        }
        // Normalize escaped newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      if (clientEmail && privateKey && projectId) {
        adminApp = initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });
      } else if (projectId) {
        adminApp = initializeApp({ projectId });
      }
      // If no credentials at all — adminApp stays null, in-memory fallback used
    }

    if (adminApp) {
      adminDb = getFirestore(adminApp);
      try {
        adminDb.settings({ ignoreUndefinedProperties: true });
      } catch {
        // Settings may already have been configured on this instance
      }
      adminAuth = getAuth(adminApp);
    }
  } catch (err) {
    // Non-fatal — in-memory db fallback will be used instead
    console.warn('[FirebaseAdmin] Initialization warning (using in-memory fallback):', err);
    adminApp = null;
    adminDb = null;
    adminAuth = null;
  }

  return { adminApp, adminDb, adminAuth };
}

export { adminDb, adminAuth, adminApp };
export default adminApp;
