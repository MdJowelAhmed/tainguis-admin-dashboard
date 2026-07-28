import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CalendarClock,
  Eye,
  Gavel,
  Radio,
  Search,
  Users,
  Video,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useStreams } from '../../components/live/liveStore'
import {
  formatLabels,
  statusLabels,
  type LiveFormat,
  type LiveStatus,
  type LiveStream,
} from '../../components/live/liveData'
import { useUsers } from '../../components/users/usersStore'

type StatusFilter = 'all' | LiveStatus
type FormatFilter = 'all' | LiveFormat

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})
const numberFmt = new Intl.NumberFormat('en-US')

const statusStyles: Record<LiveStatus, { bg: string; text: string }> = {
  live: { bg: 'bg-red-100', text: 'text-red-700' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ended: { bg: 'bg-gray-100', text: 'text-gray-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

export default function Live() {
  const streams = useStreams()
  const users = useUsers()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all')

  const userById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return streams.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (formatFilter !== 'all' && s.format !== formatFilter) return false
      if (!q) return true
      const sellerName = userById.get(s.sellerId)?.name.toLowerCase() ?? ''
      return (
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        sellerName.includes(q)
      )
    })
  }, [streams, search, statusFilter, formatFilter, userById])

  const counts = useMemo(() => {
    const liveNow = streams.filter((s) => s.status === 'live')
    return {
      liveNow: liveNow.length,
      scheduled: streams.filter((s) => s.status === 'scheduled').length,
      viewers: liveNow.reduce((sum, s) => sum + s.currentViewers, 0),
      todaySales: streams
        .filter((s) => s.status === 'live' || s.status === 'ended')
        .reduce((sum, s) => sum + s.totalSales, 0),
    }
  }, [streams])

  const columns: ColumnsType<LiveStream> = [
    {
      title: 'Stream',
      key: 'stream',
      render: (_, s) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: s.thumbnailColor }}
          >
            {s.format === 'auction' ? <Gavel size={18} /> : <Video size={18} />}
          </div>
          <div className="min-w-0">
            <Link
              to={`/dashboard/live/${s.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-sm font-semibold text-gray-900 hover:text-brand"
            >
              {s.title}
            </Link>
            <div className="text-xs text-gray-500">
              {s.id} · {s.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Seller',
      key: 'seller',
      render: (_, s) => {
        const u = userById.get(s.sellerId)
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
      title: 'Format',
      key: 'format',
      render: (_, s) => (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2 py-1 text-xs font-medium text-gray-700">
          {s.format === 'auction' ? <Gavel size={12} /> : <Radio size={12} />}
          {formatLabels[s.format]}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, s) => {
        const style = statusStyles[s.status]
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
          >
            {s.status === 'live' && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            {statusLabels[s.status]}
          </span>
        )
      },
    },
    {
      title: 'Viewers',
      key: 'viewers',
      align: 'right',
      render: (_, s) => {
        if (s.status === 'live') {
          return (
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {numberFmt.format(s.currentViewers)}
              </div>
              <div className="text-[11px] text-gray-500">
                peak {numberFmt.format(s.peakViewers)}
              </div>
            </div>
          )
        }
        if (s.status === 'ended') {
          return (
            <div className="text-right">
              <div className="text-sm text-gray-700">
                {numberFmt.format(s.uniqueViewers)}
              </div>
              <div className="text-[11px] text-gray-500">unique</div>
            </div>
          )
        }
        return <span className="text-xs text-gray-400">—</span>
      },
    },
    {
      title: 'Items',
      key: 'items',
      align: 'right',
      render: (_, s) => (
        <div className="text-right">
          <div className="text-sm text-gray-700">
            {s.itemsSold} / {s.products.reduce((n, p) => n + p.stock, 0)}
          </div>
          <div className="text-[11px] text-gray-500">
            {s.products.length} listing
            {s.products.length === 1 ? '' : 's'}
          </div>
        </div>
      ),
    },
    {
      title: 'Sales',
      key: 'sales',
      align: 'right',
      render: (_, s) => (
        <span className="text-sm font-semibold text-gray-900">
          {s.format === 'auction' && s.currentBid !== undefined
            ? currency.format(s.currentBid)
            : currency.format(s.totalSales)}
        </span>
      ),
      sorter: (a, b) => a.totalSales - b.totalSales,
    },
    {
      title: 'Started / Scheduled',
      key: 'time',
      render: (_, s) => (
        <span className="text-xs text-gray-500">
          {s.startedAt ?? s.scheduledFor ?? '—'}
        </span>
      ),
      sorter: (a, b) =>
        (a.startedAt ?? a.scheduledFor ?? '').localeCompare(
          b.startedAt ?? b.scheduledFor ?? '',
        ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, s) => (
        <Link
          to={`/dashboard/live/${s.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
          aria-label="Open stream"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Live & Auctions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track live streams and auctions where sellers showcase products in
          real time.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          label="Live right now"
          value={counts.liveNow}
          icon={Radio}
          tone="red"
        />
        <SummaryCard
          label="Scheduled"
          value={counts.scheduled}
          icon={CalendarClock}
          tone="blue"
        />
        <SummaryCard
          label="Active viewers"
          value={counts.viewers}
          icon={Users}
          tone="brand"
        />
        <SummaryCard
          label="Sales (live + recent)"
          value={counts.todaySales}
          icon={Wallet}
          tone="green"
          format="currency"
        />
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, seller, category, or id"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[340px]"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'live', label: 'Live now' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'ended', label: 'Ended' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <Select
            value={formatFilter}
            onChange={setFormatFilter}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All formats' },
              { value: 'live', label: 'Live drop' },
              { value: 'auction', label: 'Auction' },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            Showing {filtered.length} of {streams.length}
          </span>
        </div>

        <Table<LiveStream>
          className="dashboard-table"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          onRow={(s) => ({
            onClick: () => navigate(`/dashboard/live/${s.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </section>
    </div>
  )
}

type Tone = 'red' | 'blue' | 'brand' | 'green'

const toneStyles: Record<Tone, string> = {
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  brand: 'bg-brand/10 text-brand',
  green: 'bg-green-100 text-green-700',
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  format,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone: Tone
  format?: 'currency'
}) {
  const display =
    format === 'currency' ? currency.format(value) : numberFmt.format(value)
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
      <div className="mt-3 text-2xl font-semibold text-gray-900">{display}</div>
    </div>
  )
}
