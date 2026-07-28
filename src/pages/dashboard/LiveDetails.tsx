import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  ExternalLink,
  EyeOff,
  Gavel,
  Pin,
  Radio,
  ShoppingBag,
  Timer,
  TrendingUp,
  Users,
  Video,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  cancelStream,
  endStream,
  hideMessage,
  pinMessage,
  useStream,
} from '../../components/live/liveStore'
import {
  formatLabels,
  statusLabels,
  type LiveBid,
  type LiveProduct,
  type LiveStatus,
} from '../../components/live/liveData'
import { useUser } from '../../components/users/usersStore'

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
  cancelled: { bg: 'bg-gray-200', text: 'text-gray-600' },
}

function formatDuration(startIso: string, endIso?: string): string {
  if (!startIso) return '—'
  const start = new Date(startIso.replace(' ', 'T'))
  const end = endIso ? new Date(endIso.replace(' ', 'T')) : new Date()
  const ms = end.getTime() - start.getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const m = Math.floor(ms / 60000)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}

function formatSeconds(s: number) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

export default function LiveDetails() {
  const { id } = useParams<{ id: string }>()
  const stream = useStream(id)
  const seller = useUser(stream?.sellerId)
  const navigate = useNavigate()
  const { modal, message } = App.useApp()

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-base text-gray-700">Stream not found.</p>
        <Link
          to="/dashboard/live"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to live streams
        </Link>
      </div>
    )
  }

  const handleEnd = () => {
    modal.confirm({
      title: 'End this stream?',
      content:
        'Ending a stream immediately disconnects all viewers. The seller will need to start a new stream.',
      okText: 'End stream',
      okButtonProps: { danger: true },
      onOk: () => {
        endStream(stream.id)
        message.success('Stream ended.')
      },
    })
  }

  const handleCancel = () => {
    modal.confirm({
      title: 'Cancel scheduled stream?',
      content: 'The seller will be notified the stream is cancelled.',
      okText: 'Cancel stream',
      okButtonProps: { danger: true },
      onOk: () => {
        cancelStream(stream.id)
        message.success('Stream cancelled.')
      },
    })
  }

  const statusStyle = statusStyles[stream.status]
  const isAuction = stream.format === 'auction'
  const totalStock = stream.products.reduce((n, p) => n + p.stock, 0)
  const visibleMessages = stream.messages.filter((m) => !m.hidden)
  const hiddenMessageCount = stream.messages.length - visibleMessages.length

  const productColumns: ColumnsType<LiveProduct> = [
    {
      title: 'Product',
      key: 'name',
      render: (_, p) => (
        <div className="text-sm font-medium text-gray-900">{p.name}</div>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      align: 'right',
      render: (_, p) =>
        p.price > 0 ? (
          <span className="text-sm text-gray-800">{currency.format(p.price)}</span>
        ) : (
          <span className="text-xs italic text-gray-500">Auction</span>
        ),
    },
    {
      title: 'Stock',
      key: 'stock',
      align: 'right',
      render: (_, p) => (
        <span className="text-sm text-gray-700">{numberFmt.format(p.stock)}</span>
      ),
    },
    {
      title: 'Sold',
      key: 'sold',
      align: 'right',
      render: (_, p) => (
        <span className="text-sm font-semibold text-gray-900">
          {numberFmt.format(p.sold)}
        </span>
      ),
    },
    {
      title: 'Revenue',
      key: 'revenue',
      align: 'right',
      render: (_, p) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(p.price * p.sold)}
        </span>
      ),
    },
  ]

  const bidColumns: ColumnsType<LiveBid> = [
    {
      title: 'Bidder',
      key: 'bidder',
      render: (_, b) => (
        <Link
          to={`/dashboard/users/${b.bidderId}`}
          className="text-sm text-gray-900 hover:text-brand"
        >
          {b.bidderName}
        </Link>
      ),
    },
    {
      title: 'Amount',
      key: 'amount',
      align: 'right',
      render: (_, b) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(b.amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Placed at',
      dataIndex: 'placedAt',
      key: 'placedAt',
      render: (d: string) => <span className="text-xs text-gray-500">{d}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/live')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to live streams
        </button>
      </div>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: stream.thumbnailColor }}
            >
              {isAuction ? <Gavel size={26} /> : <Video size={26} />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {stream.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {stream.status === 'live' && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                  )}
                  {statusLabels[stream.status]}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-medium text-gray-700">
                  {isAuction ? <Gavel size={12} /> : <Radio size={12} />}
                  {formatLabels[stream.format]}
                </span>
                <span className="text-xs text-gray-500">{stream.category}</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                {stream.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {stream.startedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Timer size={12} />
                    Started {stream.startedAt}
                  </span>
                )}
                {stream.scheduledFor && stream.status === 'scheduled' && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={12} />
                    Scheduled for {stream.scheduledFor}
                  </span>
                )}
                {stream.endedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Timer size={12} />
                    Ended {stream.endedAt} · duration{' '}
                    {formatDuration(stream.startedAt ?? stream.endedAt, stream.endedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stream.status === 'live' && (
              <button
                type="button"
                onClick={handleEnd}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Ban size={14} />
                End stream
              </button>
            )}
            {stream.status === 'scheduled' && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                <Ban size={14} />
                Cancel stream
              </button>
            )}
            {seller && (
              <Link
                to={`/dashboard/users/${seller.id}`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated"
              >
                Seller profile
                <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          label={stream.status === 'live' ? 'Current viewers' : 'Peak viewers'}
          value={
            stream.status === 'live' ? stream.currentViewers : stream.peakViewers
          }
          icon={Users}
          tone="brand"
        />
        <Stat
          label="Unique viewers"
          value={stream.uniqueViewers}
          icon={Users}
          tone="blue"
        />
        <Stat
          label={isAuction ? 'Current bid' : 'Stream sales'}
          value={
            isAuction ? stream.currentBid ?? 0 : stream.totalSales
          }
          icon={Wallet}
          tone="green"
          asCurrency
        />
        <Stat
          label={isAuction ? 'Total bidders' : 'Items sold'}
          value={isAuction ? stream.bidderCount ?? 0 : stream.itemsSold}
          icon={isAuction ? Gavel : ShoppingBag}
          tone="orange"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-surface-border bg-surface-card">
            <div className="flex items-center justify-between border-b border-surface-border p-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Featured products
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {stream.products.length} listing
                  {stream.products.length === 1 ? '' : 's'} · {totalStock} units in stock
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Avg watch</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatSeconds(stream.avgWatchSeconds)}
                </div>
              </div>
            </div>
            <Table<LiveProduct>
              className="dashboard-table"
              rowKey="productId"
              columns={productColumns}
              dataSource={stream.products}
              pagination={false}
              locale={{ emptyText: 'No products linked to this stream.' }}
            />
          </div>

          {isAuction && (
            <div className="rounded-2xl border border-surface-border bg-surface-card">
              <div className="flex items-center justify-between border-b border-surface-border p-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Bid history
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {stream.bids?.length ?? 0} bid
                    {(stream.bids?.length ?? 0) === 1 ? '' : 's'} from{' '}
                    {stream.bidderCount ?? 0} unique bidder
                    {(stream.bidderCount ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
                {stream.bidEndsAt && stream.status === 'live' && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Ends</div>
                    <div className="text-sm font-medium text-gray-900">
                      {stream.bidEndsAt}
                    </div>
                  </div>
                )}
              </div>
              <Table<LiveBid>
                className="dashboard-table"
                rowKey="id"
                columns={bidColumns}
                dataSource={stream.bids ?? []}
                pagination={false}
                locale={{ emptyText: 'No bids placed yet.' }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Live chat
              </h2>
              <span className="text-xs text-gray-500">
                {stream.messages.length} message
                {stream.messages.length === 1 ? '' : 's'}
                {hiddenMessageCount > 0 && ` · ${hiddenMessageCount} hidden`}
              </span>
            </div>
            {stream.messages.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No chat activity yet.</p>
            ) : (
              <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                {stream.messages.map((m) => (
                  <li
                    key={m.id}
                    className={`group rounded-xl border p-3 ${
                      m.hidden
                        ? 'border-dashed border-gray-200 bg-gray-50 opacity-60'
                        : m.pinned
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-surface-border bg-surface-elevated'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                          {m.authorName}
                          {m.pinned && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 text-[10px] text-amber-700">
                              <Pin size={10} />
                              Pinned
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500">{m.sentAt}</div>
                      </div>
                      <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => pinMessage(stream.id, m.id)}
                          aria-label="Pin message"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-amber-700"
                        >
                          <Pin size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => hideMessage(stream.id, m.id)}
                          aria-label={m.hidden ? 'Unhide message' : 'Hide message'}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-red-600"
                        >
                          <EyeOff size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-gray-800">
                      {m.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {seller && (
            <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
              <h2 className="text-sm font-semibold text-gray-900">Seller</h2>
              <div className="mt-3">
                <Link
                  to={`/dashboard/users/${seller.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
                >
                  {seller.name}
                  <ExternalLink size={12} />
                </Link>
                <div className="mt-1 text-xs text-gray-500">{seller.email}</div>
                <div className="text-xs text-gray-500">{seller.city}</div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-700">
                  <TrendingUp size={11} />
                  {seller.orders.length} order
                  {seller.orders.length === 1 ? '' : 's'} placed as buyer
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

type Tone = 'brand' | 'blue' | 'green' | 'orange'

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
  asCurrency,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone: Tone
  asCurrency?: boolean
}) {
  const display = asCurrency ? currency.format(value) : numberFmt.format(value)
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
