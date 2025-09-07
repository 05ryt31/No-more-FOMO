import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Calendar, MapPin, Clock, Users, ExternalLink, Heart, UserCheck, Loader2 } from 'lucide-react';
import { calculateETA, getCurrentLocation, getCampusCenterCoords, formatDuration } from '~/utils/eta';
import { useUserStore } from '~/stores/user-store';

interface Event {
  id: string;
  title: string;
  description?: string | null;
  start: Date;
  end?: Date | null;
  location?: string | null;
  coordsLat?: number | null;
  coordsLng?: number | null;
  categories: string[];
  image?: string | null;
  popularity: number;
  userRegistrationStatus?: string | null;
}

interface EventCardProps {
  event: Event;
  onGoingClick?: (eventId: string) => void;
  onInterestedClick?: (eventId: string) => void;
  isRegisterLoading?: boolean;
  isCancelLoading?: boolean;
}

export function EventCard({ event, onGoingClick, onInterestedClick, isRegisterLoading = false, isCancelLoading = false }: EventCardProps) {
  const { isAuthenticated } = useUserStore();
  const [eta, setEta] = useState<{
    duration: number;
    leaveByTime: string;
    canMakeIt: boolean;
  } | null>(null);
  const [isLoadingEta, setIsLoadingEta] = useState(false);
  const [etaError, setEtaError] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Fetch user location once on component mount
  useEffect(() => {
    async function fetchLocation() {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch {
        // Fallback to campus center
        const fallbackLocation = getCampusCenterCoords();
        setUserLocation(fallbackLocation);
      }
    }

    fetchLocation();
  }, []); // Empty dependency array - runs only once on mount

  // Calculate ETA when we have both location and event coordinates
  useEffect(() => {
    async function fetchETA() {
      if (!event.coordsLat || !event.coordsLng || !userLocation) return;
      
      setIsLoadingEta(true);
      setEtaError(false);
      try {
        const etaResult = await calculateETA(
          userLocation,
          { lat: event.coordsLat, lng: event.coordsLng },
          new Date(event.start)
        );
        
        if (etaResult) {
          setEta({
            duration: etaResult.duration,
            leaveByTime: etaResult.leaveByTime,
            canMakeIt: etaResult.canMakeIt,
          });
        } else {
          setEtaError(true);
        }
      } catch (error) {
        console.error('ETA calculation failed:', error);
        setEtaError(true);
      } finally {
        setIsLoadingEta(false);
      }
    }

    fetchETA();
  }, [event.coordsLat, event.coordsLng, event.start, userLocation?.lat, userLocation?.lng]);

  const formatEventTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const generateCalendarLink = () => {
    const startUTC = new Date(event.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endUTC = event.end 
      ? new Date(event.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : new Date(new Date(event.start).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startUTC}/${endUTC}`,
      location: event.location || '',
      details: event.description || '',
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Event Image */}
      {event.image && (
        <Link to={`/event/${event.id}`} className="block">
          <div className="relative h-48 overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {eta && (
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                eta.canMakeIt 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
              }`}>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Walk {formatDuration(eta.duration)}
                </div>
                <div className="text-xs opacity-90">
                  Leave by {eta.leaveByTime}
                </div>
              </div>
            )}
            {isLoadingEta && event.coordsLat && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm bg-gray-500/90 text-white">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Calculating...
                </div>
              </div>
            )}
            {etaError && event.coordsLat && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm bg-orange-500/90 text-white">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ETA unavailable
                </div>
                <div className="text-xs opacity-90">
                  Maps API issue
                </div>
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="p-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-3">
          {event.categories.slice(0, 3).map((category) => (
            <span 
              key={category}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
            >
              {category}
            </span>
          ))}
          {event.categories.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
              +{event.categories.length - 3} more
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/event/${event.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
            {event.title}
          </h3>
        </Link>

        {/* Description */}
        {event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatEventTime(new Date(event.start))}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
              {event.coordsLat && event.coordsLng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${event.coordsLat},${event.coordsLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{event.popularity} interested</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onGoingClick?.(event.id)}
            disabled={!isAuthenticated || isRegisterLoading || isCancelLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
              !isAuthenticated
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : event.userRegistrationStatus === 'going'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${(isRegisterLoading || isCancelLoading) ? 'opacity-50' : ''}`}
            title={!isAuthenticated ? 'Please log in to register for events' : undefined}
          >
            {(isRegisterLoading || isCancelLoading) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            {isRegisterLoading || isCancelLoading
              ? 'Updating...'
              : !isAuthenticated 
              ? 'Login to Register'
              : event.userRegistrationStatus === 'going' 
              ? 'Cancel' 
              : 'Register'
            }
          </button>
          
          <button
            onClick={() => onInterestedClick?.(event.id)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Interested
          </button>
          
          <a
            href={generateCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            title="Add to Google Calendar"
          >
            <Calendar className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
