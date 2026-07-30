import { useSearchParams } from 'react-router-dom'
import { Spin, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CreditCard, ShoppingBag, Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  useGetOverviewStatsQuery,
  useGetRevenueByMonthsQuery,
} from '../../redux/api/overviewApi'
import {
  useGetAllTransactionsQuery,
  type RevenueTransaction,
} from '../../redux/api/revenueApi'
import SearchInput from '../../components/ui/SearchInput'
import { formatPeso } from '../../lib/currency'

export default function Revenue() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page')) || 1
  const searchTerm = searchParams.get('searchTerm') ?? ''

  const updateParams = (updates: Record<string, string | number | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '') {
          next.delete(key)
        } else {
          next.set(key, String(val))
        }
      })
      return next
    })
  }

  // ── RTK Queries ─────────────────────────────────────────────────────────────
  const { data: stats, isLoading: isLoadingStats } = useGetOverviewStatsQuery()
  const { data: revenueMonthly = [], isLoading: isLoadingRevenue } = useGetRevenueByMonthsQuery()
  const { data: transactionsRes, isLoading: isLoadingTransactions } = useGetAllTransactionsQuery({
    page,
    limit: 10,
    searchTerm: searchTerm.trim() || undefined,
  })

  const transactions = transactionsRes?.data ?? []
  const pagination = transactionsRes?.pagination

  // ── Table Columns ────────────────────────────────────────────────────────────
  const columns: ColumnsType<RevenueTransaction> = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id: string) => (
        <span className="font-mono text-xs font-semibold text-gray-900">
          {id}
        </span>
      ),
    },
    {
      title: 'Buyer',
      key: 'buyer',
      render: (_, record) => (
        <span className="text-sm font-medium text-gray-800">
          {record.buyer?.name ?? 'Anonymous'}
        </span>
      ),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => (
        <span className="text-xs text-gray-600">
          {record.items?.length ?? 0} item{(record.items?.length ?? 0) === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      title: 'Platform Fee',
      dataIndex: 'platformFee',
      key: 'platformFee',
      align: 'right',
      render: (fee: number) => (
        <span className="text-sm font-semibold text-emerald-600">
          {formatPeso(fee ?? 0)}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'right',
      render: (dateStr: string) => (
        <span className="text-xs text-gray-500">
          {dateStr ? new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }) : 'N/A'}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Revenue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of platform earnings and transactions list.
          </p>
        </div>
      </header>

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            {isLoadingStats ? (
              <Spin size="small" />
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {formatPeso(stats?.totalRevenue ?? 0)}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-3">
            {isLoadingStats ? (
              <Spin size="small" />
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {stats?.totalOrders ?? 0}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Active Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-3">
            {isLoadingStats ? (
              <Spin size="small" />
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {stats?.activeUsers ?? 0}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Monthly Revenue Chart (Same as Overview Page) */}
      <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Revenue by Month
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Monthly revenue summary from paid orders
            </p>
          </div>
        </div>
        <div className="mt-5 h-80">
          {isLoadingRevenue ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : revenueMonthly.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueMonthly} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  cursor={false}
                  formatter={(v) => formatPeso(Number(v) || 0)}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#6366f1"
                  name="Revenue"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Revenue Transactions Table */}
      <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Revenue Transactions
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              List of platform transactions and fees collected
            </p>
          </div>
          <SearchInput
            value={searchTerm}
            onChange={(val) => updateParams({ searchTerm: val, page: null })}
            placeholder="Search by order ID or buyer..."
            maxWidth={320}
          />
        </div>

        <Table<RevenueTransaction>
          rowKey="_id"
          columns={columns}
          dataSource={transactions}
          loading={isLoadingTransactions}
          pagination={{
            current: page,
            pageSize: 10,
            total: pagination?.total ?? 0,
            onChange: (p) => updateParams({ page: p }),
            showSizeChanger: false,
          }}
        />
      </section>
    </div>
  )
}
