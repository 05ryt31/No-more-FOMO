import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Users, ExternalLink, Share2, Heart, UserCheck, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';
import { RegistrationModal } from '~/components/RegistrationModal';
import toast from 'react-hot-toast';

export const Route = createFileRoute("/event/$id")({
  component: EventDetail,
});

function EventDetail() {
  const { id } = useParams({ from: "/event/$id" });
  const trpc = useTRPC();
  const { authToken, isAuthenticated } = useUserStore();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  
  const eventQuery = useQuery(trpc.getEventById.queryOptions({ id }));
  
  // Get user's registration status for this event
  const registrationStatusQuery = useQuery({
    ...trpc.getUserRegistrationStatus.queryOptions({
      token: authToken!,
      eventIds: [id],
    }),
    enabled: !!authToken && isAuthenticated,
  });

  // Registration mutations
  const registerMutation = useMutation(trpc.registerForEvent.mutationOptions());
  const cancelMutation = useMutation(trpc.cancelEventRegistration.mutationOptions());

  const formatEventTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const generateCalendarLink = (event: any) => {
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

  const handleShare = async (event: any) => {
    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title}`,
      url: window.location.href,
    };

    try {
      // Try native sharing first
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return; // Success, exit early
        } catch (shareError) {
          // If share was cancelled by user or permission denied, fall back to clipboard
          console.log('Native sharing failed, falling back to clipboard:', shareError);
        }
      }
      
      // Fallback to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Event link copied to clipboard!');
      } else {
        // Final fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Event link copied to clipboard!');
      }
    } catch (error) {
      console.error('All sharing methods failed:', error);
      toast.error('Failed to share event. Please copy the URL manually.');
    }
  };

  const handleGoingClick = async () => {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to register for events');
      return;
    }

    const currentStatus = registrationStatusQuery.data?.[id];

    if (currentStatus === 'going') {
      // User is already going, so cancel registration
      try {
        await cancelMutation.mutateAsync({
          token: authToken,
          eventId: id,
        });
        toast.success('Registration cancelled');
        // Refetch registration status
        registrationStatusQuery.refetch();
      } catch (error) {
        console.error('Cancellation error:', error);
        toast.error('Failed to cancel registration');
      }
    } else {
      // Show registration modal for new registration
      setIsRegistrationModalOpen(true);
    }
  };

  const handleRegistrationSuccess = () => {
    // Refetch registration status after successful registration
    registrationStatusQuery.refetch();
  };

  const handleInterestedClick = () => {
    toast.success('Added to Interested! ⭐');
  };

  if (eventQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to events
          </Link>
        </div>
      </div>
    );
  }

  const event = eventQuery.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Event Image */}
          {event.image && (
            <div className="h-64 sm:h-80 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {event.categories.map((category) => (
                <span 
                  key={category}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            {/* Event Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">{formatEventTime(new Date(event.start))}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{event.location}</span>
                  {event.coordsLat && event.coordsLng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${event.coordsLat},${event.coordsLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="text-lg">{event.popularity} people interested</span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this event</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGoingClick}
                disabled={!isAuthenticated || registerMutation.isPending || cancelMutation.isPending}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  !isAuthenticated
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : registrationStatusQuery.data?.[id] === 'going'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${(registerMutation.isPending || cancelMutation.isPending) ? 'opacity-50' : ''}`}
                title={!isAuthenticated ? 'Please log in to register for events' : undefined}
              >
                {(registerMutation.isPending || cancelMutation.isPending) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserCheck className="w-5 h-5" />
                )}
                {registerMutation.isPending || cancelMutation.isPending
                  ? 'Updating...'
                  : !isAuthenticated 
                  ? 'Login to Register'
                  : registrationStatusQuery.data?.[id] === 'going' 
                  ? 'Cancel Registration' 
                  : 'Apply'
                }
              </button>
              
              <button
                onClick={handleInterestedClick}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Interested
              </button>
              
              <a
                href={generateCalendarLink(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Add to Google Calendar
              </a>
              
              <button
                onClick={() => handleShare(event)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        eventId={id}
        eventTitle={event?.title || 'Event'}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
