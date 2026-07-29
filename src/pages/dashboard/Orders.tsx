import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Input, Select, Table, Tag, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CreditCard,
  Eye,
  Package,
  Search,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { useGetAllOrdersQuery, useGetOrderStatsQuery } from '../../redux/api/orderApi'
import type { OrderListItem, GetOrdersParams } from '../../redux/api/orderApi'
import {
  orderStatusColor,
  orderStatusLabel,
  paymentStatusColor,
  paymentStatusLabel,
} from '../../components/orders/orderLabels'
import type { OrderStatus, PaymentStatus } from '../../components/users/usersData'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function Orders() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('searchTerm') ?? ''
  const statusFilter = searchParams.get('orderStatus') ?? 'all'
  const paymentFilter = searchParams.get('paymentStatus') ?? 'all'
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
  const { data: statsRes, isLoading: isLoadingStats } = useGetOrderStatsQuery()
  const stats = statsRes?.data

  const queryParams: GetOrdersParams = {
    page,
    limit: pageSize,
    ...(search.trim() ? { searchTerm: search.trim() } : {}),
    ...(statusFilter !== 'all' ? { orderStatus: statusFilter } : {}),
    ...(paymentFilter !== 'all' ? { paymentStatus: paymentFilter } : {}),
  }

  const { data: ordersRes, isLoading: isLoadingOrders, isError, error } = useGetAllOrdersQuery(queryParams)

  const orders = ordersRes?.data ?? []
  const pagination = ordersRes?.pagination

  const columns: ColumnsType<OrderListItem> = [
    {
      title: 'Order',
      key: 'orderId',
      render: (_, o) => (
        <div>
          <Link
            to={`/dashboard/orders/${o._id}`}
            state={{ order: o }}
            className="text-sm font-semibold text-gray-900 hover:text-brand"
          >
            {o.orderId || o._id}
          </Link>
          <div className="text-xs text-gray-500">
            {new Date(o.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, o) => (
        <div className="min-w-0">
          <Link
            to={`/dashboard/users/${o.buyer?._id}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate text-sm font-medium text-gray-900 hover:text-brand"
          >
            {o.buyer?.name ?? 'Customer'}
          </Link>
          <div className="truncate text-xs text-gray-500">
            {o.buyer?.email ?? ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      align: 'right',
      render: (_, o) => {
        const itemCount = o.items?.reduce((n, i) => n + i.quantity, 0) ?? 0
        return <span className="text-sm text-gray-700">{itemCount}</span>
      },
    },
    {
      title: 'Total',
      key: 'total',
      align: 'right',
      render: (_, o) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(o.total)}
        </span>
      ),
    },
    {
      title: 'Payment',
      key: 'paymentStatus',
      render: (_, o) => {
        const color = paymentStatusColor[o.paymentStatus as PaymentStatus] || 'green'
        const label = paymentStatusLabel[o.paymentStatus as PaymentStatus] || o.paymentStatus
        return <Tag color={color} className="capitalize">{label}</Tag>
      },
    },
    {
      title: 'Status',
      key: 'orderStatus',
      render: (_, o) => {
        const color = orderStatusColor[o.orderStatus as OrderStatus] || (o.orderStatus === 'in_progress' ? 'blue' : 'geekblue')
        const label = orderStatusLabel[o.orderStatus as OrderStatus] || o.orderStatus.replace(/_/g, ' ')
        return <Tag color={color} className="capitalize">{label}</Tag>
      },
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, o) => (
        <Link
          to={`/dashboard/orders/${o._id}`}
          state={{ order: o }}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
          aria-label="View order"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ]

  if (isError) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load orders.'
    return (
      <div className="py-6">
        <Alert type="error" message={errMsg} showIcon />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          All customer orders. Track fulfillment, payments, and revenue.
        </p>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          label="Total orders"
          value={isLoadingStats ? '...' : String(stats?.totalOrders ?? 0)}
          icon={ShoppingBag}
        />
        <SummaryCard
          label="Revenue (paid)"
          value={isLoadingStats ? '...' : currency.format(stats?.revenue ?? 0)}
          icon={Wallet}
          tone="green"
        />
        <SummaryCard
          label="In fulfillment"
          value={isLoadingStats ? '...' : String(stats?.inFulfillment ?? 0)}
          icon={Package}
          tone="blue"
        />
        <SummaryCard
          label="Avg. order value"
          value={isLoadingStats ? '...' : currency.format(Math.round(stats?.avgOrderValue ?? 0))}
          icon={CreditCard}
        />
      </section>

      {/* Main Table */}
      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => updateParams({ searchTerm: e.target.value, page: null })}
            placeholder="Search by order id, customer, or tracking"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[340px]"
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateParams({ orderStatus: val, page: null })}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
          <Select
            value={paymentFilter}
            onChange={(val) => updateParams({ paymentStatus: val, page: null })}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All payments' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'refunded', label: 'Refunded' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            {pagination ? `${pagination.total} total orders` : ''}
          </span>
        </div>

        <Spin spinning={isLoadingOrders}>
          <Table<OrderListItem>
            className="dashboard-table"
            rowKey="_id"
            columns={columns}
            dataSource={orders}
            pagination={{
              current: page,
              pageSize,
              total: pagination?.total ?? 0,
              showSizeChanger: false,
              onChange: (p) => updateParams({ page: String(p) }),
            }}
            onRow={(o) => ({
              onClick: () => navigate(`/dashboard/orders/${o._id}`, { state: { order: o } }),
              style: { cursor: 'pointer' },
            })}
          />
        </Spin>
      </section>
    </div>
  )
}

type Tone = 'neutral' | 'green' | 'blue'

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  icon: typeof ShoppingBag
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
