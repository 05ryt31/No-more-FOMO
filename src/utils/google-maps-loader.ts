// Extend Window interface to include Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

// Global state to track loading
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Google Maps JavaScript API
 * @returns Promise that resolves when the API is ready
 */
export function loadGoogleMapsAPI(): Promise<void> {
  // If already loaded, resolve immediately
  if (isLoaded && window.google && window.google.maps) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise<void>((resolve, reject) => {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY environment variable.'));
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    
    // Handle successful load
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    // Handle load error
    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps JavaScript API'));
    };

    // Add script to document
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Check if Google Maps API is ready to use
 * @returns boolean indicating if the API is loaded and ready
 */
export function isGoogleMapsAPIReady(): boolean {
  return isLoaded && !!window.google && !!window.google.maps && !!window.google.maps.DistanceMatrixService;
}

/**
 * Wait for Google Maps API to be ready, loading it if necessary
 * @returns Promise that resolves when the API is ready to use
 */
export async function ensureGoogleMapsAPI(): Promise<void> {
  if (isGoogleMapsAPIReady()) {
    return;
  }
  
  await loadGoogleMapsAPI();
  
  // Double-check that everything is ready
  if (!isGoogleMapsAPIReady()) {
    throw new Error('Google Maps API failed to load properly');
  }
}
