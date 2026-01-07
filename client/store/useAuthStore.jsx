import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      credentials: {
        openai_key: '',
        supabase_url: '',
        supabase_key: '',
        cohere_key: '',
      },
      
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
      setCredentials: (credentials) => set((state) => ({ 
        credentials: { ...state.credentials, ...credentials } 
      })),
      logout: () => set({ user: null, token: null, refreshToken: null }),
      
      isAuthenticated: () => !!useAuthStore.getState().token,
    }),
    {
      name: 'cortex-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
