import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Eye,
  LifeBuoy,
  Search,
} from 'lucide-react'
import { useTickets } from '../../components/support/supportStore'
import {
  categoryLabels,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from '../../components/support/supportData'
import { useUsers } from '../../components/users/usersStore'
import { PriorityBadge, TicketStatusBadge } from '../../components/support/badges'

type StatusFilter = 'all' | TicketStatus
type PriorityFilter = 'all' | TicketPriority
type CategoryFilter = 'all' | TicketCategory

export default function Support() {
  const tickets = useTickets()
  const users = useUsers()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter)
        return false
      if (categoryFilter !== 'all' && t.category !== categoryFilter)
        return false
      if (!q) return true
      const customer = userById.get(t.customerId)?.name.toLowerCase() ?? ''
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        customer.includes(q) ||
        (t.orderId?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter, userById])

  const counts = useMemo(() => {
    const open = tickets.filter(
      (t) => t.status === 'open' || t.status === 'in_progress',
    ).length
    const urgent = tickets.filter(
      (t) =>
        (t.priority === 'urgent' || t.priority === 'high') &&
        t.status !== 'resolved' &&
        t.status !== 'closed',
    ).length
    const waiting = tickets.filter((t) => t.status === 'waiting_customer').length
    const resolved = tickets.filter(
      (t) => t.status === 'resolved' || t.status === 'closed',
    ).length
    return { open, urgent, waiting, resolved }
  }, [tickets])

  const columns: ColumnsType<Ticket> = [
    {
      title: 'Ticket',
      key: 'ticket',
      render: (_, t) => (
        <div className="min-w-0">
          <Link
            to={`/dashboard/support/${t.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-gray-900 hover:text-brand"
          >
            {t.id}
          </Link>
          <div className="line-clamp-1 text-xs text-gray-600">{t.subject}</div>
        </div>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, t) => {
        const u = userById.get(t.customerId)
        if (!u) return <span className="text-sm text-gray-500">Unknown</span>
        return (
          <Link
            to={`/dashboard/users/${u.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-700 hover:text-brand"
          >
            {u.name}
          </Link>
        )
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (c: TicketCategory) => (
        <span className="text-sm text-gray-700">{categoryLabels[c]}</span>
      ),
    },
    {
      title: 'Priority',
      key: 'priority',
      render: (_, t) => <PriorityBadge priority={t.priority} />,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, t) => <TicketStatusBadge status={t.status} />,
    },
    {
      title: 'Assignee',
      key: 'assignee',
      render: (_, t) =>
        t.assigneeName ? (
          <span className="text-sm text-gray-700">{t.assigneeName}</span>
        ) : (
          <span className="text-xs italic text-gray-400">Unassigned</span>
        ),
    },
    {
      title: 'Last update',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (d: string) => <span className="text-xs text-gray-500">{d}</span>,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      defaultSortOrder: 'descend',
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, t) => (
        <Link
          to={`/dashboard/support/${t.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
          aria-label="Open ticket"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customer support tickets — reply, prioritize, assign, and resolve.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          label="Open / In progress"
          value={counts.open}
          icon={LifeBuoy}
          tone="amber"
        />
        <SummaryCard
          label="High / Urgent"
          value={counts.urgent}
          icon={AlertOctagon}
          tone="red"
        />
        <SummaryCard
          label="Waiting on customer"
          value={counts.waiting}
          icon={Clock}
          tone="blue"
        />
        <SummaryCard
          label="Resolved / Closed"
          value={counts.resolved}
          icon={CheckCircle2}
          tone="green"
        />
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket id, subject, customer, order"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[340px]"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'waiting_customer', label: 'Waiting on customer' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'All priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All categories' },
              ...Object.entries(categoryLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            Showing {filtered.length} of {tickets.length}
          </span>
        </div>

        <Table<Ticket>
          className="dashboard-table"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          onRow={(t) => ({
            onClick: () => navigate(`/dashboard/support/${t.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </section>
    </div>
  )
}

type Tone = 'neutral' | 'amber' | 'red' | 'blue' | 'green'

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: number
  icon: typeof LifeBuoy
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
