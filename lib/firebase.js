import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgsoiAB4MKc6ShlW3wJ45o7RTjAYI6e-8",
  authDomain: "qrams-df915.firebaseapp.com",
  databaseURL: "https://qrams-df915-default-rtdb.firebaseio.com",
  projectId: "qrams-df915",
  storageBucket: "qrams-df915.firebasestorage.app",
  messagingSenderId: "368409110202",
  appId: "1:368409110202:web:2610c0635abf5db2a30483",
  measurementId: "G-QBHQLVG4T0"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
