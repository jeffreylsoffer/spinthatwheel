
import admin from 'firebase-admin';

// --- Admin SDK Initialization (Server-side only) ---
let adminDb: admin.firestore.Firestore;

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (process.env.NODE_ENV !== 'development' || !admin.apps.length) {
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized.');
      adminDb = admin.firestore();
    } catch (e: any) {
      console.error('Firebase Admin SDK initialization error:', e);
      throw new Error('Could not initialize Firebase Admin SDK. FIREBASE_SERVICE_ACCOUNT_KEY may be misconfigured.');
    }
  } else {
    console.warn('FIREBASE_ADMIN_SDK_WARNING: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found. Server-side features like sharing will not work.');
    // In a development environment without the key, we can use a mock/dummy object
    // to prevent crashes, but in production this should be a hard error.
    if (process.env.NODE_ENV === 'production') {
       throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in production environment.');
    }
    adminDb = {} as admin.firestore.Firestore;
  }
} else {
  adminDb = admin.firestore();
}


export { adminDb };
