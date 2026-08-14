import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageLoader } from '@/components/common/PageLoader'
import { setTokens } from '@/services/api'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken)
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, searchParams])

  return <PageLoader />
}
