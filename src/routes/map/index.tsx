import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React from 'react';
import { ArrowLeft, List, Settings, Plus, Crosshair, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';
import { Map } from '~/components/Map';
import { getCurrentLocation } from '~/utils/eta';
import toast from 'react-hot-toast';

export const Route = createFileRoute("/map/")({
  component: MapView,
});

function MapView() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { selectedUniversityId, interests } = useUserStore();

  // Location states
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [centerOnUser, setCenterOnUser] = React.useState(false);

  // Fetch events data
  const eventsQuery = useQuery(trpc.getEvents.queryOptions({
    universityId: selectedUniversityId || 'ucla',
    interests: interests.length > 0 ? interests : undefined,
    timeFilter: 'all', // Show all upcoming events on the map
    limit: 100, // Show more events on map view
  }));

  const defaultUniversityQuery = useQuery(trpc.getDefaultUniversity.queryOptions());

  const selectedUniversityQuery = useQuery(trpc.getUniversityById.queryOptions({
    id: selectedUniversityId || 'ucla',
  }));

  const handleEventClick = (event: any) => {
    // Optional: could show a toast or navigate to event details
    toast.success(`Viewing ${event.title}`);
  };

  const handleBackToFeed = () => {
    navigate({ to: '/' });
  };

  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setCenterOnUser(true);
      toast.success('Location found!');
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Handle geolocation errors
      if (error && typeof error === 'object' && 'code' in error) {
        const geoError = error as { code: number; message: string };
        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case 2: // POSITION_UNAVAILABLE
            toast.error('Location information unavailable.');
            break;
          case 3: // TIMEOUT
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An error occurred while getting your location.');
            break;
        }
      } else if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          toast.error('Location services are not supported by your browser.');
        } else {
          toast.error('An error occurred while getting your location.');
        }
      } else {
        toast.error('Location services are not available.');
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleCenterComplete = () => {
    setCenterOnUser(false);
  };

  if (defaultUniversityQuery.isLoading || selectedUniversityQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Campus Compass...</p>
        </div>
      </div>
    );
  }

  // Convert event dates to Date objects
  const eventsWithDates = eventsQuery.data?.map(event => ({
    ...event,
    start: new Date(event.start),
    end: event.end ? new Date(event.end) : null,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToFeed}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                title="Back to feed"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Event Map</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{selectedUniversityQuery.data?.name || defaultUniversityQuery.data?.name || 'UCLA'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Find my location"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Crosshair className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Locate Me</span>
              </button>
              <Link 
                to="/" 
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                title="List view"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List View</span>
              </Link>
              <Link 
                to="/post" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post Event</span>
              </Link>
              <Link 
                to="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-full">
          <Map
            events={eventsWithDates}
            loading={eventsQuery.isLoading}
            onEventClick={handleEventClick}
            className="w-full h-full min-h-[600px] rounded-lg shadow-lg"
            userLocation={userLocation}
            centerOnUser={centerOnUser}
            onCenterComplete={handleCenterComplete}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            Showing {eventsWithDates.length} upcoming events
            {interests.length > 0 && (
              <span> filtered by your interests</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
