import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Table, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  ExternalLink,
  Gavel,
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
  useGetLiveShowByIdQuery,
  useEndLiveShowMutation,
  useGetLiveInChattingMessageQuery,
  type LiveProduct,
} from '../../redux/api/liveShowApi'

// ─── Formatters ───────────────────────────────────────────────────────────────

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const numberFmt = new Intl.NumberFormat('en-US')

const statusStyles: Record<string, { bg: string; text: string }> = {
  live: { bg: 'bg-red-100', text: 'text-red-700' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  cancelled: { bg: 'bg-gray-200', text: 'text-gray-600' },
}

function formatDuration(startIso?: string, endIso?: string): string {
  if (!startIso) return '—'
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : new Date()
  const ms = end.getTime() - start.getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const m = Math.floor(ms / 60000)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { modal, message } = App.useApp()

  // 1. Fetch Show Details
  const { data: showRes, isLoading: isLoadingShow, isError: isErrorShow } = useGetLiveShowByIdQuery(id!, { skip: !id })
  const detail = showRes?.data

  // 2. Fetch Chat Messages (only if chatRoomId is available)
  const chatRoomId = detail?.chat?.chatRoomId
  const { data: chatRes, isLoading: isLoadingChat } = useGetLiveInChattingMessageQuery(chatRoomId!, { skip: !chatRoomId })
  const messages = chatRes?.data ?? []

  // 3. End Stream Mutation
  const [endLiveShow, { isLoading: isEnding }] = useEndLiveShowMutation()

  // ── Loading & Error states ─────────────────────────────────────────────────
  if (isLoadingShow) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" tip="Loading live stream details…" />
      </div>
    )
  }

  if (isErrorShow || !detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Alert type="error" message="Stream not found." showIcon />
        <Link to="/dashboard/live" className="text-sm font-medium text-brand hover:underline">
          Back to live streams
        </Link>
      </div>
    )
  }

  const stream = detail.show
  const seller = stream.seller
  const products = detail.liveProducts
  const bids = detail.bids
  const sellerStats = detail.sellerStats

  const handleEnd = () => {
    modal.confirm({
      title: 'End this stream?',
      content: 'Ending a stream immediately disconnects all viewers. The seller will need to start a new stream.',
      okText: 'End stream',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await endLiveShow(stream._id).unwrap()
          message.success('Stream ended successfully.')
        } catch {
          message.error('Failed to end stream.')
        }
      },
    })
  }

  const isAuction = products.some(p => p.product.salesFormat === 'auction')
  const totalStock = products.reduce((n, p) => n + p.product.stock, 0)
  const statusStyle = statusStyles[stream.status] ?? statusStyles.cancelled

  const productColumns: ColumnsType<LiveProduct> = [
    {
      title: 'Product ID',
      key: 'product',
      render: (_, p) => (
        <div className="text-sm font-medium text-gray-900">{p.product._id}</div>
      ),
    },
    {
      title: 'Format',
      key: 'format',
      render: (_, p) => (
        <span className="text-sm text-gray-700 capitalize">{p.product.salesFormat}</span>
      ),
    },
    {
      title: 'Price / Bid Start',
      key: 'price',
      align: 'right',
      render: (_, p) =>
        p.product.bidStartFrom ? (
          <span className="text-sm text-gray-800">{currency.format(p.product.bidStartFrom)}</span>
        ) : (
          <span className="text-sm text-gray-800">—</span>
        ),
    },
    {
      title: 'Stock',
      key: 'stock',
      align: 'right',
      render: (_, p) => (
        <span className="text-sm text-gray-700">{numberFmt.format(p.product.stock)}</span>
      ),
    },
    {
      title: 'Sold',
      key: 'sold',
      align: 'right',
      render: (_, p) => (
        <span className="text-sm font-semibold text-gray-900">
          {numberFmt.format(p.soldCount)}
        </span>
      ),
    },
    {
      title: 'Revenue',
      key: 'revenue',
      align: 'right',
      render: (_, p) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(p.revenue)}
        </span>
      ),
    },
  ]

  return (
    <Spin spinning={isEnding}>
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

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-elevated text-gray-400">
                {stream.thumbnail ? (
                  <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {isAuction ? <Gavel size={26} /> : <Video size={26} />}
                  </div>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {stream._id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {stream.status === 'live' && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                    )}
                    {stream.status}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-medium text-gray-700 capitalize">
                    {isAuction ? <Gavel size={12} /> : <Radio size={12} />}
                    {isAuction ? 'Auction' : 'Live Drop'}
                  </span>
                  <span className="text-xs text-gray-500">{stream.category.name}</span>
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                  {stream.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {stream.startedAt && (
                    <span className="inline-flex items-center gap-1">
                      <Timer size={12} />
                      Started {new Date(stream.startedAt).toLocaleString()}
                    </span>
                  )}
                  {stream.scheduledAt && stream.status === 'scheduled' && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={12} />
                      Scheduled for {new Date(stream.scheduledAt).toLocaleString()}
                    </span>
                  )}
                  {stream.endedAt && (
                    <span className="inline-flex items-center gap-1">
                      <Timer size={12} />
                      Ended {new Date(stream.endedAt).toLocaleString()} · duration{' '}
                      {formatDuration(stream.startedAt, stream.endedAt)}
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
              {seller && (
                <Link
                  to={`/dashboard/users/${seller._id}`}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated"
                >
                  Seller profile
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat
            label={stream.status === 'live' ? 'Current viewers' : 'Total Views'}
            value={stream.status === 'live' ? stream.activeViewers : stream.totalViews}
            icon={Users}
            tone="brand"
          />
          <Stat
            label="Total Hearts"
            value={stream.totalHearts}
            icon={Users}
            tone="blue"
          />
          <Stat
            label="Current Bid"
            value={bids?.currentBid ?? 0}
            icon={Wallet}
            tone="green"
            asCurrency
          />
          <Stat
            label="Total Bidders"
            value={bids?.totalBidders ?? 0}
            icon={Gavel}
            tone="orange"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            
            {/* ── Products Table ──────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-surface-border bg-surface-card">
              <div className="flex items-center justify-between border-b border-surface-border p-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Featured products</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {products.length} listing{products.length === 1 ? '' : 's'} · {totalStock} units in stock
                  </p>
                </div>
              </div>
              <Table<LiveProduct>
                className="dashboard-table"
                rowKey="_id"
                columns={productColumns}
                dataSource={products}
                pagination={false}
                locale={{ emptyText: 'No products linked to this stream.' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* ── Chat ────────────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Live chat</h2>
                <span className="text-xs text-gray-500">
                  {messages.length} message{messages.length === 1 ? '' : 's'}
                </span>
              </div>
              <Spin spinning={isLoadingChat}>
                {messages.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">No chat activity yet.</p>
                ) : (
                  <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                    {messages.map((m) => (
                      <li
                        key={m._id}
                        className="group rounded-xl border border-surface-border bg-surface-elevated p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                              {m.sender?.profileImage && (
                                <img
                                  src={m.sender.profileImage}
                                  alt=""
                                  className="h-4 w-4 rounded-full object-cover"
                                />
                              )}
                              {m.sender?.name ?? 'Unknown'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {new Date(m.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm text-gray-800">
                          {m.text}
                        </p>
                        {m.image && (
                          <img
                            src={m.image}
                            alt="Chat attachment"
                            className="mt-2 max-h-24 rounded-lg border object-cover"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Spin>
            </div>

            {/* ── Seller Stats ────────────────────────────────────────────────── */}
            {seller && (
              <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
                <h2 className="text-sm font-semibold text-gray-900">Seller</h2>
                <div className="mt-3">
                  <Link
                    to={`/dashboard/users/${seller._id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
                  >
                    {seller.name}
                    <ExternalLink size={12} />
                  </Link>
                  <div className="mt-1 text-xs text-gray-500">{seller.email}</div>
                  <div className="mt-2 text-xs text-gray-500 text-balance">{seller.address}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      <Radio size={11} /> {sellerStats?.totalShows ?? 0} shows
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      <ShoppingBag size={11} /> {sellerStats?.totalProducts ?? 0} products
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      <TrendingUp size={11} /> {sellerStats?.totalOrders ?? 0} orders
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Spin>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────

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
