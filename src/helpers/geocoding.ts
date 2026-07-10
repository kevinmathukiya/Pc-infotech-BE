import { logger } from '../logger';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export const geocodeAddress = async (
  address: string,
  city: string,
  state: string,
  pincode: string
): Promise<GeocodeResult> => {
  try {
    const query = encodeURIComponent(`${address}, ${city}, ${state}, ${pincode}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PC-Infotech-Backend-Geocoding/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim HTTP error! status: ${response.status}`);
    }

    const data: any = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      logger.info(`🗺️ Geocoding successful: ${lat}, ${lon}`);
      return { latitude: lat, longitude: lon };
    }

    // Try a broader search with just city, state, pincode if the full address is too specific
    const broadQuery = encodeURIComponent(`${city}, ${state}, ${pincode}`);
    const broadUrl = `https://nominatim.openstreetmap.org/search?q=${broadQuery}&format=json&limit=1`;
    const broadResponse = await fetch(broadUrl, {
      headers: {
        'User-Agent': 'PC-Infotech-Backend-Geocoding/1.0',
      },
    });

    if (broadResponse.ok) {
      const broadData: any = await broadResponse.json();
      if (Array.isArray(broadData) && broadData.length > 0) {
        const lat = parseFloat(broadData[0].lat);
        const lon = parseFloat(broadData[0].lon);
        logger.info(`🗺️ Geocoding (broad search) successful: ${lat}, ${lon}`);
        return { latitude: lat, longitude: lon };
      }
    }

    // Return default coordinate fallbacks based on target cities to prevent database failure
    logger.warn(`🗺️ Geocoding returned no results for: ${address}, ${city}. Using default city fallbacks.`);
    return getCityFallback(city);
  } catch (error) {
    logger.error('❌ Geocoding API Error:', error);
    return getCityFallback(city);
  }
};

const getCityFallback = (city: string): GeocodeResult => {
  const normCity = city.toLowerCase().trim();
  if (normCity.includes('surat')) {
    return { latitude: 21.1702, longitude: 72.8311 };
  }
  if (normCity.includes('ahmedabad')) {
    return { latitude: 23.0225, longitude: 72.5714 };
  }
  if (normCity.includes('mumbai')) {
    return { latitude: 19.0760, longitude: 72.8777 };
  }
  if (normCity.includes('pune')) {
    return { latitude: 18.5204, longitude: 73.8567 };
  }
  // Generic India centroid fallback
  return { latitude: 20.5937, longitude: 78.9629 };
};
