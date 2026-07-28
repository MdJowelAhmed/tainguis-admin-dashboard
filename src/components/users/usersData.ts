export type UserStatus = 'active' | 'banned' | 'restricted'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed'

export type PaymentMethod =
  | 'card'
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'wallet'

export type ShippingMethod = 'standard' | 'express' | 'pickup'

export type Order = {
  id: string
  placedAt: string
  date: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
  shippingAddress: string
  trackingNumber?: string
  notes?: string
}

export type OrderItem = {
  productId: string
  name: string
  image?: string
  quantity: number
  price: number
}

export type UserRecord = {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
  address: string
  city: string
  country: string
  joinedAt: string
  lastActiveAt: string
  status: UserStatus
  statusNote?: string
  orders: Order[]
}

const product = (
  productId: string,
  name: string,
  price: number,
  quantity: number,
): OrderItem => ({ productId, name, price, quantity })

function buildOrder(opts: {
  id: string
  placedAt: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
  shippingAddress: string
  items: OrderItem[]
  shippingFee?: number
  taxRate?: number
  discount?: number
  trackingNumber?: string
  notes?: string
}): Order {
  const subtotal = opts.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  )
  const shippingFee = opts.shippingFee ?? (opts.shippingMethod === 'express' ? 180 : opts.shippingMethod === 'pickup' ? 0 : 90)
  const discount = opts.discount ?? 0
  const tax = Math.round((subtotal - discount) * (opts.taxRate ?? 0.08))
  const total = subtotal + shippingFee + tax - discount
  return {
    id: opts.id,
    placedAt: opts.placedAt,
    date: opts.placedAt.slice(0, 10),
    items: opts.items,
    subtotal,
    shippingFee,
    tax,
    discount,
    total,
    status: opts.status,
    paymentStatus: opts.paymentStatus,
    paymentMethod: opts.paymentMethod,
    shippingMethod: opts.shippingMethod,
    shippingAddress: opts.shippingAddress,
    trackingNumber: opts.trackingNumber,
    notes: opts.notes,
  }
}

export const initialUsers: UserRecord[] = [
  {
    id: 'u_001',
    name: 'María González',
    email: 'maria.gonzalez@example.mx',
    phone: '+52 55 1234 5678',
    address: 'Av. Reforma 123, Col. Centro',
    city: 'Ciudad de México',
    country: 'Mexico',
    joinedAt: '2024-02-14',
    lastActiveAt: '2026-05-15',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-10042',
        placedAt: '2026-05-10 14:22',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'express',
        shippingAddress: 'Av. Reforma 123, Col. Centro, Ciudad de México, Mexico',
        trackingNumber: 'TIANG-1042-MX',
        items: [
          product('p_010', 'Handwoven Oaxaca Rug', 950, 1),
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
        ],
      }),
      buildOrder({
        id: 'ORD-09988',
        placedAt: '2026-04-22 10:05',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'wallet',
        shippingMethod: 'standard',
        shippingAddress: 'Av. Reforma 123, Col. Centro, Ciudad de México, Mexico',
        trackingNumber: 'TIANG-9988-MX',
        items: [
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
          product('p_034', 'Mezcal Glass Set', 210, 1),
        ],
      }),
      buildOrder({
        id: 'ORD-09921',
        placedAt: '2026-04-05 09:33',
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'standard',
        shippingAddress: 'Av. Reforma 123, Col. Centro, Ciudad de México, Mexico',
        trackingNumber: 'TIANG-9921-MX',
        items: [product('p_010', 'Handwoven Oaxaca Rug', 950, 2)],
      }),
    ],
  },
  {
    id: 'u_002',
    name: 'Carlos Hernández',
    email: 'carlos.h@example.mx',
    phone: '+52 33 9876 5432',
    address: 'Calle Juárez 45',
    city: 'Guadalajara',
    country: 'Mexico',
    joinedAt: '2023-11-03',
    lastActiveAt: '2026-05-12',
    status: 'restricted',
    statusNote: 'Multiple chargeback disputes pending review.',
    orders: [
      buildOrder({
        id: 'ORD-09845',
        placedAt: '2026-03-18 16:48',
        status: 'refunded',
        paymentStatus: 'refunded',
        paymentMethod: 'card',
        shippingMethod: 'standard',
        shippingAddress: 'Calle Juárez 45, Guadalajara, Mexico',
        notes: 'Customer reported item not as described. Refund issued in full.',
        items: [product('p_044', 'Leather Huarache Sandals', 720, 1)],
      }),
      buildOrder({
        id: 'ORD-09701',
        placedAt: '2026-02-02 11:10',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'cash_on_delivery',
        shippingMethod: 'standard',
        shippingAddress: 'Calle Juárez 45, Guadalajara, Mexico',
        trackingNumber: 'TIANG-9701-MX',
        items: [product('p_044', 'Leather Huarache Sandals', 720, 1)],
      }),
    ],
  },
  {
    id: 'u_003',
    name: 'Sofía Ramírez',
    email: 'sofia.ramirez@example.mx',
    phone: '+52 81 4455 6677',
    address: 'Av. Constitución 890',
    city: 'Monterrey',
    country: 'Mexico',
    joinedAt: '2025-01-09',
    lastActiveAt: '2026-05-16',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-10110',
        placedAt: '2026-05-14 08:42',
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'express',
        shippingAddress: 'Av. Constitución 890, Monterrey, Mexico',
        items: [product('p_055', 'Silver Filigree Earrings', 880, 3)],
      }),
      buildOrder({
        id: 'ORD-10067',
        placedAt: '2026-05-02 19:14',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'wallet',
        shippingMethod: 'standard',
        shippingAddress: 'Av. Constitución 890, Monterrey, Mexico',
        trackingNumber: 'TIANG-0067-MX',
        items: [
          product('p_055', 'Silver Filigree Earrings', 880, 1),
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
          product('p_067', 'Embroidered Cotton Blouse', 110, 1),
        ],
      }),
    ],
  },
  {
    id: 'u_004',
    name: 'Diego Morales',
    email: 'diego.morales@example.mx',
    phone: '+52 222 333 4455',
    address: 'Calle 5 de Mayo 12',
    city: 'Puebla',
    country: 'Mexico',
    joinedAt: '2024-07-21',
    lastActiveAt: '2026-04-28',
    status: 'banned',
    statusNote: 'Repeated policy violations — fraudulent payment attempts.',
    orders: [
      buildOrder({
        id: 'ORD-09600',
        placedAt: '2026-01-15 22:01',
        status: 'cancelled',
        paymentStatus: 'failed',
        paymentMethod: 'card',
        shippingMethod: 'standard',
        shippingAddress: 'Calle 5 de Mayo 12, Puebla, Mexico',
        notes: 'Payment declined — flagged for fraud review.',
        items: [product('p_072', 'Copper Cookware Set', 1450, 1)],
      }),
    ],
  },
  {
    id: 'u_005',
    name: 'Lucía Vega',
    email: 'lucia.vega@example.mx',
    phone: '+52 998 112 3344',
    address: 'Av. Tulum 250',
    city: 'Cancún',
    country: 'Mexico',
    joinedAt: '2025-08-30',
    lastActiveAt: '2026-05-16',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-10125',
        placedAt: '2026-05-16 12:30',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'bank_transfer',
        shippingMethod: 'standard',
        shippingAddress: 'Av. Tulum 250, Cancún, Mexico',
        items: [product('p_067', 'Embroidered Cotton Blouse', 110, 3)],
      }),
    ],
  },
  {
    id: 'u_006',
    name: 'Javier Ortiz',
    email: 'javier.ortiz@example.mx',
    phone: '+52 614 778 9900',
    address: 'Av. Independencia 67',
    city: 'Chihuahua',
    country: 'Mexico',
    joinedAt: '2024-05-12',
    lastActiveAt: '2026-05-11',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-09975',
        placedAt: '2026-04-18 15:55',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'pickup',
        shippingAddress: 'Tianguis Pickup Point #12, Chihuahua, Mexico',
        items: [
          product('p_034', 'Mezcal Glass Set', 210, 4),
          product('p_010', 'Handwoven Oaxaca Rug', 950, 1),
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
        ],
      }),
    ],
  },
  {
    id: 'u_007',
    name: 'Andrea Castillo',
    email: 'a.castillo@example.mx',
    phone: '+52 477 223 1199',
    address: 'Blvd. López Mateos 1500',
    city: 'León',
    country: 'Mexico',
    joinedAt: '2023-09-04',
    lastActiveAt: '2026-05-14',
    status: 'active',
    orders: [],
  },
]

export function getUserById(id: string): UserRecord | undefined {
  return initialUsers.find((u) => u.id === id)
}

export type TopProduct = {
  productId: string
  name: string
  quantity: number
  totalSpent: number
}

export function topProductsForUser(user: UserRecord, limit = 5): TopProduct[] {
  const totals = new Map<string, TopProduct>()
  for (const order of user.orders) {
    for (const item of order.items) {
      const existing = totals.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
        existing.totalSpent += item.price * item.quantity
      } else {
        totals.set(item.productId, {
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          totalSpent: item.price * item.quantity,
        })
      }
    }
  }
  return Array.from(totals.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export function userTotals(user: UserRecord) {
  const orderCount = user.orders.length
  const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0)
  const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0
  const lastOrderDate =
    user.orders
      .map((o) => o.date)
      .sort()
      .at(-1) ?? null
  return { orderCount, totalSpent, avgOrderValue, lastOrderDate }
}
