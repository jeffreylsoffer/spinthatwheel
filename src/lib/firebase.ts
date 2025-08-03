
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "card-deck-wheel",
  appId: "1:357412366942:web:bbca4bc90ff0a6e91c62cf",
  storageBucket: "card-deck-wheel.firebasestorage.app",
  apiKey: "AIzaSyCMktHIfqjMeee5EM1JIi1dk5CzDQDmN1w",
  authDomain: "card-deck-wheel.firebaseapp.com",
  messagingSenderId: "357412366942",
};

// This robust singleton pattern ensures Firebase is initialized only once,
// whether on the client or in a serverless function environment.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
