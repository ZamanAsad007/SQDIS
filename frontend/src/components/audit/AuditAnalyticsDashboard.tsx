import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/audit.service';

export function AuditAnalyticsDashboard() {
  const { data: actionCounts, isLoading: loadingCounts } = useQuery({
    queryKey: ['auditAnalyticsActionCounts'],
    queryFn: () => auditService.getActionCounts(),
  });

  const { data: activeUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['auditAnalyticsActiveUsers'],
    queryFn: () => auditService.getActiveUsers(),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Top Actions</h3>
          {loadingCounts ? (
            <div className="text-sm text-slate-500">Loading action distribution...</div>
          ) : !actionCounts || actionCounts.length === 0 ? (
            <div className="text-sm text-slate-500">No action data available.</div>
          ) : (
            <div className="space-y-2">
              {actionCounts.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="font-mono text-slate-300">{item.action || item._id}</span>
                  <span className="font-semibold text-sky-400">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Most Active Users</h3>
          {loadingUsers ? (
            <div className="text-sm text-slate-500">Loading user analytics...</div>
          ) : !activeUsers || activeUsers.length === 0 ? (
            <div className="text-sm text-slate-500">No user activity data available.</div>
          ) : (
            <div className="space-y-2">
              {activeUsers.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-300">{item.user?.email || item.email || item.userId}</span>
                  <span className="font-semibold text-emerald-400">{item.count} actions</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
