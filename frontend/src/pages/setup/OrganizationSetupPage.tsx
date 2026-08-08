import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { organizationService } from '@/services'
import { useOrganizationStore } from '@/stores'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function OrganizationSetupPage() {
  const navigate = useNavigate()
  const setCurrentOrganization = useOrganizationStore((state) => state.setCurrentOrganization)
  const setOrganizations = useOrganizationStore((state) => state.setOrganizations)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const suggestedSlug = useMemo(() => slug || slugify(name), [name, slug])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const org = await organizationService.create({ name, slug: suggestedSlug })
      setCurrentOrganization(org)
      setOrganizations([org])
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create organization')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center">
      <Card className="w-full">
        <CardContent className="space-y-6 p-6">
          <div>
            <Building2 className="h-10 w-10 text-blue-600" />
            <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Create your organization</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              SQDIS uses an organization workspace to scope metrics, members, and repositories.
            </p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input label="Organization name" value={name} onChange={(event) => setName(event.target.value)} required />
            <Input
              label="Workspace slug"
              value={suggestedSlug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              required
            />
            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!name || !suggestedSlug}>
              Create organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
