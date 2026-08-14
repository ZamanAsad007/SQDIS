import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: {
    id: string;
    email: string;
    name?: string;
  };
  resource: string;
  ipAddress?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
}

export function RealTimeAuditMonitor() {
  const [events, setEvents] = useState<AuditLog[]>([]);

  const { isConnected } = useWebSocket('audit-events', {
    onMessage: (message) => {
      if (message.type === 'AUDIT_LOG_CREATED' && message.data) {
        setEvents((prev) => [message.data as AuditLog, ...prev.slice(0, 99)]);
      }
    },
  });

  return (
    <div className="space-y-4 p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Real-Time Audit Monitor</h2>
          <p className="text-sm text-slate-400">Live stream of security events & system audit logs</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs text-slate-400 font-medium">
            {isConnected ? 'LIVE STREAM CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="mt-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          {events.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-sans">
              Waiting for incoming real-time audit events...
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id || event.timestamp} className="p-3 hover:bg-slate-900/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      event.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      event.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      event.severity === 'medium' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {event.severity}
                    </span>
                    <span className="font-semibold text-slate-200">{event.action}</span>
                    <span className="text-slate-500">on</span>
                    <span className="text-slate-300">{event.resource}</span>
                  </div>
                  <div className="text-slate-400">
                    Actor: {event.actor?.email || event.actor?.id || 'System'} | IP: {event.ipAddress || 'Internal'}
                  </div>
                </div>
                <div className="text-slate-500 text-[11px] whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
