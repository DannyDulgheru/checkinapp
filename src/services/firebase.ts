// Firebase Configuration and Initialization
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1yFmfq50p1O_ZNNnqhxtE7uo0P8HcRdw",
  authDomain: "smmaudit-55e97.firebaseapp.com",
  projectId: "smmaudit-55e97",
  storageBucket: "smmaudit-55e97.firebasestorage.app",
  messagingSenderId: "637886859945",
  appId: "1:637886859945:web:df2a4720acaea83fdbb7b8",
  measurementId: "G-T3CRWF51RF"
};

let db: Firestore | null = null;
let realtimeDb: Database | null = null;
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

  // Initialize Realtime Database
  // Note: Firebase automatically determines the correct database URL
  // For new projects: https://{projectId}-default-rtdb.{region}.firebasedatabase.app
  // For older projects: https://{projectId}.firebaseio.com
  try {
    realtimeDb = getDatabase(app);
    console.log('[Firebase] Realtime Database initialized');
  } catch (error) {
    console.error('[Firebase] Realtime Database initialization error:', error);
    console.error('[Firebase] ⚠️ Make sure Realtime Database is enabled in Firebase Console!');
    console.error('[Firebase] See FIREBASE_REALTIME_DATABASE_SETUP.md for instructions');
    realtimeDb = null;
  }

  // Initialize Auth
  auth = getAuth(app);

  // Initialize Analytics (only in browser environment)
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }

  firebaseInitialized = true;
  console.log('[Firebase] Initialized successfully');
  
  if (!realtimeDb) {
    console.warn('[Firebase] ⚠️ Realtime Database is not available. Please enable it in Firebase Console.');
  }
} catch (error) {
  console.error('[Firebase] Failed to initialize:', error);
  firebaseInitialized = false;
}

export { db, realtimeDb, auth, analytics, app, firebaseInitialized };
export default app;
