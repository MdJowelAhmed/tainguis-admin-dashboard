import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Spin } from 'antd'
import {
  Bell,
  CheckCheck,
  Flag,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Users as UsersIcon,
  type LucideIcon,
} from 'lucide-react'
import {
  useGetAllNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadSingleNotificationMutation,
  type NotificationItem,
} from '../../redux/api/notificationApi'

const typeIcons: Record<string, LucideIcon> = {
  order: ShoppingBag,
  user: UsersIcon,
  support: LifeBuoy,
  report: Flag,
  broadcast: Megaphone,
  announcement: Megaphone,
  admin: ShieldCheck,
}

const getIconForType = (type?: string): LucideIcon => {
  if (!type) return Bell
  return typeIcons[type.toLowerCase()] || Bell
}

const getToneStyle = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'order':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'support':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'report':
      return { bg: 'bg-red-100', text: 'text-red-700' }
    case 'broadcast':
    case 'announcement':
      return { bg: 'bg-purple-100', text: 'text-purple-700' }
    case 'user':
      return { bg: 'bg-green-100', text: 'text-green-700' }
    default:
      return { bg: 'bg-brand/10', text: 'text-brand' }
  }
}

type Filter = 'all' | 'unread' | string

export default function Notifications() {
  const { data: notificationRes, isLoading } = useGetAllNotificationsQuery()
  const [readAllNotifications, { isLoading: isReadingAll }] =
    useReadAllNotificationsMutation()
  const [readSingleNotification] = useReadSingleNotificationMutation()

  const navigate = useNavigate()
  const { message } = App.useApp()
  const [filter, setFilter] = useState<Filter>('all')

  const notifications = useMemo(
    () => notificationRes?.data?.notifications || [],
    [notificationRes],
  )

  const unreadCount = useMemo(
    () => notificationRes?.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length,
    [notificationRes, notifications],
  )

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const n of notifications) {
      const cat = n.type || 'general'
      map.set(cat, (map.get(cat) ?? 0) + 1)
    }
    return map
  }, [notifications])

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications
    if (filter === 'unread') return notifications.filter((n) => !n.isRead)
    return notifications.filter((n) => (n.type || 'general').toLowerCase() === filter.toLowerCase())
  }, [notifications, filter])

  const handleOpen = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await readSingleNotification(n._id).unwrap()
      } catch (err) {
        console.error('Failed to mark read:', err)
      }
    }
    if (n.referenceId) {
      // Optional navigation if link or reference exists
    }
  }

  const handleMarkAll = async () => {
    if (unreadCount === 0) return
    try {
      await readAllNotifications().unwrap()
      message.success('All notifications marked as read.')
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to mark all as read')
    }
  }

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>()
    for (const n of notifications) {
      if (n.type) types.add(n.type.toLowerCase())
    }
    return Array.from(types)
  }, [notifications])

  const tabs: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    ...uniqueTypes.map((t) => ({
      key: t,
      label: t.charAt(0).toUpperCase() + t.slice(1),
      count: categoryCounts.get(t) ?? 0,
    })),
  ]

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'You are all caught up.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || isReadingAll}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap gap-1 border-b border-surface-border p-3">
          {tabs.map((t) => {
            const active = t.key === filter
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-600 hover:bg-surface-elevated hover:text-gray-900'
                }`}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                      active ? 'bg-brand/20 text-brand' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-gray-400">
              <Bell size={20} />
            </span>
            <p className="text-sm text-gray-500">
              {filter === 'unread'
                ? 'No unread notifications.'
                : 'No notifications here yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {filtered.map((n) => {
              const Icon = getIconForType(n.type)
              const tone = getToneStyle(n.type)
              return (
                <li key={n._id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpen(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleOpen(n)
                      }
                    }}
                    className={`flex cursor-pointer items-start gap-4 px-6 py-4 transition-colors hover:bg-surface-elevated ${
                      !n.isRead ? 'bg-brand/5' : ''
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.text}`}
                    >
                      <Icon size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {!n.isRead && (
                              <span
                                aria-label="Unread"
                                className="h-2 w-2 shrink-0 rounded-full bg-brand"
                              />
                            )}
                            <span className="truncate text-sm font-semibold text-gray-900">
                              {n.title}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-600">
                            {n.message}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(n.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-600 capitalize">
                          {n.type || 'General'}
                        </span>
                        {n.channels && n.channels.length > 0 && (
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                            {n.channels.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
