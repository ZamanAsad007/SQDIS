import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, UserPlus, Shield, Trash2, Award, Users, Activity, Settings, GitCommit, Search, Plus } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { teamsService, membersService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { PageHeader, MetricTile, QueryState, formatScore } from '../pageUtils'
import type { TeamMetrics } from '@/types'

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const teamQuery = useQuery({
    queryKey: queryKeys.teams.detail(id ?? ''),
    queryFn: () => teamsService.getById(id!),
    enabled: !!id,
  })
  
  const metricsQuery = useQuery({
    queryKey: queryKeys.teams.metrics(id ?? ''),
    queryFn: () => teamsService.getMetrics(id!),
    enabled: !!id,
  })

  const membersQuery = useQuery({
    queryKey: queryKeys.members.all(),
    queryFn: () => membersService.getAll(),
  })

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => teamsService.addMember(id!, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(id!) })
      setIsAddMemberOpen(false)
      setSelectedUserId('')
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => teamsService.removeMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(id!) })
    },
  })

  const assignLeadMutation = useMutation({
    mutationFn: (userId: string) => teamsService.assignLead(id!, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(id!) })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => teamsService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(id!) })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => teamsService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() })
      navigate('/teams')
    },
  })

  const team = teamQuery.data
  const metrics = metricsQuery.data as TeamMetrics | undefined
  
  const availableMembers = (membersQuery.data ?? []).filter(
    (m) => !(team?.members ?? []).some((tm) => tm.id === m.userId || tm.id === m.id)
  )

  const filteredMembers = (team?.members ?? []).filter(member => {
    if (!memberSearchQuery) return true
    const q = memberSearchQuery.toLowerCase()
    return member.name?.toLowerCase().includes(q) || member.email?.toLowerCase().includes(q)
  })

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    addMemberMutation.mutate(selectedUserId)
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    updateMutation.mutate({ name, description })
  }

  const openEditModal = () => {
    if (team) {
      setName(team.name)
      setDescription(team.description || '')
      setIsEditOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </Link>
      </div>

      <QueryState isLoading={teamQuery.isLoading} error={teamQuery.error} onRetry={() => teamQuery.refetch()}>
        {team && (
          <div className="space-y-6">
            <PageHeader
              title={team.name}
              description={team.description || 'Team overview and configuration.'}
              action={
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={openEditModal} className="gap-2">
                    <Settings className="h-4 w-4" /> Edit Team
                  </Button>
                  <Button onClick={() => setIsAddMemberOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" /> Add Member
                  </Button>
                </div>
              }
            />

            <div className="grid gap-4 md:grid-cols-4">
              <MetricTile label="Team Members" value={team.members?.length ?? team.memberCount ?? 0} icon={<Users className="h-5 w-5" />} />
              <MetricTile label="Team SQS Score" value={formatScore(team.score ?? metrics?.avgSqs)} icon={<Award className="h-5 w-5" />} />
              <MetricTile label="Active Projects" value={team.projects?.length ?? team.projectCount ?? 0} icon={<Activity className="h-5 w-5" />} />
              <MetricTile label="Total Commits" value={metrics?.totalCommits ?? 'N/A'} icon={<GitCommit className="h-5 w-5" />} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 flex flex-col">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <CardTitle>Team Members</CardTitle>
                  <div className="relative mt-3 sm:mt-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search members..."
                      className="pl-9 w-full sm:w-64"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  {filteredMembers.length === 0 ? (
                    <EmptyState
                      title="No members found"
                      description={memberSearchQuery ? "Try adjusting your search query." : "There are no members in this team yet."}
                      action={!memberSearchQuery && (
                        <Button onClick={() => setIsAddMemberOpen(true)} variant="outline">
                          <Plus className="mr-2 h-4 w-4" /> Add First Member
                        </Button>
                      )}
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <Avatar name={member.name || member.email} src={member.avatarUrl} size="md" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                            </div>
                            {team.lead?.id === member.id && (
                              <Badge variant="secondary" className="ml-2 gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                <Shield className="h-3 w-3" /> Team Lead
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {team.lead?.id !== member.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => assignLeadMutation.mutate(member.id)}
                                isLoading={assignLeadMutation.isPending}
                              >
                                Make Lead
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                              onClick={() => removeMemberMutation.mutate(member.id)}
                              isLoading={removeMemberMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Team Lead</span>
                      <div className="mt-2 flex items-center gap-3">
                        {team.lead ? (
                          <>
                            <Avatar name={team.lead.name || team.lead.email} src={team.lead.avatarUrl} size="sm" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {team.lead.name || team.lead.email}
                            </span>
                          </>
                        ) : (
                          <span className="italic text-slate-500">Not assigned</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Created At</span>
                      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                        {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {metrics && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Code Coverage</span>
                          <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                            {metrics.coverage ? `${metrics.coverage}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Technical Debt</span>
                          <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                            {metrics.techDebt ? `${metrics.techDebt} issues` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => setIsDeleteOpen(true)}>
                        Delete Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {team.projects && team.projects.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Associated Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {team.projects.map(project => (
                          <Link key={project.id} to={`/projects/${project.id}`} className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-900 dark:text-slate-100">{project.name}</span>
                              {project.sqsScore !== undefined && (
                                <Badge variant="secondary" className="text-xs">
                                  SQS {formatScore(project.sqsScore)}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </QueryState>

      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose an organization member...</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.userId || m.user?.id || m.id}>
                  {m.user?.name || m.user?.email || m.id}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={addMemberMutation.isPending} disabled={!selectedUserId}>Add Member</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Team">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Team Name <span className="text-red-500">*</span></label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Frontend Core" required className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." className="mt-1" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={updateMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Team"
        message={`Are you sure you want to delete "${team?.name}"? This action cannot be undone.`}
        confirmText="Delete Team"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
