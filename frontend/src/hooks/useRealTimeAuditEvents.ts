import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import type { AuditLog } from '@/types';

export function useRealTimeAuditEvents() {
  const [realtimeLogs, setRealtimeLogs] = useState<AuditLog[]>([]);

  const handleMessage = useCallback((msg: any) => {
    if (msg?.type === 'AUDIT_LOG_CREATED' && msg.data) {
      setRealtimeLogs((prev) => [msg.data as AuditLog, ...prev.slice(0, 49)]);
    }
  }, []);

  const { isConnected } = useWebSocket('audit-events', {
    onMessage: handleMessage,
  });

  return { realtimeLogs, isConnected };
}
