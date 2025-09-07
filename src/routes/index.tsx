import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from 'react';
import { Search, Settings, Plus, MapPin, Calendar } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';
import { EventCard } from '~/components/EventCard';
import { TabNavigation } from '~/components/TabNavigation';
import { AuthPrompt } from '~/components/AuthPrompt';
import { RegistrationModal } from '~/components/RegistrationModal';
import { calculateETA, getCurrentLocation, getCampusCenterCoords } from '~/utils/eta';
import { isGoogleMapsAPIReady } from '~/utils/google-maps-loader';
import toast from 'react-hot-toast';

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  // All hooks called at the top level
  const trpc = useTRPC();
  const { selectedUniversityId, interests, currentTab, authToken, isAuthenticated, addInterest, removeInterest, setCurrentTab } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [etaFilterError, setEtaFilterError] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<{id: string; title: string} | null>(null);

  // tRPC queries with correct usage pattern
  const defaultUniversityQuery = useQuery(trpc.getDefaultUniversity.queryOptions());
  const selectedUniversityQuery = useQuery(trpc.getUniversityById.queryOptions({
    id: selectedUniversityId || 'ucla',
  }));
  const eventsQuery = useQuery(trpc.getEvents.queryOptions({
    universityId: selectedUniversityId || 'ucla',
    interests: interests.length > 0 ? interests : undefined,
    timeFilter: currentTab,
    token: authToken || undefined,
  }));

  // Registration mutations
  const registerMutation = useMutation(trpc.registerForEvent.mutationOptions());
  const cancelMutation = useMutation(trpc.cancelEventRegistration.mutationOptions());

  // Get user location on component mount
  useEffect(() => {
    async function fetchLocation() {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.log('Location access denied, using campus center as fallback');
        setUserLocation(getCampusCenterCoords());
      }
    }
    
    fetchLocation();
  }, []);

  // Filter events by ETA for "make-it-in-time" tab
  const [filteredEvents, setFilteredEvents] = useState(eventsQuery.data || []);
  
  useEffect(() => {
    async function filterEventsByETA() {
      const events = eventsQuery.data;
      if (!events || currentTab !== 'make-it-in-time' || !userLocation) {
        setFilteredEvents(events || []);
        setEtaFilterError(false);
        return;
      }

      setEtaFilterError(false);
      const canMakeItEvents = [];
      let hasErrors = false;
      
      for (const event of events) {
        if (!event.coordsLat || !event.coordsLng) {
          continue;
        }

        try {
          const etaResult = await calculateETA(
            userLocation,
            { lat: event.coordsLat, lng: event.coordsLng },
            new Date(event.start)
          );
          
          if (etaResult && etaResult.canMakeIt) {
            canMakeItEvents.push(event);
          } else if (etaResult === null) {
            hasErrors = true;
          }
        } catch (error) {
          console.error('ETA calculation failed for event:', event.id, error);
          hasErrors = true;
        }
      }
      
      if (hasErrors) {
        setEtaFilterError(true);
      }
      
      setFilteredEvents(canMakeItEvents);
    }

    filterEventsByETA();
  }, [eventsQuery.data, currentTab, userLocation?.lat, userLocation?.lng]);

  // Search filtering
  const searchFilteredEvents = filteredEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleGoingClick = async (eventId: string) => {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to register for events');
      return;
    }

    try {
      // Check current registration status
      const event = eventsQuery.data?.find(e => e.id === eventId);
      const currentStatus = event?.userRegistrationStatus;

      if (currentStatus === 'going') {
        // User is already going, so cancel registration directly
        await cancelMutation.mutateAsync({
          token: authToken,
          eventId,
        });
        toast.success('Registration cancelled');
        // Refetch events to update UI
        eventsQuery.refetch();
      } else {
        // Show registration modal for new registration
        setSelectedEventForRegistration({
          id: eventId,
          title: event?.title || 'Event'
        });
        setIsRegistrationModalOpen(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to update registration');
    }
  };

  const handleRegistrationSuccess = () => {
    // Refetch events to update UI after successful registration
    eventsQuery.refetch();
  };

  const handleInterestedClick = (eventId: string) => {
    toast.success('Added to Interested! ⭐');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Campus Compass</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{selectedUniversityQuery.data?.name || defaultUniversityQuery.data?.name || 'UCLA'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Link 
                  to="/my-events" 
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  title="My registered events"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">My Events</span>
                </Link>
              )}
              <Link 
                to="/post" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Post Event
              </Link>
              <Link 
                to="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        eventCounts={{
          all: eventsQuery.data?.length || 0,
          happeningSoon: eventsQuery.data?.filter(e => {
            const now = new Date();
            const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const eventStart = new Date(e.start);
            return eventStart >= now && eventStart <= next24Hours;
          }).length || 0,
          makeItInTime: filteredEvents.length,
        }}
      />

      {/* Event Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Prompt for non-logged-in users */}
        <AuthPrompt />
        
        {eventsQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : searchFilteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'No events match your current filters. Try widening your interests or date range.'
              }
            </p>
            {currentTab === 'make-it-in-time' && (
              <div className="text-sm text-gray-500 space-y-1">
                {!userLocation ? (
                  <p>Location permission denied. Using campus center as fallback.</p>
                ) : (
                  <p>Your precise location is never stored on our servers.</p>
                )}
                {etaFilterError && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                    <p className="text-orange-800 font-medium">ETA calculation unavailable</p>
                    <p className="text-orange-700 text-xs mt-1">
                      Google Maps API may not be properly configured. Showing all events instead.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchFilteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  start: new Date(event.start),
                  end: event.end ? new Date(event.end) : null,
                }}
                onGoingClick={handleGoingClick}
                onInterestedClick={handleInterestedClick}
                isRegisterLoading={registerMutation.isPending}
                isCancelLoading={cancelMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {selectedEventForRegistration && (
        <RegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => {
            setIsRegistrationModalOpen(false);
            setSelectedEventForRegistration(null);
          }}
          eventId={selectedEventForRegistration.id}
          eventTitle={selectedEventForRegistration.title}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
