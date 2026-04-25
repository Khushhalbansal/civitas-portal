/**
 * Geolocation Service
 * Uses the browser's Geolocation API to detect the user's current position.
 * Falls back to a default location (Jaipur) if permission is denied or unavailable.
 *
 * @returns {Promise<{ lat: number, lng: number, city: string }>}
 */
export const getUserLocation = () => {
  return new Promise((resolve) => {
    // Default fallback: Jaipur, Rajasthan
    const fallback = { lat: 26.9124, lng: 75.7873, city: 'Jaipur' };

    if (!navigator.geolocation) {
      resolve(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: '' // City name will be resolved via reverse geocoding
        });
      },
      (error) => {
        // Permission denied or error — use fallback
        console.warn('[Geolocation] Denied or error:', error.message);
        resolve(fallback);
      },
      { timeout: 15000, maximumAge: 300000, enableHighAccuracy: false }
    );
  });
};

/**
 * Reverse geocodes coordinates to a city name using Google Maps Geocoding
 * via a free Nominatim endpoint (OpenStreetMap) as a fallback,
 * or extracts city from the Gemini civic response.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - City name
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
    );
    const data = await response.json();
    // Extract city from the response hierarchy
    return data.address?.city
      || data.address?.town
      || data.address?.village
      || data.address?.state_district
      || data.address?.state
      || 'Your Area';
  } catch {
    return 'Your Area';
  }
};

/**
 * Builds a Google Maps embed URL centered on the given coordinates.
 * Uses the no-API-key embed format.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} [zoom=14] - Zoom level
 * @returns {string} - Google Maps embed URL
 */
export const buildGoogleMapsEmbedUrl = (lat, lng, zoom = 14) => {
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
};
