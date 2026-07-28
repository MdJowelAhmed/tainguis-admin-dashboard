import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Input, Select, Switch } from 'antd'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Lock,
  Mail,
  MessageSquare,
  Package,
  RotateCcw,
  Send,
  Tag,
  User as UserIcon,
} from 'lucide-react'
import {
  addTicketReply,
  assignTicket,
  updateTicketPriority,
  updateTicketStatus,
  useTicket,
} from '../../components/support/supportStore'
import {
  categoryLabels,
  channelLabels,
  supportAgents,
  type TicketPriority,
  type TicketStatus,
} from '../../components/support/supportData'
import { PriorityBadge, TicketStatusBadge } from '../../components/support/badges'
import { useUser } from '../../components/users/usersStore'
import { useOrder } from '../../components/orders/ordersStore'

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'waiting_customer', label: 'Waiting on customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function SupportTicket() {
  const { id } = useParams<{ id: string }>()
  const ticket = useTicket(id)
  const customer = useUser(ticket?.customerId)
  const order = useOrder(ticket?.orderId)
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [reply, setReply] = useState('')
  const [internal, setInternal] = useState(false)
  const [sending, setSending] = useState(false)

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-base text-gray-700">Ticket not found.</p>
        <Link
          to="/dashboard/support"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to support
        </Link>
      </div>
    )
  }

  const onStatusChange = (status: TicketStatus) => {
    updateTicketStatus(ticket.id, status)
    message.success(`Status updated.`)
  }

  const onPriorityChange = (priority: TicketPriority) => {
    updateTicketPriority(ticket.id, priority)
    message.success(`Priority updated.`)
  }

  const onAssign = (agentId: string | null) => {
    assignTicket(ticket.id, agentId)
    message.success(agentId ? 'Ticket assigned.' : 'Ticket unassigned.')
  }

  const sendReply = () => {
    const body = reply.trim()
    if (!body) {
      message.warning('Write a reply first.')
      return
    }
    setSending(true)
    addTicketReply(ticket.id, body, { internal })
    setReply('')
    setSending(false)
    message.success(internal ? 'Internal note added.' : 'Reply sent.')
  }

  const resolveOrReopen = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      updateTicketStatus(ticket.id, 'in_progress')
      message.success('Ticket reopened.')
    } else {
      updateTicketStatus(ticket.id, 'resolved')
      message.success('Ticket marked resolved.')
    }
  }

  const isFinal = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/support')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to support
        </button>
      </div>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {ticket.id}
              </span>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              {ticket.subject}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Opened {ticket.createdAt} via {channelLabels[ticket.channel]} ·
              Last activity {ticket.updatedAt}
            </p>
          </div>

          <button
            type="button"
            onClick={resolveOrReopen}
            className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition-colors ${
              isFinal
                ? 'bg-gray-700 hover:bg-gray-800'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isFinal ? (
              <>
                <RotateCcw size={14} />
                Reopen ticket
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Mark resolved
              </>
            )}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-surface-border bg-surface-card">
            <div className="flex items-center justify-between border-b border-surface-border p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MessageSquare size={16} className="text-gray-500" />
                Conversation
              </h2>
              <span className="text-xs text-gray-500">
                {ticket.messages.length} message
                {ticket.messages.length === 1 ? '' : 's'}
              </span>
            </div>

            <ul className="flex flex-col gap-4 p-5">
              {ticket.messages.map((m) => {
                const isCustomer = m.authorType === 'customer'
                return (
                  <li
                    key={m.id}
                    className={`flex gap-3 ${isCustomer ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        isCustomer
                          ? 'bg-surface-elevated text-gray-700'
                          : m.internal
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-brand text-white'
                      }`}
                    >
                      {m.authorName.charAt(0)}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl border p-4 ${
                        isCustomer
                          ? 'border-surface-border bg-surface-elevated'
                          : m.internal
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-brand/30 bg-brand/5'
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900">
                          {m.authorName}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {m.createdAt}
                        </span>
                        {m.internal && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            <Lock size={10} />
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-line text-sm text-gray-800">
                        {m.body}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">
                {internal ? 'Add internal note' : 'Reply to customer'}
              </h2>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <Switch
                  checked={internal}
                  onChange={setInternal}
                  size="small"
                />
                Internal note
              </label>
            </div>
            <Input.TextArea
              rows={4}
              className="mt-3"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={
                internal
                  ? 'Visible to admins only. Not sent to the customer.'
                  : 'Reply will be sent to the customer.'
              }
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {internal
                  ? 'Internal notes do not change the ticket status.'
                  : 'Sending a reply moves the ticket to "Waiting on customer".'}
              </p>
              <button
                type="button"
                onClick={sendReply}
                disabled={sending}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                <Send size={14} />
                {internal ? 'Save note' : 'Send reply'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <h2 className="text-sm font-semibold text-gray-900">Properties</h2>
            <div className="mt-4 space-y-4">
              <Field label="Status">
                <Select
                  value={ticket.status}
                  onChange={onStatusChange}
                  options={statusOptions}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={ticket.priority}
                  onChange={onPriorityChange}
                  options={priorityOptions}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Assignee">
                <Select
                  allowClear
                  value={ticket.assigneeId}
                  onChange={(v) => onAssign(v ?? null)}
                  placeholder="Unassigned"
                  options={supportAgents.map((a) => ({
                    value: a.id,
                    label: a.name,
                  }))}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label="Category">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 text-sm text-gray-800">
                  <Tag size={14} className="text-gray-500" />
                  {categoryLabels[ticket.category]}
                </span>
              </Field>
              <Field label="Channel">
                <span className="text-sm text-gray-800">
                  {channelLabels[ticket.channel]}
                </span>
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <div className="flex items-center gap-2">
              <UserIcon size={16} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
            </div>
            {customer ? (
              <div className="mt-3 space-y-1">
                <Link
                  to={`/dashboard/users/${customer.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
                >
                  {customer.name}
                  <ExternalLink size={12} />
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail size={12} />
                  {customer.email}
                </div>
                <div className="text-xs text-gray-500">{customer.phone}</div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Customer not found.</p>
            )}
          </div>

          {ticket.orderId && (
            <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Related order
                </h2>
              </div>
              {order ? (
                <div className="mt-3">
                  <Link
                    to={`/dashboard/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
                  >
                    {order.id}
                    <ExternalLink size={12} />
                  </Link>
                  <div className="mt-1 text-xs text-gray-500">
                    Placed {order.placedAt}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Order reference: {ticket.orderId}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      {children}
    </div>
  )
}
