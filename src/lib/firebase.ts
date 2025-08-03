
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

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  // This check runs when the server starts. If the key is missing,
  // we log a warning but don't throw an error, allowing the app to run.
  // The API routes that depend on adminDb will fail gracefully if called.
  console.warn('FIREBASE_ADMIN_SDK_WARNING: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found. Server-side features like sharing will not work.');
  // Assign a dummy object to prevent crashes on import, but functions will fail.
  adminDb = {} as admin.firestore.Firestore;
} else {
    // Only initialize if not already initialized
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    adminDb = admin.firestore();
}


export { clientApp, db, adminDb };
