import type { ReportStatus } from './reportsData'

const styles: Record<ReportStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 ring-amber-200',
  dismissed: 'bg-gray-100 text-gray-700 ring-gray-200',
  actioned: 'bg-red-100 text-red-700 ring-red-200',
}

const labels: Record<ReportStatus, string> = {
  pending: 'Pending',
  dismissed: 'Dismissed',
  actioned: 'Actioned',
}

export default function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
