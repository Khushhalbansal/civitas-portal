import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

/**
 * Firebase configuration — environment variables loaded via Vite's import.meta.env.
 * Keys are restricted by domain in the Firebase Console.
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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firebase Authentication — supports Anonymous + Google sign-in
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firebase Cloud Firestore — NoSQL document database for interaction telemetry
export const db = getFirestore(app);

// Firebase Cloud Storage — for secure document uploads (Zero-PII)
export const storage = getStorage(app);

// Firebase Performance Monitoring — auto-tracks page load, network latency, and custom traces
let perf = null;
try {
  perf = getPerformance(app);
} catch (e) {
  console.warn('[Firebase Performance] Initialization skipped:', e.message);
}
export { perf };

// Firebase Analytics (Google Analytics 4) — initialized asynchronously
let analytics = null;

/**
 * Initializes Firebase Analytics if the browser supports it.
 * @returns {Promise<import("firebase/analytics").Analytics|null>}
 */
export const initAnalytics = async () => {
  if (analytics) return analytics;
  const supported = await isSupported();
  if (supported) {
    analytics = getAnalytics(app);
  }
  return analytics;
};

// Auto-initialize analytics on module load
initAnalytics();

/**
 * Logs a custom event to Google Analytics 4. Zero-PII by design.
 * @param {string} eventName - e.g., 'eligibility_check', 'page_view'
 * @param {Object} [params={}] - Event parameters (must never contain PII)
 */
export const logAnalyticsEvent = (eventName, params = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

/**
 * Tracks a page/screen view in GA4.
 * @param {string} pagePath - The route path, e.g., '/chat'
 * @param {string} pageTitle - Human-readable title, e.g., 'AI Chat'
 */
export const logPageView = (pagePath, pageTitle) => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

/**
 * Signs the user in anonymously via Firebase Auth.
 * @returns {Promise<import("firebase/auth").UserCredential|null>}
 */
export const signInAnon = async () => {
  try {
    const cred = await signInAnonymously(auth);
    return cred;
  } catch (error) {
    console.warn('[Firebase Auth] Anonymous sign-in failed:', error.code);
    return null;
  }
};
