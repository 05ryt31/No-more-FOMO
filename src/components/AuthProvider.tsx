import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import { useUserStore } from '~/stores/user-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const trpc = useTRPC();
  const { authToken, isAuthenticated, setAuthData, logout } = useUserStore();

  // Only verify token if we have one and think we're authenticated
  const tokenVerificationQuery = useQuery({
    ...trpc.verifyToken.queryOptions({ token: authToken || '' }),
    enabled: !!authToken && isAuthenticated,
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // Consider token valid for 5 minutes before re-checking
  });

  useEffect(() => {
    // If we have a token but verification failed, log the user out
    if (authToken && isAuthenticated && tokenVerificationQuery.isError) {
      logout();
    }
    
    // If verification succeeded and we have updated user data, refresh the store
    if (tokenVerificationQuery.isSuccess && tokenVerificationQuery.data && authToken) {
      setAuthData({
        token: authToken,
        user: tokenVerificationQuery.data.user,
      });
    }
  }, [authToken, isAuthenticated, tokenVerificationQuery.isError, tokenVerificationQuery.isSuccess, tokenVerificationQuery.data, logout, setAuthData]);

  return <>{children}</>;
}
