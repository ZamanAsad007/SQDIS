import { useEffect } from 'react'
import { useAuthStore } from '@/stores'
import { getAccessToken } from '@/services/api'

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, register, logout, fetchCurrentUser, clearError } = useAuthStore()

  // Fetch current user on mount if we have a token but no user
  useEffect(() => {
    const token = getAccessToken()
    if (token && (!user || !isAuthenticated)) {
      fetchCurrentUser()
    }
  }, [user, isAuthenticated, fetchCurrentUser])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}
