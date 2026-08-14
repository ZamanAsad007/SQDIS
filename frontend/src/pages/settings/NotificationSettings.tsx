import { useState } from 'react'
import { 
  Bell, Mail, Smartphone, Slack, Save, 
  CheckCircle2, MessageSquare, HeartPulse
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function NotificationSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Notification configuration state
  const [settings, setSettings] = useState({
    // Global channels
    emailEnabled: true,
    inAppEnabled: true,
    slackEnabled: false,
    
    // Quality & Alerts
    sqsDrops: { email: true, inApp: true },
    newDebt: { email: false, inApp: true },
    buildFailures: { email: true, inApp: true },
    
    // Reviews & Collaboration
    prReviews: { email: true, inApp: true },
    mentions: { email: true, inApp: true },
    teamAnnouncements: { email: true, inApp: true },
    
    // System
    weeklyDigest: { email: true, inApp: false },
    billingAlerts: { email: true, inApp: true },
  })

  const handleToggle = (category: string, channel: 'email' | 'inApp') => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }))
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }, 800)
  }

  return (
    <div className="space-y-6">
      
      {/* Global Channels Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            Notification Channels
          </CardTitle>
          <CardDescription>Select where you want to receive notifications overall.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-slate-500">Receive alerts in your inbox</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.emailEnabled} onChange={() => setSettings(s => ({...s, emailEnabled: !s.emailEnabled}))} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">In-App Notifications</p>
                <p className="text-sm text-slate-500">Show alerts in the dashboard bell icon</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.inAppEnabled} onChange={() => setSettings(s => ({...s, inAppEnabled: !s.inAppEnabled}))} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 opacity-70">
            <div className="flex items-center gap-3">
              <Slack className="h-5 w-5 text-slate-400" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900 dark:text-white">Slack Integration</p>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">Coming Soon</Badge>
                </div>
                <p className="text-sm text-slate-500">Direct messages and channel alerts</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>Connect Slack</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-red-500" />
            Quality & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-left">Event Type</th>
                  <th className="px-4 py-3 font-medium text-center w-24">Email</th>
                  <th className="px-4 py-3 font-medium text-center w-24">In-App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">Quality Score Drop</p>
                    <p className="text-xs text-slate-500 mt-0.5">When a repository's SQS falls below threshold</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.sqsDrops.email} onChange={() => handleToggle('sqsDrops', 'email')} disabled={!settings.emailEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.sqsDrops.inApp} onChange={() => handleToggle('sqsDrops', 'inApp')} disabled={!settings.inAppEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">New Technical Debt</p>
                    <p className="text-xs text-slate-500 mt-0.5">When high-severity technical debt is identified</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.newDebt.email} onChange={() => handleToggle('newDebt', 'email')} disabled={!settings.emailEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.newDebt.inApp} onChange={() => handleToggle('newDebt', 'inApp')} disabled={!settings.inAppEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-left">Event Type</th>
                  <th className="px-4 py-3 font-medium text-center w-24">Email</th>
                  <th className="px-4 py-3 font-medium text-center w-24">In-App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">Mentions</p>
                    <p className="text-xs text-slate-500 mt-0.5">When someone @mentions you in a comment or review</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.mentions.email} onChange={() => handleToggle('mentions', 'email')} disabled={!settings.emailEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.mentions.inApp} onChange={() => handleToggle('mentions', 'inApp')} disabled={!settings.inAppEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">PR Reviews Assigned</p>
                    <p className="text-xs text-slate-500 mt-0.5">When a pull request is assigned to you for review</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.prReviews.email} onChange={() => handleToggle('prReviews', 'email')} disabled={!settings.emailEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" checked={settings.prReviews.inApp} onChange={() => handleToggle('prReviews', 'inApp')} disabled={!settings.inAppEnabled} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 py-4 flex items-center justify-between">
          <div className="flex items-center h-6">
            {showSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" /> Settings saved successfully
              </span>
            )}
          </div>
          <Button onClick={handleSave} isLoading={isSaving} className="gap-2 min-w-[120px]">
            <Save className="h-4 w-4" /> Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
