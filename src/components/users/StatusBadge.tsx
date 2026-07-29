import type { UserStatus as UsersDataUserStatus } from './usersData'
import type { UserStatus as ApiUserStatus } from '../../redux/api/userApi'

export type StatusBadgeStatus = UsersDataUserStatus | ApiUserStatus | string

const styles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 ring-green-200',
  inactive: 'bg-gray-100 text-gray-700 ring-gray-200',
  restricted: 'bg-amber-100 text-amber-700 ring-amber-200',
  banned: 'bg-red-100 text-red-700 ring-red-200',
}

const labels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  restricted: 'Restricted',
  banned: 'Banned',
}

export default function StatusBadge({ status }: { status: StatusBadgeStatus }) {
  const currentStyle = styles[status] || 'bg-gray-100 text-gray-700 ring-gray-200'
  const currentLabel = labels[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '')

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${currentStyle}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'active'
            ? 'bg-green-500'
            : status === 'restricted'
              ? 'bg-amber-500'
              : status === 'inactive'
                ? 'bg-gray-400'
                : 'bg-red-500'
        }`}
      />
      {currentLabel}
    </span>
  )
}
