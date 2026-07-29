import { Link } from 'react-router-dom'
import { Spin, Tag } from 'antd'
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
  ArrowUpRight,
  Flag,
  Gavel,
  LifeBuoy,
  Radio,
  ShoppingBag,
  Users as UsersIcon,
  Video,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  useGetOverviewStatsQuery,
  useGetRevenueByMonthsQuery,
  useGetRecentOrdersQuery,
  useGetRecentlyLiveShowsQuery,
  useGetRecentSupportedTicketsQuery,
  useGetRecentPendingReportsQuery,
} from '../../redux/api/overviewApi'
import {
  orderStatusColor,
  orderStatusLabel,
  paymentStatusColor,
  paymentStatusLabel,
} from '../../components/orders/orderLabels'
import { formatPeso } from '../../lib/currency'
import { PriorityBadge } from '../../components/support/badges'
import { formatLabels as liveFormatLabels } from '../../components/live/liveData'
import { reasonLabels as reportReasonLabels } from '../../components/reports/reportsData'
import type { OrderStatus, PaymentStatus } from '../../components/users/usersData'
import type { ReportReason } from '../../components/reports/reportsData'
import { imageUrl } from '../../lib/imageUrl'

const numberFmt = new Intl.NumberFormat('en-US')

export default function DashboardOverview() {
  const { data: stats, isLoading: isLoadingStats } = useGetOverviewStatsQuery()
  const { data: revenueMonthly = [], isLoading: isLoadingRevenue } = useGetRevenueByMonthsQuery()
  const { data: recentOrders = [], isLoading: isLoadingOrders } = useGetRecentOrdersQuery(8)
  const { data: liveStreams = [], isLoading: isLoadingLive } = useGetRecentlyLiveShowsQuery(4)
  const { data: openTickets = [], isLoading: isLoadingTickets } = useGetRecentSupportedTicketsQuery(3)
  const { data: pendingReports = [], isLoading: isLoadingReports } = useGetRecentPendingReportsQuery(3)

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of Tianguis Live — revenue, orders, live activity, and items
          that need attention.
        </p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total revenue"
          value={isLoadingStats ? '...' : formatPeso(stats?.totalRevenue ?? 0)}
          icon={Wallet}
          tone="brand"
          href="/dashboard/revenue"
        />
        <Kpi
          label="Orders"
          value={isLoadingStats ? '...' : numberFmt.format(stats?.totalOrders ?? 0)}
          icon={ShoppingBag}
          tone="orange"
          href="/dashboard/orders"
        />
        <Kpi
          label="Active users"
          value={isLoadingStats ? '...' : numberFmt.format(stats?.activeUsers ?? 0)}
          icon={UsersIcon}
          tone="blue"
          href="/dashboard/users"
        />
        <Kpi
          label="Live now"
          value={isLoadingStats ? '...' : numberFmt.format(stats?.liveShows ?? 0)}
          icon={Radio}
          tone="red"
          href="/dashboard/live"
        />
      </section>

      {/* Main Grid: Revenue & Live streams */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* Revenue Chart */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Revenue by Month
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Monthly revenue summary from paid orders
              </p>
            </div>
            <Link
              to="/dashboard/revenue"
              className="text-xs font-medium text-brand hover:underline"
            >
              View report
            </Link>
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
        </div>

        {/* Live streams sidebar */}
        <aside className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Live right now
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {liveStreams.length} stream
                {liveStreams.length === 1 ? '' : 's'} broadcasting
              </p>
            </div>
            <Link
              to="/dashboard/live"
              className="text-xs font-medium text-brand hover:underline"
            >
              See all
            </Link>
          </div>
          {isLoadingLive ? (
            <div className="flex h-32 items-center justify-center">
              <Spin />
            </div>
          ) : liveStreams.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No streams are live right now.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {liveStreams.map((s) => (
                <li key={s._id}>
                  <Link
                    to={`/dashboard/live/${s._id}`}
                    className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3 hover:bg-white transition-colors"
                  >
                    {s.thumbnail ? (
                      <img
                        src={imageUrl(s.thumbnail)}
                        alt={s.title}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        {s.format === 'auction' ? (
                          <Gavel size={16} />
                        ) : (
                          <Video size={16} />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {s.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {s.sellerInfo?.name ?? 'Unknown'} · {s.categoryInfo?.name ?? liveFormatLabels[s.format as keyof typeof liveFormatLabels] ?? s.format}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                        LIVE
                      </div>
                      <div className="text-xs text-gray-500">
                        {numberFmt.format(s.activeViewers ?? 0)} viewers
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>

      {/* Lower Section: Recent orders & Action Queue */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-surface-border bg-surface-card">
          <div className="flex items-center justify-between border-b border-surface-border p-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Recent orders
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Latest activity from customers
              </p>
            </div>
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>
          {isLoadingOrders ? (
            <div className="flex h-32 items-center justify-center p-6">
              <Spin />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {recentOrders.map((o) => {
                const statusColor = orderStatusColor[o.orderStatus as OrderStatus] || 'blue'
                const statusText = orderStatusLabel[o.orderStatus as OrderStatus] || o.orderStatus.replace(/_/g, ' ')
                const payColor = paymentStatusColor[o.paymentStatus as PaymentStatus] || 'green'
                const payText = paymentStatusLabel[o.paymentStatus as PaymentStatus] || o.paymentStatus
                const itemCount = o.items?.reduce((n, i) => n + i.quantity, 0) ?? 0

                return (
                  <li key={o._id}>
                    <Link
                      to={`/dashboard/orders/${o._id}`}
                      state={{ order: o }}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-surface-elevated transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {o.orderId || o._id}
                          </span>
                          <Tag color={statusColor} className="capitalize">
                            {statusText}
                          </Tag>
                          <Tag color={payColor} className="capitalize">
                            {payText}
                          </Tag>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-gray-500">
                          {o.buyer?.name ?? 'Customer'} · {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPeso(o.total)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {itemCount} item{itemCount === 1 ? '' : 's'}
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Action Queue: Support Tickets & Pending Reports */}
        <aside className="flex flex-col gap-4">
          <ActionQueueCard
            title="Open support tickets"
            description={`${openTickets.length} need attention`}
            href="/dashboard/support"
            icon={LifeBuoy}
            tone="amber"
          >
            {isLoadingTickets ? (
              <div className="flex h-20 items-center justify-center">
                <Spin />
              </div>
            ) : openTickets.length === 0 ? (
              <Empty text="All tickets resolved." />
            ) : (
              <ul className="space-y-2">
                {openTickets.slice(0, 3).map((t) => (
                  <li key={t._id}>
                    <Link
                      to={`/dashboard/support/${t._id}`}
                      className="block rounded-lg border border-surface-border bg-surface-elevated p-3 hover:bg-white transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {t.ticketId} · user: {t.user?.name ?? 'Unknown'}
                          </div>
                        </div>
                        <PriorityBadge priority={t.priority as any} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </ActionQueueCard>

          <ActionQueueCard
            title="Pending reports"
            description={`${pendingReports.length} awaiting review`}
            href="/dashboard/reports"
            icon={Flag}
            tone="red"
          >
            {isLoadingReports ? (
              <div className="flex h-20 items-center justify-center">
                <Spin />
              </div>
            ) : pendingReports.length === 0 ? (
              <Empty text="No pending reports." />
            ) : (
              <ul className="space-y-2">
                {pendingReports.slice(0, 3).map((r) => {
                  const reasonText = reportReasonLabels[r.reason as ReportReason] || r.reason.replace(/_/g, ' ')
                  return (
                    <li key={r._id}>
                      <Link
                        to={`/dashboard/reports/${r._id}`}
                        className="block rounded-lg border border-surface-border bg-surface-elevated p-3 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900 capitalize">
                              {reasonText}
                            </div>
                            <div className="text-[11px] text-gray-500 truncate">
                              Target: {r.reportedUser?.name ?? 'Unknown'} · {new Date(r.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                            {r.reportCode || r._id.slice(-6)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </ActionQueueCard>
        </aside>
      </section>
    </div>
  )
}

type Tone = 'brand' | 'orange' | 'blue' | 'red' | 'amber'

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  orange: 'bg-orange-100 text-orange-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone: Tone
  href: string
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-surface-border bg-surface-card p-5 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${toneStyles[tone]}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        <ArrowUpRight
          size={14}
          className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </Link>
  )
}

function ActionQueueCard({
  title,
  description,
  href,
  icon: Icon,
  tone,
  children,
}: {
  title: string
  description: string
  href: string
  icon: LucideIcon
  tone: Tone
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneStyles[tone]}`}
          >
            <Icon size={16} />
          </span>
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-500">{description}</div>
          </div>
        </div>
        <Link
          to={href}
          className="text-xs font-medium text-brand hover:underline"
        >
          See all
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-gray-500">{text}</p>
}
