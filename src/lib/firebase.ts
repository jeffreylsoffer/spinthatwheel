
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "card-deck-wheel",
  appId: "1:357412366942:web:bbca4bc90ff0a6e91c62cf",
  storageBucket: "card-deck-wheel.firebasestorage.app",
  apiKey: "AIzaSyCMktHIfqjMeee5EM1JIi1dk5CzDQDmN1w",
  authDomain: "card-deck-wheel.firebaseapp.com",
  messagingSenderId: "357412366942",
};

// Robust singleton pattern for Firebase initialization.
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { app, db };
