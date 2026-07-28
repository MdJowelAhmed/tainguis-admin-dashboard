import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Input, Modal } from 'antd'
import {
  ArrowLeft,
  Ban,
  CircleSlash,
  ExternalLink,
  Flag,
  MessageSquareWarning,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { reopenReport, resolveReport, useReport, useReportsAgainst } from '../../components/reports/reportsStore'
import { reasonLabels, type ReportAction } from '../../components/reports/reportsData'
import { setUserStatus, useUser } from '../../components/users/usersStore'
import ReportStatusBadge from '../../components/reports/ReportStatusBadge'

type ResolutionType = 'dismiss' | 'warning' | 'restrict' | 'ban'

const resolutionConfig: Record<
  ResolutionType,
  {
    title: string
    okText: string
    danger?: boolean
    status: 'dismissed' | 'actioned'
    action: ReportAction
    affectsUser: 'none' | 'restricted' | 'banned'
    description: string
  }
> = {
  dismiss: {
    title: 'Dismiss report',
    okText: 'Dismiss report',
    status: 'dismissed',
    action: 'none',
    affectsUser: 'none',
    description: 'No policy violation found. The reported user is not affected.',
  },
  warning: {
    title: 'Send warning',
    okText: 'Send warning',
    status: 'actioned',
    action: 'warning_sent',
    affectsUser: 'none',
    description: 'A warning will be recorded against the user. Account access stays the same.',
  },
  restrict: {
    title: 'Restrict user',
    okText: 'Restrict user',
    status: 'actioned',
    action: 'restricted',
    affectsUser: 'restricted',
    description: 'The user can browse but cannot checkout or place new orders.',
  },
  ban: {
    title: 'Ban user',
    okText: 'Ban user',
    danger: true,
    status: 'actioned',
    action: 'banned',
    affectsUser: 'banned',
    description: 'The user will lose access to sign in or use the platform.',
  },
}

export default function ReportDetails() {
  const { id } = useParams<{ id: string }>()
  const report = useReport(id)
  const reporter = useUser(report?.reporterId)
  const reported = useUser(report?.reportedUserId)
  const otherReports = useReportsAgainst(report?.reportedUserId)
  const navigate = useNavigate()
  const { message, modal } = App.useApp()

  const [resolutionType, setResolutionType] =
    useState<ResolutionType | null>(null)
  const [note, setNote] = useState('')

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-base text-gray-700">Report not found.</p>
        <Link
          to="/dashboard/reports"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to reports
        </Link>
      </div>
    )
  }

  const openResolution = (type: ResolutionType) => {
    setResolutionType(type)
    setNote('')
  }

  const submitResolution = () => {
    if (!resolutionType || !report) return
    const cfg = resolutionConfig[resolutionType]
    if (!note.trim()) {
      message.warning('Please add a note explaining the decision.')
      return
    }
    resolveReport(report.id, cfg.status, cfg.action, note.trim())
    if (cfg.affectsUser !== 'none' && reported) {
      setUserStatus(reported.id, cfg.affectsUser, note.trim())
    }
    message.success(
      cfg.affectsUser === 'none'
        ? `Report ${cfg.status}.`
        : `Report actioned. ${reported?.name} is now ${cfg.affectsUser}.`,
    )
    setResolutionType(null)
  }

  const handleReopen = () => {
    modal.confirm({
      title: 'Reopen this report?',
      content:
        'The report will go back to the pending queue. User status (if changed) is not automatically restored.',
      okText: 'Reopen',
      onOk: () => {
        reopenReport(report.id)
        message.success('Report reopened.')
      },
    })
  }

  const isResolved = report.status !== 'pending'
  const cfg = resolutionType ? resolutionConfig[resolutionType] : null
  const otherPending = otherReports.filter(
    (r) => r.id !== report.id && r.status === 'pending',
  ).length

  return (
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
              <h1 className="text-2xl font-semibold text-gray-900">
                {report.id.toUpperCase()}
              </h1>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Filed {report.createdAt}
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
              <ActionButton
                icon={RotateCcw}
                label="Reopen report"
                variant="ghost"
                onClick={handleReopen}
              />
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Field label="Reason">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1 text-sm font-medium text-gray-800">
              <Flag size={14} />
              {reasonLabels[report.reason]}
            </span>
          </Field>

          <Field label="Reported user">
            {reported ? (
              <Link
                to={`/dashboard/users/${reported.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand"
              >
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
                to={`/dashboard/users/${reporter.id}`}
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
                  {report.action?.replace('_', ' ') ?? '—'}
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
                  {report.resolvedAt ?? '—'}
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

      {reported && (
        <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                History for {reported.name}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {otherReports.length} total report
                {otherReports.length === 1 ? '' : 's'} against this user
                {otherPending > 0 && ` · ${otherPending} other pending`}
              </p>
            </div>
            <Link
              to={`/dashboard/users/${reported.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              View profile
              <ExternalLink size={12} />
            </Link>
          </div>

          {otherReports.length <= 1 ? (
            <p className="mt-4 text-sm text-gray-500">
              No prior reports against this user.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-surface-border">
              {otherReports
                .filter((r) => r.id !== report.id)
                .map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <Flag size={14} className="text-gray-500" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/dashboard/reports/${r.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand"
                      >
                        {r.id.toUpperCase()} · {reasonLabels[r.reason]}
                      </Link>
                      <div className="text-xs text-gray-500">{r.createdAt}</div>
                    </div>
                    <ReportStatusBadge status={r.status} />
                  </li>
                ))}
            </ul>
          )}
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

