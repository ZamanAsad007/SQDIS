import { PageHeader } from '../pageUtils'
import { MembersPage } from '../settings/MembersPage'

export function OrgMembersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Members"
        description="Manage members, role permissions, invitations, and access control for your organization."
      />
      <MembersPage />
    </div>
  )
}

export default OrgMembersPage
