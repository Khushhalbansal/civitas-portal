import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";

/**
 * Firebase configuration — all keys loaded from environment variables
 * to prevent hardcoded credentials in the source code.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Analytics (Google Analytics 4)
// Uses isSupported() to gracefully handle environments without analytics (e.g., SSR, tests)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

/**
 * Logs a custom analytics event to Google Analytics 4 via Firebase.
 * Events are anonymized — no PII is ever attached.
 * @param {string} eventName - GA4 event name (e.g., 'eligibility_check', 'ai_chat_message')
 * @param {Object} [params={}] - Event parameters (must not contain PII)
 */
export const logAnalyticsEvent = (eventName, params = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};
