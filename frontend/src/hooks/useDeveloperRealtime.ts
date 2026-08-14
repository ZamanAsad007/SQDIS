import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { queryKeys } from '@/lib/queryClient';

export function useDeveloperRealtime(developerId: string | undefined) {
  const queryClient = useQueryClient();
  const { sendMessage, isConnected } = useWebSocket(developerId ? `developer:${developerId}` : undefined, {
    onMessage: (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'score:updated' && data.payload?.developerId === developerId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.scores.dqs(developerId!) });
        }
      } catch {
        // Ignore JSON parse errors
      }
    },
  });

  useEffect(() => {
    if (isConnected && developerId) {
      sendMessage(JSON.stringify({ event: 'subscribe:developer', data: { developerId } }));
      return () => {
        sendMessage(JSON.stringify({ event: 'unsubscribe', data: { channel: `developer:${developerId}` } }));
      };
    }
  }, [isConnected, developerId, sendMessage]);
}
