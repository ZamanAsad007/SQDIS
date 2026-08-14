import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileJson } from 'lucide-react'

export interface ExportButtonProps {
  data: Record<string, unknown>[]
  filename?: string
  format?: 'csv' | 'json'
  onExport?: () => void
  className?: string
  disabled?: boolean
}

export function ExportButton({
  data,
  filename = 'export',
  format = 'csv',
  onExport,
  className,
  disabled = false,
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return

    if (onExport) {
      onExport()
    }

    if (format === 'json') {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute('download', `${filename}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    } else {
      // CSV Export logic
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const val = row[header]
              const escaped = ('' + (val ?? '')).replace(/"/g, '\\"')
              return `"${escaped}"`
            })
            .join(',')
        ),
      ]

      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(csvBlob)
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', url)
      downloadAnchor.setAttribute('download', `${filename}.csv`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      leftIcon={format === 'csv' ? <FileSpreadsheet className="h-4 w-4" /> : <FileJson className="h-4 w-4" />}
      className={className}
    >
      Export {format.toUpperCase()}
    </Button>
  )
}
