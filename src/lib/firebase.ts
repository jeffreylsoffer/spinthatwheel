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
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminDb = admin.firestore();

export { clientApp, db, adminDb };