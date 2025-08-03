
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

if (serviceAccountKey) {
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        adminDb = admin.firestore();
    } catch (error: any) {
        if (error instanceof SyntaxError) {
            console.error('FIREBASE_ADMIN_SDK_ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure the environment variable is a valid, single-line JSON string. The value should start with `{` and end with `}`.');
        } else {
            console.error('FIREBASE_ADMIN_SDK_ERROR: Error initializing Firebase Admin SDK:', error);
        }
        // Assign a dummy object in case of error to prevent subsequent crashes
        // This helps in debugging by not throwing immediate reference errors.
        adminDb = {} as admin.firestore.Firestore;
    }
} else {
  console.warn('FIREBASE_ADMIN_SDK_WARNING: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found. Server-side features like sharing will not work.');
  adminDb = {} as admin.firestore.Firestore;
}

export { clientApp, db, adminDb };
