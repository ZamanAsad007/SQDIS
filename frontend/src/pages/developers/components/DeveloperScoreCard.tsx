import { TrendingUp } from 'lucide-react'
import { MetricTile, formatScore } from '../../pageUtils'

export function DeveloperScoreCard({ label, score }: { label: string; score?: number }) {
  return <MetricTile label={label} value={formatScore(score)} icon={<TrendingUp className="h-5 w-5" />} />
}
