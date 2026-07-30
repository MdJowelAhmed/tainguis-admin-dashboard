import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Input, Select, Spin } from 'antd'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageSquare,
  RotateCcw,
  Send,
  Tag,
  User as UserIcon,
} from 'lucide-react'
import {
  useGetSupportTicketByIdQuery,
  useGetSupportMessageQuery,
  useSendSupportMessageMutation,
  useUpdateSupportMutation,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from '../../redux/api/supportApi'
import { categoryLabels, supportAgents } from '../../components/support/supportData'
import { PriorityBadge, TicketStatusBadge } from '../../components/support/badges'

const statusOptions: { value: SupportTicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'waiting_on_customer', label: 'Waiting on customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const priorityOptions: { value: SupportTicketPriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function SupportTicket() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [reply, setReply] = useState('')

  // 1. Get Support Ticket details by ID
  const { data: ticketRes, isLoading: loadingTicket } = useGetSupportTicketByIdQuery(
    id ?? '',
    { skip: !id },
  )
  const ticket = ticketRes?.data

  // 2. Get Support Messages for ticket's chat session
  const chatId = ticket?.chat ?? ''
  const { data: messagesRes, isLoading: loadingMessages } = useGetSupportMessageQuery(
    chatId,
    { skip: !chatId },
  )
  const messages = messagesRes?.data ?? []

  // 3. Mutations
  const [updateSupport, { isLoading: updating }] = useUpdateSupportMutation()
  const [sendSupportMessage, { isLoading: sending }] = useSendSupportMessageMutation()

  if (loadingTicket) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

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

  const assignedToId =
    typeof ticket.assignedTo === 'object' && ticket.assignedTo !== null
      ? ticket.assignedTo._id
      : ticket.assignedTo

  const handleUpdate = async (patch: {
    status?: SupportTicketStatus
    priority?: SupportTicketPriority
    assignedTo?: string
  }) => {
    try {
      await updateSupport({
        id: ticket._id,
        data: {
          status: patch.status ?? ticket.status,
          priority: patch.priority ?? ticket.priority,
          assignedTo: patch.assignedTo !== undefined ? patch.assignedTo : assignedToId,
        },
      }).unwrap()
      message.success('Ticket updated successfully.')
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update ticket.')
    }
  }

  const onStatusChange = (status: SupportTicketStatus) => {
    handleUpdate({ status })
  }

  const onPriorityChange = (priority: SupportTicketPriority) => {
    handleUpdate({ priority })
  }

  const onAssign = (agentId: string | null) => {
    handleUpdate({ assignedTo: agentId ?? '' })
  }

  const sendReply = async () => {
    const text = reply.trim()
    if (!text) {
      message.warning('Write a reply first.')
      return
    }
    if (!chatId) {
      message.error('Chat ID is missing for this ticket.')
      return
    }
    try {
      await sendSupportMessage({
        chat: chatId,
        type: 'text',
        text,
      }).unwrap()
      setReply('')
      message.success('Reply sent successfully.')
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to send message.')
    }
  }

  const resolveOrReopen = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      handleUpdate({ status: 'in_progress' })
    } else {
      handleUpdate({ status: 'resolved' })
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
                {ticket.ticketId || ticket._id}
              </span>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              {ticket.title}
            </h1>
            {ticket.description && (
              <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={resolveOrReopen}
            disabled={updating}
            className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
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
                {messages.length} message{messages.length === 1 ? '' : 's'}
              </span>
            </div>

            {loadingMessages ? (
              <div className="flex justify-center p-8">
                <Spin />
              </div>
            ) : messages.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No messages found for this support ticket.
              </div>
            ) : (
              <ul className="flex flex-col gap-4 p-5">
                {messages.map((m) => {
                  const isCustomer = !m.isMe
                  const senderName = m.sender?.name || (isCustomer ? ticket.user?.name || 'Customer' : 'Support Agent')
                  return (
                    <li
                      key={m._id}
                      className={`flex gap-3 ${isCustomer ? '' : 'flex-row-reverse'}`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          isCustomer
                            ? 'bg-surface-elevated text-gray-700'
                            : 'bg-brand text-white'
                        }`}
                      >
                        {m.sender?.profileImage ? (
                          <img
                            src={m.sender.profileImage}
                            alt={senderName}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          senderName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl border p-4 ${
                          isCustomer
                            ? 'border-surface-border bg-surface-elevated'
                            : 'border-brand/30 bg-brand/5'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900">
                            {senderName}
                          </span>
                          {m.createdAt && (
                            <span className="text-[11px] text-gray-500">
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {m.text && (
                          <p className="whitespace-pre-line text-sm text-gray-800">
                            {m.text}
                          </p>
                        )}
                        {m.image && (
                          <img
                            src={m.image}
                            alt="Attachment"
                            className="mt-2 max-h-48 rounded-lg object-contain"
                          />
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              Reply to customer
            </h2>
            <Input.TextArea
              rows={4}
              className="mt-3"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your message here..."
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Sending a reply sends a message directly to the user chat.
              </p>
              <button
                type="button"
                onClick={sendReply}
                disabled={sending}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                <Send size={14} />
                Send reply
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
                  disabled={updating}
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={ticket.priority}
                  onChange={onPriorityChange}
                  options={priorityOptions}
                  style={{ width: '100%' }}
                  disabled={updating}
                />
              </Field>
              <Field label="Assignee">
                <Select
                  allowClear
                  value={assignedToId}
                  onChange={(v) => onAssign(v ?? null)}
                  placeholder="Unassigned"
                  options={supportAgents.map((a) => ({
                    value: a.id,
                    label: a.name,
                  }))}
                  style={{ width: '100%' }}
                  disabled={updating}
                />
              </Field>
              <Field label="Category">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 text-sm text-gray-800 capitalize">
                  <Tag size={14} className="text-gray-500" />
                  {categoryLabels[ticket.category as keyof typeof categoryLabels] || ticket.category}
                </span>
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
            <div className="flex items-center gap-2">
              <UserIcon size={16} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">User Details</h2>
            </div>
            {ticket.user ? (
              <div className="mt-3 space-y-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  {ticket.user.name}
                </span>
                {ticket.user.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={12} />
                    {ticket.user.email}
                  </div>
                )}
                {ticket.user.phone && (
                  <div className="text-xs text-gray-500">{ticket.user.phone}</div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">User details not found.</p>
            )}
          </div>
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
