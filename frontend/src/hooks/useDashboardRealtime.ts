import { useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useQueryClient } from '@tanstack/react-query';

export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  const handleMessage = useCallback((msg: any) => {
    if (msg?.type === 'METRICS_UPDATED' || msg?.type === 'DASHBOARD_REFRESH') {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  }, [queryClient]);

  const { isConnected } = useWebSocket('dashboard-updates', {
    onMessage: handleMessage,
  });

  return { isConnected };
}
