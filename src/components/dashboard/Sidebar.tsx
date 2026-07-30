import { NavLink } from 'react-router-dom'
import {
  Bell,
  Flag,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Megaphone,
  Radio,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users as UsersIcon,
  Package,
  Percent,
  type LucideIcon,
} from 'lucide-react'
import TianguisLogo from '../auth/TianguisLogo'
import { useReports } from '../reports/reportsStore'
import { useTickets } from '../support/supportStore'
import { useNotifications } from '../notifications/notificationsStore'
import { useStreams } from '../live/liveStore'
import { useGetMyProfileQuery } from '../../redux/api/authApi'
import { imageUrl } from '../../lib/imageUrl'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  badge?: number
  permissionKeys: string[]
}

const baseNavItems: Omit<NavItem, 'badge'>[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid, permissionKeys: ['dashboard_overview', 'dashboard'] },
  { label: 'Users', to: '/dashboard/users', icon: UsersIcon, permissionKeys: ['user_management', 'users'] },
  { label: 'Live', to: '/dashboard/live', icon: Radio, permissionKeys: ['live'] },
  { label: 'Orders', to: '/dashboard/orders', icon: ShoppingBag, permissionKeys: ['orders'] },
  { label: 'Categories', to: '/dashboard/categories', icon: Package, permissionKeys: ['categories'] },
  { label: 'Revenue', to: '/dashboard/revenue', icon: TrendingUp, permissionKeys: ['revenue'] },
  { label: 'Broadcast', to: '/dashboard/broadcast', icon: Megaphone, permissionKeys: ['broadcast'] },
  { label: 'Support', to: '/dashboard/support', icon: LifeBuoy, permissionKeys: ['support'] },
  { label: 'Reports', to: '/dashboard/reports', icon: Flag, permissionKeys: ['report', 'reports'] },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell, permissionKeys: ['notifications'] },
  { label: 'Commission', to: '/dashboard/commission', icon: Percent, permissionKeys: ['commission'] },
  { label: 'Admins', to: '/dashboard/admins', icon: ShieldCheck, permissionKeys: ['admins'] },
  { label: 'Settings', to: '/dashboard/settings', icon: SettingsIcon, permissionKeys: ['settings'] },
]

type Props = {
  user: {
    name: string
    location: string
    avatarUrl?: string
  }
  onLogout?: () => void
}

export default function Sidebar({ user, onLogout }: Props) {
  const { data: profileRes } = useGetMyProfileQuery()
  const profile = profileRes?.data

  const reports = useReports()
  const tickets = useTickets()
  const notifications = useNotifications()
  const streams = useStreams()
  const pendingReports = reports.filter((r) => r.status === 'pending').length
  const openTickets = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress',
  ).length
  const unreadNotifications = notifications.filter((n) => !n.read).length
  const liveNow = streams.filter((s) => s.status === 'live').length

  const userRole = profile?.role || ''
  const isSuperAdmin = userRole === 'super_admin'
  const userPermissions = profile?.admin?.permissions

  const filteredNavItems = baseNavItems.filter((item) => {
    // Super admins see all items
    if (isSuperAdmin) return true
    // If user has admin permissions array defined, check if any key matches
    if (userPermissions && Array.isArray(userPermissions)) {
      return item.permissionKeys.some((pKey) => userPermissions.includes(pKey))
    }
    // Fallback if profile/permissions not loaded yet
    return true
  })

  const navItems: NavItem[] = filteredNavItems.map((item) => {
    if (item.to === '/dashboard/reports' && pendingReports > 0) {
      return { ...item, badge: pendingReports }
    }
    if (item.to === '/dashboard/support' && openTickets > 0) {
      return { ...item, badge: openTickets }
    }
    if (item.to === '/dashboard/notifications' && unreadNotifications > 0) {
      return { ...item, badge: unreadNotifications }
    }
    if (item.to === '/dashboard/live' && liveNow > 0) {
      return { ...item, badge: liveNow }
    }
    return item
  })

  const displayName = profile?.name || user.name
  const displayRole = profile?.role ? profile.role.replace(/_/g, ' ').toUpperCase() : user.location
  const displayAvatar = profile?.profileImage ? imageUrl(profile.profileImage) : user.avatarUrl

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-brand/60 bg-surface-sidebar">
      <div className="flex items-center justify-center py-6">
        <TianguisLogo />
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
        {navItems.map(({ label, to, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-brand text-white hover:bg-brand hover:text-white'
                  : 'text-gray-700 hover:bg-surface-elevated hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} />
                <span className="flex-1 truncate">{label}</span>
                {badge !== undefined && (
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-border p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-elevated">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-900">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-gray-900">
              {displayName}
            </div>
            <div className="truncate text-xs text-gray-500">
              {displayRole}
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-surface-border pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-surface-elevated hover:text-gray-900"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>
    </aside>
  )
}
