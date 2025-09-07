import React, { useEffect, useRef } from 'react';
import { MapPin as MapPinIcon, Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';

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

interface MapPinProps {
  event: Event;
  map: google.maps.Map;
  onPinClick?: (event: Event) => void;
}

export function MapPin({ event, map, onPinClick }: MapPinProps) {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    // Reset mounted state when effect runs (component mounts or dependencies change)
    mountedRef.current = true;
    
    if (!event.coordsLat || !event.coordsLng) return;

    // Create marker
    const marker = new google.maps.Marker({
      position: { lat: event.coordsLat, lng: event.coordsLng },
      map: map,
      title: event.title,
      animation: google.maps.Animation.DROP,
    });

    markerRef.current = marker;

    // Create info window content
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    };

    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    };

    const infoContent = `
      <div class="max-w-sm p-4">
        <h3 class="font-semibold text-lg text-gray-900 mb-2">${event.title}</h3>
        
        <div class="space-y-2 mb-3">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
            </svg>
            <span>${formatDate(event.start)}</span>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
            <span>${formatTime(event.start)}${event.end ? ` - ${formatTime(event.end)}` : ''}</span>
          </div>
          
          ${event.location ? `
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <span>${event.location}</span>
            </div>
          ` : ''}
        </div>

        ${event.description ? `
          <p class="text-sm text-gray-700 mb-3 line-clamp-3">${event.description}</p>
        ` : ''}

        ${event.categories.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-3">
            ${event.categories.slice(0, 3).map(category => `
              <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                ${category}
              </span>
            `).join('')}
            ${event.categories.length > 3 ? `
              <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                +${event.categories.length - 3} more
              </span>
            ` : ''}
          </div>
        ` : ''}

        <div class="flex gap-2">
          <a href="/event/${event.id}" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors">
            View Details
          </a>
          ${event.location ? `
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}" target="_blank" rel="noopener noreferrer" class="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z"></path>
              </svg>
            </a>
          ` : ''}
        </div>
      </div>
    `;

    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
      maxWidth: 350,
    });

    infoWindowRef.current = infoWindow;

    // Add click listener
    const clickListener = marker.addListener('click', () => {
      // Close any other open info windows by creating a new one
      infoWindow.open({
        map: map,
        anchor: marker,
      });
      
      if (onPinClick) {
        onPinClick(event);
      }
    });

    // Simplified cleanup function to prevent DOM manipulation conflicts
    return () => {
      // Mark component as unmounting immediately
      mountedRef.current = false;
      
      // Store references locally before clearing them
      const currentMarker = markerRef.current;
      const currentInfoWindow = infoWindowRef.current;
      
      // Clear refs immediately to prevent double cleanup
      markerRef.current = null;
      infoWindowRef.current = null;
      
      // Simple cleanup without complex timing mechanisms
      try {
        // Remove click listener first if it exists
        if (clickListener) {
          google.maps.event.removeListener(clickListener);
        }
        
        // Close info window before marker cleanup
        if (currentInfoWindow && typeof currentInfoWindow.close === 'function') {
          currentInfoWindow.close();
        }
        
        // Remove marker from map
        if (currentMarker && typeof currentMarker.setMap === 'function') {
          currentMarker.setMap(null);
        }
      } catch (error) {
        // Ignore cleanup errors - they're expected during component unmounting
        // when DOM elements may have already been removed by React
      }
    };
  }, [event, map, onPinClick]);

  // This component doesn't render anything directly - it manages Google Maps objects
  return null;
}
