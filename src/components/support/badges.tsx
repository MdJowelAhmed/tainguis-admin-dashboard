import type { TicketPriority, TicketStatus } from './supportData'
import { priorityLabels, statusLabels } from './supportData'

const statusStyles: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700 ring-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 ring-blue-200',
  waiting_customer: 'bg-purple-100 text-purple-700 ring-purple-200',
  waiting_on_customer: 'bg-purple-100 text-purple-700 ring-purple-200',
  resolved: 'bg-green-100 text-green-700 ring-green-200',
  closed: 'bg-gray-100 text-gray-700 ring-gray-200',
}

const statusDisplayLabels: Record<string, string> = {
  ...statusLabels,
  waiting_on_customer: 'Waiting on customer',
}

export function TicketStatusBadge({ status }: { status: TicketStatus | string }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 ring-gray-200'
  const label = statusDisplayLabels[status] || status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${style}`}
    >
      {label}
    </span>
  )
}

const priorityStyles: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 ring-gray-200',
  medium: 'bg-blue-100 text-blue-700 ring-blue-200',
  high: 'bg-amber-100 text-amber-700 ring-amber-200',
  urgent: 'bg-red-100 text-red-700 ring-red-200',
}

const priorityDot: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
  urgent: 'bg-red-500',
}

export function PriorityBadge({ priority }: { priority: TicketPriority | string }) {
  const style = priorityStyles[priority] || 'bg-gray-100 text-gray-700 ring-gray-200'
  const dot = priorityDot[priority] || 'bg-gray-400'
  const label = priorityLabels[priority as TicketPriority] || priority

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
