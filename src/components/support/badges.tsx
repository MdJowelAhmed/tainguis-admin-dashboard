import type { TicketPriority, TicketStatus } from './supportData'
import { priorityLabels, statusLabels } from './supportData'

const statusStyles: Record<TicketStatus, string> = {
  open: 'bg-amber-100 text-amber-700 ring-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 ring-blue-200',
  waiting_customer: 'bg-purple-100 text-purple-700 ring-purple-200',
  resolved: 'bg-green-100 text-green-700 ring-green-200',
  closed: 'bg-gray-100 text-gray-700 ring-gray-200',
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

const priorityStyles: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-700 ring-gray-200',
  medium: 'bg-blue-100 text-blue-700 ring-blue-200',
  high: 'bg-amber-100 text-amber-700 ring-amber-200',
  urgent: 'bg-red-100 text-red-700 ring-red-200',
}

const priorityDot: Record<TicketPriority, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityStyles[priority]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[priority]}`} />
      {priorityLabels[priority]}
    </span>
  )
}
