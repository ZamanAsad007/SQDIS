import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageLoader } from '@/components/common/PageLoader'
import { setTokens } from '@/services/api'
import { useAuthStore, useOrganizationStore } from '@/stores'
import { organizationService } from '@/services'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const processAuth = async () => {
      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')
      const userParam = searchParams.get('user')
      const error = searchParams.get('error')

      if (error || !accessToken || !refreshToken) {
        console.error('OAuth Callback error:', error || 'Missing tokens')
        navigate('/login', { replace: true, state: { error: error || 'Authentication failed' } })
        return
      }

      try {
        // 1. Save tokens to storage
        setTokens(accessToken, refreshToken)

        // 2. Set user in auth store
        if (userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam))
            setUser(user)
          } catch {
            await fetchCurrentUser()
          }
        } else {
          await fetchCurrentUser()
        }

        // 3. Hydrate organizations
        try {
          const orgs = await organizationService.getAll()
          useOrganizationStore.getState().setOrganizations(orgs)
          if (orgs && orgs.length > 0) {
            useOrganizationStore.getState().setCurrentOrganization(orgs[0])
            navigate('/dashboard', { replace: true })
          } else {
            navigate('/setup/organization', { replace: true })
          }
        } catch (orgErr) {
          console.warn('Could not fetch organizations directly, heading to dashboard:', orgErr)
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        console.error('OAuth processing failed:', err)
        navigate('/login', { replace: true })
      }
    }

    processAuth()
  }, [navigate, searchParams, setUser, fetchCurrentUser])

  return <PageLoader />
}
