import { lazy, Suspense } from 'react'
import { useRoutes, Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { AuthLayout, MainLayout } from '@/components/layout'
import { PageLoader } from '@/components/common/PageLoader'

// Lazy loaded page components
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const AcceptInvitationPage = lazy(() => import('@/pages/auth/AcceptInvitationPage').then((m) => ({ default: m.AcceptInvitationPage })))
const OAuthCallbackPage = lazy(() => import('@/pages/auth/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })))

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const CommitsPage = lazy(() => import('@/pages/commits/CommitsPage').then((m) => ({ default: m.CommitsPage })))
const CoveragePage = lazy(() => import('@/pages/coverage/CoveragePage').then((m) => ({ default: m.CoveragePage })))
const DevelopersPage = lazy(() => import('@/pages/developers/DevelopersPage').then((m) => ({ default: m.DevelopersPage })))
const DeveloperProfilePage = lazy(() => import('@/pages/developers/DeveloperProfilePage').then((m) => ({ default: m.DeveloperProfilePage })))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })))
const OrganizationSetupPage = lazy(() => import('@/pages/setup/OrganizationSetupPage').then((m) => ({ default: m.OrganizationSetupPage })))

const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  // Public auth routes
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/signin', element: <Navigate to="/login" replace /> },
          { path: '/signup', element: <Navigate to="/register" replace /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
          { path: '/invitations/:token', element: <AcceptInvitationPage /> },
        ],
      },
      { path: '/auth/callback', element: <OAuthCallbackPage /> },
    ],
  },
  // Protected application routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/setup/organization',
        element: <OrganizationSetupPage />,
      },
      {
        element: <MainLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/commits', element: <CommitsPage /> },
          { path: '/coverage', element: <CoveragePage /> },
          { path: '/developers', element: <DevelopersPage /> },
          { path: '/developers/:id', element: <DeveloperProfilePage /> },
          { path: '/leaderboard', element: <LeaderboardPage /> },
        ],
      },
    ],
  },
  // Fallbacks
  { path: '/forbidden', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]

export function AppRoutes() {
  const element = useRoutes(routes)
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}
