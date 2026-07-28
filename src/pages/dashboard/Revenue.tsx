import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAllOrders } from '../../components/orders/ordersStore'
import { useUsers } from '../../components/users/usersStore'
import {
  buildMonthlyTrend,
  buildRevenueEvents,
  COMMISSION_RATE,
  filterByRange,
  SHIPPING_MARGIN_RATE,
  sourceColors,
  sourceLabels,
  summarizeRevenue,
  type RevenueEvent,
  type RevenueSource,
} from '../../components/revenue/revenueData'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

type RangeKey = '30d' | '90d' | '180d' | 'all'

const rangeOptions: { value: RangeKey; label: string; days: number | null }[] = [
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '180d', label: 'Last 6 months', days: 180 },
  { value: 'all', label: 'All time', days: null },
]

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export default function Revenue() {
  const orders = useAllOrders()
  const users = useUsers()
  const [range, setRange] = useState<RangeKey>('90d')

  const allEventsBundle = useMemo(
    () => buildRevenueEvents(orders),
    [orders],
  )

  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  )

  const rangeDays = rangeOptions.find((r) => r.value === range)?.days ?? null

  const currentEvents = useMemo(() => {
    if (rangeDays === null) return allEventsBundle.events
    return filterByRange(allEventsBundle.events, isoDaysAgo(rangeDays))
  }, [allEventsBundle.events, rangeDays])

  const previousEvents = useMemo(() => {
    if (rangeDays === null) return []
    const from = isoDaysAgo(rangeDays * 2)
    const to = isoDaysAgo(rangeDays)
    return allEventsBundle.events.filter((e) => {
      const d = e.occurredAt.slice(0, 10)
      return d >= from && d < to
    })
  }, [allEventsBundle.events, rangeDays])

  const current = useMemo(
    () => summarizeRevenue(currentEvents, allEventsBundle.refunded),
    [currentEvents, allEventsBundle.refunded],
  )

  const previous = useMemo(
    () => summarizeRevenue(previousEvents, 0),
    [previousEvents],
  )

  const monthly = useMemo(
    () => buildMonthlyTrend(allEventsBundle.events, 6, new Date('2026-05-31')),
    [allEventsBundle.events],
  )

  const breakdownData = (Object.keys(current.breakdown) as RevenueSource[])
    .map((s) => ({
      key: s,
      name: sourceLabels[s],
      value: current.breakdown[s],
      color: sourceColors[s],
    }))
    .filter((d) => d.value > 0)

  const eventColumns: ColumnsType<RevenueEvent> = [
    {
      title: 'When',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      render: (d: string) => <span className="text-xs text-gray-500">{d}</span>,
      sorter: (a, b) => a.occurredAt.localeCompare(b.occurredAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (s: RevenueSource) => (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${sourceColors[s]}1a`,
            color: sourceColors[s],
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: sourceColors[s] }}
          />
          {sourceLabels[s]}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <span className="text-sm text-gray-800">{text}</span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, e) => {
        const u = userById.get(e.customerId)
        if (!u) return <span className="text-sm text-gray-500">Unknown</span>
        return (
          <Link
            to={`/dashboard/users/${u.id}`}
            className="text-sm text-gray-800 hover:text-brand"
          >
            {u.name}
          </Link>
        )
      },
    },
    {
      title: 'Amount',
      key: 'amount',
      align: 'right',
      render: (_, e) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(e.amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Revenue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Earnings from paid orders — {Math.round(COMMISSION_RATE * 100)}%
            marketplace commission plus{' '}
            {Math.round(SHIPPING_MARGIN_RATE * 100)}% shipping margin.
          </p>
        </div>
        <Select
          value={range}
          onChange={setRange}
          style={{ width: 180 }}
          options={rangeOptions.map((r) => ({
            value: r.value,
            label: r.label,
          }))}
        />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Total revenue"
          value={current.total}
          previous={previous.total}
          icon={Wallet}
          tone="brand"
          showDelta={rangeDays !== null}
        />
        <KpiCard
          label="Order commission"
          value={current.breakdown.commission}
          previous={previous.breakdown.commission}
          icon={CreditCard}
          tone="orange"
          showDelta={rangeDays !== null}
        />
        <KpiCard
          label="Shipping margin"
          value={current.breakdown.shipping}
          previous={previous.breakdown.shipping}
          icon={Truck}
          tone="blue"
          showDelta={rangeDays !== null}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Monthly revenue trend
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Last 6 months by revenue source
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Net (range)</div>
              <div className="text-lg font-semibold text-gray-900">
                {currency.format(current.net)}
              </div>
              {current.refunded > 0 && (
                <div className="text-[11px] text-red-600">
                  − {currency.format(current.refunded)} refunded
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v) => currency.format(Number(v) || 0)}
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
                <Bar dataKey="commission" stackId="r" fill={sourceColors.commission} name="Commission" />
                <Bar dataKey="shipping" stackId="r" fill={sourceColors.shipping} name="Shipping" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Revenue mix
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Where revenue is coming from in the selected range
          </p>
          {breakdownData.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">No revenue in this range.</p>
          ) : (
            <>
              <div className="mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {breakdownData.map((d) => (
                        <Cell key={d.key} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => currency.format(Number(v) || 0)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-2">
                {breakdownData.map((d) => {
                  const pct = current.total > 0 ? (d.value / current.total) * 100 : 0
                  return (
                    <li key={d.key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-xs text-gray-700">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {currency.format(d.value)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {pct.toFixed(1)}%
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex items-center justify-between border-b border-surface-border p-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Revenue transactions
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Every revenue event in the selected range
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {currentEvents.length} transaction
            {currentEvents.length === 1 ? '' : 's'}
          </span>
        </div>
        <Table<RevenueEvent>
          className="dashboard-table"
          rowKey="id"
          columns={eventColumns}
          dataSource={currentEvents}
          pagination={
            currentEvents.length > 10 ? { pageSize: 10, showSizeChanger: false } : false
          }
          locale={{ emptyText: 'No revenue in this range.' }}
        />
      </section>
    </div>
  )
}

type Tone = 'brand' | 'orange' | 'blue'

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  orange: 'bg-orange-100 text-orange-700',
  blue: 'bg-blue-100 text-blue-700',
}

function KpiCard({
  label,
  value,
  previous,
  icon: Icon,
  tone,
  showDelta,
}: {
  label: string
  value: number
  previous: number
  icon: LucideIcon
  tone: Tone
  showDelta: boolean
}) {
  const delta = previous === 0 ? null : ((value - previous) / previous) * 100
  const up = (delta ?? 0) >= 0
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
      <div className="mt-3 text-2xl font-semibold text-gray-900">
        {currency.format(value)}
      </div>
      {showDelta && delta !== null && (
        <div
          className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
            up ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta).toFixed(1)}% vs previous
        </div>
      )}
      {showDelta && delta === null && previous === 0 && value > 0 && (
        <div className="mt-1 text-xs text-gray-500">New this range</div>
      )}
    </div>
  )
}

