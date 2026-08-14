import { lazy } from 'react'

export const ScoreGauge = lazy(() =>
  import('./ScoreGauge').then((module) => ({ default: module.ScoreGauge }))
)
export const TrendChart = lazy(() =>
  import('./TrendChart').then((module) => ({ default: module.TrendChart }))
)
export const CommitChart = lazy(() =>
  import('./CommitChart').then((module) => ({ default: module.CommitChart }))
)
export const HeatmapChart = lazy(() =>
  import('./HeatmapChart').then((module) => ({ default: module.HeatmapChart }))
)

export { ChartSuspense } from './ChartSuspense'
export type { TrendChartPoint } from './TrendChart'
export type { CommitChartPoint } from './CommitChart'
export type { HeatmapCell } from './HeatmapChart'
