import type { UserStatus } from './usersData'

const styles: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-700 ring-green-200',
  restricted: 'bg-amber-100 text-amber-700 ring-amber-200',
  banned: 'bg-red-100 text-red-700 ring-red-200',
}

const labels: Record<UserStatus, string> = {
  active: 'Active',
  restricted: 'Restricted',
  banned: 'Banned',
}

export default function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'active'
            ? 'bg-green-500'
            : status === 'restricted'
              ? 'bg-amber-500'
              : 'bg-red-500'
        }`}
      />
      {labels[status]}
    </span>
  )
}
