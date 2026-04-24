import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Saves anonymized user interaction data for analytics.
 * No PII (Personally Identifiable Information) is stored.
 * 
 * @param {string} interactionType - e.g., 'ELIGIBILITY_CHECK', 'FAQ_VIEWED'
 * @param {object} metadata - e.g., { language: 'hi', location: 'Delhi', ageGroup: '18-24' }
 */
export const saveAnonymizedInteraction = async (interactionType, metadata = {}) => {
  try {
    const interactionsRef = collection(db, 'anonymized_interactions');
    await addDoc(interactionsRef, {
      type: interactionType,
      metadata: metadata,
      timestamp: serverTimestamp(),
      // Adding a generic identifier instead of User ID to maintain privacy
      sessionType: 'anonymous' 
    });
    console.log(`Interaction logged: ${interactionType}`);
  } catch (error) {
    console.error("Error saving interaction to Firestore:", error);
  }
};
