import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Download, BarChart3, Shield, Users, Layers, Plus, Calendar, Clock, Trash2, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { reportsService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { PageHeader, QueryState } from '../pageUtils'
import type { Report, ReportType } from '@/types'

export function ReportsPage() {
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [newReportType, setNewReportType] = useState('EXECUTIVE')
  const [newReportTitle, setNewReportTitle] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const reportsQuery = useQuery({
    queryKey: queryKeys.reports.all({ type: typeFilter !== 'ALL' ? typeFilter : undefined }),
    queryFn: () => reportsService.getAll({ type: typeFilter !== 'ALL' ? (typeFilter as ReportType) : undefined }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => reportsService.create(data, 'pdf'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() })
      setIsGenerateModalOpen(false)
      setNewReportTitle('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all() })
    },
  })

  const reportsList = reportsQuery.data?.reports ?? []
  
  const filteredReports = useMemo(() => {
    if (typeFilter === 'ALL') return reportsList
    return reportsList.filter((r) => r.type === typeFilter)
  }, [reportsList, typeFilter])

  const handleDownload = async (report: Report) => {
    try {
      setDownloadingId(report.id)
      await reportsService.download(report.id)
    } catch (e) {
      console.error('Failed to download report', e)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReportTitle.trim()) return
    
    createMutation.mutate({
      title: newReportTitle,
      type: newReportType,
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined,
    })
  }

  const openGenerateModal = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    setDateRange({
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    })
    setNewReportTitle(`Monthly ${newReportType} Report`)
    setIsGenerateModalOpen(true)
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value
    setNewReportType(type)
    if (newReportTitle.includes('Report')) {
      setNewReportTitle(`Monthly ${type} Report`)
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'EXECUTIVE':
        return <Shield className="h-6 w-6 text-indigo-500" />
      case 'DQS':
      case 'DEVELOPER':
        return <Users className="h-6 w-6 text-blue-500" />
      case 'SQS':
      case 'PROJECT':
        return <Layers className="h-6 w-6 text-emerald-500" />
      case 'VELOCITY':
        return <Clock className="h-6 w-6 text-amber-500" />
      case 'AUDIT':
        return <FileText className="h-6 w-6 text-rose-500" />
      default:
        return <BarChart3 className="h-6 w-6 text-slate-500" />
    }
  }

  const getReportDescription = (type: string) => {
    switch (type) {
      case 'EXECUTIVE': return 'High-level summary of engineering health and KPIs'
      case 'DQS': return 'Developer quality scores and individual performance'
      case 'SQS': return 'System quality scores across repositories'
      case 'VELOCITY': return 'Sprint velocity and PR turnaround metrics'
      case 'AUDIT': return 'Security and compliance audit trail'
      default: return 'Automated engineering metric report'
    }
  }

  const reportTypes = ['ALL', 'EXECUTIVE', 'DQS', 'SQS', 'VELOCITY', 'AUDIT']

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineering Reports"
        description="Generate, view, and export executive quality reports, DQS analytics, and velocity metrics."
        action={
          <Button onClick={openGenerateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Generate Report
          </Button>
        }
      />

      {/* Scheduled Reports summary card - placeholder for future functionality */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-blue-100 dark:border-blue-900">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Scheduled Reports Active</h3>
              <p className="text-sm text-slate-500">3 reports are scheduled to generate weekly on Mondays.</p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0 bg-white dark:bg-slate-800">
            Manage Schedules
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto flex overflow-x-auto justify-start">
            {reportTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="min-w-fit">
                {type === 'ALL' ? 'All Reports' : type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="text-sm text-slate-500 font-medium">
          Showing {filteredReports.length} reports
        </div>
      </div>

      <QueryState isLoading={reportsQuery.isLoading} error={reportsQuery.error} onRetry={() => reportsQuery.refetch()}>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report: Report) => (
            <Card key={report.id} className="flex h-full flex-col justify-between group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                      {getReportIcon(report.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={report.title}>
                        {report.title}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 text-xs">
                        {report.description || getReportDescription(report.type)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="py-0 flex-1">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3 space-y-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1"><FileText className="h-3 w-3" /> Type</span>
                    <Badge variant="outline" className="text-[10px] h-5">{report.type}</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Period</span>
                    <span className="font-medium">{(report as any).period || 'Last 30 Days'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Status</span>
                    <span className="text-emerald-500 font-medium">Completed</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <span className="block">Generated on</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownload(report)} 
                    disabled={downloadingId === report.id}
                    className="gap-2"
                  >
                    <Download className="h-3.5 w-3.5" /> 
                    {downloadingId === report.id ? 'Downloading...' : 'PDF'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {filteredReports.length === 0 && (
            <div className="col-span-full">
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Reports Found</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm">
                    {typeFilter === 'ALL' 
                      ? 'You haven\'t generated any reports yet.' 
                      : `No reports of type ${typeFilter} have been generated.`}
                  </p>
                  <Button onClick={openGenerateModal} className="mt-6 gap-2" variant="outline">
                    <Plus className="h-4 w-4" /> Generate Your First Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </QueryState>

      {/* Generate Report Modal */}
      <Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Generate New Report">
        <form onSubmit={handleGenerate} className="space-y-4">
          <Input 
            label="Report Title"
            value={newReportTitle} 
            onChange={(e) => setNewReportTitle(e.target.value)} 
            placeholder="e.g. Q3 Executive Summary" 
            required 
            autoFocus
          />
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Report Type</label>
            <select
              value={newReportType}
              onChange={handleTypeChange}
              className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXECUTIVE">Executive Summary</option>
              <option value="DQS">Developer Quality Score (DQS)</option>
              <option value="SQS">System Quality Score (SQS)</option>
              <option value="VELOCITY">Engineering Velocity</option>
              <option value="AUDIT">Security & Compliance Audit</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Start Date"
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
              required 
            />
            
            <Input 
              label="End Date"
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
              required 
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg flex items-start gap-3 mt-4 text-sm">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200">Report Contents</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">{getReportDescription(newReportType)}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending} className="gap-2">
              <FileText className="h-4 w-4" /> Generate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
