import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from '../users/usersData'

export const orderStatusColor: Record<OrderStatus, string> = {
  pending: 'gold',
  processing: 'blue',
  shipped: 'geekblue',
  delivered: 'green',
  cancelled: 'default',
  refunded: 'red',
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const paymentStatusColor: Record<PaymentStatus, string> = {
  paid: 'green',
  pending: 'gold',
  refunded: 'red',
  failed: 'default',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
  failed: 'Failed',
}

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  card: 'Credit / Debit card',
  cash_on_delivery: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
  wallet: 'Tianguis wallet',
}

export const shippingMethodLabel: Record<ShippingMethod, string> = {
  standard: 'Standard',
  express: 'Express',
  pickup: 'Pickup',
}
