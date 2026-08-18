import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Mail, Star, Trash2, ShieldAlert, ShieldCheck, 
  Plus, AlertTriangle, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { emailAliasesService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { QueryState } from '../pageUtils'
import type { EmailAlias } from '@/types'

export function EmailAliasesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [aliasToRemove, setAliasToRemove] = useState<{ id: string, email: string } | null>(null)

  const aliasesQuery = useQuery({
    queryKey: queryKeys.emailAliases.all,
    queryFn: () => emailAliasesService.getAll(),
  })

  // Mutations
  const addAliasMutation = useMutation({
    mutationFn: (email: string) => emailAliasesService.create(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailAliases.all })
      setIsAddOpen(false)
      setNewEmail('')
    },
  })

  const removeAliasMutation = useMutation({
    mutationFn: (id: string) => emailAliasesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailAliases.all })
      setAliasToRemove(null)
    },
  })

  const resendVerificationMutation = useMutation({
    mutationFn: (id: string) => emailAliasesService.resendVerification(id),
    onSuccess: () => {
      // Could show toast
    },
  })
  
  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      const alias = aliasesQuery.data?.find((a: EmailAlias) => a.id === id)
      if (alias) {
        return { success: true, message: 'Primary email updated' }
      }
      return { success: false }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailAliases.all })
    }
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    addAliasMutation.mutate(newEmail)
  }

  // Combine primary email with aliases
  const allEmails = [
    {
      id: 'primary',
      email: user?.email || '',
      isPrimary: true,
      isVerified: true,
      createdAt: user?.createdAt || new Date().toISOString()
    },
    ...(aliasesQuery.data ?? [])
  ]

  return (
    <div className="space-y-6">
      
      <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">Why map email aliases?</h3>
              <p className="text-sm text-blue-800/80 dark:text-blue-200/80 mt-1">
                Your commits on GitHub might be tied to different email addresses (e.g. personal, work, noreply). 
                Add all your commit email addresses here so SQDIS can accurately attribute your commits to your account across all repositories.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-500" />
              Email Addresses
            </CardTitle>
            <CardDescription>Manage your primary account email and alternate commit addresses.</CardDescription>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add Email Address
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <QueryState isLoading={aliasesQuery.isLoading} error={aliasesQuery.error} onRetry={() => aliasesQuery.refetch()}>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {allEmails.map((emailObj) => (
                <div key={emailObj.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {emailObj.isVerified ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{emailObj.email}</span>
                        {emailObj.isPrimary && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0">Primary</Badge>
                        )}
                        {!emailObj.isVerified && (
                          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:bg-amber-900/20 px-2 py-0">Unverified</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Added on {new Date(emailObj.createdAt).toLocaleDateString()}
                      </p>
                      
                      {!emailObj.isVerified && (
                        <div className="mt-2 text-xs flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                          <AlertTriangle className="h-3 w-3" />
                          Check your inbox for a verification link.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    {!emailObj.isVerified && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => resendVerificationMutation.mutate(emailObj.id)}
                        disabled={resendVerificationMutation.isPending && resendVerificationMutation.variables === emailObj.id}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${resendVerificationMutation.isPending && resendVerificationMutation.variables === emailObj.id ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Resend Email</span>
                      </Button>
                    )}
                    
                    {!emailObj.isPrimary && emailObj.isVerified && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setPrimaryMutation.mutate(emailObj.id)}
                        disabled={setPrimaryMutation.isPending && setPrimaryMutation.variables === emailObj.id}
                      >
                        <Star className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Make Primary</span>
                      </Button>
                    )}
                    
                    {!emailObj.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-600"
                        onClick={() => setAliasToRemove({ id: emailObj.id, email: emailObj.email })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </CardContent>
      </Card>

      {/* Add Email Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Email Address">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. your-name@users.noreply.github.com"
              required
              className="w-full"
            />
          </div>
          <p className="text-xs text-slate-500">
            A verification link will be sent to this email address to confirm ownership.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={addAliasMutation.isPending} disabled={!newEmail.trim()}>
              Add Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!aliasToRemove}
        onClose={() => setAliasToRemove(null)}
        onConfirm={() => aliasToRemove && removeAliasMutation.mutate(aliasToRemove.id)}
        title="Remove Email Address"
        description={<>Are you sure you want to remove <strong>{aliasToRemove?.email}</strong>? Commits associated with this email will no longer be attributed to your account.</>}
        confirmText="Remove Address"
        confirmVariant="destructive"
        isLoading={removeAliasMutation.isPending}
      />
    </div>
  )
}
