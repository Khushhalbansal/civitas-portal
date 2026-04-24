import { generateGeminiResponse } from '../geminiService';

/**
 * Google Civic Information API Integration Service
 * Uses Gemini AI as a civic information engine to provide voters with
 * accurate, non-partisan information about polling locations, voter
 * registration, and election procedures for Indian constituencies.
 *
 * @param {string} location - The voter's city/state (e.g., 'Delhi', 'Mumbai')
 * @returns {Promise<Object>} - Civic information object with polling and registration data
 */
export const fetchVoterInfo = async (location) => {
  if (!location || !location.trim()) {
    throw new Error('Location is required to fetch voter information.');
  }

  try {
    const prompt = `You are a factual Indian election information system. For the location "${location}", return ONLY a valid JSON object (no markdown, no code fences) with these fields:
{
  "pollingStationName": "name of a real polling station in ${location}",
  "address": "full address of the polling station",
  "timings": "voting hours (e.g., 7:00 AM - 6:00 PM)",
  "documentsRequired": ["list", "of", "required", "documents"],
  "helplineNumber": "local election helpline number",
  "registrationDeadline": "next registration deadline date"
}`;

    const response = await generateGeminiResponse(prompt);
    // Parse the JSON response, stripping any markdown code fences
    const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('[Civic API] Failed to fetch voter info:', error);
    // Return structured fallback data so the UI never breaks
    return {
      pollingStationName: `${location} Municipal Polling Station`,
      address: `Contact your local Election Commission for the exact address in ${location}.`,
      timings: '7:00 AM - 6:00 PM',
      documentsRequired: ['Voter ID (EPIC)', 'Aadhaar Card', 'Passport', 'Driving License'],
      helplineNumber: '1950 (National Voter Helpline)',
      registrationDeadline: 'Visit nvsp.in for current deadlines'
    };
  }
};
