import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Dropdown, Input, Select, App, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  Ban,
  CircleSlash,
  Eye,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useGetUsersQuery, useUpdateUserStatusMutation } from '../../redux/api/userApi'
import type { UserListItem, UserStatus, GetUsersParams } from '../../redux/api/userApi'
import StatusBadge from '../../components/users/StatusBadge'

type StatusFilter = 'all' | UserStatus

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function Users() {
  const { modal, message } = App.useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // ── Build query params ─────────────────────────────────────────────────────
  const queryParams: GetUsersParams = {
    page,
    limit: pageSize,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  }

  const { data, isLoading, isError, error } = useGetUsersQuery(queryParams)
  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation()

  const users = data?.data ?? []
  const pagination = data?.pagination

  // ── Summary counts (from current page data) ────────────────────────────────
  const counts = useMemo(
    () => ({
      total: pagination?.total ?? 0,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
    }),
    [users, pagination],
  )

  // ── Status change ──────────────────────────────────────────────────────────
  const confirmStatusChange = (
    user: UserListItem,
    status: UserStatus,
    label: string,
  ) => {
    modal.confirm({
      title: `${label} "${user.name}"?`,
      content:
        status === 'inactive'
          ? 'This user account will be deactivated.'
          : 'This user will regain full access to the platform.',
      okText: label,
      onOk: async () => {
        try {
          await updateUserStatus({ id: user._id, status }).unwrap()
          message.success(`${user.name} is now ${status}.`)
        } catch {
          message.error('Failed to update status. Please try again.')
        }
      },
    })
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: ColumnsType<UserListItem> = [
    {
      title: 'User',
      key: 'user',
      render: (_, u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold text-gray-700">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              to={`/dashboard/users/${u._id}`}
              className="block truncate text-sm font-semibold text-gray-900 hover:text-brand"
            >
              {u.name}
            </Link>
            <div className="truncate text-xs text-gray-500">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <span className="text-sm text-gray-700">{phone || '—'}</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, u) => <StatusBadge status={u.status} />,
    },
    {
      title: 'Orders',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      align: 'right',
      render: (val: number) => (
        <span className="text-sm font-medium text-gray-900">{val}</span>
      ),
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      align: 'right',
      render: (val: number) => (
        <span className="text-sm font-medium text-gray-900">
          {currency.format(val)}
        </span>
      ),
      sorter: (a, b) => a.totalSpent - b.totalSpent,
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-sm text-gray-700">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'right',
      render: (_, u) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'view',
                icon: <Eye size={14} />,
                label: <Link to={`/dashboard/users/${u._id}`}>View details</Link>,
              },
              { type: 'divider' },
              ...(u.status !== 'active'
                ? [
                    {
                      key: 'activate',
                      icon: <UserCheck size={14} />,
                      label: 'Set Active',
                      onClick: () => confirmStatusChange(u, 'active', 'Activate'),
                    },
                  ]
                : []),
              ...(u.status !== 'inactive'
                ? [
                    {
                      key: 'inactive',
                      icon: <CircleSlash size={14} />,
                      label: 'Set Inactive',
                      onClick: () => confirmStatusChange(u, 'inactive', 'Deactivate'),
                    },
                  ]
                : []),
            ],
          }}
        >
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
            aria-label="User actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isError) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load users.'
    return (
      <div className="py-6">
        <Alert type="error" message={errMsg} showIcon />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customers, view their orders, and control account access.
          </p>
        </div>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Total users" value={counts.total} icon={UserCheck} />
        <SummaryCard
          label="Active"
          value={counts.active}
          icon={ShieldCheck}
          tone="green"
        />
        <SummaryCard
          label="Inactive"
          value={counts.inactive}
          icon={CircleSlash}
          tone="amber"
        />
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // reset to page 1 on new search
            }}
            placeholder="Search by name, email, or phone"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[320px]"
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            {pagination ? `${pagination.total} total users` : ''}
          </span>
        </div>

        <Spin spinning={isLoading || isUpdating}>
          <Table<UserListItem>
            className="dashboard-table"
            rowKey="_id"
            columns={columns}
            dataSource={users}
            pagination={{
              current: page,
              pageSize,
              total: pagination?.total ?? 0,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
            }}
          />
        </Spin>
      </section>
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

type Tone = 'neutral' | 'green' | 'amber' | 'red'

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
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
  icon: typeof UserCheck
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
