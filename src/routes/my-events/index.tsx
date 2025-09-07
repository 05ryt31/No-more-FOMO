import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Heart, UserCheck, Search, Filter } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';
import { EventCard } from '~/components/EventCard';
import { AuthPrompt } from '~/components/AuthPrompt';
import { RegistrationModal } from '~/components/RegistrationModal';
import toast from 'react-hot-toast';

export const Route = createFileRoute("/my-events/")({
  component: MyEvents,
});

function MyEvents() {
  const trpc = useTRPC();
  const { authToken, isAuthenticated } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'going' | 'interested' | 'cancelled'>('all');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<{id: string; title: string} | null>(null);

  // tRPC queries and mutations
  const registrationsQuery = useQuery(
    trpc.getUserEventRegistrations.queryOptions({
      token: authToken || '',
      status: statusFilter === 'all' ? undefined : statusFilter,
    }, {
      enabled: isAuthenticated && !!authToken,
    })
  );

  const registerMutation = useMutation(trpc.registerForEvent.mutationOptions());
  const cancelMutation = useMutation(trpc.cancelEventRegistration.mutationOptions());

  const handleGoingClick = async (eventId: string) => {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to manage events');
      return;
    }

    try {
      // Find the current registration status
      const registration = registrationsQuery.data?.find(reg => reg.eventId === eventId);
      const currentStatus = registration?.status;

      if (currentStatus === 'going') {
        // User is already going, so cancel registration directly
        await cancelMutation.mutateAsync({
          token: authToken,
          eventId,
        });
        toast.success('Registration cancelled');
        // Refetch registrations to update UI
        registrationsQuery.refetch();
      } else {
        // Show registration modal for new registration
        const event = registration?.event;
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
    // Refetch registrations to update UI after successful registration
    registrationsQuery.refetch();
  };

  const handleInterestedClick = (eventId: string) => {
    toast.success('Added to Interested! ⭐');
  };

  // Filter events based on search query
  const filteredRegistrations = registrationsQuery.data?.filter(registration => {
    const event = registration.event;
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  }) || [];

  // Count registrations by status for filter tabs
  const statusCounts = registrationsQuery.data?.reduce((counts, reg) => {
    counts[reg.status] = (counts[reg.status] || 0) + 1;
    counts.all = (counts.all || 0) + 1;
    return counts;
  }, {} as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to events
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
            <p className="text-gray-600 mb-8">Manage all your registered events in one place</p>

            {/* Authentication Check */}
            {!isAuthenticated && (
              <div className="mb-8">
                <AuthPrompt />
              </div>
            )}

            {/* Content for authenticated users */}
            {isAuthenticated && (
              <>
                {/* Search and Filters */}
                <div className="mb-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search your events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {[
                      { key: 'all', label: 'All Events', icon: Calendar },
                      { key: 'going', label: 'Going', icon: UserCheck },
                      { key: 'interested', label: 'Interested', icon: Heart },
                      { key: 'cancelled', label: 'Cancelled', icon: Filter },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key as any)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                          statusFilter === key
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                        {statusCounts[key] > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusFilter === key
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {statusCounts[key]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Events List */}
                {registrationsQuery.isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your events...</p>
                  </div>
                ) : registrationsQuery.error ? (
                  <div className="text-center py-12">
                    <div className="text-red-400 mb-4">
                      <Calendar className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading events</h3>
                    <p className="text-gray-600 mb-4">
                      There was a problem loading your registered events. Please try again.
                    </p>
                    <button
                      onClick={() => registrationsQuery.refetch()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery 
                        ? 'No events found'
                        : statusFilter === 'all'
                        ? 'No registered events yet'
                        : `No ${statusFilter} events`
                      }
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery 
                        ? 'Try adjusting your search query'
                        : statusFilter === 'all'
                        ? 'Start exploring events and register for ones that interest you!'
                        : `You haven't ${statusFilter === 'going' ? 'registered for' : statusFilter === 'interested' ? 'marked as interested' : 'cancelled'} any events yet.`
                      }
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Calendar className="w-4 h-4" />
                        Explore Events
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRegistrations.map((registration) => (
                      <div key={registration.id} className="relative">
                        {/* Registration Status Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            registration.status === 'going'
                              ? 'bg-green-100 text-green-800'
                              : registration.status === 'interested'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {registration.status === 'going' 
                              ? '✓ Going' 
                              : registration.status === 'interested'
                              ? '⭐ Interested'
                              : '✕ Cancelled'
                            }
                          </span>
                        </div>
                        
                        <EventCard
                          event={{
                            ...registration.event,
                            start: new Date(registration.event.start),
                            end: registration.event.end ? new Date(registration.event.end) : null,
                            userRegistrationStatus: registration.status,
                          }}
                          onGoingClick={handleGoingClick}
                          onInterestedClick={handleInterestedClick}
                          isRegisterLoading={registerMutation.isPending}
                          isCancelLoading={cancelMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
