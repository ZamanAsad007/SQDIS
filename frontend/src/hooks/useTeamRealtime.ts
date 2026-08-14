import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { queryKeys } from '@/lib/queryClient';

export function useTeamRealtime(teamId: string | undefined) {
  const queryClient = useQueryClient();
  const { sendMessage, isConnected } = useWebSocket(teamId ? `team:${teamId}` : undefined, {
    onMessage: (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'score:updated' && data.payload?.teamId === teamId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.teams.metrics(teamId!) });
        }
      } catch {
        // Ignore JSON parse errors
      }
    },
  });

  useEffect(() => {
    if (isConnected && teamId) {
      sendMessage(JSON.stringify({ event: 'subscribe:team', data: { teamId } }));
      return () => {
        sendMessage(JSON.stringify({ event: 'unsubscribe', data: { channel: `team:${teamId}` } }));
      };
    }
  }, [isConnected, teamId, sendMessage]);
}
