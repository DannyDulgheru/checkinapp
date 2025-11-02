// Firebase Configuration and Initialization
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTauUhNkURS_IqyFqpSD-3tcipjP2FH-w",
  authDomain: "dandulgheru-e5fcc.firebaseapp.com",
  projectId: "dandulgheru-e5fcc",
  storageBucket: "dandulgheru-e5fcc.firebasestorage.app",
  messagingSenderId: "1088387489759",
  appId: "1:1088387489759:web:76f2473dc96820a9b62e6a",
  measurementId: "G-R2CEV3NQ2Q"
};

let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;
let app: FirebaseApp | null = null;
let firebaseInitialized = false;

// Initialize Firebase
try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firestore
  db = getFirestore(app);

  // Initialize Auth
  auth = getAuth(app);

  // Initialize Analytics (only in browser environment)
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }

  firebaseInitialized = true;
  console.log('[Firebase] Initialized successfully');
} catch (error) {
  console.error('[Firebase] Failed to initialize:', error);
  firebaseInitialized = false;
}

export { db, auth, analytics, app, firebaseInitialized };
export default app;
