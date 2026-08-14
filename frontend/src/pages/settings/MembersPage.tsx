import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Users, Trash2, UserPlus, Search, 
  ShieldCheck, Mail, Calendar, 
  ArrowUpDown, ChevronDown, Check
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { membersService, organizationService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { useOrganizationStore } from '@/stores/organizationStore'
import { QueryState } from '../pageUtils'
import type { OrganizationMember, UserRole } from '@/types'

const ROLE_COLORS: Record<UserRole, { bg: string, text: string, border: string }> = {
  OWNER: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  ADMIN: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  TEAM_LEAD: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  DEVELOPER: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  VIEWER: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
}

export function MembersPage() {
  const queryClient = useQueryClient()
  const { currentOrganization } = useOrganizationStore()
  
  // State
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('DEVELOPER')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' })
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  // Queries
  const membersQuery = useQuery({
    queryKey: queryKeys.members.all(),
    queryFn: () => membersService.getAll(),
  })

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: UserRole }) =>
      membersService.updateRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all() })
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => membersService.remove(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all() })
      setMemberToRemove(null)
    },
  })

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string, role: UserRole }) => {
      if (!currentOrganization) throw new Error('No organization selected')
      // Note: service might need role parameter added if supported by backend
      return organizationService.inviteMember(currentOrganization.id, { email: data.email })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.invitations })
      setIsInviteOpen(false)
      setInviteEmail('')
      setInviteRole('DEVELOPER')
    },
  })

  // Derived state
  const members = membersQuery.data ?? []
  
  const stats = useMemo(() => {
    return members.reduce((acc, member) => {
      acc.total++
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, { total: 0 } as Record<string, number>)
  }, [members])

  const filteredAndSortedMembers = useMemo(() => {
    let result = members.filter(member => {
      const matchesSearch = 
        member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter
      
      return matchesSearch && matchesRole
    })

    result.sort((a, b) => {
      let valA, valB;
      if (sortConfig.key === 'name') {
        valA = (a.user?.name || a.user?.email || '').toLowerCase()
        valB = (b.user?.name || b.user?.email || '').toLowerCase()
      } else if (sortConfig.key === 'role') {
        valA = a.role
        valB = b.role
      } else {
        valA = new Date(a.joinedAt).getTime()
        valB = new Date(b.joinedAt).getTime()
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [members, searchQuery, roleFilter, sortConfig])

  // Handlers
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole })
  }

  return (
    <div className="space-y-6">
      <QueryState isLoading={membersQuery.isLoading} error={membersQuery.error} onRetry={() => membersQuery.refetch()}>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Total Members</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.OWNER || 0}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Owners</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.ADMIN || 0}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Admins</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.DEVELOPER || 0}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Developers</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">{stats.VIEWER || 0}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Viewers</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> 
                Organization Members
              </CardTitle>
              <CardDescription>Manage user access and roles for {currentOrganization?.name}</CardDescription>
            </div>
            <Button onClick={() => setIsInviteOpen(true)} className="gap-2 shrink-0">
              <UserPlus className="h-4 w-4" /> Invite New Member
            </Button>
          </CardHeader>
          
          <div className="px-6 py-3 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search members by name or email..." 
                className="pl-9 bg-white dark:bg-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                  className="appearance-none h-10 px-3 pr-8 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th 
                      className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">User <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th 
                      className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-1">Role <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th 
                      className="px-6 py-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:table-cell"
                      onClick={() => handleSort('joinedAt')}
                    >
                      <div className="flex items-center gap-1">Joined <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAndSortedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-base font-medium text-slate-700 dark:text-slate-300">No members found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedMembers.map((member: OrganizationMember) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.user?.name || member.user?.email || 'User'} src={member.user?.avatarUrl} />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{member.user?.name || 'Unnamed User'}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {member.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`${ROLE_COLORS[member.role].bg} ${ROLE_COLORS[member.role].text} ${ROLE_COLORS[member.role].border}`}>
                            {member.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <select
                              value={member.role}
                              onChange={(e) => updateRoleMutation.mutate({ memberId: member.id, role: e.target.value as UserRole })}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.memberId === member.id}
                            >
                              <option value="OWNER">Owner</option>
                              <option value="ADMIN">Admin</option>
                              <option value="TEAM_LEAD">Team Lead</option>
                              <option value="DEVELOPER">Developer</option>
                              <option value="VIEWER">Viewer</option>
                            </select>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 border-red-200 dark:border-red-900/50"
                              onClick={() => setMemberToRemove(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </QueryState>

      {/* Invite Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite New Member">
        <form onSubmit={handleInvite} className="space-y-5">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <p>Invited users will receive an email with a link to join your organization. You can change their role later.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {(['ADMIN', 'TEAM_LEAD', 'DEVELOPER', 'VIEWER'] as UserRole[]).map((role) => (
                <div 
                  key={role}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${inviteRole === role ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  onClick={() => setInviteRole(role)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{role.replace('_', ' ')}</span>
                    {inviteRole === role && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                  <p className="text-xs text-slate-500">
                    {role === 'ADMIN' && 'Full access except billing.'}
                    {role === 'TEAM_LEAD' && 'Can manage teams and projects.'}
                    {role === 'DEVELOPER' && 'Can contribute to assigned projects.'}
                    {role === 'VIEWER' && 'Read-only access to organization.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={inviteMutation.isPending} disabled={!currentOrganization || !inviteEmail.trim()}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Remove Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => memberToRemove && removeMemberMutation.mutate(memberToRemove)}
        title="Remove Member"
        description="Are you sure you want to remove this member from the organization? They will lose access to all repositories and teams."
        confirmText="Remove Member"
        confirmVariant="destructive"
        isLoading={removeMemberMutation.isPending}
      />
    </div>
  )
}
