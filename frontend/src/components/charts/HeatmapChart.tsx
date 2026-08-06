import { cn } from '@/lib/utils'

export interface HeatmapCell {
  x: string
  y: string
  value: number
}

interface HeatmapChartProps {
  data: HeatmapCell[]
  xLabels?: string[]
  yLabels?: string[]
  className?: string
}

function getHeatColor(value: number) {
  if (value <= 0) return 'bg-slate-100 dark:bg-slate-800'
  if (value < 25) return 'bg-blue-100 dark:bg-blue-950'
  if (value < 50) return 'bg-blue-300 dark:bg-blue-800'
  if (value < 75) return 'bg-emerald-400 dark:bg-emerald-700'
  return 'bg-emerald-600 dark:bg-emerald-500'
}

export function HeatmapChart({ data, xLabels, yLabels, className }: HeatmapChartProps) {
  const columns = xLabels ?? Array.from(new Set(data.map((cell) => cell.x)))
  const rows = yLabels ?? Array.from(new Set(data.map((cell) => cell.y)))
  const valueByKey = new Map(data.map((cell) => [`${cell.x}:${cell.y}`, cell.value]))

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div
        className="grid min-w-max gap-1"
        style={{ gridTemplateColumns: `minmax(5rem, auto) repeat(${columns.length}, minmax(2rem, 1fr))` }}
      >
        <div />
        {columns.map((label) => (
          <div key={label} className="px-1 text-center text-xs font-medium text-slate-500">
            {label}
          </div>
        ))}
        {rows.map((row) => (
          <div key={row} className="contents">
            <div className="pr-2 text-xs font-medium text-slate-500">{row}</div>
            {columns.map((column) => {
              const value = valueByKey.get(`${column}:${row}`) ?? 0
              return (
                <div
                  key={`${column}:${row}`}
                  title={`${row}, ${column}: ${value}`}
                  className={cn('h-8 rounded-md border border-white/50', getHeatColor(value))}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
