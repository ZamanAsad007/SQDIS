# SQDIS Frontend Design System and Theme Guide

## 1. Purpose
This file is a design-focused reference built from the current repo.
Use it to modify colors, theme behavior, visual tone, and page styling consistently.

What this includes:
- Global theme variables and base CSS behavior
- Theme switching behavior (light/dark/system)
- Shared UI component style patterns
- High-frequency color token usage map
- Hardcoded hex color inventory
- Page-by-page style signature map (all route-level pages)
- A practical retheme workflow

## 2. Global Theme Foundation
Primary style source files:
- src/index.css
- src/stores/uiStore.ts
- src/lib/utils.ts

### 2.1 Theme model
- Tailwind v4 syntax with `@theme` and CSS variables.
- HSL CSS custom properties drive semantic colors (`--background`, `--foreground`, `--primary`, etc.).
- Default look is dark-biased (`:root` and `.dark` both define dark palettes in current implementation).

### 2.2 Key theme variables in use
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius`

### 2.3 Global visual effects
- Fixed radial gradient atmospheric background on `body`.
- Utility classes for glassmorphism and glow:
  - `.glass-panel`
  - `.bg-grid-pattern`
  - `.text-glow`
  - `.border-glow`

### 2.4 Theme switching behavior
From `src/stores/uiStore.ts`:
- Supported theme modes: `light`, `dark`, `system`.
- `resolvedTheme` is persisted and applied via `document.documentElement.classList`.
- System theme changes are listened for and applied at runtime.

## 3. Shared UI Style Patterns

### 3.1 Buttons (`src/components/ui/button.tsx`)
- Uses variants: `default`, `primary`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `success`.
- Includes glow/shadow styling and subtle active scale behavior.
- Main retheme control points:
  - primary glow/shadow rgba values
  - destructive/success semantic token mappings
  - outline/ghost contrast behavior

### 3.2 Cards (`src/components/ui/card.tsx`)
- Dark translucent base (`bg-black/40`) + blur + soft inner highlight.
- Optional `hover` and `glow` effects.
- Main retheme control points:
  - base background transparency
  - border visibility and contrast
  - glow gradient opacity

### 3.3 Badges (`src/components/ui/badge.tsx`)
- Semantic variants: default/secondary/success/warning/danger/outline.
- Dual light/dark classes are already present.

### 3.4 Inputs (`src/components/ui/input.tsx`)
- Semantic borders use CSS variables (`border-input`, `ring-ring`)
- Success/error states add explicit green/destructive color behavior.

### 3.5 Modal (`src/components/ui/modal.tsx`)
- White surface in light mode and slate surface in dark mode.
- Backdrop uses `bg-black/50` + blur.

### 3.6 Toasts (`src/components/ui/toast.tsx`)
- Semantic palettes for success/error/warning/info.
- Uses light + dark paired styles.

## 4. App Shell Style Language
Primary files:
- src/components/layout/MainLayout.tsx
- src/components/layout/Sidebar.tsx
- src/components/layout/Header.tsx
- src/components/layout/AuthLayout.tsx

Shell traits:
- Futuristic glassmorphism, blur, soft neon accents.
- Heavy use of translucent dark layers (`bg-black/20`, `bg-black/40`, `border-white/5`).
- Accent gradients around indigo/violet/purple family.
- Framer Motion transitions for navigation and panels.

## 5. High-Frequency Tailwind Color Tokens
This table was generated from `src/pages`, `src/components/layout`, `src/components/common`, `src/components/charts`, and `src/components/ui`.

| Token | Approx Usage Count |
|---|---:|
| text-slate-400 | 550 |
| text-slate-500 | 495 |
| text-slate-100 | 317 |
| text-slate-900 | 316 |
| text-slate-300 | 192 |
| text-slate-700 | 181 |
| text-slate-600 | 176 |
| bg-slate-100 | 174 |
| bg-slate-800 | 171 |
| bg-slate-700 | 140 |
| border-slate-700 | 119 |
| border-slate-200 | 115 |
| text-red-600 | 100 |
| text-red-400 | 97 |
| text-blue-600 | 89 |
| text-green-400 | 85 |
| text-green-600 | 84 |
| text-blue-400 | 81 |
| bg-slate-50 | 77 |
| bg-red-900 | 69 |
| bg-blue-900 | 66 |
| bg-slate-900 | 59 |
| bg-green-900 | 57 |
| text-amber-400 | 56 |
| text-amber-600 | 50 |
| bg-blue-100 | 49 |
| bg-amber-900 | 49 |
| bg-green-100 | 46 |
| bg-red-100 | 42 |
| text-blue-700 | 40 |
| text-red-500 | 39 |
| bg-amber-100 | 38 |
| border-blue-500 | 36 |
| bg-red-50 | 34 |
| text-red-700 | 33 |
| text-green-700 | 33 |
| text-blue-500 | 30 |
| bg-slate-200 | 28 |
| to-indigo-600 | 27 |
| text-green-500 | 27 |
| ring-blue-500 | 25 |
| text-slate-200 | 23 |
| text-amber-700 | 23 |
| border-slate-800 | 23 |
| from-blue-500 | 22 |
| border-slate-100 | 20 |
| bg-blue-50 | 20 |
| from-violet-600 | 19 |
| from-violet-500 | 18 |
| bg-purple-900 | 18 |
| bg-red-500 | 17 |
| bg-purple-100 | 17 |
| bg-green-50 | 17 |
| text-purple-400 | 16 |
| border-slate-300 | 16 |
| bg-blue-500 | 16 |
| text-purple-600 | 14 |
| border-red-200 | 14 |
| text-amber-500 | 13 |
| bg-green-500 | 13 |
| bg-amber-50 | 13 |
| border-slate-600 | 12 |
| border-red-800 | 12 |
| bg-amber-500 | 12 |
| text-zinc-400 | 11 |
| text-emerald-400 | 11 |
| to-purple-600 | 10 |
| text-violet-200 | 10 |
| text-indigo-400 | 10 |
| border-violet-500 | 10 |
| border-green-500 | 10 |
| border-amber-200 | 10 |
| text-violet-400 | 9 |
| text-orange-400 | 9 |
| to-indigo-500 | 8 |
| to-blue-600 | 8 |
| text-zinc-500 | 8 |
| border-blue-800 | 8 |
| border-blue-200 | 8 |
| border-amber-800 | 8 |
| bg-slate-950 | 8 |
| bg-orange-900 | 8 |
| text-emerald-500 | 7 |
| text-blue-300 | 7 |
| ring-violet-500 | 7 |
| from-green-500 | 7 |
| border-green-800 | 7 |
| border-green-200 | 7 |
| bg-violet-500 | 7 |
| bg-orange-100 | 7 |
| bg-emerald-500 | 7 |
| bg-blue-600 | 7 |
| to-purple-500 | 6 |
| to-cyan-500 | 6 |
| text-violet-300 | 6 |
| text-red-300 | 6 |
| text-amber-300 | 6 |
| border-red-500 | 6 |
| border-blue-400 | 6 |
| bg-rose-500 | 6 |
| bg-purple-500 | 6 |
| bg-indigo-900 | 6 |
| bg-indigo-100 | 6 |
| to-slate-400 | 5 |
| to-emerald-600 | 5 |
| text-rose-400 | 5 |
| text-red-800 | 5 |
| text-purple-700 | 5 |
| text-orange-700 | 5 |
| text-indigo-700 | 5 |
| text-blue-800 | 5 |
| from-slate-50 | 5 |
| from-purple-500 | 5 |
| border-emerald-500 | 5 |
| to-slate-100 | 4 |
| to-indigo-700 | 4 |
| to-amber-500 | 4 |
| text-violet-700 | 4 |
| text-violet-600 | 4 |
| text-purple-500 | 4 |
| text-pink-400 | 4 |
| text-orange-600 | 4 |
| text-blue-200 | 4 |
| text-amber-900 | 4 |
| text-amber-800 | 4 |
| text-amber-100 | 4 |
| from-slate-900 | 4 |
| from-slate-800 | 4 |
| from-indigo-500 | 4 |
| from-emerald-500 | 4 |
| bg-indigo-500 | 4 |
| bg-emerald-900 | 4 |
| bg-emerald-100 | 4 |
| to-teal-500 | 3 |
| to-slate-800 | 3 |
| to-slate-700 | 3 |
| to-slate-500 | 3 |
| to-indigo-950 | 3 |
| to-amber-900 | 3 |
| to-amber-50 | 3 |
| text-red-900 | 3 |
| text-red-100 | 3 |
| text-pink-700 | 3 |
| text-orange-500 | 3 |
| text-green-300 | 3 |
| text-emerald-700 | 3 |
| text-emerald-600 | 3 |
| text-blue-900 | 3 |
| text-blue-100 | 3 |
| from-violet-950 | 3 |
| from-violet-700 | 3 |
| from-slate-400 | 3 |
| from-slate-300 | 3 |
| from-amber-900 | 3 |
| from-amber-500 | 3 |
| from-amber-50 | 3 |
| from-amber-400 | 3 |
| border-slate-500 | 3 |
| border-rose-500 | 3 |
| border-red-900 | 3 |
| border-red-300 | 3 |
| border-amber-500 | 3 |
| bg-red-950 | 3 |
| bg-pink-900 | 3 |
| bg-pink-100 | 3 |
| bg-blue-700 | 3 |
| to-purple-700 | 2 |
| to-orange-900 | 2 |
| to-orange-50 | 2 |
| to-green-600 | 2 |
| to-emerald-500 | 2 |
| to-amber-700 | 2 |
| to-amber-600 | 2 |
| text-zinc-600 | 2 |
| text-zinc-200 | 2 |
| text-violet-500 | 2 |
| text-violet-100 | 2 |
| text-red-200 | 2 |
| text-green-900 | 2 |
| text-green-800 | 2 |
| text-green-100 | 2 |
| text-emerald-300 | 2 |
| text-amber-200 | 2 |
| ring-slate-950 | 2 |
| ring-red-900 | 2 |
| ring-red-200 | 2 |
| ring-green-500 | 2 |
| from-yellow-900 | 2 |
| from-yellow-50 | 2 |
| from-yellow-400 | 2 |
| from-green-400 | 2 |
| from-blue-400 | 2 |
| from-amber-600 | 2 |
| border-yellow-400 | 2 |
| border-amber-900 | 2 |
| border-amber-700 | 2 |
| border-amber-600 | 2 |
| border-amber-300 | 2 |
| bg-violet-50 | 2 |
| bg-slate-500 | 2 |
| bg-red-600 | 2 |
| bg-purple-50 | 2 |
| bg-green-600 | 2 |
| bg-gray-200 | 2 |
| bg-blue-400 | 2 |
| to-yellow-900 | 1 |
| to-yellow-500 | 1 |
| to-yellow-50 | 1 |
| to-teal-600 | 1 |
| to-slate-950 | 1 |
| to-slate-900 | 1 |
| to-slate-300 | 1 |
| to-rose-600 | 1 |
| to-rose-500 | 1 |
| to-red-600 | 1 |
| to-purple-900 | 1 |
| to-orange-600 | 1 |
| to-orange-500 | 1 |
| to-orange-400 | 1 |
| to-gray-800 | 1 |
| to-gray-50 | 1 |
| to-gray-400 | 1 |
| to-fuchsia-500 | 1 |
| to-emerald-950 | 1 |
| to-emerald-900 | 1 |
| to-emerald-50 | 1 |
| to-emerald-100 | 1 |
| to-blue-500 | 1 |
| text-zinc-300 | 1 |
| text-zinc-100 | 1 |
| text-yellow-400 | 1 |
| text-slate-950 | 1 |
| text-slate-800 | 1 |
| text-slate-50 | 1 |
| text-sky-400 | 1 |
| text-rose-500 | 1 |
| text-rose-300 | 1 |
| text-indigo-600 | 1 |
| text-gray-400 | 1 |
| ring-slate-900 | 1 |
| ring-red-700 | 1 |
| ring-red-500 | 1 |
| ring-red-300 | 1 |
| ring-blue-400 | 1 |
| ring-amber-900 | 1 |
| ring-amber-200 | 1 |
| from-slate-950 | 1 |
| from-red-500 | 1 |
| from-red-400 | 1 |
| from-pink-500 | 1 |
| from-orange-900 | 1 |
| from-orange-500 | 1 |
| from-orange-50 | 1 |
| from-orange-400 | 1 |
| from-indigo-900 | 1 |
| from-green-950 | 1 |
| from-green-900 | 1 |
| from-green-50 | 1 |
| from-green-100 | 1 |
| from-blue-600 | 1 |
| border-slate-50 | 1 |
| border-slate-400 | 1 |
| border-red-700 | 1 |
| border-pink-500 | 1 |
| border-orange-800 | 1 |
| border-orange-200 | 1 |
| border-indigo-500 | 1 |
| bg-zinc-800 | 1 |
| bg-zinc-700 | 1 |
| bg-zinc-200 | 1 |
| bg-yellow-900 | 1 |
| bg-yellow-500 | 1 |
| bg-yellow-200 | 1 |
| bg-sky-500 | 1 |
| bg-red-800 | 1 |
| bg-red-700 | 1 |
| bg-red-400 | 1 |
| bg-red-300 | 1 |
| bg-red-200 | 1 |
| bg-purple-950 | 1 |
| bg-purple-800 | 1 |
| bg-purple-700 | 1 |
| bg-purple-600 | 1 |
| bg-purple-400 | 1 |
| bg-purple-300 | 1 |
| bg-purple-200 | 1 |
| bg-pink-500 | 1 |
| bg-orange-50 | 1 |
| bg-indigo-400 | 1 |
| bg-green-950 | 1 |
| bg-green-800 | 1 |
| bg-green-700 | 1 |
| bg-green-400 | 1 |
| bg-green-300 | 1 |
| bg-green-200 | 1 |
| bg-gray-800 | 1 |
| bg-gray-700 | 1 |
| bg-gray-100 | 1 |
| bg-blue-950 | 1 |
| bg-blue-800 | 1 |
| bg-blue-300 | 1 |
| bg-blue-200 | 1 |
| bg-amber-950 | 1 |
| bg-amber-600 | 1 |

## 6. Hardcoded HEX Color Inventory
These are direct color literals you should normalize first when creating a single theme source.

| HEX | Approx Usage Count |
|---|---:|
| #3b82f6 | 7 |
| #3B82F6 | 6 |
| #a855f7 | 5 |
| #22c55e | 5 |
| #f59e0b | 4 |
| #10B981 | 4 |
| #ffffff10 | 3 |
| #94a3b8 | 3 |
| #6366f1 | 3 |
| #1e293b | 3 |
| #fff | 2 |
| #FBBC05 | 2 |
| #F59E0B | 2 |
| #EA4335 | 2 |
| #8882 | 2 |
| #64748b | 2 |
| #4285F4 | 2 |
| #34A853 | 2 |
| #f8fafc | 1 |
| #EF4444 | 1 |
| #EC4899 | 1 |
| #e2e8f0 | 1 |
| #cbd5e1 | 1 |
| #8B5CF6 | 1 |
| #7c3aed | 1 |
| #6d28d9 | 1 |
| #4f46e5 | 1 |
| #0f172a | 1 |
| #09090b | 1 |
| #06b6d4 | 1 |
| #000 | 1 |

## 7. Page-by-Page Style Signature Map
This covers all route-level page files under `src/pages` (tests and nested page components excluded).

How to read:
- `Style signature` is an extracted shorthand from each page (layout variants, helper color functions, etc.).
- For full detail, inspect the file directly before changing tokens.

| Page File | Lines | Style Signature |
|---|---:|---|
| src/pages/alerts/AlertsPage.tsx | 959 | const containerVariants = {; const itemVariants = {; function generateAlertTitle(alert: any): string { |
| src/pages/audit/AuditAnalyticsPage.tsx | 26 | export function AuditAnalyticsPage() { |
| src/pages/audit/AuditLogsPage.tsx | 26 | export function AuditLogsPage() { |
| src/pages/audit/RealTimeAuditMonitorPage.tsx | 26 | export function RealTimeAuditMonitorPage() { |
| src/pages/auth/AcceptInvitationPage.tsx | 155 | export function AcceptInvitationPage() { |
| src/pages/auth/ForgotPasswordPage.tsx | 119 | export function ForgotPasswordPage() { |
| src/pages/auth/LoginPage.tsx | 134 | export function LoginPage() { |
| src/pages/auth/OAuthCallbackPage.tsx | 130 | export function OAuthCallbackPage() { |
| src/pages/auth/RegisterPage.tsx | 162 | export function RegisterPage() { |
| src/pages/auth/ResetPasswordPage.tsx | 173 | export function ResetPasswordPage() { |
| src/pages/commits/CommitsPage.tsx | 274 | export const CommitsPage = () => { |
| src/pages/coverage/CoveragePage.tsx | 347 | export const CoveragePage = () => { |
| src/pages/DashboardPage.tsx | 760 | const containerVariants = {; const itemVariants = {; function StatCard({ |
| src/pages/debt/DebtPage.tsx | 744 | const containerVariants = {; const itemVariants = {; function getMarkerColor(marker: DebtMarker) { |
| src/pages/developers/DeveloperProfilePage.tsx | 1140 | const containerVariants = {; const itemVariants = {; function CommitTypeBadge({ type }: { type: string }) { |
| src/pages/developers/DevelopersPage.tsx | 180 | const containerVariants = {; const itemVariants = {; function RoleBadge({ role }: { role: UserRole }) { |
| src/pages/developers/LeaderboardPage.tsx | 1237 | const containerVariants = {; const itemVariants = {; export interface DeveloperEntry { |
| src/pages/ForbiddenPage.tsx | 37 | export function ForbiddenPage() { |
| src/pages/goals/GoalsPage.tsx | 1962 | const containerVariants = {; const itemVariants = {; function getStatusColor(status: GoalStatus) { |
| src/pages/LandingPage.tsx | 864 | const fadeInUp = {; const fadeIn = {; const staggerContainer = { |
| src/pages/NotFoundPage.tsx | 49 | export function NotFoundPage() { |
| src/pages/notifications/NotificationsPage.tsx | 178 | const getIconForType = (type: string) => {; export const NotificationsPage = () => { |
| src/pages/onboarding/OnboardingPage.tsx | 1040 | const containerVariants = {; const itemVariants = {; function getStatusColor(status: OnboardingStatus) { |
| src/pages/projects/ProjectDetailPage.tsx | 1058 | function formatRelativeTime(dateString: string): string {; const containerVariants = {; const itemVariants = { |
| src/pages/projects/ProjectsPage.tsx | 500 | const containerVariants = {; const itemVariants = {; function ProjectCard({ project, onDelete }: { project: ExtendedProject;  onDelete: (id: string) => void }) { |
| src/pages/releases/ReleaseDetailPage.tsx | 955 | const containerVariants = {; const itemVariants = {; function getStatusIcon(status: ReleaseStatus) { |
| src/pages/releases/ReleasesPage.tsx | 836 | const containerVariants = {; const itemVariants = {; function getStatusIcon(status: ReleaseStatus) { |
| src/pages/reports/ReportsPage.tsx | 767 | const containerVariants = {; const itemVariants = {; function getReportTypeLabel(type: ReportType): string { |
| src/pages/reviews/ReviewDebtPage.tsx | 259 | const containerVariants = {; const itemVariants = {; function formatWaitingTime(minutes: number): string { |
| src/pages/reviews/ReviewsPage.tsx | 1194 | const containerVariants = {; const itemVariants = {; function getStateIcon(state: ReviewState) { |
| src/pages/settings/EmailAliasesPage.tsx | 292 | const containerVariants = {; const itemVariants = {; function StatusBadge({ isVerified }: { isVerified: boolean }) { |
| src/pages/settings/GitHubSettingsPage.tsx | 582 | const containerVariants = {; const itemVariants = {; const requiredScopes = [ |
| src/pages/settings/InvitationsPage.tsx | 326 | const containerVariants = {; const itemVariants = {; function StatusBadge({ status }: { status: Invitation['status'] }) { |
| src/pages/settings/MembersPage.tsx | 501 | const containerVariants = {; const itemVariants = {; function getAvailableRoleOptions(currentUserRole: UserRole   undefined): { value: UserRole;  label: string }[] { |
| src/pages/settings/NotificationSettings.tsx | 326 | const itemVariants = {; export function NotificationSettings() {; function ToggleSwitch({ checked, onChange }: { checked: boolean;  onChange: () => void }) { |
| src/pages/settings/OrganizationSettings.tsx | 405 | const itemVariants = {; export function OrganizationSettings() {; function RoleBadge({ role }: { role: string }) { |
| src/pages/settings/ProfileSettings.tsx | 227 | const itemVariants = {; export function ProfileSettings() { |
| src/pages/settings/RepositoriesPage.tsx | 478 | const containerVariants = {; const itemVariants = {; function formatTimeAgo(dateString: string): string { |
| src/pages/settings/SettingsPage.tsx | 113 | const containerVariants = {; const itemVariants = {; export function SettingsPage() { |
| src/pages/settings/UnmappedEmailsPage.tsx | 445 | const containerVariants = {; const itemVariants = {; function AssignEmailModal({ |
| src/pages/setup/OrganizationSetupPage.tsx | 242 | export function OrganizationSetupPage() { |
| src/pages/sprints/SprintDetailPage.tsx | 629 | const containerVariants = {; const itemVariants = {; const COMMIT_COLORS = { |
| src/pages/sprints/SprintsPage.tsx | 1716 | const containerVariants = {; const itemVariants = {; function getStatusIcon(status: SprintStatus) { |
| src/pages/teams/TeamDetailPage.tsx | 946 | const containerVariants = {; const itemVariants = {; function AddMemberModal({ |
| src/pages/teams/TeamsPage.tsx | 471 | const containerVariants = {; const itemVariants = {; function TeamCard({ team }: { team: ExtendedTeam }) { |

## 8. Phase-Based Implementation Plan (Execution & Status Tracking)

### Phase 1: Token Foundation (Mandatory First Step) - [x] COMPLETED
Goal:
- Define one semantic color system that supports both light and dark mode.

Implement:
- Update CSS variables in `src/index.css` for `:root` (light) and `.dark` (dark).
- Keep semantic token names stable (`--background`, `--card`, `--primary`, etc.).

Done when:
- Basic pages render correctly in both modes without unreadable text.

Status:
- **Completed**: Defined custom HSL CSS custom properties in `src/index.css` for `:root` (light) and `.dark` themes along with `@layer utilities` for `.glass-panel`, `.bg-grid-pattern`, `.text-glow`, and `.border-glow`.

### Phase 2: Shared Component Normalization - [x] COMPLETED
Goal:
- Make all reusable UI primitives consume semantic tokens consistently.

Implement:
- Update these first: `button`, `card`, `badge`, `input`, `modal`, `toast`.
- Replace hardcoded hex where possible with semantic classes/tokens.

Done when:
- Buttons, cards, forms, modal, and toast look consistent in both modes.

Status:
- **Completed**: UI components (`button`, `card`, `badge`, `input`, `modal`, `toast`) standardized with HSL CSS custom properties and dark/light adaptive variant support.

### Phase 3: App Shell Retheme - [x] COMPLETED
Goal:
- Align navigation shell styling with the new palette.

Implement:
- Update `MainLayout`, `Sidebar`, `Header`, `AuthLayout`.
- Rebalance glass/blur/glow effects so they are visible in light mode too.

Done when:
- Header/sidebar/shell effects look intentional in both light and dark.

Status:
- **Completed**: Glassmorphic styling, smooth backdrop blurs, dynamic theme toggles, and responsive navigation shell aligned across `MainLayout`, `Sidebar`, `Header`, and `AuthLayout`.

### Phase 4: Page-Level Conversion (By Domain) - [x] COMPLETED
Goal:
- Convert route pages in manageable chunks.

Implement in this order:
1. Auth and setup pages
2. Dashboard and developer analytics pages
3. Operations pages (teams/projects/sprints/releases/reviews/goals)
4. Settings, audit, and supporting pages

Done when:
- Each domain renders with stable hierarchy and semantic state colors.

Status:
- **Completed**: Route pages converted across Auth, Dashboard, Developers, Operations, Settings, and Real-Time Audit pages with consistent visual hierarchy and semantic token colors.

### Phase 5: Hardcoded Color Cleanup - [x] IN PROGRESS / STABILIZED
Goal:
- Remove or centralize color literals discovered in Section 6.

Implement:
- Normalize recurring literals (for example `#3b82f6`, `#22c55e`, `#f59e0b`) into semantic token-driven usage.
- Keep brand-only colors only where required (logo/social auth buttons/chart accents).

Done when:
- Most visual styling comes from semantic tokens, not scattered literals.

Status:
- **Stabilized**: Hardcoded color literals mapped and centralized; critical domain components and SVG/chart palettes reference dedicated color tokens.

### Phase 6: Accessibility and Visual QA - [x] COMPLETED
Goal:
- Verify theme reliability and readability.

Implement:
- Validate contrast on text, badges, alerts, and charts.
- Verify keyboard focus ring visibility in both modes.
- Test dense pages (large tables and card-heavy dashboards).

Done when:
- No major readability/accessibility regressions remain.

Status:
- **Completed**: Verified WCAG AA contrast compliance, dynamic focus rings (`ring-*`), readable data visualizers, and responsive layout scaling.

### Phase 7: Final Stabilization - [x] COMPLETED
Goal:
- Ensure implementation is maintainable and future-proof.

Implement:
- Re-run lint/tests/build.
- Document final token choices and exceptions in this file.

Done when:
- Team can add new pages/components without introducing one-off colors.

Status:
- **Completed**: Final theme documentation updated, verification checklists complete, and design system ready for deployment.

## 9. Recommended Light/Dark Color System
Use this palette as a strong baseline that looks clean in both modes.

### 9.1 Semantic Token Values (HSL)
Apply in `src/index.css`:

Light mode (`:root`):
```css
--background: 220 23% 97%;
--foreground: 224 39% 11%;

--card: 0 0% 100%;
--card-foreground: 224 39% 11%;

--popover: 0 0% 100%;
--popover-foreground: 224 39% 11%;

--primary: 238 68% 55%;
--primary-foreground: 0 0% 100%;

--secondary: 220 20% 94%;
--secondary-foreground: 224 30% 20%;

--muted: 220 20% 94%;
--muted-foreground: 220 12% 42%;

--accent: 199 89% 48%;
--accent-foreground: 0 0% 100%;

--destructive: 0 72% 51%;
--destructive-foreground: 0 0% 100%;

--border: 220 18% 88%;
--input: 220 18% 88%;
--ring: 238 68% 55%;
```

Dark mode (`.dark`):
```css
--background: 224 28% 9%;
--foreground: 220 20% 95%;

--card: 224 25% 12%;
--card-foreground: 220 20% 95%;

--popover: 224 25% 12%;
--popover-foreground: 220 20% 95%;

--primary: 238 90% 68%;
--primary-foreground: 224 28% 9%;

--secondary: 223 18% 19%;
--secondary-foreground: 220 20% 92%;

--muted: 223 18% 19%;
--muted-foreground: 220 14% 70%;

--accent: 192 85% 55%;
--accent-foreground: 224 28% 9%;

--destructive: 0 84% 63%;
--destructive-foreground: 224 28% 9%;

--border: 223 17% 24%;
--input: 223 17% 24%;
--ring: 238 90% 68%;
```

### 9.2 Semantic State Colors
Use consistent state mapping across pages/components:
- Success: emerald
- Warning: amber
- Error: red
- Info: blue/cyan

### 9.3 Chart Accent Suggestions (Light + Dark Compatible)
- Primary series: `#4f46e5`
- Secondary series: `#06b6d4`
- Positive series: `#10b981`
- Warning series: `#f59e0b`
- Negative series: `#ef4444`
- Neutral series: `#94a3b8`

## 10. Theme Safety Checklist
- Ensure contrast remains acceptable for text on cards, badges, alerts, and tables.
- Verify destructive/success/warning/info remain visually distinct in both themes.
- Check focus ring visibility (`ring-*`) on keyboard navigation.
- Verify chart palette readability against both light and dark backgrounds.
- Test at least one dense table page and one card-heavy dashboard page in both modes.

## 11. Notes
- Current implementation is dark-biased; the palette above intentionally rebalances both modes.
- Keep semantic tokens as the single source of truth and minimize page-level hardcoded colors.

## 12. Execution Audit & Phase Summary Log

| Phase | Description | Completion Status | Key Artifacts / Mappings |
|---|---|---|---|
| Phase 1 | Token Foundation | Completed | `frontend/src/index.css` (HSL variables for `:root` & `.dark`) |
| Phase 2 | Shared Component Normalization | Completed | `frontend/src/components/ui/` (`button`, `card`, `badge`, `input`, `modal`, `toast`) |
| Phase 3 | App Shell Retheme | Completed | `frontend/src/components/layout/` (`MainLayout`, `Sidebar`, `Header`, `AuthLayout`) |
| Phase 4 | Page-Level Conversion | Completed | `frontend/src/pages/` (Auth, Dashboard, Developers, Operations, Settings) |
| Phase 5 | Hardcoded Color Cleanup | Stabilized | Color token map & chart color definitions |
| Phase 6 | Accessibility & Visual QA | Completed | WCAG contrast & focus indicators (`ring-*`) verified |
| Phase 7 | Final Stabilization | Completed | `frontend/design.md` updated and pushed to `design-fix` branch |

