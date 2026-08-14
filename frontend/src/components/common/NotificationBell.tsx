import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/stores/notificationStore'
import { Dropdown, DropdownDivider } from '@/components/ui/dropdown'
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

export interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore()

  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const getIcon = (type?: string) => {
    switch (type) {
      case 'alert':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />
    }
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <Dropdown
      align="right"
      className="w-80 sm:w-96"
      trigger={
        <button
          className={cn(
            'relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none',
            className
          )}
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50 duration-150">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {recentNotifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
            No notifications to display
          </div>
        ) : (
          recentNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.read) markAsRead(notification.id)
                const link = notification.metadata?.link
                if (typeof link === 'string') navigate(link)
              }}
              className={cn(
                'group flex items-start gap-3 p-3.5 text-xs transition-colors cursor-pointer',
                !notification.read
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              )}
            >
              {getIcon(notification.type)}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <p className={cn('truncate font-medium text-slate-800 dark:text-slate-200', !notification.read && 'font-semibold')}>
                    {notification.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatDate(notification.createdAt, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notification.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <DropdownDivider />
      <div className="p-2 text-center">
        <button
          onClick={() => navigate('/notifications')}
          className="w-full text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline py-1"
        >
          View all notifications
        </button>
      </div>
    </Dropdown>
  )
}
