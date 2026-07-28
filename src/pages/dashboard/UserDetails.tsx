import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeft,
  Ban,
  CircleSlash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react'
import { setUserStatus, useUser } from '../../components/users/usersStore'
import {
  topProductsForUser,
  userTotals,
  type Order,
  type OrderStatus,
  type UserStatus,
} from '../../components/users/usersData'
import StatusBadge from '../../components/users/StatusBadge'
import EditUserModal from '../../components/users/EditUserModal'
import { useReportsAgainst } from '../../components/reports/reportsStore'
import { reasonLabels } from '../../components/reports/reportsData'
import ReportStatusBadge from '../../components/reports/ReportStatusBadge'
import { Flag } from 'lucide-react'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const orderStatusColor: Record<OrderStatus, string> = {
  pending: 'gold',
  processing: 'blue',
  shipped: 'geekblue',
  delivered: 'green',
  cancelled: 'default',
  refunded: 'red',
}

export default function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const user = useUser(id)
  const navigate = useNavigate()
  const { modal, message } = App.useApp()
  const [editing, setEditing] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-base text-gray-700">User not found.</p>
        <Link
          to="/dashboard/users"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to users
        </Link>
      </div>
    )
  }

  const totals = userTotals(user)
  const topProducts = topProductsForUser(user)
  const reports = useReportsAgainst(user.id)
  const pendingReports = reports.filter((r) => r.status === 'pending').length

  const confirmStatusChange = (status: UserStatus, label: string) => {
    modal.confirm({
      title: `${label} ${user.name}?`,
      content:
        status === 'banned'
          ? 'Banned users cannot sign in or place orders.'
          : status === 'restricted'
            ? 'Restricted users can browse but cannot checkout.'
            : 'This user will regain full access to the site.',
      okText: label,
      okButtonProps: status === 'banned' ? { danger: true } : undefined,
      onOk: () => {
        setUserStatus(user.id, status)
        message.success(`${user.name} is now ${status}.`)
      },
    })
  }

  const orderColumns: ColumnsType<Order> = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Link
          to={`/dashboard/orders/${id}`}
          className="text-sm font-medium text-gray-900 hover:text-brand"
        >
          {id}
        </Link>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d: string) => <span className="text-sm text-gray-700">{d}</span>,
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, o) => (
        <span className="text-sm text-gray-700">
          {o.items.reduce((n, i) => n + i.quantity, 0)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: OrderStatus) => (
        <Tag color={orderStatusColor[s]} className="capitalize">
          {s}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (t: number) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(t)}
        </span>
      ),
      sorter: (a, b) => a.total - b.total,
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/users')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to users
        </button>
      </div>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-xl font-semibold text-gray-700">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {user.name}
                </h1>
                <StatusBadge status={user.status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Joined {user.joinedAt} · Last active {user.lastActiveAt}
              </p>
              {user.statusNote && (
                <p className="mt-2 max-w-xl text-xs text-gray-600">
                  <span className="font-semibold">Note:</span> {user.statusNote}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated"
            >
              <Pencil size={14} />
              Edit
            </button>
            {user.status !== 'active' && (
              <button
                type="button"
                onClick={() => confirmStatusChange('active', 'Reinstate')}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
              >
                <UserCheck size={14} />
                Reinstate
              </button>
            )}
            {user.status !== 'restricted' && (
              <button
                type="button"
                onClick={() => confirmStatusChange('restricted', 'Restrict')}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600"
              >
                <CircleSlash size={14} />
                Restrict
              </button>
            )}
            {user.status !== 'banned' && (
              <button
                type="button"
                onClick={() => confirmStatusChange('banned', 'Ban')}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Ban size={14} />
                Ban
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ContactRow icon={Mail} label="Email" value={user.email} />
          <ContactRow icon={Phone} label="Phone" value={user.phone} />
          <ContactRow
            icon={MapPin}
            label="Address"
            value={`${user.address}, ${user.city}, ${user.country}`}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          label="Total orders"
          value={String(totals.orderCount)}
          icon={ShoppingBag}
        />
        <Stat
          label="Total spent"
          value={currency.format(totals.totalSpent)}
          icon={Wallet}
        />
        <Stat
          label="Avg. order value"
          value={currency.format(Math.round(totals.avgOrderValue))}
          icon={TrendingUp}
        />
        <Stat
          label="Last order"
          value={totals.lastOrderDate ?? '—'}
          icon={ShoppingBag}
        />
      </section>

      {reports.length > 0 && (
        <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <Flag size={16} className="text-red-500" />
                Reports against this user
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {reports.length} total
                {pendingReports > 0 && ` · ${pendingReports} pending review`}
              </p>
            </div>
            {pendingReports > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                {pendingReports} pending
              </span>
            )}
          </div>

          <ul className="mt-4 divide-y divide-surface-border">
            {reports.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/reports/${r.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-brand"
                  >
                    {r.id.toUpperCase()} · {reasonLabels[r.reason]}
                  </Link>
                  <div className="truncate text-xs text-gray-500">
                    {r.createdAt} · {r.description}
                  </div>
                </div>
                <ReportStatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-surface-border bg-surface-card">
          <div className="border-b border-surface-border p-5">
            <h2 className="text-base font-semibold text-gray-900">Order history</h2>
            <p className="mt-1 text-xs text-gray-500">
              All orders placed by this user.
            </p>
          </div>
          <Table<Order>
            className="dashboard-table"
            rowKey="id"
            columns={orderColumns}
            dataSource={user.orders}
            pagination={user.orders.length > 8 ? { pageSize: 8 } : false}
            locale={{ emptyText: 'No orders yet.' }}
          />
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Most ordered products
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Top items by total quantity ordered.
          </p>

          {topProducts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-surface-border p-6 text-center text-sm text-gray-500">
              No products ordered yet.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {topProducts.map((p, idx) => (
                <li
                  key={p.productId}
                  className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-brand">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {p.quantity} units · {currency.format(p.totalSpent)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <EditUserModal
        user={editing ? user : null}
        onClose={() => setEditing(false)}
      />
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {label}
        </div>
        <div className="truncate text-sm text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof ShoppingBag
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <Icon size={18} className="text-gray-500" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}
