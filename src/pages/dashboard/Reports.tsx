import { Link, useSearchParams } from 'react-router-dom'
import { Input, Select, Table, Spin, Alert } from 'antd'
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
import { useGetAllReportsQuery } from '../../redux/api/reportApi'
import type { ReportListItem, GetReportsParams } from '../../redux/api/reportApi'
import {
  reasonLabels,
  type ReportReason,
  type ReportStatus,
} from '../../components/reports/reportsData'
import ReportStatusBadge from '../../components/reports/ReportStatusBadge'

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('searchTerm') ?? ''
  const statusFilter = searchParams.get('status') ?? 'all'
  const reasonFilter = searchParams.get('reason') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = 10

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === 'all') {
          next.delete(k)
        } else {
          next.set(k, v)
        }
      })
      return next
    })
  }

  // ── Queries ────────────────────────────────────────────────────────────────
  const queryParams: GetReportsParams = {
    page,
    limit: pageSize,
    ...(search.trim() ? { searchTerm: search.trim() } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(reasonFilter !== 'all' ? { reason: reasonFilter } : {}),
  }

  const { data: reportsRes, isLoading, isError, error } = useGetAllReportsQuery(queryParams)

  const reports = reportsRes?.data ?? []
  const pagination = reportsRes?.pagination

  // Calculate summary counts from fetched results / pagination
  const pendingCount = reports.filter((r) => r.status === 'pending').length
  const actionedCount = reports.filter((r) => r.status === 'actioned').length
  const dismissedCount = reports.filter((r) => r.status === 'dismissed').length

  const columns: ColumnsType<ReportListItem> = [
    {
      title: 'Report',
      key: 'id',
      render: (_, r) => (
        <div>
          <Link
            to={`/dashboard/reports/${r._id}`}
            className="text-sm font-semibold text-gray-900 hover:text-brand uppercase"
          >
            {r.reportCode || r._id.slice(-6)}
          </Link>
          <div className="text-xs text-gray-500">
            {new Date(r.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Reported user',
      key: 'reported',
      render: (_, r) => {
        const u = r.reportedUser
        if (!u) return <span className="text-sm text-gray-500">Unknown</span>
        return (
          <Link
            to={`/dashboard/users/${u._id}`}
            className="flex items-center gap-2 text-sm text-gray-900 hover:text-brand"
          >
            {u.profileImage ? (
              <img
                src={u.profileImage}
                alt={u.name}
                className="h-7 w-7 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated text-xs font-semibold text-gray-700">
                {u.name.charAt(0)}
              </span>
            )}
            <span className="truncate">{u.name}</span>
          </Link>
        )
      },
    },
    {
      title: 'Reporter',
      key: 'reporter',
      render: (_, r) => {
        const u = r.reporter
        if (!u) return <span className="text-sm text-gray-500">Unknown</span>
        return (
          <Link
            to={`/dashboard/users/${u._id}`}
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
      render: (reason: string) => {
        const labelText = reasonLabels[reason as ReportReason] || reason.replace(/_/g, ' ')
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2 py-1 text-xs font-medium text-gray-700 capitalize">
            <Flag size={12} />
            {labelText}
          </span>
        )
      },
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
      render: (_, r) => <ReportStatusBadge status={r.status as ReportStatus} />,
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, r) => (
        <Link
          to={`/dashboard/reports/${r._id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
          aria-label="Review report"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ]

  if (isError) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load reports.'
    return (
      <div className="py-6">
        <Alert type="error" message={errMsg} showIcon />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">User reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Reports filed by users against other users. Review and take action.
        </p>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Total reports" value={pagination?.total ?? reports.length} icon={Flag} />
        <SummaryCard
          label="Pending"
          value={pendingCount}
          icon={Clock}
          tone="amber"
        />
        <SummaryCard
          label="Actioned"
          value={actionedCount}
          icon={ShieldAlert}
          tone="red"
        />
        <SummaryCard
          label="Dismissed"
          value={dismissedCount}
          icon={CheckCircle2}
          tone="neutral"
        />
      </section>

      {/* Main Table */}
      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => updateParams({ searchTerm: e.target.value, page: null })}
            placeholder="Search by user, report id, or description"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[320px]"
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateParams({ status: val, page: null })}
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
            onChange={(val) => updateParams({ reason: val, page: null })}
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
            {pagination ? `${pagination.total} total reports` : ''}
          </span>
        </div>

        <Spin spinning={isLoading}>
          <Table<ReportListItem>
            className="dashboard-table"
            rowKey="_id"
            columns={columns}
            dataSource={reports}
            pagination={{
              current: page,
              pageSize,
              total: pagination?.total ?? 0,
              showSizeChanger: false,
              onChange: (p) => updateParams({ page: String(p) }),
            }}
          />
        </Spin>
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
