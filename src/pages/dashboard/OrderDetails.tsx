import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Input, Modal, Select, Tag } from 'antd'
import {
  ArrowLeft,
  Ban,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Receipt,
  RotateCcw,
  Truck,
  User as UserIcon,
} from 'lucide-react'
import {
  cancelOrder,
  refundOrder,
  setOrderTracking,
  updateOrderPaymentStatus,
  updateOrderStatus,
  useOrder,
} from '../../components/orders/ordersStore'
import { useUsers } from '../../components/users/usersStore'
import {
  orderStatusColor,
  orderStatusLabel,
  paymentMethodLabel,
  paymentStatusColor,
  paymentStatusLabel,
  shippingMethodLabel,
} from '../../components/orders/orderLabels'
import type {
  OrderStatus,
  PaymentStatus,
} from '../../components/users/usersData'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
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
  const order = useOrder(id)
  const users = useUsers()
  const navigate = useNavigate()
  const { message, modal } = App.useApp()

  const [trackingOpen, setTrackingOpen] = useState(false)
  const [trackingDraft, setTrackingDraft] = useState('')
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundNote, setRefundNote] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelNote, setCancelNote] = useState('')

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

  const customer = users.find((u) => u.id === order.customerId)

  const onStatusChange = (status: OrderStatus) => {
    updateOrderStatus(users, order.id, status)
    message.success(`Order status set to ${orderStatusLabel[status]}.`)
  }

  const onPaymentChange = (status: PaymentStatus) => {
    updateOrderPaymentStatus(users, order.id, status)
    message.success(`Payment marked ${paymentStatusLabel[status]}.`)
  }

  const submitTracking = () => {
    if (!trackingDraft.trim()) {
      message.warning('Enter a tracking number.')
      return
    }
    setOrderTracking(users, order.id, trackingDraft.trim())
    message.success('Tracking number updated.')
    setTrackingOpen(false)
    setTrackingDraft('')
  }

  const submitRefund = () => {
    refundOrder(users, order.id, refundNote.trim() || undefined)
    message.success('Order refunded.')
    setRefundOpen(false)
    setRefundNote('')
  }

  const submitCancel = () => {
    cancelOrder(users, order.id, cancelNote.trim() || undefined)
    message.success('Order cancelled.')
    setCancelOpen(false)
    setCancelNote('')
  }

  const confirmRefund = () => {
    modal.confirm({
      title: 'Refund this order?',
      content: 'The order will be marked refunded and the payment reversed.',
      okText: 'Continue',
      onOk: () => {
        setRefundOpen(true)
      },
    })
  }

  const isFinal = order.status === 'refunded' || order.status === 'cancelled'

  return (
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {order.id}
              </h1>
              <Tag color={orderStatusColor[order.status]}>
                {orderStatusLabel[order.status]}
              </Tag>
              <Tag color={paymentStatusColor[order.paymentStatus]}>
                {paymentStatusLabel[order.paymentStatus]}
              </Tag>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Placed {order.placedAt}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTrackingOpen(true)}
              disabled={isFinal}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Truck size={14} />
              {order.trackingNumber ? 'Update tracking' : 'Add tracking'}
            </button>
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
            {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
              <button
                type="button"
                onClick={confirmRefund}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RotateCcw size={14} />
                Refund
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ControlCard
            icon={Package}
            label="Fulfillment status"
            control={
              <Select
                value={order.status}
                onChange={onStatusChange}
                options={statusOptions}
                disabled={isFinal}
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
                style={{ width: '100%' }}
              />
            }
          />
          <InfoCard
            icon={Truck}
            label="Tracking"
            value={order.trackingNumber ?? 'Not assigned'}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-surface-border bg-surface-card">
          <div className="flex items-center justify-between border-b border-surface-border p-5">
            <h2 className="text-base font-semibold text-gray-900">Items</h2>
            <span className="text-xs text-gray-500">
              {order.items.length} product
              {order.items.length === 1 ? '' : 's'} ·{' '}
              {order.items.reduce((n, i) => n + i.quantity, 0)} units
            </span>
          </div>
          <ul className="divide-y divide-surface-border">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <Package size={18} className="text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.quantity} × {currency.format(item.price)}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {currency.format(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-surface-border p-5">
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={currency.format(order.subtotal)} />
              <Row label="Shipping" value={currency.format(order.shippingFee)} />
              {order.discount > 0 && (
                <Row
                  label="Discount"
                  value={`- ${currency.format(order.discount)}`}
                  tone="green"
                />
              )}
              <Row label="Tax" value={currency.format(order.tax)} />
              <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{currency.format(order.total)}</span>
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
            {customer ? (
              <div className="mt-3">
                <Link
                  to={`/dashboard/users/${customer.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
                >
                  {customer.name}
                  <ExternalLink size={12} />
                </Link>
                <div className="mt-1 text-xs text-gray-500">
                  {customer.email}
                </div>
                <div className="text-xs text-gray-500">{customer.phone}</div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Customer not found.</p>
            )}
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Shipping</h2>
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-800">
              <div>{order.shippingAddress}</div>
              <div className="text-xs text-gray-500">
                Method: {shippingMethodLabel[order.shippingMethod]} ·{' '}
                {currency.format(order.shippingFee)}
              </div>
              {order.trackingNumber && (
                <div className="text-xs text-gray-500">
                  Tracking: {order.trackingNumber}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-800">
              <div>{paymentMethodLabel[order.paymentMethod]}</div>
              <div className="text-xs text-gray-500">
                Status: {paymentStatusLabel[order.paymentStatus]}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={trackingOpen}
        title="Tracking number"
        okText="Save"
        onOk={submitTracking}
        onCancel={() => setTrackingOpen(false)}
        destroyOnClose
      >
        <Input
          autoFocus
          value={trackingDraft}
          placeholder={order.trackingNumber ?? 'e.g. TIANG-1234-MX'}
          onChange={(e) => setTrackingDraft(e.target.value)}
        />
      </Modal>

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
