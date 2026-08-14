import { AuditLogQuery, AuditAnalyticsDashboard, RealTimeAuditMonitor } from '@/components/audit';

export function AuditLogsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Audit Logs</h1>
        <p className="text-slate-400 text-sm">Query and audit system activities and security events.</p>
      </div>
      <AuditLogQuery />
    </div>
  );
}

export function AuditAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Audit Analytics</h1>
        <p className="text-slate-400 text-sm">Overview metrics and security action trends.</p>
      </div>
      <AuditAnalyticsDashboard />
    </div>
  );
}

export function RealTimeAuditMonitorPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Real-Time Monitor</h1>
        <p className="text-slate-400 text-sm">Live security event socket monitoring.</p>
      </div>
      <RealTimeAuditMonitor />
    </div>
  );
}
