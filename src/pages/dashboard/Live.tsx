import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Select, Table, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CalendarClock,
  Eye,
  Gavel,
  Radio,
  Users,
  Video,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useGetAllLiveShowsQuery } from '../../redux/api/liveShowApi'
import type { LiveShowListItem, GetLiveShowsParams } from '../../redux/api/liveShowApi'
import { imageUrl } from '../../lib/imageUrl'
import SearchInput from '../../components/ui/SearchInput'

// ─── Formatters ───────────────────────────────────────────────────────────────

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})
const numberFmt = new Intl.NumberFormat('en-US')

// ─── Status badge styles ──────────────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; text: string }> = {
  live:      { bg: 'bg-red-100',  text: 'text-red-700'  },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Live() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Derive state from URL ──────────────────────────────────────────────────
  const search     = searchParams.get('searchTerm') ?? ''
  const statusFilter = searchParams.get('status') ?? 'all'
  const formatFilter = searchParams.get('format') ?? 'all'
  const page       = Number(searchParams.get('page') ?? '1')
  const pageSize   = 10

  // ── URL update helper ──────────────────────────────────────────────────────
  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === 'all') next.delete(k)
        else next.set(k, v)
      })
      return next
    })
  }

  // ── API query ──────────────────────────────────────────────────────────────
  const queryParams: GetLiveShowsParams = {
    page,
    limit: pageSize,
    ...(search.trim()              ? { searchTerm: search.trim() }    : {}),
    ...(statusFilter !== 'all'     ? { status: statusFilter }         : {}),
    ...(formatFilter !== 'all'     ? { format: formatFilter }         : {}),
  }

  const { data, isLoading, isError, error } = useGetAllLiveShowsQuery(queryParams)

  const shows      = data?.data ?? []
  const pagination = data?.pagination

  // ── Summary counts ─────────────────────────────────────────────────────────
  const liveCount      = shows.filter((s) => s.status === 'live').length
  const scheduledCount = shows.filter((s) => s.status === 'scheduled').length
  const totalViewers   = shows.reduce((sum, s) => sum + s.activeViewers, 0)
  const totalSales     = shows.reduce((sum, s) => sum + s.totalSales, 0)

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: ColumnsType<LiveShowListItem> = [
    {
      title: 'Show',
      key: 'show',
      render: (_, s) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
            {s.thumbnail ? (
              <img
                src={imageUrl(s.thumbnail)}
                alt={s.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                {s.format === 'auction' ? <Gavel size={18} /> : <Video size={18} />}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              to={`/dashboard/live/${s._id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-sm font-semibold text-gray-900 hover:text-brand"
            >
              {s.title}
            </Link>
            <div className="truncate text-xs text-gray-500">
              {s.categoryInfo?.name ?? '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Seller',
      key: 'seller',
      render: (_, s) => (
        <div className="flex items-center gap-2">
          {s.sellerInfo?.profileImage && (
            <img
              src={imageUrl(s.sellerInfo.profileImage)}
              alt={s.sellerInfo.name}
              className="h-7 w-7 rounded-full object-cover"
            />
          )}
          <Link
            to={`/dashboard/users/${s.sellerInfo?._id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-700 hover:text-brand"
          >
            {s.sellerInfo?.name ?? '—'}
          </Link>
        </div>
      ),
    },
    {
      title: 'Format',
      key: 'format',
      render: (_, s) => (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2 py-1 text-xs font-medium text-gray-700 capitalize">
          {s.format === 'auction' ? <Gavel size={12} /> : <Radio size={12} />}
          {s.format}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, s) => {
        const style = statusStyles[s.status] ?? statusStyles.cancelled
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style.bg} ${style.text}`}
          >
            {s.status === 'live' && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            {s.status}
          </span>
        )
      },
    },
    {
      title: 'Viewers',
      dataIndex: 'activeViewers',
      key: 'activeViewers',
      align: 'right',
      render: (val: number) => (
        <span className="text-sm text-gray-700">{numberFmt.format(val)}</span>
      ),
      sorter: (a, b) => a.activeViewers - b.activeViewers,
    },
    {
      title: 'Items',
      key: 'items',
      align: 'right',
      render: (_, s) => (
        <div className="text-right">
          <div className="text-sm text-gray-700">{s.soldItemsCount} / {s.totalStock}</div>
          <div className="text-[11px] text-gray-500">{s.listingsCount} listing{s.listingsCount === 1 ? '' : 's'}</div>
        </div>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right',
      render: (val: number) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(val)}
        </span>
      ),
      sorter: (a, b) => a.totalSales - b.totalSales,
    },
    {
      title: 'Scheduled At',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (d: string) => (
        <span className="text-xs text-gray-500">
          {new Date(d).toLocaleString()}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, s) => (
        <Link
          to={`/dashboard/live/${s._id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
          aria-label="Open show"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ]

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load live shows.'
    return (
      <div className="py-6">
        <Alert type="error" message={errMsg} showIcon />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Live & Auctions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track live streams and auctions where sellers showcase products in real time.
        </p>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Live right now" value={liveCount}      icon={Radio}       tone="red"   />
        <SummaryCard label="Scheduled"      value={scheduledCount} icon={CalendarClock} tone="blue" />
        <SummaryCard label="Active viewers" value={totalViewers}   icon={Users}        tone="brand" />
        <SummaryCard label="Total sales"    value={totalSales}     icon={Wallet}       tone="green" format="currency" />
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <SearchInput
            value={search}
            onChange={(val) => updateParams({ searchTerm: val, page: null })}
            placeholder="Search by title, seller or category"
            debounceMs={400}
            maxWidth={340}
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateParams({ status: val, page: null })}
            style={{ width: 170 }}
            options={[
              { value: 'all',       label: 'All statuses' },
              { value: 'live',      label: 'Live now'     },
              { value: 'scheduled', label: 'Scheduled'    },
              { value: 'completed', label: 'Completed'    },
              { value: 'cancelled', label: 'Cancelled'    },
            ]}
          />
          <Select
            value={formatFilter}
            onChange={(val) => updateParams({ format: val, page: null })}
            style={{ width: 150 }}
            options={[
              { value: 'all',     label: 'All formats' },
              { value: 'auction', label: 'Auction'     },
              { value: 'live',    label: 'Live drop'   },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            {pagination ? `${pagination.total} total shows` : ''}
          </span>
        </div>

        <Spin spinning={isLoading}>
          <Table<LiveShowListItem>
            className="dashboard-table"
            rowKey="_id"
            columns={columns}
            dataSource={shows}
            pagination={{
              current: page,
              pageSize,
              total: pagination?.total ?? 0,
              showSizeChanger: false,
              onChange: (p) => updateParams({ page: String(p) }),
            }}
            onRow={(s) => ({
              onClick: () => navigate(`/dashboard/live/${s._id}`),
              style: { cursor: 'pointer' },
            })}
          />
        </Spin>
      </section>
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

type Tone = 'red' | 'blue' | 'brand' | 'green'

const toneStyles: Record<Tone, string> = {
  red:   'bg-red-100 text-red-700',
  blue:  'bg-blue-100 text-blue-700',
  brand: 'bg-brand/10 text-brand',
  green: 'bg-green-100 text-green-700',
}

function SummaryCard({
  label, value, icon: Icon, tone, format,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone: Tone
  format?: 'currency'
}) {
  const display = format === 'currency' ? currency.format(value) : numberFmt.format(value)
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${toneStyles[tone]}`}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{display}</div>
    </div>
  )
}
