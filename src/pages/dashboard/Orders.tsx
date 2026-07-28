import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input, Select, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CreditCard,
  Eye,
  Package,
  Search,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { useAllOrders, type OrderWithCustomer } from '../../components/orders/ordersStore'
import {
  orderStatusColor,
  orderStatusLabel,
  paymentStatusColor,
  paymentStatusLabel,
} from '../../components/orders/orderLabels'
import type {
  OrderStatus,
  PaymentStatus,
} from '../../components/users/usersData'

type StatusFilter = 'all' | OrderStatus
type PaymentFilter = 'all' | PaymentStatus

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

export default function Orders() {
  const orders = useAllOrders()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter)
        return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.trackingNumber?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [orders, search, statusFilter, paymentFilter])

  const counts = useMemo(() => {
    const revenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0)
    const refunded = orders.filter((o) => o.paymentStatus === 'refunded')
      .length
    const pendingPayment = orders.filter((o) => o.paymentStatus === 'pending')
      .length
    const inFulfillment = orders.filter(
      (o) =>
        o.status === 'pending' ||
        o.status === 'processing' ||
        o.status === 'shipped',
    ).length
    const avg = orders.length > 0 ? revenue / orders.length : 0
    return {
      total: orders.length,
      revenue,
      refunded,
      pendingPayment,
      inFulfillment,
      avg,
    }
  }, [orders])

  const columns: ColumnsType<OrderWithCustomer> = [
    {
      title: 'Order',
      key: 'id',
      render: (_, o) => (
        <div>
          <Link
            to={`/dashboard/orders/${o.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-brand"
          >
            {o.id}
          </Link>
          <div className="text-xs text-gray-500">{o.placedAt}</div>
        </div>
      ),
      sorter: (a, b) => a.placedAt.localeCompare(b.placedAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, o) => (
        <div className="min-w-0">
          <Link
            to={`/dashboard/users/${o.customerId}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate text-sm font-medium text-gray-900 hover:text-brand"
          >
            {o.customerName}
          </Link>
          <div className="truncate text-xs text-gray-500">
            {o.customerEmail}
          </div>
        </div>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      align: 'right',
      render: (_, o) => (
        <span className="text-sm text-gray-700">
          {o.items.reduce((n, i) => n + i.quantity, 0)}
        </span>
      ),
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
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Payment',
      key: 'payment',
      render: (_, o) => (
        <Tag color={paymentStatusColor[o.paymentStatus]}>
          {paymentStatusLabel[o.paymentStatus]}
        </Tag>
      ),
      filters: [
        { text: 'Paid', value: 'paid' },
        { text: 'Pending', value: 'pending' },
        { text: 'Refunded', value: 'refunded' },
        { text: 'Failed', value: 'failed' },
      ],
      onFilter: (value, o) => o.paymentStatus === value,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, o) => (
        <Tag color={orderStatusColor[o.status]}>
          {orderStatusLabel[o.status]}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
        { text: 'Cancelled', value: 'cancelled' },
        { text: 'Refunded', value: 'refunded' },
      ],
      onFilter: (value, o) => o.status === value,
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, o) => (
        <Link
          to={`/dashboard/orders/${o.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
          aria-label="View order"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          All customer orders. Track fulfillment, payments, and revenue.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Total orders" value={String(counts.total)} icon={ShoppingBag} />
        <SummaryCard
          label="Revenue (paid)"
          value={currency.format(counts.revenue)}
          icon={Wallet}
          tone="green"
        />
        <SummaryCard
          label="In fulfillment"
          value={String(counts.inFulfillment)}
          icon={Package}
          tone="blue"
        />
        <SummaryCard
          label="Avg. order value"
          value={currency.format(Math.round(counts.avg))}
          icon={CreditCard}
        />
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order id, customer, or tracking"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[340px]"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
          <Select
            value={paymentFilter}
            onChange={setPaymentFilter}
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
            Showing {filtered.length} of {orders.length}
          </span>
        </div>

        <Table<OrderWithCustomer>
          className="dashboard-table"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          onRow={(o) => ({
            onClick: () => navigate(`/dashboard/orders/${o.id}`),
            style: { cursor: 'pointer' },
          })}
        />
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

