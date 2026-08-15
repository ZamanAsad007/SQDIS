import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import type { AuditLog } from '@/types';

export interface AuditEventMessage {
  type?: string;
  data?: AuditLog;
}

export function useRealTimeAuditEvents() {
  const [realtimeLogs, setRealtimeLogs] = useState<AuditLog[]>([]);

  const handleMessage = useCallback((msg: AuditEventMessage | string | unknown) => {
    let parsed: AuditEventMessage | null = null;
    if (typeof msg === 'string') {
      try {
        parsed = JSON.parse(msg) as AuditEventMessage;
      } catch {
        return;
      }
    } else if (typeof msg === 'object' && msg !== null) {
      parsed = msg as AuditEventMessage;
    }

    if (parsed?.type === 'AUDIT_LOG_CREATED' && parsed.data) {
      const newLog = parsed.data;
      setRealtimeLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    }
  }, []);

  const { isConnected } = useWebSocket('audit-events', {
    onMessage: handleMessage,
  });

  return { realtimeLogs, isConnected };
}
