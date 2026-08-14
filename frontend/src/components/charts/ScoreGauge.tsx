import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { cn, formatPercentage } from '@/lib/utils'

interface ScoreGaugeProps {
  value: number
  max?: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: { height: 140, innerRadius: 42, outerRadius: 56, valueClass: 'text-2xl' },
  md: { height: 190, innerRadius: 58, outerRadius: 78, valueClass: 'text-3xl' },
  lg: { height: 240, innerRadius: 76, outerRadius: 102, valueClass: 'text-4xl' },
}

function getScoreColor(score: number) {
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#2563eb'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

export function ScoreGauge({
  value,
  max = 100,
  label = 'Score',
  size = 'md',
  className,
}: ScoreGaugeProps) {
  const config = sizeConfig[size]
  const normalized = Math.max(0, Math.min(value, max))
  const percent = max > 0 ? (normalized / max) * 100 : 0
  const data = [
    { name: 'score', value: percent },
    { name: 'remaining', value: 100 - percent },
  ]

  return (
    <div className={cn('relative w-full', className)} style={{ height: config.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="72%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={getScoreColor(percent)} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center">
        <span className={cn('font-bold text-slate-900 dark:text-slate-50', config.valueClass)}>
          {Math.round(normalized)}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label} · {formatPercentage(percent, 0)}
        </span>
      </div>
    </div>
  )
}
