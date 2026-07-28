import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App } from 'antd'
import {
  Bell,
  CheckCheck,
  Flag,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users as UsersIcon,
  type LucideIcon,
} from 'lucide-react'
import {
  clearAll,
  deleteNotification,
  markAllRead,
  markRead,
  useNotifications,
} from '../../components/notifications/notificationsStore'
import {
  categoryLabels,
  type Notification,
  type NotificationCategory,
  type NotificationTone,
} from '../../components/notifications/notificationsData'

const categoryIcons: Record<NotificationCategory, LucideIcon> = {
  order: ShoppingBag,
  user: UsersIcon,
  support: LifeBuoy,
  report: Flag,
  broadcast: Megaphone,
  admin: ShieldCheck,
}

const toneStyles: Record<NotificationTone, { bg: string; text: string }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  success: { bg: 'bg-green-100', text: 'text-green-700' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700' },
  danger: { bg: 'bg-red-100', text: 'text-red-700' },
}

type Filter = 'all' | 'unread' | NotificationCategory

export default function Notifications() {
  const notifications = useNotifications()
  const navigate = useNavigate()
  const { modal, message } = App.useApp()
  const [filter, setFilter] = useState<Filter>('all')

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const counts = useMemo(() => {
    const map = new Map<NotificationCategory, number>()
    for (const n of notifications) {
      map.set(n.category, (map.get(n.category) ?? 0) + 1)
    }
    return map
  }, [notifications])

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications
    if (filter === 'unread') return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.category === filter)
  }, [notifications, filter])

  const handleOpen = (n: Notification) => {
    if (!n.read) markRead(n.id)
    navigate(n.linkTo)
  }

  const handleDelete = (n: Notification) => {
    deleteNotification(n.id)
    message.success('Notification removed.')
  }

  const handleClearAll = () => {
    if (notifications.length === 0) return
    modal.confirm({
      title: 'Clear all notifications?',
      content: 'This removes every notification from the list.',
      okText: 'Clear all',
      okButtonProps: { danger: true },
      onOk: () => {
        clearAll()
        message.success('All notifications cleared.')
      },
    })
  }

  const handleMarkAll = () => {
    if (unreadCount === 0) return
    markAllRead()
    message.success('All notifications marked as read.')
  }

  const tabs: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    ...(Object.keys(categoryLabels) as NotificationCategory[]).map((c) => ({
      key: c as Filter,
      label: categoryLabels[c],
      count: counts.get(c) ?? 0,
    })),
  ]

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
            disabled={unreadCount === 0}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} />
            Clear all
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
              const Icon = categoryIcons[n.category]
              const tone = toneStyles[n.tone]
              return (
                <li key={n.id}>
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
                      !n.read ? 'bg-brand/5' : ''
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
                            {!n.read && (
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
                            {n.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {n.createdAt}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(n)
                            }}
                            aria-label="Remove notification"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {categoryLabels[n.category]}
                        </span>
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
