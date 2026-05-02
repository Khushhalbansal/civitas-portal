/**
 * @fileoverview Geolocation Service
 * Provides secure user location detection using the browser's Geolocation API.
 * Includes fallback mechanisms and detailed error handling for civic context.
 * @version 1.2.0
 */

/** Default coordinates for Jaipur */
const DEFAULT_LOC = { lat: 26.9124, lng: 75.7873, city: 'Jaipur' };

/**
 * Retrieves the user's current latitude and longitude.
 * Includes logic to handle permission denials and timeout scenarios with fallbacks.
 * 
 * @returns {Promise<{lat: number, lng: number, city: string}>} User coordinates.
 */
export const getUserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation unsupported, using fallback');
      resolve(DEFAULT_LOC);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: '' // City will be filled by reverse geocoding
        });
      },
      (error) => {
        console.error('[Geolocation Error]', error.message);
        resolve(DEFAULT_LOC); // Resolve with fallback instead of rejecting to keep app functional
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

/**
 * Reverse geocodes coordinates to a city name using OpenStreetMap Nominatim.
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} City name or 'Your Area' fallback.
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || 'Your Area';
  } catch (error) {
    console.error('[Reverse Geocode Error]', error);
    return 'Your Area';
  }
};

/**
 * Builds a Google Maps Embed URL for a given location.
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level (default 12)
 * @returns {string} The embed URL.
 */
export const buildGoogleMapsEmbedUrl = (lat, lng, zoom = 12) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return `https://www.google.com/maps/embed/v1/view?key=${API_KEY}&center=${lat},${lng}&zoom=${zoom}`;
};
