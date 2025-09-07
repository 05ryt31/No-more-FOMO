import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserStore {
  // Authentication state
  authToken: string | null;
  userId: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  
  // User preferences
  selectedUniversityId: string | null;
  interests: string[];
  
  // UI state
  currentTab: 'all' | 'happening-soon' | 'make-it-in-time';
  
  // Authentication actions
  setAuthData: (data: { token: string; user: { id: string; email: string; universityId: string; interests: string[] } }) => void;
  logout: () => void;
  
  // Existing actions
  setSelectedUniversity: (universityId: string) => void;
  setInterests: (interests: string[]) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  setCurrentTab: (tab: 'all' | 'happening-soon' | 'make-it-in-time') => void;
  reset: () => void;
}

const initialState = {
  // Authentication
  authToken: null,
  userId: null,
  userEmail: null,
  isAuthenticated: false,
  
  // Preferences
  selectedUniversityId: 'ucla', // Default to UCLA for MVP
  interests: [],
  currentTab: 'all' as const,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setAuthData: (data: { token: string; user: { id: string; email: string; universityId: string; interests: string[] } }) => {
        set({
          authToken: data.token,
          userId: data.user.id,
          userEmail: data.user.email,
          isAuthenticated: true,
          selectedUniversityId: data.user.universityId,
          interests: data.user.interests,
        });
      },
      
      logout: () => {
        set({
          authToken: null,
          userId: null,
          userEmail: null,
          isAuthenticated: false,
          // Keep university and other preferences
        });
      },
      
      setSelectedUniversity: (universityId: string) => {
        set({ selectedUniversityId: universityId });
      },
      
      setInterests: (interests: string[]) => {
        set({ interests });
      },
      
      addInterest: (interest: string) => {
        const currentInterests = get().interests;
        if (!currentInterests.includes(interest)) {
          set({ interests: [...currentInterests, interest] });
        }
      },
      
      removeInterest: (interest: string) => {
        const currentInterests = get().interests;
        set({ interests: currentInterests.filter(i => i !== interest) });
      },
      
      setCurrentTab: (tab: 'all' | 'happening-soon' | 'make-it-in-time') => {
        set({ currentTab: tab });
      },
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'campus-compass-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
