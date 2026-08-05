import { create } from 'zustand'

/**
 * Dashboard summary data fetched from /dashboard/summary
 */
export interface DashboardSummary {
    totalCommits: number
    totalDevelopers: number
    totalRepositories: number
    avgDqs: number
    avgSqs: number
    recentAlerts: number
    activeSprints: number
}

interface DashboardState {
    summary: DashboardSummary | null
    isLoading: boolean
    error: string | null
    lastFetchedAt: string | null

    // Actions
    fetchSummary: (organizationId: string) => Promise<void>
    clearDashboard: () => void
    clearError: () => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
    summary: null,
    isLoading: false,
    error: null,
    lastFetchedAt: null,

    fetchSummary: async (organizationId: string) => {
        set({ isLoading: true, error: null })
        try {
            const { default: api } = await import('@/services/api')
            const response = await api.get(
                `/dashboard/summary?organizationId=${organizationId}`,
            )
            set({
                summary: response.data,
                isLoading: false,
                lastFetchedAt: new Date().toISOString(),
            })
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to load dashboard'
            set({ error: message, isLoading: false })
        }
    },

    clearDashboard: () => {
        set({ summary: null, lastFetchedAt: null })
    },

    clearError: () => {
        set({ error: null })
    },
}))
