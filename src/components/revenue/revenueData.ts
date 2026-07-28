import type { OrderWithCustomer } from '../orders/ordersStore'

export const COMMISSION_RATE = 0.08
export const SHIPPING_MARGIN_RATE = 0.2

export type RevenueSource = 'commission' | 'shipping'

export const sourceLabels: Record<RevenueSource, string> = {
  commission: 'Order commission',
  shipping: 'Shipping margin',
}

export const sourceColors: Record<RevenueSource, string> = {
  commission: '#FF5B03',
  shipping: '#3b82f6',
}

export type RevenueEvent = {
  id: string
  source: RevenueSource
  description: string
  customerId: string
  amount: number
  occurredAt: string
}

export type RevenueBreakdown = Record<RevenueSource, number>

export type RevenueSummary = {
  total: number
  refunded: number
  net: number
  breakdown: RevenueBreakdown
  events: RevenueEvent[]
}

export function buildRevenueEvents(orders: OrderWithCustomer[]): {
  events: RevenueEvent[]
  refunded: number
} {
  const events: RevenueEvent[] = []
  let refunded = 0

  for (const o of orders) {
    if (o.paymentStatus === 'paid') {
      const commission = Math.round(o.subtotal * COMMISSION_RATE)
      const shipping = Math.round(o.shippingFee * SHIPPING_MARGIN_RATE)
      if (commission > 0) {
        events.push({
          id: `${o.id}-comm`,
          source: 'commission',
          description: `${o.id} · ${o.items.length} item${o.items.length === 1 ? '' : 's'}`,
          customerId: o.customerId,
          amount: commission,
          occurredAt: o.placedAt,
        })
      }
      if (shipping > 0) {
        events.push({
          id: `${o.id}-ship`,
          source: 'shipping',
          description: `${o.id} · shipping margin`,
          customerId: o.customerId,
          amount: shipping,
          occurredAt: o.placedAt,
        })
      }
    } else if (o.paymentStatus === 'refunded') {
      refunded += Math.round(o.subtotal * COMMISSION_RATE)
    }
  }

  events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  return { events, refunded }
}

export function summarizeRevenue(
  events: RevenueEvent[],
  refunded: number,
): RevenueSummary {
  const breakdown: RevenueBreakdown = {
    commission: 0,
    shipping: 0,
  }
  let total = 0
  for (const e of events) {
    breakdown[e.source] += e.amount
    total += e.amount
  }
  return { total, refunded, net: total - refunded, breakdown, events }
}

export function filterByRange(
  events: RevenueEvent[],
  fromIsoDate: string,
): RevenueEvent[] {
  return events.filter((e) => e.occurredAt.slice(0, 10) >= fromIsoDate)
}

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export type MonthlyPoint = {
  month: string
  label: string
  commission: number
  shipping: number
  total: number
}

export function buildMonthlyTrend(
  events: RevenueEvent[],
  monthsBack = 6,
  referenceDate = new Date(),
): MonthlyPoint[] {
  const buckets = new Map<string, MonthlyPoint>()

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - i,
      1,
    )
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
    buckets.set(key, {
      month: key,
      label,
      commission: 0,
      shipping: 0,
      total: 0,
    })
  }

  for (const e of events) {
    const key = monthKey(e.occurredAt)
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket[e.source] += e.amount
    bucket.total += e.amount
  }

  return Array.from(buckets.values())
}
