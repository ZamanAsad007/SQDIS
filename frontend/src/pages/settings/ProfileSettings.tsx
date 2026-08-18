import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, Shield, Key, Image as ImageIcon,
  Save, AlertTriangle, LogOut, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { authService } from '@/services'
import { queryKeys } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'

export function ProfileSettings() {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return authService.updateProfile(data)
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => {
      return authService.changePassword(data)
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordError('')
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update password'
      setPasswordError(msg)
    },
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({ name: profileData.name })
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match")
      return
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }
    setPasswordError('')
    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      
      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and public profile.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileUpdate}>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer">
                  <Avatar 
                    name={user.name || user.email} 
                    src={user.avatarUrl} 
                    className="h-24 w-24 text-2xl border-2 border-slate-100 dark:border-slate-800"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full hidden group-hover:flex items-center justify-center transition-colors">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Profile Picture</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">JPG, GIF or PNG. Max 1MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="profile-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <Input 
                    id="profile-name"
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    placeholder="John Doe"
                    className="max-w-md"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="profile-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <Input 
                    id="profile-email"
                    value={profileData.email} 
                    disabled
                    className="max-w-md bg-slate-50 dark:bg-slate-900 text-slate-500"
                  />
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Verified email address. To change your email, please contact support.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 py-4 flex justify-end">
            <Button type="submit" isLoading={updateProfileMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Security & Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Security & Password
          </CardTitle>
          <CardDescription>Manage your password and account security settings.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordUpdate}>
          <CardContent className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded border border-red-200 dark:border-red-800/30 text-sm flex items-start gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{passwordError}</p>
              </div>
            )}
            {updatePasswordMutation.isSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800/30 text-sm flex items-start gap-2 mb-4">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Password updated successfully.</p>
              </div>
            )}
            
            <div className="grid gap-2 max-w-md">
              <label htmlFor="current-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <Input 
                id="current-password"
                type="password"
                value={passwordData.currentPassword} 
                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />
            </div>
            
            <div className="grid gap-2 max-w-md">
              <label htmlFor="new-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <Input 
                id="new-password"
                type="password"
                value={passwordData.newPassword} 
                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
            </div>
            
            <div className="grid gap-2 max-w-md">
              <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <Input 
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword} 
                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 py-4 flex justify-between items-center">
            <a href="#" className="text-sm text-blue-600 hover:underline dark:text-blue-400">Forgot your password?</a>
            <Button type="submit" isLoading={updatePasswordMutation.isPending} className="gap-2" variant="outline">
              <Key className="h-4 w-4" /> Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Account Session */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-slate-500" />
            Active Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                You are currently logged in as <span className="font-semibold">{user.email}</span>.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Log out of this device to end your session.
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="shrink-0"
              onClick={() => setIsLogoutConfirmOpen(true)}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out? You will need to log back in to access your organizations."
        confirmText="Sign Out"
      />
    </div>
  )
}
