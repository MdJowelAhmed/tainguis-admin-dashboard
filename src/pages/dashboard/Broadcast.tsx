import { useState } from 'react'
import { App, DatePicker, Input, Select, Switch, Table, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import {
  AlertTriangle,
  Bell,
  Check,
  Gift,
  Info,
  Mail,
  Megaphone,
  Send,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import {
  useGetAllBroadcastsQuery,
  useSendBroadcastMutation,
} from '../../redux/api/broadcastApi'
import type { BroadcastListItem } from '../../redux/api/broadcastApi'
import {
  audienceLabels,
  broadcastTypeLabels,
  channelLabels,
  MESSAGE_MAX,
  type BroadcastAudience,
  type BroadcastChannel,
  type BroadcastStatus,
  type BroadcastType,
} from '../../components/broadcasts/broadcastsData'

const typeConfig: Record<
  BroadcastType,
  { icon: LucideIcon; accent: string; iconBg: string }
> = {
  announcement: {
    icon: Megaphone,
    accent: 'text-brand',
    iconBg: 'bg-brand/10',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  promo: { icon: Gift, accent: 'text-pink-600', iconBg: 'bg-pink-100' },
  info: { icon: Info, accent: 'text-blue-600', iconBg: 'bg-blue-100' },
}

const channelConfig: Record<
  BroadcastChannel,
  { icon: LucideIcon; label: string }
> = {
  in_app: { icon: Bell, label: 'In-App' },
  email: { icon: Mail, label: 'Email' },
  push: { icon: Smartphone, label: 'Push' },
}

const numberFmt = new Intl.NumberFormat('en-US')

export default function Broadcast() {
  const { message } = App.useApp()

  const { data: broadcastsRes, isLoading, isError, error } = useGetAllBroadcastsQuery()
  const [sendBroadcast, { isLoading: isSending }] = useSendBroadcastMutation()

  const broadcasts = broadcastsRes?.data ?? []
  const pagination = broadcastsRes?.pagination

  const [type, setType] = useState<BroadcastType>('announcement')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<BroadcastAudience>('all_users')
  const [channels, setChannels] = useState<BroadcastChannel[]>(['in_app', 'push', 'email'])
  const [scheduleOn, setScheduleOn] = useState(false)
  const [scheduledFor, setScheduledFor] = useState<Dayjs | null>(null)

  const toggleChannel = (c: BroadcastChannel) => {
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )
  }

  const reset = () => {
    setType('announcement')
    setTitle('')
    setBody('')
    setAudience('all_users')
    setChannels(['in_app', 'push', 'email'])
    setScheduleOn(false)
    setScheduledFor(null)
  }

  const submit = async () => {
    if (!title.trim()) {
      message.warning('Add a title.')
      return
    }
    if (!body.trim()) {
      message.warning('Write a message.')
      return
    }
    if (channels.length === 0) {
      message.warning('Pick at least one delivery channel.')
      return
    }
    if (scheduleOn && !scheduledFor) {
      message.warning('Pick a date and time to schedule.')
      return
    }

    const payload = {
      type,
      title: title.trim(),
      message: body.trim(),
      audience: audience === 'all' ? 'all_users' : audience,
      channels,
      ...(scheduleOn && scheduledFor ? { scheduledAt: scheduledFor.toISOString() } : {}),
    }

    try {
      await sendBroadcast(payload).unwrap()
      message.success(
        scheduleOn ? 'Broadcast scheduled successfully.' : 'Broadcast sent successfully.',
      )
      reset()
    } catch (err: any) {
      const errMsg = err?.data?.message ?? 'Failed to send broadcast.'
      message.error(errMsg)
    }
  }

  const columns: ColumnsType<BroadcastListItem> = [
    {
      title: 'Broadcast',
      key: 'broadcast',
      render: (_, b) => (
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {b.code || b._id.slice(-6)}
          </div>
          <div className="truncate text-sm font-semibold text-gray-900">
            {b.title}
          </div>
        </div>
      ),
    },
    {
      title: 'Audience',
      key: 'audience',
      render: (_, b) => (
        <span className="text-sm text-gray-700 capitalize">
          {audienceLabels[b.audience] || b.audience.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      title: 'Channels',
      key: 'channels',
      render: (_, b) => (
        <div className="flex flex-wrap gap-1.5">
          {b.channels?.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-gray-700 capitalize"
            >
              {channelLabels[c as BroadcastChannel] || c}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Recipients',
      key: 'sent',
      align: 'right',
      render: (_, b) => (
        <span className="text-sm text-gray-700">
          {numberFmt.format(b.totalRecipients ?? 0)}
        </span>
      ),
    },
    {
      title: 'Read rate',
      key: 'read',
      render: (_, b) =>
        b.readRate === undefined ? (
          <span className="text-xs text-gray-400">0%</span>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-brand"
                style={{ width: `${Math.round((b.readRate ?? 0) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {Math.round((b.readRate ?? 0) * 100)}%
            </span>
          </div>
        ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, b) => <StatusPill status={b.status as BroadcastStatus} />,
    },
  ]

  if (isError) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load broadcasts.'
    return (
      <div className="py-6">
        <Alert type="error" message={errMsg} showIcon />
      </div>
    )
  }

  return (
    <Spin spinning={isSending}>
      <div className="flex flex-col gap-6 py-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">Broadcast</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send notifications and announcements to your users.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Compose Broadcast
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Craft your message and pick your audience
              </p>
            </div>

            <div className="mt-5">
              <FieldLabel>Notification Type</FieldLabel>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(Object.keys(broadcastTypeLabels) as BroadcastType[]).map((t) => {
                  const cfg = typeConfig[t]
                  const active = t === type
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors ${
                        active
                          ? 'border-brand bg-brand/5'
                          : 'border-surface-border bg-white hover:border-gray-300'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.iconBg}`}
                      >
                        <cfg.icon size={16} className={cfg.accent} />
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          active ? 'text-brand' : 'text-gray-800'
                        }`}
                      >
                        {broadcastTypeLabels[t]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>Title</FieldLabel>
              <Input
                className="mt-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance"
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <FieldLabel>Message</FieldLabel>
                <span className="text-xs text-gray-500">
                  {body.length} / {MESSAGE_MAX}
                </span>
              </div>
              <Input.TextArea
                className="mt-2"
                rows={4}
                maxLength={MESSAGE_MAX}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a clear, concise message…"
              />
            </div>

            <div className="mt-5">
              <FieldLabel>Audience</FieldLabel>
              <Select
                className="mt-2"
                value={audience}
                onChange={setAudience}
                style={{ width: '100%' }}
                options={Object.keys(audienceLabels).map((a) => ({
                  value: a,
                  label: audienceLabels[a],
                }))}
              />
            </div>

            <div className="mt-5">
              <FieldLabel>Delivery Channels</FieldLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(channelConfig) as BroadcastChannel[]).map((c) => {
                  const cfg = channelConfig[c]
                  const active = channels.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleChannel(c)}
                      className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
                        active
                          ? 'border-brand bg-brand/5 text-brand'
                          : 'border-surface-border bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <cfg.icon size={14} />
                      {cfg.label}
                      {active && <Check size={14} />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-surface-border bg-surface-elevated p-4">
              <div className="flex items-center gap-3">
                <Switch checked={scheduleOn} onChange={setScheduleOn} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Schedule for later
                  </div>
                  <div className="text-xs text-gray-500">
                    Pick when this broadcast should go out
                  </div>
                </div>
              </div>
              {scheduleOn && (
                <DatePicker
                  showTime
                  className="mt-3 w-full"
                  value={scheduledFor}
                  onChange={setScheduledFor}
                  placeholder="Pick date and time"
                />
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={submit}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                <Send size={14} />
                {scheduleOn ? 'Schedule' : 'Send Now'}
              </button>
            </div>
          </div>

          <aside className="rounded-2xl border border-surface-border bg-surface-card p-6">
            <h2 className="text-base font-semibold text-gray-900">Live Preview</h2>
            <p className="mt-1 text-xs text-gray-500">How users will see this</p>

            <Preview type={type} title={title} body={body} />
          </aside>
        </section>

        <section className="rounded-2xl border border-surface-border bg-surface-card">
          <div className="flex items-center justify-between border-b border-surface-border p-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Broadcast History
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Previously sent and scheduled broadcasts
              </p>
            </div>
            {pagination && (
              <span className="text-xs text-gray-500">
                {pagination.total} total broadcasts
              </span>
            )}
          </div>
          <Spin spinning={isLoading}>
            <Table<BroadcastListItem>
              className="dashboard-table"
              rowKey="_id"
              columns={columns}
              dataSource={broadcasts}
              pagination={{
                pageSize: 10,
                total: pagination?.total ?? 0,
                showSizeChanger: false,
              }}
            />
          </Spin>
        </section>
      </div>
    </Spin>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-900">{children}</label>
  )
}

function Preview({
  type,
  title,
  body,
}: {
  type: BroadcastType
  title: string
  body: string
}) {
  const cfg = typeConfig[type]
  return (
    <div className="mt-4 rounded-2xl border border-surface-border bg-surface-elevated p-4">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}
        >
          <cfg.icon size={16} className={cfg.accent} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-900">
            {title.trim() || 'Your notification title'}
          </div>
          <p className="mt-1 line-clamp-3 text-xs text-gray-600">
            {body.trim() || 'Your message will appear here as users see it.'}
          </p>
          <div className="mt-2 text-[11px] font-medium text-gray-500">
            Tianguis
          </div>
        </div>
      </div>
    </div>
  )
}

const statusStyles: Record<string, string> = {
  sent: 'bg-green-100 text-green-700 ring-green-200',
  scheduled: 'bg-blue-100 text-blue-700 ring-blue-200',
  draft: 'bg-gray-100 text-gray-700 ring-gray-200',
}

const statusLabels: Record<string, string> = {
  sent: 'Sent',
  scheduled: 'Scheduled',
  draft: 'Draft',
}

function StatusPill({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 ring-gray-200'
  const label = statusLabels[status] || status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${style}`}
    >
      {label}
    </span>
  )
}
