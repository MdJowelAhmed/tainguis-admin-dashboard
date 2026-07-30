import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Input, Modal, Spin, Alert } from 'antd'
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  CircleSlash,
  ExternalLink,
  Flag,
  MessageSquareWarning,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  useGetReportByIdQuery,
  useGetReportsHistoryQuery,
  useReportResolveMutation,
  type ReportActionTaken,
} from '../../redux/api/reportApi'
import { reasonLabels, type ReportReason } from '../../components/reports/reportsData'
import ReportStatusBadge from '../../components/reports/ReportStatusBadge'
import { imageUrl } from '../../lib/imageUrl'

type ResolutionType = 'dismiss' | 'warning' | 'restrict' | 'ban'

const resolutionConfig: Record<
  ResolutionType,
  {
    title: string
    okText: string
    danger?: boolean
    actionTaken: ReportActionTaken
    description: string
  }
> = {
  dismiss: {
    title: 'Dismiss report',
    okText: 'Dismiss report',
    actionTaken: 'dismiss',
    description: 'No policy violation found. The reported user is not affected.',
  },
  warning: {
    title: 'Send warning',
    okText: 'Send warning',
    actionTaken: 'warning',
    description: 'A warning will be recorded against the user. Account access stays the same.',
  },
  restrict: {
    title: 'Restrict user',
    okText: 'Restrict user',
    actionTaken: 'inactive',
    description: 'The user will be set to inactive.',
  },
  ban: {
    title: 'Ban user',
    okText: 'Ban user',
    danger: true,
    actionTaken: 'blocked',
    description: 'The user will be blocked from accessing the platform.',
  },
}

export default function ReportDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message, modal } = App.useApp()

  const { data: reportRes, isLoading: isLoadingReport, isError, error } = useGetReportByIdQuery(id!, { skip: !id })
  const report = reportRes?.data

  const { data: historyRes } = useGetReportsHistoryQuery(id!, { skip: !id })
  const historyList = historyRes?.data ?? []

  const [reportResolve, { isLoading: isResolving }] = useReportResolveMutation()

  const [resolutionType, setResolutionType] = useState<ResolutionType | null>(null)
  const [note, setNote] = useState('')

  if (isLoadingReport) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" tip="Loading report details…" />
      </div>
    )
  }

  if (isError || !report) {
    const errMsg =
      (error as { data?: { message?: string } })?.data?.message ??
      'Report not found.'
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Alert type="error" message={errMsg} showIcon />
        <Link
          to="/dashboard/reports"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to reports
        </Link>
      </div>
    )
  }

  const reporter = report.reporter
  const reported = report.reportedUser

  const openResolution = (type: ResolutionType) => {
    setResolutionType(type)
    setNote('')
  }

  const submitResolution = async () => {
    if (!resolutionType || !report) return
    const cfg = resolutionConfig[resolutionType]
    if (!note.trim()) {
      message.warning('Please add a note explaining the decision.')
      return
    }

    try {
      await reportResolve({
        id: report._id,
        data: {
          actionTaken: cfg.actionTaken,
          adminNote: note.trim(),
        },
      }).unwrap()

      message.success('Report resolved successfully.')
      setResolutionType(null)
    } catch (err: any) {
      const errMsg = err?.data?.message ?? 'Failed to resolve report.'
      message.error(errMsg)
    }
  }

  const isResolved = report.status !== 'pending'
  const cfg = resolutionType ? resolutionConfig[resolutionType] : null

  const reasonText = reasonLabels[report.reason as ReportReason] || report.reason.replace(/_/g, ' ')

  return (
    <Spin spinning={isResolving}>
      <div className="flex flex-col gap-6 py-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/reports')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to reports
          </button>
        </div>

        <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 uppercase">
                  {report.reportCode || report._id}
                </h1>
                <ReportStatusBadge status={report.status as any} />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Filed {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isResolved ? (
                <>
                  <ActionButton
                    icon={X}
                    label="Dismiss"
                    variant="ghost"
                    onClick={() => openResolution('dismiss')}
                  />
                  <ActionButton
                    icon={MessageSquareWarning}
                    label="Send warning"
                    variant="amber-outline"
                    onClick={() => openResolution('warning')}
                  />
                  <ActionButton
                    icon={CircleSlash}
                    label="Restrict user"
                    variant="amber"
                    onClick={() => openResolution('restrict')}
                  />
                  <ActionButton
                    icon={Ban}
                    label="Ban user"
                    variant="danger"
                    onClick={() => openResolution('ban')}
                  />
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-gray-200 px-4 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  Already resolved
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Field label="Reason">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 text-sm font-medium text-gray-800 capitalize">
                <Flag size={14} />
                {reasonText}
              </span>
            </Field>

            <Field label="Reported user">
              {reported ? (
                <Link
                  to={`/dashboard/users/${reported._id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
                >
                  {reported.profileImage && (
                    <img
                      src={imageUrl(reported.profileImage)}
                      alt={reported.name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  {reported.name}
                  <ExternalLink size={12} />
                </Link>
              ) : (
                <span className="text-sm text-gray-500">Unknown</span>
              )}
            </Field>

            <Field label="Reporter">
              {reporter ? (
                <Link
                  to={`/dashboard/users/${reporter._id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-800 hover:text-brand"
                >
                  {reporter.name}
                  <ExternalLink size={12} />
                </Link>
              ) : (
                <span className="text-sm text-gray-500">Unknown</span>
              )}
            </Field>
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Description
            </div>
            <p className="mt-2 whitespace-pre-line rounded-xl border border-surface-border bg-surface-elevated p-4 text-sm text-gray-800">
              {report.description}
            </p>
          </div>

          {isResolved && (
            <div className="mt-6 rounded-xl border border-surface-border bg-surface-elevated p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <ShieldCheck size={16} className="text-brand" />
                Resolution
              </div>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Action taken
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900 capitalize">
                    {report.actionTaken || report.action?.replace('_', ' ') || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Resolved by
                  </div>
                  <div className="mt-1 text-sm text-gray-800">
                    {report.resolvedBy ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Resolved at
                  </div>
                  <div className="mt-1 text-sm text-gray-800">
                    {report.updatedAt ? new Date(report.updatedAt).toLocaleString() : '—'}
                  </div>
                </div>
              </div>
              {report.adminNote && (
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Admin note
                  </div>
                  <p className="mt-1 text-sm text-gray-800">{report.adminNote}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* User Reports History Section */}
        {historyList.length > 0 && (
          <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Reports History for {reported?.name ?? 'User'}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {historyList.length} report{historyList.length === 1 ? '' : 's'} recorded in history
                </p>
              </div>
              {reported && (
                <Link
                  to={`/dashboard/users/${reported._id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                >
                  View profile
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>

            <ul className="mt-4 divide-y divide-surface-border">
              {historyList.map((item) => {
                const itemReason = reasonLabels[item.reason as ReportReason] || item.reason.replace(/_/g, ' ')
                return (
                  <li key={item._id} className="flex items-center gap-3 py-3">
                    <Flag size={14} className="text-gray-500" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/dashboard/reports/${item._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand capitalize"
                      >
                        {item.reportCode || item._id.slice(-6)} · {itemReason}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <ReportStatusBadge status={item.status as any} />
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <Modal
          open={!!resolutionType}
          title={cfg?.title}
          okText={cfg?.okText}
          okButtonProps={cfg?.danger ? { danger: true } : undefined}
          onOk={submitResolution}
          onCancel={() => setResolutionType(null)}
          destroyOnClose
        >
          {cfg && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{cfg.description}</p>
              <div>
                <div className="mb-2 text-sm font-medium text-gray-900">
                  Admin note (required)
                </div>
                <Input.TextArea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain the decision so other moderators have context."
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Spin>
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
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  )
}

type ButtonVariant = 'ghost' | 'amber-outline' | 'amber' | 'danger'

const variantStyles: Record<ButtonVariant, string> = {
  ghost:
    'border border-surface-border bg-white text-gray-800 hover:bg-surface-elevated',
  'amber-outline':
    'border border-amber-300 bg-white text-amber-700 hover:bg-amber-50',
  amber: 'bg-amber-500 text-white hover:bg-amber-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

function ActionButton({
  icon: Icon,
  label,
  variant,
  onClick,
}: {
  icon: typeof Ban
  label: string
  variant: ButtonVariant
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ${variantStyles[variant]}`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
