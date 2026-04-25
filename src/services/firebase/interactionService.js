import { collection, addDoc, getCountFromServer, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Saves anonymized user interaction data to Firestore.
 * Zero-PII: No personally identifiable information is stored.
 *
 * @param {string} interactionType - e.g., 'ELIGIBILITY_CHECK', 'AI_CHAT'
 * @param {object} metadata - e.g., { result: 'Eligible' }
 */
export const saveAnonymizedInteraction = async (interactionType, metadata = {}) => {
  try {
    const interactionsRef = collection(db, 'anonymized_interactions');
    await addDoc(interactionsRef, {
      type: interactionType,
      metadata: metadata,
      timestamp: serverTimestamp(),
      sessionType: 'anonymous'
    });
  } catch (error) {
    console.error('[Firestore] Error saving interaction:', error);
  }
};

/**
 * Reads the total count of anonymized interactions from Firestore.
 * Uses getCountFromServer for efficiency (does not download documents).
 * This demonstrates active Firestore READ operations.
 *
 * @returns {Promise<number>} The total interaction count.
 */
export const getInteractionCount = async () => {
  try {
    const interactionsRef = collection(db, 'anonymized_interactions');
    const snapshot = await getCountFromServer(interactionsRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('[Firestore] Error reading interaction count:', error);
    return 0;
  }
};
