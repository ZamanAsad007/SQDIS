import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Plus, Award, Code2, ArrowRight, Search, Edit2, Trash2, MoreVertical, SlidersHorizontal, Activity } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@/components/ui/dropdown'
import { teamsService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { PageHeader, MetricTile, QueryState, formatScore } from '../pageUtils'
import type { Team, CreateTeamRequest, UpdateTeamRequest } from '@/types'

export function TeamsPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'members'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const teamsQuery = useQuery({
    queryKey: queryKeys.teams.all(),
    queryFn: () => teamsService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTeamRequest) => teamsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() })
      closeModals()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) => teamsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() })
      closeModals()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() })
      closeModals()
    },
  })

  const teams = teamsQuery.data ?? []
  
  const filteredAndSortedTeams = useMemo(() => {
    let result = teamsQuery.data ?? []
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description?.toLowerCase().includes(q)
      )
    }
    
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'score') {
        comparison = (a.score ?? 0) - (b.score ?? 0)
      } else if (sortBy === 'members') {
        comparison = (a.memberCount ?? a.members?.length ?? 0) - (b.memberCount ?? b.members?.length ?? 0)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return result
  }, [teamsQuery.data, searchQuery, sortBy, sortOrder])

  const totalMembers = teams.reduce((acc, t) => acc + (t.memberCount ?? t.members?.length ?? 0), 0)
  const avgScore = teams.length > 0
    ? teams.reduce((acc, t) => acc + (t.score ?? 0), 0) / teams.length
    : 0

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate({ name, description })
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam || !name.trim()) return
    updateMutation.mutate({ id: selectedTeam.id, data: { name, description } })
  }

  const handleDelete = () => {
    if (!selectedTeam) return
    deleteMutation.mutate(selectedTeam.id)
  }

  const openCreateModal = () => {
    setName('')
    setDescription('')
    setIsCreateOpen(true)
  }

  const openEditModal = (team: Team) => {
    setSelectedTeam(team)
    setName(team.name)
    setDescription(team.description || '')
    setIsEditOpen(true)
  }

  const openDeleteModal = (team: Team) => {
    setSelectedTeam(team)
    setIsDeleteOpen(true)
  }

  const closeModals = () => {
    setIsCreateOpen(false)
    setIsEditOpen(false)
    setIsDeleteOpen(false)
    setSelectedTeam(null)
    setName('')
    setDescription('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Manage engineering teams, track team scores, and monitor member allocations."
        action={
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Create Team
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile label="Total Teams" value={teams.length} icon={<Users className="h-5 w-5" />} />
        <MetricTile label="Total Team Members" value={totalMembers} icon={<Code2 className="h-5 w-5" />} />
        <MetricTile label="Average Team SQS" value={formatScore(avgScore)} icon={<Award className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Teams</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search teams..."
                className="pl-9 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Sort By
                </Button>
              </DropdownTrigger>
              <DropdownMenu align="end">
                <DropdownItem onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownItem>
                <DropdownItem onClick={() => { setSortBy('score'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>
                  Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownItem>
                <DropdownItem onClick={() => { setSortBy('members'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>
                  Members {sortBy === 'members' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>
        <CardContent>
          <QueryState isLoading={teamsQuery.isLoading} error={teamsQuery.error} onRetry={() => teamsQuery.refetch()}>
            {filteredAndSortedTeams.length === 0 ? (
              <EmptyState 
                title="No teams found" 
                description={searchQuery ? "Try adjusting your search criteria." : "Create a team to get started."}
                action={!searchQuery && <Button onClick={openCreateModal}>Create Team</Button>}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedTeams.map((team: Team) => (
                  <Card key={team.id} className="group relative flex h-full flex-col transition-all hover:border-blue-300 dark:hover:border-blue-700">
                    <CardContent className="flex h-full flex-col justify-between p-5">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-lg font-semibold text-slate-950 dark:text-white truncate" title={team.name}>
                            {team.name}
                          </h2>
                          <div className="flex items-center gap-2">
                            {team.score !== undefined && (
                              <Badge variant="secondary" className="font-mono">
                                SQS {formatScore(team.score)}
                              </Badge>
                            )}
                            <Dropdown>
                              <DropdownTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu align="end">
                                <DropdownItem onClick={() => openEditModal(team)} className="gap-2">
                                  <Edit2 className="h-4 w-4" /> Edit
                                </DropdownItem>
                                <DropdownItem onClick={() => openDeleteModal(team)} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                          {team.description || 'No description provided.'}
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="text-xs uppercase tracking-wider font-semibold">Lead:</span>
                          {team.lead ? (
                            <>
                              <Avatar name={team.lead.name || team.lead.email} src={team.lead.avatarUrl} size="sm" />
                              <span className="font-medium text-slate-900 dark:text-slate-200 truncate">{team.lead.name || team.lead.email}</span>
                            </>
                          ) : (
                            <span className="italic">Unassigned</span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{team.memberCount ?? team.members?.length ?? 0} Members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5" />
                            <span>{team.projectCount ?? team.projects?.length ?? 0} Projects</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-2">
                        <Link to={`/teams/${team.id}`}>
                          <Button variant="outline" className="w-full justify-between gap-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40">
                            View Team Details
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </QueryState>
        </CardContent>
      </Card>

      <Modal isOpen={isCreateOpen} onClose={closeModals} title="Create New Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Team Name <span className="text-red-500">*</span></label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Frontend Core" required className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." className="mt-1" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={closeModals}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create Team</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={closeModals} title="Edit Team">
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
            <Button type="button" variant="outline" onClick={closeModals}>Cancel</Button>
            <Button type="submit" isLoading={updateMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={closeModals}
        onConfirm={handleDelete}
        title="Delete Team"
        message={`Are you sure you want to delete the team "${selectedTeam?.name}"? This action cannot be undone and will remove all member associations.`}
        confirmText="Delete Team"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
