import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from './MapPin';
import { ensureGoogleMapsAPI } from '~/utils/google-maps-loader';
import { Search, Filter, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start: Date;
  end: Date | null;
  location: string | null;
  coordsLat: number;
  coordsLng: number;
  categories: string[];
  popularity: number;
  organizerId: string;
  universityId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MapProps {
  events: Event[];
  loading?: boolean;
  onEventClick?: (event: Event) => void;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
  centerOnUser?: boolean;
  onCenterComplete?: () => void;
}

export function Map({ 
  events, 
  loading = false, 
  onEventClick, 
  className = '', 
  userLocation = null,
  centerOnUser = false,
  onCenterComplete
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Initialize map
  useEffect(() => {
    async function initializeMap() {
      try {
        await ensureGoogleMapsAPI();
        
        if (!mapRef.current) return;

        // Default center (UCLA campus center from env)
        const defaultCenter = {
          lat: parseFloat(import.meta.env.VITE_DEFAULT_CAMPUS_CENTER_LAT || '34.0689'),
          lng: parseFloat(import.meta.env.VITE_DEFAULT_CAMPUS_CENTER_LNG || '-118.4452'),
        };

        const map = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 15,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeControl: false,
        });

        mapInstanceRef.current = map;
        setIsMapLoaded(true);
        setMapError(null);
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to load map');
        toast.error('Failed to load map. Please check your internet connection.');
      }
    }

    initializeMap();

    // Cleanup function
    return () => {
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setMap(null);
        userLocationMarkerRef.current = null;
      }
    };
  }, []);

  // Handle user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // Remove existing user location marker
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setMap(null);
      userLocationMarkerRef.current = null;
    }

    // Add user location marker if location is available
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
        },
      });

      userLocationMarkerRef.current = userMarker;
    }
  }, [userLocation, isMapLoaded]);

  // Handle centering on user location
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || !centerOnUser || !userLocation) return;

    mapInstanceRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    mapInstanceRef.current.setZoom(16);

    // Call completion callback if provided
    if (onCenterComplete) {
      onCenterComplete();
    }
  }, [centerOnUser, userLocation, isMapLoaded, onCenterComplete]);

  // Filter events based on search and categories
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategories = selectedCategories.length === 0 ||
      event.categories.some(cat => selectedCategories.includes(cat));
    
    return matchesSearch && matchesCategories && event.coordsLat && event.coordsLng;
  });

  // Update map bounds when filtered events change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || filteredEvents.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    filteredEvents.forEach(event => {
      if (event.coordsLat && event.coordsLng) {
        bounds.extend(new google.maps.LatLng(event.coordsLat, event.coordsLng));
        hasValidCoords = true;
      }
    });

    if (hasValidCoords && mapInstanceRef.current) {
      // Add some padding to the bounds
      mapInstanceRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level for single events
      let boundsListener: google.maps.MapsEventListener | null = null;
      
      try {
        boundsListener = google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
          try {
            if (mapInstanceRef.current && mapInstanceRef.current.getZoom && mapInstanceRef.current.getZoom() > 18) {
              mapInstanceRef.current.setZoom(16);
            }
          } catch (error) {
            console.debug('Error setting zoom level:', error);
          }
        });
      } catch (error) {
        console.debug('Error adding bounds listener:', error);
      }

      // Simple, defensive cleanup without complex timing mechanisms
      return () => {
        if (boundsListener) {
          try {
            // Just try to remove the listener without extensive DOM checks
            // Google Maps API should handle invalid listeners gracefully
            google.maps.event.removeListener(boundsListener);
          } catch (error) {
            // Ignore cleanup errors - they're expected during component unmounting
          }
          boundsListener = null;
        }
      };
    }
  }, [filteredEvents, isMapLoaded]);

  // Get unique categories from all events
  const availableCategories = Array.from(
    new Set(events.flatMap(event => event.categories))
  ).sort();

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (mapError) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-4">
          <MapPin className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Map unavailable</h3>
        <p className="text-gray-600 mb-4">{mapError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search and Filter Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events on map..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !selectedCategories.includes(e.target.value)) {
                      setSelectedCategories(prev => [...prev, e.target.value]);
                    }
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Add Category Filter</option>
                  {availableCategories
                    .filter(category => !selectedCategories.includes(category))
                    .map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Event Count */}
          <div className="text-sm text-gray-600 flex items-center whitespace-nowrap">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <span>{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Selected Categories */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCategories.map(category => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {category}
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setSelectedCategories([])}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
        {!isMapLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Event Pins */}
      {isMapLoaded && mapInstanceRef.current && filteredEvents.map(event => (
        <MapPin
          key={event.id}
          event={event}
          map={mapInstanceRef.current}
          onPinClick={onEventClick}
        />
      ))}
    </div>
  );
}
