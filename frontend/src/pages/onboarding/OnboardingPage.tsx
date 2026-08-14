import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCheck, Award, UserPlus, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { onboardingService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { PageHeader, MetricTile, QueryState } from '../pageUtils'
import { AssignMentorModal } from './components'
import type { Onboarding } from '@/types'

export function OnboardingPage() {
  const queryClient = useQueryClient()
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  const onboardingQuery = useQuery({
    queryKey: queryKeys.onboarding.all(),
    queryFn: () => onboardingService.getAll(),
  })

  const mentorsQuery = useQuery({
    queryKey: queryKeys.onboarding.availableMentors,
    queryFn: () => onboardingService.getAvailableMentors(),
  })

  const assignMentorMutation = useMutation({
    mutationFn: ({ trackId, mentorId }: { trackId: string; mentorId: string }) =>
      onboardingService.assignMentor(trackId, mentorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all() })
      setSelectedTrackId(null)
    },
  })

  const tracks = onboardingQuery.data ?? []
  const mentors = mentorsQuery.data ?? []
  const activeCount = tracks.filter((t) => t.status === 'IN_PROGRESS').length
  const completedCount = tracks.filter((t) => t.status === 'COMPLETED').length

  return (
    <div>
      <PageHeader
        title="Developer Onboarding Dashboard"
        description="Track new hire ramp-up progress, checklist completions, and mentor assignments."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricTile label="Active Onboarding Tracks" value={activeCount} icon={<UserCheck className="h-5 w-5" />} />
        <MetricTile label="Graduated Developers" value={completedCount} icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricTile label="Available Mentors" value={mentors.length} icon={<Award className="h-5 w-5" />} />
      </div>

      <QueryState isLoading={onboardingQuery.isLoading} error={onboardingQuery.error} onRetry={() => onboardingQuery.refetch()}>
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Developer Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tracks.map((track: Onboarding) => {
                const progress = track.progress ?? 0

                return (
                  <div key={track.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {track.developer?.name || track.developerId || 'New Developer'}
                        </h3>
                        <Badge variant={track.status === 'COMPLETED' ? 'success' : track.status === 'AT_RISK' ? 'destructive' : 'secondary'}>
                          {track.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Mentor: {track.mentor?.name || 'Unassigned'} • Joined: {track.startDate ? new Date(track.startDate).toLocaleDateString() : 'Recent'}
                      </p>

                      <div className="mt-2 w-full max-w-md space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Ramp-up Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    </div>

                    {!track.mentorId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTrackId(track.id)}
                        className="gap-1 shrink-0"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Assign Mentor
                      </Button>
                    )}
                  </div>
                )
              })}
              {tracks.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">No active developer onboarding tracks.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </QueryState>

      <AssignMentorModal
        open={!!selectedTrackId}
        onClose={() => setSelectedTrackId(null)}
        mentors={mentors}
        onAssign={(mentorId) => {
          if (selectedTrackId) {
            assignMentorMutation.mutate({ trackId: selectedTrackId, mentorId })
          }
        }}
        isPending={assignMentorMutation.isPending}
      />
    </div>
  )
}
