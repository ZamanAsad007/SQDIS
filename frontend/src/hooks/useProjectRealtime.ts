import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import io from 'socket.io-client'

export function useProjectRealtime(projectId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!projectId) return

    const socket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('accessToken') },
    })

    socket.emit('subscribe', { channel: `project:${projectId}` })

    // On score updated event, auto-refresh React Query data
    socket.on('score:updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores.sqs(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats })
    })

    // On alert triggered event, auto-refresh alerts
    socket.on('alert:triggered', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all() })
    })

    return () => {
      socket.disconnect()
    }
  }, [projectId, queryClient])
}
