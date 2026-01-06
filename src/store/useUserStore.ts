import { UserState } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      email: null,
      isAuthenticated: false,
      token: null, 

      setUser: (user) => set({ 
        user, 
        isAuthenticated: true,
        email: user.email 
      }),

      setEmail: (email) => set({ email }),

      setToken: (token) => set({ token }),

      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false,
        token: null 
      }),

      clearEmail: () => set({ email: null }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      logout: () => set({ 
        user: null,
        email: null,
        isAuthenticated: false,
        token: null
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
        token: state.token, // Include token in persistence
      }),
    }
  )
)