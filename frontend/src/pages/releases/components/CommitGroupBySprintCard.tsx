import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { GitCommit, Search, Filter, Activity, PlusCircle, MinusCircle, FileCode } from 'lucide-react'
import type { Commit, CommitClassification } from '@/types'

export function CommitGroupBySprintCard({
  sprintName,
  commits,
  onSelectCommit,
}: {
  sprintName: string
  commits: Commit[]
  onSelectCommit?: (commit: Commit) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [classificationFilter, setClassificationFilter] = useState<CommitClassification | 'ALL'>('ALL')

  const classifications = useMemo(() => {
    const counts = commits.reduce((acc, c) => {
      acc[c.classification] = (acc[c.classification] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([type, count]) => ({ type, count }))
  }, [commits])

  const filteredCommits = useMemo(() => {
    return commits.filter(c => {
      const matchesSearch = c.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.sha.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = classificationFilter === 'ALL' || c.classification === classificationFilter
      return matchesSearch && matchesClass
    })
  }, [commits, searchTerm, classificationFilter])

  const totalInsertions = commits.reduce((sum, c) => sum + (c.insertions || 0), 0)
  const totalDeletions = commits.reduce((sum, c) => sum + (c.deletions || 0), 0)
  const totalFilesChanged = commits.reduce((sum, c) => sum + (c.filesChanged || 0), 0)

  const getClassificationColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'FEATURE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'BUGFIX': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'DOCS': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      case 'REFACTOR': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'TEST': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'CHORE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            <span>{sprintName} Activity</span>
          </CardTitle>
          <Badge variant="secondary" className="px-3 py-1 font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
            {commits.length} Commits
          </Badge>
        </div>
        
        {/* Velocity Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 flex items-center gap-1"><PlusCircle className="h-3 w-3" /> Insertions</span>
            <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">+{totalInsertions}</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-4">
            <span className="text-xs text-slate-500 flex items-center gap-1"><MinusCircle className="h-3 w-3" /> Deletions</span>
            <span className="text-lg font-semibold text-red-600 dark:text-red-400">-{totalDeletions}</span>
          </div>
          <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-4">
            <span className="text-xs text-slate-500 flex items-center gap-1"><FileCode className="h-3 w-3" /> Files Changed</span>
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{totalFilesChanged}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow flex flex-col min-h-[400px]">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-950">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by commit message, author, or SHA..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-slate-400" />
            <button
              onClick={() => setClassificationFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                classificationFilter === 'ALL' 
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              All
            </button>
            {classifications.map(({ type, count }) => (
              <button
                key={type}
                onClick={() => setClassificationFilter(type as CommitClassification)}
                className={`px-2.5 py-1 text-xs rounded-full border flex items-center gap-1.5 transition-colors ${
                  classificationFilter === type 
                    ? getClassificationColor(type) 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
                }`}
              >
                <span>{type}</span>
                <span className="opacity-60 text-[10px] bg-black/10 dark:bg-white/10 px-1.5 rounded-full">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Commit List */}
        <div className="flex-grow overflow-y-auto p-2">
          {filteredCommits.length > 0 ? (
            <div className="space-y-1">
              {filteredCommits.map((commit) => (
                <div
                  key={commit.id || commit.sha}
                  onClick={() => onSelectCommit?.(commit)}
                  className="group flex flex-col p-3 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg border border-transparent hover:border-blue-100 dark:hover:border-blue-800/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 min-w-0 flex-grow">
                      <div className="mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                          <GitCommit className="h-4 w-4 text-slate-500 group-hover:text-blue-500" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {commit.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{commit.authorName || 'Developer'}</span>
                          <span>•</span>
                          <span>{new Date(commit.committedAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {commit.sha?.substring(0, 7)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={`text-[10px] uppercase font-bold tracking-wider ${getClassificationColor(commit.classification)}`} variant="outline">
                        {commit.classification}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        {commit.insertions > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{commit.insertions}</span>}
                        {commit.deletions > 0 && <span className="text-red-600 dark:text-red-400">-{commit.deletions}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-900 dark:text-slate-100 font-medium mb-1">No commits found</p>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                {commits.length === 0 
                  ? "No commits have been linked to this sprint yet." 
                  : "We couldn't find any commits matching your current filters."}
              </p>
              {commits.length > 0 && (searchTerm || classificationFilter !== 'ALL') && (
                <button 
                  onClick={() => { setSearchTerm(''); setClassificationFilter('ALL'); }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
