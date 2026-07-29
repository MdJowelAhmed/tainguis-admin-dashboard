import { useParams, useNavigate, Link } from 'react-router-dom'
import { App, Spin, Alert, Tag, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeft,
  CircleSlash,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react'
import { useGetUserByIdQuery, useUpdateUserStatusMutation } from '../../redux/api/userApi'
import type { UserStatus } from '../../redux/api/userApi'
import StatusBadge from '../../components/users/StatusBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  _id?: string
  name?: string
  quantity?: number
  price?: number
}

interface OrderRecord {
  _id: string
  createdAt: string
  status: string
  total?: number
  items?: OrderItem[]
}

// ─── Currency ─────────────────────────────────────────────────────────────────

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { modal, message } = App.useApp()

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetUserByIdQuery(id!, { skip: !id })

  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation()

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" tip="Loading user details…" />
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !response?.data) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'User not found.'
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Alert type="error" message={errMsg} showIcon />
        <Link
          to="/dashboard/users"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to users
        </Link>
      </div>
    )
  }

  const user = response.data

  // ── Status change ──────────────────────────────────────────────────────────
  const confirmStatusChange = (status: UserStatus, label: string) => {
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

  // ── Order history columns ──────────────────────────────────────────────────
  const orderColumns: ColumnsType<OrderRecord> = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (oid: string) => (
        <Link
          to={`/dashboard/orders/${oid}`}
          className="text-sm font-medium text-gray-900 hover:text-brand"
        >
          {oid}
        </Link>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => (
        <span className="text-sm text-gray-700">
          {new Date(d).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag className="capitalize">{s}</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (t: number) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(t ?? 0)}
        </span>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Spin spinning={isUpdating} tip="Updating…">
      <div className="flex flex-col gap-6 py-6">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/users')}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to users
        </button>

        {/* Profile card */}
        <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-xl font-semibold text-gray-700">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
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
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                  {user.lastOrderDate
                    ? ` · Last order ${new Date(user.lastOrderDate).toLocaleDateString()}`
                    : ''}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {user.status !== 'active' && (
                <button
                  type="button"
                  onClick={() => confirmStatusChange('active', 'Activate')}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <UserCheck size={14} />
                  Set Active
                </button>
              )}
              {user.status !== 'inactive' && (
                <button
                  type="button"
                  onClick={() => confirmStatusChange('inactive', 'Deactivate')}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  <CircleSlash size={14} />
                  Set Inactive
                </button>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ContactRow icon={Mail} label="Email" value={user.email} />
            <ContactRow icon={Phone} label="Phone" value={user.phone || '—'} />
            <ContactRow icon={MapPin} label="Address" value={user.address || '—'} />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Total orders" value={String(user.totalOrders)} icon={ShoppingBag} />
          <Stat label="Total spent" value={currency.format(user.totalSpent)} icon={Wallet} />
          <Stat
            label="Avg. order value"
            value={currency.format(Math.round(user.avgOrderValue))}
            icon={TrendingUp}
          />
          <Stat
            label="Last order"
            value={user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : '—'}
            icon={ShoppingBag}
          />
        </section>

        {/* Order history */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-surface-border bg-surface-card">
            <div className="border-b border-surface-border p-5">
              <h2 className="text-base font-semibold text-gray-900">Order history</h2>
              <p className="mt-1 text-xs text-gray-500">All orders placed by this user.</p>
            </div>
            <Table<OrderRecord>
              className="dashboard-table"
              rowKey="_id"
              columns={orderColumns}
              dataSource={user.orderHistory as OrderRecord[]}
              pagination={
                (user.orderHistory?.length ?? 0) > 8 ? { pageSize: 8 } : false
              }
              locale={{ emptyText: 'No orders yet.' }}
            />
          </div>

          {/* Most ordered products */}
          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <h2 className="text-base font-semibold text-gray-900">
              Most ordered products
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Top items by total quantity ordered.
            </p>

            {(user.mostOrderedProducts?.length ?? 0) === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-surface-border p-6 text-center text-sm text-gray-500">
                No products ordered yet.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {user.mostOrderedProducts.map((p, idx: number) => (
                  <li
                    key={p._id ?? idx}
                    className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-brand">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">
                        {p.name ?? 'Unknown product'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.quantity ?? 0} units · {currency.format(p.totalSpent ?? 0)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      </div>
    </Spin>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────

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
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
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
