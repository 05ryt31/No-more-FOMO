import React, { useState } from 'react';
import { User, Star, Settings } from 'lucide-react';
import { useUserStore } from '~/stores/user-store';
import { AuthModal } from './AuthModal';

export function AuthPrompt() {
  const { isAuthenticated } = useUserStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('signup');

  // Don't show if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSignup = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  const handleLogin = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get the most out of No More FOMO
            </h3>
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-blue-500" />
                <span>Save your interests and get personalized event recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Settings className="w-4 h-4 text-blue-500" />
                <span>Sync your preferences across all your devices</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSignup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
              >
                Create Account
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
