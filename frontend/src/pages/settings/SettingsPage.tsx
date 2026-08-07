import { useState } from 'react'
import { Building, Github, GitBranch, Users, Mail, User, Bell, HelpCircle } from 'lucide-react'
import { PageHeader } from '../pageUtils'
import { OrganizationSettings } from './OrganizationSettings'
import { GitHubSettingsPage } from './GitHubSettingsPage'
import { RepositoriesPage } from './RepositoriesPage'
import { MembersPage } from './MembersPage'
import { InvitationsPage } from './InvitationsPage'
import { EmailAliasesPage } from './EmailAliasesPage'
import { UnmappedEmailsPage } from './UnmappedEmailsPage'
import { ProfileSettings } from './ProfileSettings'
import { NotificationSettings } from './NotificationSettings'

type SettingsTab =
  | 'profile'
  | 'organization'
  | 'github'
  | 'repositories'
  | 'members'
  | 'invitations'
  | 'email-aliases'
  | 'unmapped-emails'
  | 'notifications'

export function SettingsPage({ initialTab = 'profile' }: { initialTab?: SettingsTab }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'organization', label: 'Organization', icon: <Building className="h-4 w-4" /> },
    { id: 'github', label: 'GitHub App', icon: <Github className="h-4 w-4" /> },
    { id: 'repositories', label: 'Repositories', icon: <GitBranch className="h-4 w-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
    { id: 'invitations', label: 'Invitations', icon: <Mail className="h-4 w-4" /> },
    { id: 'email-aliases', label: 'Email Aliases', icon: <Mail className="h-4 w-4" /> },
    { id: 'unmapped-emails', label: 'Unmapped Emails', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  ]

  return (
    <div>
      <PageHeader
        title="Settings & Administration"
        description="Configure your personal profile, organization parameters, integrations, and access control."
      />

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-3">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'organization' && <OrganizationSettings />}
          {activeTab === 'github' && <GitHubSettingsPage />}
          {activeTab === 'repositories' && <RepositoriesPage />}
          {activeTab === 'members' && <MembersPage />}
          {activeTab === 'invitations' && <InvitationsPage />}
          {activeTab === 'email-aliases' && <EmailAliasesPage />}
          {activeTab === 'unmapped-emails' && <UnmappedEmailsPage />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </div>
  )
}
