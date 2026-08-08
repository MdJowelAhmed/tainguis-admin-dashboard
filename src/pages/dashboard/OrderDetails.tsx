import { useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { App, Input, Modal, Select, Tag, Spin } from 'antd'
import {
  ArrowLeft,
  // Ban,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Receipt,
  // RotateCcw,
  Truck,
  User as UserIcon,
} from 'lucide-react'
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentStatusMutation,
} from '../../redux/api/orderApi'
import type { OrderListItem } from '../../redux/api/orderApi'
import {
  orderStatusColor,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusColor,
  paymentStatusLabel,
} from '../../components/orders/orderLabels'
import type {
  OrderStatus,
  PaymentStatus,
} from '../../components/users/usersData'
import { imageUrl } from '../../lib/imageUrl'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const statusOptions = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const paymentOptions: { value: PaymentStatus; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
]

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const stateOrder = (location.state as { order?: OrderListItem } | null)?.order

  // Fallback if page was refreshed directly
  const { data: allOrdersRes, isLoading } = useGetAllOrdersQuery(undefined, {
    skip: Boolean(stateOrder),
  })

  const orderFromStore = allOrdersRes?.data?.find(
    (o) => o._id === id || o.orderId === id,
  )

  const initialOrder = stateOrder ?? orderFromStore
  const [localOrder, setLocalOrder] = useState<OrderListItem | null>(null)

  const order = localOrder ?? initialOrder

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation()
  const [updateOrderPaymentStatus, { isLoading: isUpdatingPayment }] = useUpdateOrderPaymentStatusMutation()

  const [refundOpen, setRefundOpen] = useState(false)
  const [refundNote, setRefundNote] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelNote, setCancelNote] = useState('')

  if (!stateOrder && isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" tip="Loading order details…" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-base text-gray-700">Order not found.</p>
        <Link
          to="/dashboard/orders"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to orders
        </Link>
      </div>
    )
  }

  const buyer = order.buyer

  const onStatusChange = async (status: string) => {
    try {
      await updateOrderStatus({ id: order._id, orderStatus: status }).unwrap()
      setLocalOrder({ ...order, orderStatus: status })
      message.success(`Order status set to ${orderStatusLabel[status as OrderStatus] || status}.`)
    } catch {
      message.error('Failed to update status.')
    }
  }

  const onPaymentChange = async (status: string) => {
    try {
      await updateOrderPaymentStatus({ id: order._id, paymentStatus: status }).unwrap()
      setLocalOrder({ ...order, paymentStatus: status })
      message.success(`Payment marked ${paymentStatusLabel[status as PaymentStatus] || status}.`)
    } catch {
      message.error('Failed to update payment status.')
    }
  }

  const submitRefund = async () => {
    try {
      await updateOrderPaymentStatus({ id: order._id, paymentStatus: 'refunded' }).unwrap()
      await updateOrderStatus({ id: order._id, orderStatus: 'refunded' }).unwrap()
      setLocalOrder({ ...order, paymentStatus: 'refunded', orderStatus: 'refunded' })
      message.success('Order refunded.')
      setRefundOpen(false)
      setRefundNote('')
    } catch {
      message.error('Failed to process refund.')
    }
  }

  const submitCancel = async () => {
    try {
      await updateOrderStatus({ id: order._id, orderStatus: 'cancelled' }).unwrap()
      setLocalOrder({ ...order, orderStatus: 'cancelled' })
      message.success('Order cancelled.')
      setCancelOpen(false)
      setCancelNote('')
    } catch {
      message.error('Failed to cancel order.')
    }
  }

  // const confirmRefund = () => {
  //   modal.confirm({
  //     title: 'Refund this order?',
  //     content: 'The order will be marked refunded and the payment reversed.',
  //     okText: 'Continue',
  //     onOk: () => {
  //       setRefundOpen(true)
  //     },
  //   })
  // }

  // const isFinal = order.orderStatus === 'refunded' || order.orderStatus === 'cancelled'

  const statusColor = orderStatusColor[order.orderStatus as OrderStatus] || (order.orderStatus === 'in_progress' ? 'blue' : 'geekblue')
  const statusLabelText = orderStatusLabel[order.orderStatus as OrderStatus] || order.orderStatus.replace(/_/g, ' ')
  const payColor = paymentStatusColor[order.paymentStatus as PaymentStatus] || 'green'
  const payLabelText = paymentStatusLabel[order.paymentStatus as PaymentStatus] || order.paymentStatus

  // Address helper
  const addressText = typeof order.shippingAddress === 'string'
    ? order.shippingAddress
    : order.shippingAddress
      ? `${order.shippingAddress.fullName} (${order.shippingAddress.phone})\n${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country} - ${order.shippingAddress.postalCode}`
      : 'Address not available'

  return (
    <Spin spinning={isUpdatingStatus || isUpdatingPayment}>
      <div className="flex flex-col gap-6 py-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/orders')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to orders
          </button>
        </div>

        <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {order.orderId || order._id}
                </h1>
                <Tag color={statusColor} className="capitalize">
                  {statusLabelText}
                </Tag>
                <Tag color={payColor} className="capitalize">
                  {payLabelText}
                </Tag>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Placed {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* <div className="flex flex-wrap items-center gap-2">
              {!isFinal && (
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Ban size={14} />
                  Cancel order
                </button>
              )}
              {order.paymentStatus === 'paid' && order.orderStatus !== 'refunded' && (
                <button
                  type="button"
                  onClick={confirmRefund}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <RotateCcw size={14} />
                  Refund
                </button>
              )}
            </div> */}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ControlCard
              icon={Package}
              label="Fulfillment status"
              control={
                <Select
                  value={order.orderStatus}
                  onChange={onStatusChange}
                  options={statusOptions}
                  disabled
                  style={{ width: '100%' }}
                />
              }
            />
            <ControlCard
              icon={CreditCard}
              label="Payment status"
              control={
                <Select
                  value={order.paymentStatus}
                  onChange={onPaymentChange}
                  options={paymentOptions}
                  disabled
                  style={{ width: '100%' }}
                />
              }
            />
            <InfoCard
              icon={Truck}
              label="Tracking"
              value={
                order.trackingNumber
                  ? `${order.carrier ? `${order.carrier.toUpperCase()}: ` : ''}${order.trackingNumber}`
                  : 'Not assigned'
              }
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-surface-border bg-surface-card">
            <div className="flex items-center justify-between border-b border-surface-border p-5">
              <h2 className="text-base font-semibold text-gray-900">Items</h2>
              <span className="text-xs text-gray-500">
                {order.items?.length ?? 0} product
                {(order.items?.length ?? 0) === 1 ? '' : 's'} ·{' '}
                {order.items?.reduce((n, i) => n + i.quantity, 0) ?? 0} units
              </span>
            </div>
            <ul className="divide-y divide-surface-border">
              {order.items?.map((item, idx) => {
                const title = typeof item.product === 'object'
                  ? (item.product.title || item.product.name || item.name || 'Product')
                  : (item.name || 'Product')
                const img = typeof item.product === 'object'
                  ? (item.product.thumbnail || item.product.image || item.product.images?.[0] || item.image)
                  : item.image

                return (
                  <li key={item._id || idx} className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                      {img ? (
                        <img
                          src={imageUrl(img)}
                          alt={title}
                          className="h-full w-full rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <Package size={18} className="text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">
                        {title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} × {currency.format(item.price)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {currency.format(item.price * item.quantity)}
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-surface-border p-5">
              <dl className="space-y-2 text-sm">
                <Row label="Subtotal" value={currency.format(order.subtotal ?? 0)} />
                <Row label="Shipping cost" value={currency.format(order.shippingCost ?? order.shippingFee ?? 0)} />
                {(order.discount ?? 0) > 0 && (
                  <Row
                    label="Discount"
                    value={`- ${currency.format(order.discount!)}`}
                    tone="green"
                  />
                )}
                <Row label="Tax" value={currency.format(order.tax ?? 0)} />
                <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{currency.format(order.total ?? 0)}</span>
                </div>
              </dl>
            </div>

            {order.notes && (
              <div className="border-t border-surface-border bg-amber-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Order note
                </div>
                <p className="mt-1 text-sm text-amber-900">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
              </div>
              {buyer ? (
                <div className="mt-3">
                  <Link
                    to={`/dashboard/users/${buyer._id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
                  >
                    {buyer.name}
                    <ExternalLink size={12} />
                  </Link>
                  <div className="mt-1 text-xs text-gray-500">
                    {buyer.email}
                  </div>
                  {buyer.phone && <div className="text-xs text-gray-500">{buyer.phone}</div>}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">Customer not found.</p>
              )}
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-800 whitespace-pre-line">
                {addressText}
              </div>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-800">
                <div className="capitalize">{paymentMethodLabel[order.paymentMethod as keyof typeof paymentMethodLabel] || order.paymentMethod}</div>
                <div className="text-xs text-gray-500">
                  Status: {payLabelText}
                </div>
                {order.transaction && (
                  <div className="text-xs text-gray-500 truncate">
                    Transaction ID: {order.transaction}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Modal
          open={refundOpen}
          title="Refund order"
          okText="Refund"
          okButtonProps={{ danger: true }}
          onOk={submitRefund}
          onCancel={() => setRefundOpen(false)}
          destroyOnClose
        >
          <p className="text-sm text-gray-600">
            The order will be marked refunded. Add an internal note for the
            finance team (optional).
          </p>
          <Input.TextArea
            rows={3}
            className="mt-3"
            value={refundNote}
            onChange={(e) => setRefundNote(e.target.value)}
            placeholder="Reason or reference id"
          />
        </Modal>

        <Modal
          open={cancelOpen}
          title="Cancel order"
          okText="Cancel order"
          okButtonProps={{ danger: true }}
          onOk={submitCancel}
          onCancel={() => setCancelOpen(false)}
          destroyOnClose
        >
          <p className="text-sm text-gray-600">
            Cancelling an order stops fulfillment. Payment status is not changed
            automatically.
          </p>
          <Input.TextArea
            rows={3}
            className="mt-3"
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder="Cancellation reason"
          />
        </Modal>
      </div>
    </Spin>
  )
}

function ControlCard({
  icon: Icon,
  label,
  control,
}: {
  icon: typeof Package
  label: string
  control: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-2">{control}</div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-gray-900">{value}</div>
    </div>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'green'
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={
          tone === 'green' ? 'text-green-700' : 'font-medium text-gray-900'
        }
      >
        {value}
      </dd>
    </div>
  )
}
