/**
 * @fileoverview Google Civic Information API Service
 * Handles integration with the Google Civic Info API to fetch representative 
 * and polling station data based on user address.
 * @version 1.0.1
 */

const CIVIC_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Reusing maps key as it usually has civic scope
const BASE_URL = 'https://www.googleapis.com/civicinfo/v2';

/**
 * Fetches voter information including representatives and polling locations.
 * 
 * @param {string} address - The user's residential address.
 * @returns {Promise<Object>} The raw civic data from Google.
 */
export const getVoterInfo = async (address) => {
  try {
    if (!CIVIC_API_KEY) {
      throw new Error('Civic API Key missing');
    }

    const response = await fetch(
      `${BASE_URL}/voterinfo?key=${CIVIC_API_KEY}&address=${encodeURIComponent(address)}`
    );

    if (!response.ok) {
      throw new Error(`Civic API returned status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Civic API Error]', error);
    // Return mock fallback for hackathon demonstration if API fails
    return {
      status: 'mock',
      pollingLocations: [
        { address: { locationName: 'Local Community Center (Fallback)', line1: '123 Civic Ave' } }
      ]
    };
  }
};
