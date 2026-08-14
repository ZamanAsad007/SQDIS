import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Building, Image as ImageIcon, Save, 
  AlertOctagon, Clock, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { organizationService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { useOrganizationStore } from '@/stores/organizationStore'
import type { UpdateOrganizationRequest } from '@/types'

export function OrganizationSettings() {
  const queryClient = useQueryClient()
  const { currentOrganization, setCurrentOrganization } = useOrganizationStore()
  
  const [formData, setFormData] = useState<UpdateOrganizationRequest>({
    name: currentOrganization?.name || '',
    slug: currentOrganization?.slug || '',
    logoUrl: currentOrganization?.logoUrl || '',
  })
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => {
      if (!currentOrganization) throw new Error('No organization')
      return organizationService.update(currentOrganization.id, data)
    },
    onSuccess: (updatedOrg) => {
      if (updatedOrg) {
        setCurrentOrganization(updatedOrg)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!currentOrganization) throw new Error('No organization')
      // Mocking delete as it might not be in service yet
      // return organizationService.delete(currentOrganization.id)
      return new Promise(resolve => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      // Redirect or handle post-delete
      window.location.href = '/'
    },
  })

  if (!currentOrganization) {
    return (
      <div className="p-8 text-center border rounded-lg bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700">
        <Building className="h-10 w-10 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium">No Organization Selected</h3>
        <p className="text-slate-500 mt-1">Please select an organization to view its settings.</p>
      </div>
    )
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  return (
    <div className="space-y-8">
      
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            General Settings
          </CardTitle>
          <CardDescription>Update your organization's core details and identity.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Section */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-24 w-24 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Org Logo" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                    <span className="text-xs text-white font-medium">Upload</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Organization Logo</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">128x128px recommended</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="org-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Organization Name
                  </label>
                  <Input 
                    id="org-name"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Acme Inc."
                    className="max-w-md"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="org-slug" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    URL Slug
                  </label>
                  <div className="flex items-center max-w-md">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm h-10 dark:bg-slate-800 dark:border-slate-700">
                      sqdis.com/
                    </span>
                    <Input 
                      id="org-slug"
                      value={formData.slug} 
                      onChange={e => setFormData({...formData, slug: e.target.value})}
                      className="rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Must be unique and contain only lowercase letters, numbers, and hyphens.</p>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="org-logo" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Logo URL (Optional)
                  </label>
                  <Input 
                    id="org-logo"
                    value={formData.logoUrl || ''} 
                    onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="max-w-md"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 py-4 flex justify-between">
            <p className="text-sm text-slate-500">
              <Clock className="inline-block h-4 w-4 mr-1 pb-0.5" />
              Created on {new Date(currentOrganization.createdAt || Date.now()).toLocaleDateString()}
            </p>
            <Button type="submit" isLoading={updateMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Subscription & Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-emerald-500" />
            Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between p-5 border border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10 rounded-lg">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Enterprise Tier</h3>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Full access to all features, unlimited repositories, and priority support.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <Button variant="outline">View Billing</Button>
              <Button variant="default">Manage Plan</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50 overflow-hidden">
        <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/50">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertOctagon className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            Irreversible and destructive actions for this organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Delete Organization</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Permanently delete this organization, all its repositories, teams, and data. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="shrink-0"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false)
          setDeleteConfirmText('')
        }}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Organization"
        description={
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300">
              This will permanently delete <span className="font-bold">{currentOrganization.name}</span> and all of its data. This action cannot be undone.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded text-sm border border-red-100 dark:border-red-800/30">
              <p className="font-medium mb-1">Please type the organization name to confirm:</p>
              <Input 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={currentOrganization.name}
                className="mt-2 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        }
        confirmText="Yes, delete organization"
        confirmVariant="destructive"
        isLoading={deleteMutation.isPending}
        isConfirmDisabled={deleteConfirmText !== currentOrganization.name}
      />
    </div>
  )
}
