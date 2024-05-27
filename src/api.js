const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://solar.googleapis.com/v1'; 

/**
 * Fetch solar data for a given location (latitude and longitude).
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<object>} - A promise that resolves to the solar data.
 */
export async function getSolarData(latitude, longitude) {
  const url = `${BASE_URL}/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&requiredQuality=HIGH&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching solar data: ${response.statusText}`);
    }

    const {solarPotential} = await response.json();

    const solarData = {
      solarPotential
    };

    return solarData;

  } catch (error) {
    console.error('Error fetching solar data:', error);
    throw error;
  }
}
