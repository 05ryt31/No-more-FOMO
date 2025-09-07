import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from 'react';
import { ArrowLeft, University, Heart, Bell, Code, RefreshCw, User, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';
import { InterestChips } from '~/components/InterestChips';
import { AuthModal } from '~/components/AuthModal';

export const Route = createFileRoute("/settings/")({
  component: Settings,
});

function Settings() {
  const trpc = useTRPC();
  const { 
    selectedUniversityId, 
    interests, 
    isAuthenticated,
    userEmail,
    setSelectedUniversity, 
    addInterest, 
    removeInterest, 
    logout,
    reset 
  } = useUserStore();
  const [activeTab, setActiveTab] = useState<'preferences' | 'debug'>('preferences');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const universitiesQuery = useQuery(trpc.getUniversities.queryOptions());
  const categoriesQuery = useQuery(trpc.getEventCategories.queryOptions({
    universityId: selectedUniversityId || 'ucla',
  }));

  const handleUniversityChange = (universityId: string) => {
    setSelectedUniversity(universityId);
  };

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      removeInterest(interest);
    } else {
      addInterest(interest);
    }
  };

  const handleLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings? This will clear your interests and preferences.')) {
      reset();
    }
  };

  // Mock ingestion logs for the demo
  const mockLogs = [
    {
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      step: 'Collector',
      status: 'success',
      message: 'Collected 15 events from 3 ICS sources',
    },
    {
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      step: 'Normalizer',
      status: 'success',
      message: 'Normalized 15 events, parsed dates and locations',
    },
    {
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      step: 'Deduper',
      status: 'success',
      message: 'Found 2 duplicates, merged to 13 unique events',
    },
    {
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      step: 'Ranker',
      status: 'success',
      message: 'Ranked events by relevance and popularity',
    },
    {
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      step: 'Publisher',
      status: 'success',
      message: 'Published 13 events to campus feed',
    },
  ];

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
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600 mb-8">Customize your No More FOMO experience</p>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'preferences'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('debug')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'debug'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Developer Panel
                </button>
              </nav>
            </div>

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                {/* Authentication Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account
                  </h2>
                  {isAuthenticated ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-800 font-medium">Signed in as</p>
                          <p className="text-green-700">{userEmail}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 mb-3">
                        Sign in to save your preferences and get personalized recommendations.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleLogin}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={handleSignup}
                          className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* University Selection */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <University className="w-5 h-5" />
                    University
                  </h2>
                  {universitiesQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading universities...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {universitiesQuery.data?.map((university) => (
                        <label key={university.id} className="flex items-center">
                          <input
                            type="radio"
                            name="university"
                            value={university.id}
                            checked={selectedUniversityId === university.id}
                            onChange={(e) => handleUniversityChange(e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{university.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interest Selection */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Interests
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Select your interests to get personalized event recommendations.
                  </p>
                  {categoriesQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading categories...</span>
                    </div>
                  ) : categoriesQuery.data ? (
                    <InterestChips
                      availableInterests={categoriesQuery.data}
                      selectedInterests={interests}
                      onInterestToggle={handleInterestToggle}
                    />
                  ) : null}
                </div>

                {/* Notification Preferences (Future Feature) */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications (Coming Soon)
                  </h2>
                  <div className="space-y-3 opacity-50">
                    <label className="flex items-center">
                      <input type="checkbox" disabled className="mr-3" />
                      <span className="text-gray-700">Email reminders for events I'm attending</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" disabled className="mr-3" />
                      <span className="text-gray-700">Push notifications for new events</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" disabled className="mr-3" />
                      <span className="text-gray-700">Weekly digest of upcoming events</span>
                    </label>
                  </div>
                </div>

                {/* Reset Settings */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                  >
                    Reset All Settings
                  </button>
                </div>
              </div>
            )}

            {/* Debug Tab */}
            {activeTab === 'debug' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Ingestion Pipeline Logs
                  </h2>
                  <button className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {mockLogs.map((log, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="font-medium text-gray-900">{log.step}</span>
                          <span className="text-gray-600">{log.message}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Privacy Note:</strong> Your precise location is never stored on our servers.</p>
                  <p>ETA calculations are performed client-side using Google Maps Distance Matrix API.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}
