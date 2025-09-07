import { ensureGoogleMapsAPI, isGoogleMapsAPIReady } from '~/utils/google-maps-loader';

interface ETAResult {
  duration: number; // in minutes
  distance: string;
  leaveByTime: string;
  canMakeIt: boolean;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Calculate ETA using Google Maps Distance Matrix API
export async function calculateETA(
  origin: Coordinates,
  destination: Coordinates,
  eventStartTime: Date,
  bufferMinutes: number = 10
): Promise<ETAResult | null> {
  try {
    // Ensure Google Maps API is loaded
    await ensureGoogleMapsAPI();

    // Double-check that the API is ready
    if (!isGoogleMapsAPIReady()) {
      console.error('Google Maps API not ready after loading attempt');
      return null;
    }

    const service = new google.maps.DistanceMatrixService();
    
    const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
      service.getDistanceMatrix({
        origins: [new google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          resolve(response);
        } else {
          console.error(`Distance Matrix API error: ${status}`);
          if (status === 'REQUEST_DENIED') {
            console.error('This usually indicates that the required Google Maps Platform APIs are not enabled for your API key.');
            console.error('Please enable the following APIs in Google Cloud Console:');
            console.error('1. Maps JavaScript API');
            console.error('2. Distance Matrix API');
          }
          reject(new Error(`Distance Matrix API error: ${status}`));
        }
      });
    });

    const element = result.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      return null;
    }

    const durationMinutes = Math.ceil(element.duration.value / 60);
    const now = new Date();
    const leaveBy = new Date(eventStartTime.getTime() - (durationMinutes + bufferMinutes) * 60 * 1000);
    const canMakeIt = now <= leaveBy;

    return {
      duration: durationMinutes,
      distance: element.distance.text,
      leaveByTime: leaveBy.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      canMakeIt,
    };
  } catch (error) {
    console.error('ETA calculation error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.message.includes('ApiNotActivatedMapError') || error.message.includes('REQUEST_DENIED')) {
        console.error('Google Maps API access denied. Please check:');
        console.error('1. API key is valid and not restricted');
        console.error('2. Maps JavaScript API is enabled');
        console.error('3. Distance Matrix API is enabled');
        console.error('4. Billing is set up in Google Cloud Console');
      }
    }
    return null;
  }
}

// Get user's current location
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

// Cache for campus center coordinates to prevent unnecessary re-renders
let cachedCampusCoords: Coordinates | null = null;

// Get fallback campus center coordinates
export function getCampusCenterCoords(): Coordinates {
  if (!cachedCampusCoords) {
    cachedCampusCoords = {
      lat: parseFloat(import.meta.env.VITE_DEFAULT_CAMPUS_CENTER_LAT || '34.0689'),
      lng: parseFloat(import.meta.env.VITE_DEFAULT_CAMPUS_CENTER_LNG || '-118.4452'),
    };
  }
  return cachedCampusCoords;
}
