
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import admin from 'firebase-admin';

// Client-side Firebase configuration
const clientFirebaseConfig: FirebaseOptions = {
  projectId: "card-deck-wheel",
  appId: "1:357412366942:web:bbca4bc90ff0a6e91c62cf",
  storageBucket: "card-deck-wheel.firebasestorage.app",
  apiKey: "AIzaSyCMktHIfqjMeee5EM1JIi1dk5CzDQDmN1w",
  authDomain: "card-deck-wheel.firebaseapp.com",
  messagingSenderId: "357412366942",
};

// Initialize Client-side App
const clientApp = getApps().length ? getApp() : initializeApp(clientFirebaseConfig);
const db = getFirestore(clientApp);

// --- Admin SDK Initialization (Server-side only) ---
let adminDb: admin.firestore.Firestore;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('Firebase service account key environment variable not found.');
  }

  const serviceAccount = JSON.parse(serviceAccountKey);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  adminDb = admin.firestore();

} catch (error) {
  console.error("Firebase Admin SDK initialization error:", (error as Error).message);
  // Set adminDb to a mock/dummy object in case of failure
  // This prevents the app from crashing on import if the admin SDK fails to initialize.
  // API routes that depend on it will fail gracefully.
  adminDb = {} as admin.firestore.Firestore;
}


export { clientApp, db, adminDb };
