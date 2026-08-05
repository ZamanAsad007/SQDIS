import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authService } from '@/services'
import { clearTokens, getAccessToken } from '@/services/api'

const hasAccessToken = () => {
  if (typeof window === 'undefined') return false
  return !!getAccessToken()
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: hasAccessToken(),
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({ email, password })
          set({ user: response.user, isAuthenticated: true, isLoading: false })

          // Fetch organizations after login
          try {
            const { organizationService } = await import('@/services')
            const { useOrganizationStore } = await import('@/stores/organizationStore')
            const orgs = await organizationService.getAll()
            useOrganizationStore.getState().setOrganizations(orgs)
          } catch (orgError) {
            console.error('Failed to fetch organizations after login:', orgError)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register({ email, password, name })
          set({ user: response.user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
        } finally {
          const { useOrganizationStore } = await import('@/stores/organizationStore')
          clearTokens()
          useOrganizationStore.getState().clearOrganization()
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      fetchCurrentUser: async () => {
        if (!getAccessToken()) {
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const user = await authService.getMe()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
          clearTokens()
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!getAccessToken()) {
          state?.setUser(null)
        }
      },
    }
  )
)
