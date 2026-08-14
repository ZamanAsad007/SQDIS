import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { 
  GitCommit, User, Calendar, Code, FileText, ExternalLink, 
  Clock, GitBranch, PlusCircle, MinusCircle, ShieldCheck
} from 'lucide-react'
import type { Commit } from '@/types'

export function CommitDetailModal({
  commit,
  onClose,
}: {
  commit: Commit | null
  onClose: () => void
}) {
  if (!commit) return null

  const getClassificationColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'FEATURE': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'BUGFIX': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      case 'DOCS': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
      case 'REFACTOR': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      case 'TEST': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
      case 'CHORE': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const commitDate = new Date(commit.committedAt)
  const timeFormatted = commitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateFormatted = commitDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Modal isOpen={!!commit} onClose={onClose} title="Commit Analysis">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4 mb-3">
            <Badge className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 ${getClassificationColor(commit.classification)}`} variant="outline">
              {commit.classification}
            </Badge>
            <div className="flex items-center gap-1.5 font-mono text-sm bg-white dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
              <GitCommit className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{commit.sha.substring(0, 8)}</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {commit.message}
          </h3>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950">
            <div className="mt-0.5 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Author</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{commit.authorName}</p>
              <p className="text-xs text-slate-500 truncate max-w-[140px]" title={commit.authorEmail}>{commit.authorEmail}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950">
            <div className="mt-0.5 bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-md">
              <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Committed On</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{dateFormatted}</p>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>{timeFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code className="h-4 w-4 text-slate-500" />
            Code Impact
          </h4>
          
          <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <GitBranch className="h-4 w-4" />
                <span>Branch: <strong className="text-slate-900 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">{commit.branch || 'main'}</strong></span>
              </div>
              {commit.sqs !== undefined && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  SQS: {commit.sqs}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <PlusCircle className="h-3 w-3 text-emerald-500" /> Insertions
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{commit.insertions || 0}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (commit.insertions / (commit.insertions + commit.deletions || 1)) * 100)}%` }}></div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <MinusCircle className="h-3 w-3 text-red-500" /> Deletions
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">-{commit.deletions || 0}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (commit.deletions / (commit.insertions + commit.deletions || 1)) * 100)}%` }}></div>
                </div>
              </div>
            </div>
            
            {commit.filesChanged !== undefined && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>Modified <strong>{commit.filesChanged}</strong> {commit.filesChanged === 1 ? 'file' : 'files'} in this commit</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          {commit.repository && (
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
              <ExternalLink className="h-4 w-4" />
              View in Repository
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
