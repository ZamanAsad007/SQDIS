import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/audit.service';
import type { AuditLog, AuditLogFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AuditLogQuery() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    pageSize: 20,
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => auditService.queryLogs(filters),
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: search || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <Input
          placeholder="Filter by action, user, or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
        />
        <Button onClick={() => refetch()} variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
          Refresh
        </Button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading audit records...</div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-400">Failed to load audit records.</div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No audit logs found matching criteria.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            <div className="grid grid-cols-12 gap-4 p-3 bg-slate-950/60 font-semibold text-xs text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">Timestamp</div>
              <div className="col-span-3">Actor</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-3">Resource</div>
            </div>
            {data.data.map((log: AuditLog) => (
              <div key={log.id} className="grid grid-cols-12 gap-4 p-3 text-xs text-slate-300 hover:bg-slate-800/40 transition-colors">
                <div className="col-span-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                <div className="col-span-3 font-medium text-slate-200">{log.user?.email || log.userId || 'System'}</div>
                <div className="col-span-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {log.action}
                  </span>
                </div>
                <div className="col-span-3 text-slate-400 truncate">{log.resourceId || log.resourceType}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
