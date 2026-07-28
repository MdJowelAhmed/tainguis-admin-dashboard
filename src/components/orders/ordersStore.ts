import { useMemo } from 'react'
import { updateUser, useUsers } from '../users/usersStore'
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  UserRecord,
} from '../users/usersData'

export type OrderWithCustomer = Order & {
  customerId: string
  customerName: string
  customerEmail: string
}

function flatten(users: UserRecord[]): OrderWithCustomer[] {
  const out: OrderWithCustomer[] = []
  for (const u of users) {
    for (const o of u.orders) {
      out.push({
        ...o,
        customerId: u.id,
        customerName: u.name,
        customerEmail: u.email,
      })
    }
  }
  out.sort((a, b) => b.placedAt.localeCompare(a.placedAt))
  return out
}

export function useAllOrders(): OrderWithCustomer[] {
  const users = useUsers()
  return useMemo(() => flatten(users), [users])
}

export function useOrder(id: string | undefined): OrderWithCustomer | undefined {
  const all = useAllOrders()
  return id ? all.find((o) => o.id === id) : undefined
}

function patchOrder(
  users: UserRecord[],
  orderId: string,
  patch: Partial<Order>,
): { customerId: string; orders: Order[] } | null {
  for (const u of users) {
    const idx = u.orders.findIndex((o) => o.id === orderId)
    if (idx === -1) continue
    const next = [...u.orders]
    next[idx] = { ...next[idx], ...patch }
    return { customerId: u.id, orders: next }
  }
  return null
}

export function updateOrderStatus(
  users: UserRecord[],
  orderId: string,
  status: OrderStatus,
) {
  const patched = patchOrder(users, orderId, { status })
  if (patched) updateUser(patched.customerId, { orders: patched.orders })
}

export function updateOrderPaymentStatus(
  users: UserRecord[],
  orderId: string,
  paymentStatus: PaymentStatus,
) {
  const patched = patchOrder(users, orderId, { paymentStatus })
  if (patched) updateUser(patched.customerId, { orders: patched.orders })
}

export function setOrderTracking(
  users: UserRecord[],
  orderId: string,
  trackingNumber: string,
) {
  const patched = patchOrder(users, orderId, { trackingNumber })
  if (patched) updateUser(patched.customerId, { orders: patched.orders })
}

export function refundOrder(users: UserRecord[], orderId: string, note?: string) {
  const patched = patchOrder(users, orderId, {
    status: 'refunded',
    paymentStatus: 'refunded',
    notes: note,
  })
  if (patched) updateUser(patched.customerId, { orders: patched.orders })
}

export function cancelOrder(users: UserRecord[], orderId: string, note?: string) {
  const patched = patchOrder(users, orderId, {
    status: 'cancelled',
    notes: note,
  })
  if (patched) updateUser(patched.customerId, { orders: patched.orders })
}
