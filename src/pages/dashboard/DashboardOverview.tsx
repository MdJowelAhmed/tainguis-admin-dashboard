import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Tag } from 'antd'
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
import { useUsers } from '../../components/users/usersStore'
import { useAllOrders } from '../../components/orders/ordersStore'
import { useStreams } from '../../components/live/liveStore'
import { useTickets } from '../../components/support/supportStore'
import { useReports } from '../../components/reports/reportsStore'
import {
  buildMonthlyTrend,
  buildRevenueEvents,
  sourceColors,
  summarizeRevenue,
} from '../../components/revenue/revenueData'
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

const numberFmt = new Intl.NumberFormat('en-US')

export default function DashboardOverview() {
  const users = useUsers()
  const orders = useAllOrders()
  const streams = useStreams()
  const tickets = useTickets()
  const reports = useReports()

  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  )

  const revenue = useMemo(() => {
    const bundle = buildRevenueEvents(orders)
    const summary = summarizeRevenue(bundle.events, bundle.refunded)
    const monthly = buildMonthlyTrend(
      bundle.events,
      6,
      new Date('2026-05-31'),
    )
    return { summary, monthly }
  }, [orders])

  const activeUsers = useMemo(
    () => users.filter((u) => u.status === 'active').length,
    [users],
  )

  const liveStreams = useMemo(
    () => streams.filter((s) => s.status === 'live'),
    [streams],
  )

  const openTickets = useMemo(
    () =>
      tickets
        .filter((t) => t.status === 'open' || t.status === 'in_progress')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [tickets],
  )

  const pendingReports = useMemo(
    () =>
      reports
        .filter((r) => r.status === 'pending')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports],
  )

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders])

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of Tianguis Live — revenue, orders, live activity, and items
          that need attention.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total revenue"
          value={formatPeso(revenue.summary.net)}
          icon={Wallet}
          tone="brand"
          href="/dashboard/revenue"
        />
        <Kpi
          label="Orders"
          value={numberFmt.format(orders.length)}
          icon={ShoppingBag}
          tone="orange"
          href="/dashboard/orders"
        />
        <Kpi
          label="Active users"
          value={numberFmt.format(activeUsers)}
          icon={UsersIcon}
          tone="blue"
          href="/dashboard/users"
        />
        <Kpi
          label="Live now"
          value={numberFmt.format(liveStreams.length)}
          icon={Radio}
          tone="red"
          href="/dashboard/live"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Revenue (last 6 months)
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Commission and shipping margin from paid orders
              </p>
            </div>
            <Link
              to="/dashboard/revenue"
              className="text-xs font-medium text-brand hover:underline"
            >
              View report
            </Link>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.monthly} barGap={4}>
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
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
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
                  dataKey="commission"
                  stackId="r"
                  fill={sourceColors.commission}
                  name="Commission"
                />
                <Bar
                  dataKey="shipping"
                  stackId="r"
                  fill={sourceColors.shipping}
                  name="Shipping"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
          {liveStreams.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No streams are live right now.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {liveStreams.map((s) => {
                const seller = userById.get(s.sellerId)
                return (
                  <li key={s.id}>
                    <Link
                      to={`/dashboard/live/${s.id}`}
                      className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3 hover:bg-white"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: s.thumbnailColor }}
                      >
                        {s.format === 'auction' ? (
                          <Gavel size={16} />
                        ) : (
                          <Video size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {s.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {seller?.name ?? 'Unknown'} · {liveFormatLabels[s.format]}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                          </span>
                          LIVE
                        </div>
                        <div className="text-xs text-gray-500">
                          {numberFmt.format(s.currentViewers)} viewers
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
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
          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    to={`/dashboard/orders/${o.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-surface-elevated"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {o.id}
                        </span>
                        <Tag color={orderStatusColor[o.status]}>
                          {orderStatusLabel[o.status]}
                        </Tag>
                        <Tag color={paymentStatusColor[o.paymentStatus]}>
                          {paymentStatusLabel[o.paymentStatus]}
                        </Tag>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-500">
                        {o.customerName} · {o.placedAt}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPeso(o.total)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {o.items.reduce((n, i) => n + i.quantity, 0)} items
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <ActionQueueCard
            title="Open support tickets"
            description={`${openTickets.length} need attention`}
            href="/dashboard/support"
            icon={LifeBuoy}
            tone="amber"
          >
            {openTickets.length === 0 ? (
              <Empty text="All tickets resolved." />
            ) : (
              <ul className="space-y-2">
                {openTickets.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/dashboard/support/${t.id}`}
                      className="block rounded-lg border border-surface-border bg-surface-elevated p-3 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {t.subject}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {t.id} · updated {t.updatedAt}
                          </div>
                        </div>
                        <PriorityBadge priority={t.priority} />
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
            {pendingReports.length === 0 ? (
              <Empty text="No pending reports." />
            ) : (
              <ul className="space-y-2">
                {pendingReports.slice(0, 3).map((r) => {
                  const reported = userById.get(r.reportedUserId)
                  return (
                    <li key={r.id}>
                      <Link
                        to={`/dashboard/reports/${r.id}`}
                        className="block rounded-lg border border-surface-border bg-surface-elevated p-3 hover:bg-white"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {reportReasonLabels[r.reason]}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {reported?.name ?? 'Unknown'} · {r.createdAt}
                            </div>
                          </div>
                          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                            {r.id.toUpperCase()}
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
