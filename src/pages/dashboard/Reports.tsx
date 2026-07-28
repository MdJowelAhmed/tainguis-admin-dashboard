import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { useReports } from '../../components/reports/reportsStore'
import {
  reasonLabels,
  type Report,
  type ReportReason,
  type ReportStatus,
} from '../../components/reports/reportsData'
import { useUsers } from '../../components/users/usersStore'
import ReportStatusBadge from '../../components/reports/ReportStatusBadge'

type StatusFilter = 'all' | ReportStatus
type ReasonFilter = 'all' | ReportReason

export default function Reports() {
  const reports = useReports()
  const users = useUsers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all')

  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (reasonFilter !== 'all' && r.reason !== reasonFilter) return false
      if (!q) return true
      const reporter = userById.get(r.reporterId)?.name.toLowerCase() ?? ''
      const reported = userById.get(r.reportedUserId)?.name.toLowerCase() ?? ''
      return (
        reporter.includes(q) ||
        reported.includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      )
    })
  }, [reports, search, statusFilter, reasonFilter, userById])

  const counts = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      actioned: reports.filter((r) => r.status === 'actioned').length,
      dismissed: reports.filter((r) => r.status === 'dismissed').length,
    }),
    [reports],
  )

  const columns: ColumnsType<Report> = [
    {
      title: 'Report',
      key: 'id',
      render: (_, r) => (
        <div>
          <Link
            to={`/dashboard/reports/${r.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-brand"
          >
            {r.id.toUpperCase()}
          </Link>
          <div className="text-xs text-gray-500">{r.createdAt}</div>
        </div>
      ),
    },
    {
      title: 'Reported user',
      key: 'reported',
      render: (_, r) => {
        const u = userById.get(r.reportedUserId)
        if (!u) return <span className="text-sm text-gray-500">Unknown</span>
        return (
          <Link
            to={`/dashboard/users/${u.id}`}
            className="flex items-center gap-2 text-sm text-gray-900 hover:text-brand"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated text-xs font-semibold text-gray-700">
              {u.name.charAt(0)}
            </span>
            <span className="truncate">{u.name}</span>
          </Link>
        )
      },
    },
    {
      title: 'Reporter',
      key: 'reporter',
      render: (_, r) => {
        const u = userById.get(r.reporterId)
        if (!u) return <span className="text-sm text-gray-500">Unknown</span>
        return (
          <Link
            to={`/dashboard/users/${u.id}`}
            className="text-sm text-gray-700 hover:text-brand"
          >
            {u.name}
          </Link>
        )
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: ReportReason) => (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2 py-1 text-xs font-medium text-gray-700">
          <Flag size={12} />
          {reasonLabels[reason]}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <p className="line-clamp-2 max-w-[360px] text-sm text-gray-600">
          {text}
        </p>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => <ReportStatusBadge status={r.status} />,
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, r) => (
        <Link
          to={`/dashboard/reports/${r.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
          aria-label="Review report"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">User reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Reports filed by users against other users. Review and take action.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Total reports" value={counts.total} icon={Flag} />
        <SummaryCard
          label="Pending"
          value={counts.pending}
          icon={Clock}
          tone="amber"
        />
        <SummaryCard
          label="Actioned"
          value={counts.actioned}
          icon={ShieldAlert}
          tone="red"
        />
        <SummaryCard
          label="Dismissed"
          value={counts.dismissed}
          icon={CheckCircle2}
          tone="neutral"
        />
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, report id, or description"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[320px]"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'actioned', label: 'Actioned' },
              { value: 'dismissed', label: 'Dismissed' },
            ]}
          />
          <Select
            value={reasonFilter}
            onChange={setReasonFilter}
            style={{ width: 200 }}
            options={[
              { value: 'all', label: 'All reasons' },
              ...Object.entries(reasonLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            Showing {filtered.length} of {reports.length}
          </span>
        </div>

        <Table<Report>
          className="dashboard-table"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </section>
    </div>
  )
}

type Tone = 'neutral' | 'amber' | 'red'

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: number
  icon: typeof AlertTriangle
  tone?: Tone
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${toneStyles[tone]}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}
