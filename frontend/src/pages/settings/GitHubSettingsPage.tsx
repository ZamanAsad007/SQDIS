import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Github, RefreshCw, CheckCircle2, AlertTriangle, Link2, 
  Activity, Shield, Webhook, Clock, Info, Check, X,
  Terminal, Search
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { githubService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { QueryState } from '../pageUtils'

export function GitHubSettingsPage() {
  const queryClient = useQueryClient()
  const [searchLogs, setSearchLogs] = useState('')

  const statusQuery = useQuery({
    queryKey: queryKeys.github.status,
    queryFn: () => githubService.getStatus(),
  })

  // Mock data for webhook events log since there's no endpoint in githubService yet
  const webhookLogs = [
    { id: '1', event: 'push', repo: 'backend-api', status: 'success', time: '2 mins ago', payload: 'refs/heads/main' },
    { id: '2', event: 'pull_request', repo: 'frontend-web', status: 'success', time: '15 mins ago', payload: 'opened #42' },
    { id: '3', event: 'issue_comment', repo: 'mobile-app', status: 'success', time: '1 hour ago', payload: 'created' },
    { id: '4', event: 'push', repo: 'backend-api', status: 'error', time: '3 hours ago', payload: 'timeout' },
    { id: '5', event: 'pull_request_review', repo: 'frontend-web', status: 'success', time: '5 hours ago', payload: 'submitted' },
  ]

  const syncMutation = useMutation({
    mutationFn: () => githubService.syncRepositories(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.github.status })
      queryClient.invalidateQueries({ queryKey: queryKeys.repositories.all() })
    },
  })

  const status = statusQuery.data
  const isConnected = status?.isConnected ?? status?.connected ?? false

  const scopes = [
    { name: 'repo', description: 'Full control of private repositories', granted: true },
    { name: 'read:org', description: 'Read organization and team membership', granted: true },
    { name: 'admin:repo_hook', description: 'Full control of repository hooks', granted: true },
    { name: 'read:user', description: 'Read all user profile data', granted: true },
    { name: 'workflow', description: 'Update GitHub Action workflows', granted: false },
  ]

  const filteredLogs = webhookLogs.filter(log => 
    log.event.includes(searchLogs.toLowerCase()) || 
    log.repo.includes(searchLogs.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <QueryState isLoading={statusQuery.isLoading} error={statusQuery.error} onRetry={() => statusQuery.refetch()}>
        
        {/* Main Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Github className="h-6 w-6 text-slate-900 dark:text-white" /> 
                  GitHub Integration
                </CardTitle>
                <CardDescription className="mt-2">
                  Connect your GitHub Organization or Personal Account to sync commit history, pull request reviews, and automated webhook events.
                </CardDescription>
              </div>
              <Badge variant={isConnected ? 'success' : 'destructive'} className="gap-1 px-3 py-1 text-sm">
                {isConnected ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Connected Account</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {status?.username || 'Not connected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enabled Repositories</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {status?.enabledRepositoriesCount ?? 0} active
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Connection Date</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {status?.connectedAt ? new Date(status.connectedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sync Status</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      Healthy
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-center md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6">
                <Button
                  onClick={() => syncMutation.mutate()}
                  disabled={!isConnected || syncMutation.isPending}
                  className="gap-2 w-full justify-start"
                >
                  <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} /> 
                  {syncMutation.isPending ? 'Syncing...' : 'Trigger Repository Sync'}
                </Button>
                
                {!isConnected ? (
                  <Button variant="default" className="gap-2 w-full justify-start bg-slate-900 hover:bg-slate-800 text-white">
                    <Link2 className="h-4 w-4" /> Connect GitHub App
                  </Button>
                ) : (
                  <Button variant="outline" className="gap-2 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <AlertTriangle className="h-4 w-4" /> Disconnect Integration
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scopes & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" /> 
                OAuth Scopes & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scopes.map((scope) => (
                  <div key={scope.name} className="flex items-start justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {scope.name}
                        </code>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">{scope.description}</span>
                    </div>
                    {scope.granted ? (
                      <Badge variant="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">Granted</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Missing</Badge>
                    )}
                  </div>
                ))}
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 rounded-md text-sm">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>Missing scopes may prevent some features from working correctly. To update scopes, you need to re-authenticate the GitHub App.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-purple-500" /> 
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payload URL</label>
                  <div className="flex mt-1.5">
                    <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-l-md border border-slate-200 dark:border-slate-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                      https://api.sqdis.example.com/webhooks/github
                    </code>
                    <Button variant="outline" className="rounded-l-none border-l-0">Copy</Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Webhook Secret</label>
                  <div className="flex mt-1.5">
                    <Input type="password" value="super-secret-token-12345" readOnly className="rounded-r-none font-mono text-sm" />
                    <Button variant="outline" className="rounded-l-none border-l-0">Rotate</Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Used to verify that webhook requests are coming from GitHub.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-medium mb-3">Subscribed Events</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Push', 'Pull Request', 'Pull Request Review', 'Issue Comment', 'Repository'].map(event => (
                      <Badge key={event} variant="outline" className="bg-slate-50 dark:bg-slate-900">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Webhook Events Log */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" /> 
                Recent Webhook Deliveries
              </CardTitle>
              <CardDescription>View the most recent events sent by GitHub to your webhook URL.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search events..." 
                className="pl-9"
                value={searchLogs}
                onChange={(e) => setSearchLogs(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Event Type</th>
                    <th className="px-4 py-3 font-medium">Repository</th>
                    <th className="px-4 py-3 font-medium">Payload Detail</th>
                    <th className="px-4 py-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        {log.status === 'success' ? (
                          <Badge variant="success" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 gap-1 px-1.5 py-0.5">
                            <Check className="h-3 w-3" /> 200 OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 gap-1 px-1.5 py-0.5">
                            <X className="h-3 w-3" /> 504 Error
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-400">
                          {log.event}
                        </code>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{log.repo}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs truncate max-w-[200px]">{log.payload}</td>
                      <td className="px-4 py-3 text-right text-slate-500 whitespace-nowrap flex justify-end items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {log.time}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No webhook events match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm">Load More Events</Button>
            </div>
          </CardContent>
        </Card>
      </QueryState>
    </div>
  )
}
