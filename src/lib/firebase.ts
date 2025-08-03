
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import admin from 'firebase-admin';

// Client-side Firebase configuration, now read from environment variables
const clientFirebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Client-side App
const clientApp = getApps().length ? getApp() : initializeApp(clientFirebaseConfig);
const db = getFirestore(clientApp);

// --- Admin SDK Initialization (Server-side only) ---
let adminDb: admin.firestore.Firestore;

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      adminDb = admin.firestore();
    } catch (e: any) {
      console.error('Firebase Admin SDK initialization error:', e);
      throw new Error('Could not initialize Firebase Admin SDK. FIREBASE_SERVICE_ACCOUNT_KEY may be misconfigured.');
    }
  } else {
    console.warn('FIREBASE_ADMIN_SDK_WARNING: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found. Server-side features like sharing will not work.');
    adminDb = {} as admin.firestore.Firestore; // Assign dummy object
  }
} else {
  adminDb = admin.firestore();
}


export { clientApp, db, adminDb };
