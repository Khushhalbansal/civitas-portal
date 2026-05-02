/**
 * Local Knowledge Base for Electoral Processes
 * Acts as a resilient fallback when the Gemini AI API is unavailable.
 * Contains non-partisan, factual information about Indian elections.
 */
export const localCivicKnowledge = {
  "eligibility": "To be eligible to vote in India, you must be a citizen of India, 18 years or older on the qualifying date (typically January 1st of the year of registration), and a resident in the polling area where you want to be registered.",
  "documents": "Accepted documents for voter registration include: Aadhaar Card, PAN Card, Driving License, Indian Passport, or Bank/Post Office Passbook with photograph.",
  "process": "The voting process involves: 1. Checking your name in the voter list, 2. Presenting ID at the polling station, 3. Getting your finger inked, 4. Casting your vote on the EVM/VVPAT machine.",
  "epic": "EPIC stands for Election Photo Identity Card. It is a secure document issued by the Election Commission of India to all eligible voters.",
  "nri": "Overseas (NRI) voters can register by filing Form 6A online or at the nearest Indian Mission. They must be present at the polling station in India to cast their vote.",
  "default": "I'm currently operating in offline mode. I can help with basic questions about voter eligibility, required documents, and the voting process. For complex queries, please check back when the connection is restored."
};

/**
 * Searches the local knowledge base for a relevant answer.
 * @param {string} query - The user's question.
 * @returns {string} - The most relevant local answer or a default fallback.
 */
export const getLocalFallbackAnswer = (query) => {
  const q = query.toLowerCase();
  if (q.includes('eligible') || q.includes('age') || q.includes('qualify')) return localCivicKnowledge.eligibility;
  if (q.includes('document') || q.includes('id') || q.includes('proof')) return localCivicKnowledge.documents;
  if (q.includes('process') || q.includes('step') || q.includes('how')) return localCivicKnowledge.process;
  if (q.includes('epic') || q.includes('voter id card')) return localCivicKnowledge.epic;
  if (q.includes('nri') || q.includes('overseas')) return localCivicKnowledge.nri;
  return localCivicKnowledge.default;
};
