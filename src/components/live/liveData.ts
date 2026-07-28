export type LiveStatus = 'live' | 'scheduled' | 'ended' | 'cancelled'

export type LiveFormat = 'live' | 'auction'

export type LiveProduct = {
  productId: string
  name: string
  price: number
  stock: number
  sold: number
}

export type LiveBid = {
  id: string
  bidderId: string
  bidderName: string
  amount: number
  placedAt: string
}

export type LiveMessage = {
  id: string
  authorId: string
  authorName: string
  body: string
  sentAt: string
  pinned?: boolean
  hidden?: boolean
}

export type LiveStream = {
  id: string
  title: string
  category: string
  format: LiveFormat
  status: LiveStatus
  sellerId: string
  thumbnailColor: string
  scheduledFor?: string
  startedAt?: string
  endedAt?: string
  currentViewers: number
  peakViewers: number
  uniqueViewers: number
  avgWatchSeconds: number
  products: LiveProduct[]
  itemsSold: number
  totalSales: number
  messages: LiveMessage[]
  startingBid?: number
  currentBid?: number
  bidderCount?: number
  bidEndsAt?: string
  bids?: LiveBid[]
}

export const statusLabels: Record<LiveStatus, string> = {
  live: 'Live now',
  scheduled: 'Scheduled',
  ended: 'Ended',
  cancelled: 'Cancelled',
}

export const formatLabels: Record<LiveFormat, string> = {
  live: 'Live drop',
  auction: 'Auction',
}

export const initialStreams: LiveStream[] = [
  {
    id: 'LV-2104',
    title: 'Oaxaca handwoven rugs — May drop',
    category: 'Home & decor',
    format: 'live',
    status: 'live',
    sellerId: 'u_001',
    thumbnailColor: '#FF5B03',
    startedAt: '2026-05-17 09:05',
    currentViewers: 234,
    peakViewers: 312,
    uniqueViewers: 1840,
    avgWatchSeconds: 184,
    products: [
      { productId: 'p_010', name: 'Handwoven Oaxaca Rug', price: 950, stock: 12, sold: 5 },
      { productId: 'p_021', name: 'Talavera Ceramic Mug', price: 165, stock: 40, sold: 14 },
    ],
    itemsSold: 19,
    totalSales: 7060,
    messages: [
      { id: 'm_1', authorId: 'u_003', authorName: 'Sofía R.', body: '¡Hermosos tapetes!', sentAt: '2026-05-17 09:12' },
      { id: 'm_2', authorId: 'u_006', authorName: 'Javier O.', body: '¿Hay tamaños más grandes?', sentAt: '2026-05-17 09:18' },
      { id: 'm_3', authorId: 'u_005', authorName: 'Lucía V.', body: 'Acabo de comprar 2 tazas 🙌', sentAt: '2026-05-17 09:24', pinned: true },
      { id: 'm_4', authorId: 'u_007', authorName: 'Andrea C.', body: '¿Hacen envíos a León?', sentAt: '2026-05-17 09:31' },
    ],
  },
  {
    id: 'LV-2103',
    title: 'Silver filigree earrings — live auction',
    category: 'Jewelry',
    format: 'auction',
    status: 'live',
    sellerId: 'u_003',
    thumbnailColor: '#a855f7',
    startedAt: '2026-05-17 08:30',
    currentViewers: 87,
    peakViewers: 142,
    uniqueViewers: 612,
    avgWatchSeconds: 246,
    products: [
      { productId: 'p_055', name: 'Silver Filigree Earrings (one-of-a-kind)', price: 0, stock: 1, sold: 0 },
    ],
    itemsSold: 0,
    totalSales: 0,
    startingBid: 800,
    currentBid: 1320,
    bidderCount: 8,
    bidEndsAt: '2026-05-17 10:00',
    bids: [
      { id: 'b_1', bidderId: 'u_001', bidderName: 'María González', amount: 800, placedAt: '2026-05-17 08:42' },
      { id: 'b_2', bidderId: 'u_006', bidderName: 'Javier Ortiz', amount: 900, placedAt: '2026-05-17 08:51' },
      { id: 'b_3', bidderId: 'u_005', bidderName: 'Lucía Vega', amount: 1050, placedAt: '2026-05-17 09:03' },
      { id: 'b_4', bidderId: 'u_001', bidderName: 'María González', amount: 1180, placedAt: '2026-05-17 09:14' },
      { id: 'b_5', bidderId: 'u_007', bidderName: 'Andrea Castillo', amount: 1320, placedAt: '2026-05-17 09:28' },
    ],
    messages: [
      { id: 'm_1', authorId: 'u_001', authorName: 'María G.', body: 'Subasta emocionante 🔥', sentAt: '2026-05-17 09:05' },
      { id: 'm_2', authorId: 'u_005', authorName: 'Lucía V.', body: '¿Vienen con caja regalo?', sentAt: '2026-05-17 09:15' },
    ],
  },
  {
    id: 'LV-2102',
    title: 'Mezcal glass collection preview',
    category: 'Drinkware',
    format: 'live',
    status: 'scheduled',
    sellerId: 'u_006',
    thumbnailColor: '#10b981',
    scheduledFor: '2026-05-18 19:00',
    currentViewers: 0,
    peakViewers: 0,
    uniqueViewers: 0,
    avgWatchSeconds: 0,
    products: [
      { productId: 'p_034', name: 'Mezcal Glass Set (6 pcs)', price: 210, stock: 30, sold: 0 },
    ],
    itemsSold: 0,
    totalSales: 0,
    messages: [],
  },
  {
    id: 'LV-2101',
    title: 'Embroidered blouses — Cancún makers',
    category: 'Fashion',
    format: 'live',
    status: 'scheduled',
    sellerId: 'u_005',
    thumbnailColor: '#3b82f6',
    scheduledFor: '2026-05-19 17:00',
    currentViewers: 0,
    peakViewers: 0,
    uniqueViewers: 0,
    avgWatchSeconds: 0,
    products: [
      { productId: 'p_067', name: 'Embroidered Cotton Blouse', price: 110, stock: 20, sold: 0 },
    ],
    itemsSold: 0,
    totalSales: 0,
    messages: [],
  },
  {
    id: 'LV-2098',
    title: 'Talavera ceramics weekend special',
    category: 'Home & decor',
    format: 'live',
    status: 'ended',
    sellerId: 'u_001',
    thumbnailColor: '#FF5B03',
    startedAt: '2026-05-10 18:00',
    endedAt: '2026-05-10 19:42',
    currentViewers: 0,
    peakViewers: 421,
    uniqueViewers: 2680,
    avgWatchSeconds: 312,
    products: [
      { productId: 'p_021', name: 'Talavera Ceramic Mug', price: 165, stock: 80, sold: 62 },
      { productId: 'p_010', name: 'Handwoven Oaxaca Rug', price: 950, stock: 5, sold: 2 },
    ],
    itemsSold: 64,
    totalSales: 12130,
    messages: [],
  },
  {
    id: 'LV-2095',
    title: 'Copper cookware live auction',
    category: 'Kitchen',
    format: 'auction',
    status: 'ended',
    sellerId: 'u_006',
    thumbnailColor: '#a855f7',
    startedAt: '2026-05-04 20:00',
    endedAt: '2026-05-04 21:15',
    currentViewers: 0,
    peakViewers: 198,
    uniqueViewers: 940,
    avgWatchSeconds: 285,
    products: [
      { productId: 'p_072', name: 'Copper Cookware Set', price: 0, stock: 1, sold: 1 },
    ],
    itemsSold: 1,
    totalSales: 2100,
    startingBid: 1200,
    currentBid: 2100,
    bidderCount: 11,
    bids: [],
    messages: [],
  },
  {
    id: 'LV-2090',
    title: 'Huarache leather sandals drop',
    category: 'Fashion',
    format: 'live',
    status: 'cancelled',
    sellerId: 'u_002',
    thumbnailColor: '#6b7280',
    scheduledFor: '2026-04-28 16:00',
    currentViewers: 0,
    peakViewers: 0,
    uniqueViewers: 0,
    avgWatchSeconds: 0,
    products: [],
    itemsSold: 0,
    totalSales: 0,
    messages: [],
  },
]
