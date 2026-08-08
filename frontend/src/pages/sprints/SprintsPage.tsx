import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Plus, CheckCircle2, Clock, PlayCircle, Search, Target, Users, Flame, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { sprintsService, teamsService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { PageHeader, MetricTile, QueryState } from '../pageUtils'
import type { Sprint, SprintStatus, Team } from '@/types'

export function SprintsPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<SprintStatus | 'ALL'>('ALL')
  
  // Form State
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [teamId, setTeamId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const sprintsQuery = useQuery({
    queryKey: queryKeys.sprints.all(),
    queryFn: () => sprintsService.getAll(),
  })

  const teamsQuery = useQuery({
    queryKey: queryKeys.teams.all(),
    queryFn: () => teamsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; goal?: string; teamId: string; startDate: string; endDate: string }) =>
      sprintsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all() })
      setIsCreateOpen(false)
      // Reset form
      setName('')
      setGoal('')
      setTeamId('')
      setStartDate('')
      setEndDate('')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SprintStatus }) => 
      sprintsService.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all() })
    },
  })

  const sprints = sprintsQuery.data ?? []
  const teams = teamsQuery.data ?? []
  
  // Metrics
  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE').length
  const completedSprints = sprints.filter((s) => s.status === 'COMPLETED').length
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED').length

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !teamId || !startDate || !endDate) return
    createMutation.mutate({ name, goal, teamId, startDate, endDate })
  }

  const filteredSprints = useMemo(() => {
    return sprints.filter((sprint) => {
      const matchesSearch = sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (sprint.goal && sprint.goal.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'ALL' || sprint.status === statusFilter
      return matchesSearch && matchesStatus
    }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }, [sprints, searchTerm, statusFilter])

  const getStatusBadge = (status: SprintStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="gap-1.5 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50"><PlayCircle className="h-3.5 w-3.5" /> Active</Badge>
      case 'COMPLETED':
        return <Badge className="gap-1.5 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</Badge>
      case 'CANCELLED':
        return <Badge className="gap-1.5 bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"><AlertCircle className="h-3.5 w-3.5" /> Cancelled</Badge>
      default:
        return <Badge className="gap-1.5 bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"><Clock className="h-3.5 w-3.5" /> Planned</Badge>
    }
  }

  const getSprintProgress = (sprint: Sprint) => {
    const today = new Date()
    const start = new Date(sprint.startDate)
    const end = new Date(sprint.endDate)
    
    if (today >= end) return 100
    if (today <= start) return 0
    
    const total = end.getTime() - start.getTime()
    const current = today.getTime() - start.getTime()
    return Math.min(100, Math.max(0, (current / total) * 100))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sprints"
        description="Plan iteration cycles, track sprint goals, velocity, and burndown progress."
        action={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> New Sprint
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Total Sprints" value={sprints.length} icon={<Calendar className="h-5 w-5 text-indigo-500" />} />
        <MetricTile label="Active Sprints" value={activeSprints} icon={<PlayCircle className="h-5 w-5 text-blue-500" />} />
        <MetricTile label="Planned Sprints" value={plannedSprints} icon={<Clock className="h-5 w-5 text-amber-500" />} />
        <MetricTile label="Completed Sprints" value={completedSprints} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
      </div>

      <QueryState isLoading={sprintsQuery.isLoading} error={sprintsQuery.error} onRetry={() => sprintsQuery.refetch()}>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search sprints..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-950" 
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(['ALL', 'PLANNED', 'ACTIVE', 'COMPLETED'] as const).map((status) => (
                <Button 
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`${statusFilter === status ? 'shadow-sm' : 'bg-white dark:bg-slate-950'}`}
                >
                  {status === 'ALL' ? 'All Sprints' : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredSprints.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredSprints.map((sprint: Sprint) => (
                  <Card key={sprint.id} className="group flex flex-col h-full border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-r from-transparent to-slate-50/50 dark:to-slate-900/20">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <Link to={`/sprints/${sprint.id}`} className="hover:underline decoration-blue-500 underline-offset-4">
                          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {sprint.name}
                          </CardTitle>
                        </Link>
                        {getStatusBadge(sprint.status)}
                      </div>
                      
                      {sprint.team && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
                          <Users className="h-4 w-4" />
                          <span>{sprint.team.name}</span>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="flex-grow py-5">
                      <div className="space-y-4">
                        {/* Goal */}
                        <div className="flex items-start gap-2.5">
                          <Target className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {sprint.goal || 'No specific goal statement defined.'}
                          </p>
                        </div>

                        {/* Dates & Progress */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-3 border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(sprint.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <span className="text-slate-300 dark:text-slate-700">→</span>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(sprint.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          
                          {sprint.status === 'ACTIVE' && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-500">Timeline Progress</span>
                                <span className="text-blue-600 dark:text-blue-400">{Math.round(getSprintProgress(sprint))}%</span>
                              </div>
                              <Progress value={getSprintProgress(sprint)} className="h-1.5" />
                            </div>
                          )}
                        </div>

                        {/* Stats mini-metrics if available */}
                        {(sprint.velocity !== undefined || (sprint.commits && sprint.commits.length > 0)) && (
                          <div className="flex gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {sprint.velocity !== undefined && (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{sprint.velocity}</span>
                                <span className="text-slate-500 text-xs">pts</span>
                              </div>
                            )}
                            {sprint.commits && (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Target className="h-4 w-4 text-indigo-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{sprint.commits.length}</span>
                                <span className="text-slate-500 text-xs">commits</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-slate-100 dark:border-slate-800/60 p-4 bg-slate-50/30 dark:bg-slate-900/10 flex gap-2">
                      <Link to={`/sprints/${sprint.id}`} className="flex-1">
                        <Button variant="outline" className="w-full justify-center gap-2 group-hover:bg-white dark:group-hover:bg-slate-950 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                          View Details
                        </Button>
                      </Link>
                      
                      {sprint.status === 'PLANNED' && (
                        <Button 
                          className="px-3"
                          title="Start Sprint"
                          onClick={() => updateStatusMutation.mutate({ id: sprint.id, status: 'ACTIVE' })}
                          isLoading={updateStatusMutation.isPending}
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {sprint.status === 'ACTIVE' && (
                        <Button 
                          className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                          title="Complete Sprint"
                          onClick={() => updateStatusMutation.mutate({ id: sprint.id, status: 'COMPLETED' })}
                          isLoading={updateStatusMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No sprints found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? "We couldn't find any sprints matching your current filters. Try adjusting your search criteria."
                    : "Get started by planning your first sprint cycle to track progress and velocity."}
                </p>
                {(searchTerm || statusFilter !== 'ALL') ? (
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Create First Sprint
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </QueryState>

      {/* Create Sprint Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Plan New Sprint">
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sprint Name <span className="text-red-500">*</span></label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Sprint 24 - Q3 Optimization" 
                required 
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sprint Goal</label>
              <textarea 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)} 
                placeholder="What is the main objective of this sprint?..." 
                className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assign Team <span className="text-red-500">*</span></label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                required
              >
                <option value="" disabled>Select a team to take on this sprint...</option>
                {teams.map((team: Team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">End Date <span className="text-red-500">*</span></label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending} className="gap-2">
              <Plus className="h-4 w-4" /> Create Sprint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
