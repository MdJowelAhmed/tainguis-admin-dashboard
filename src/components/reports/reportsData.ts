export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'fraud'
  | 'inappropriate_content'
  | 'fake_account'
  | 'other'

export type ReportStatus = 'pending' | 'dismissed' | 'actioned'

export type ReportAction =
  | 'none'
  | 'warning_sent'
  | 'restricted'
  | 'banned'

export type Report = {
  id: string
  reporterId: string
  reportedUserId: string
  reason: ReportReason
  description: string
  createdAt: string
  status: ReportStatus
  adminNote?: string
  resolvedAt?: string
  resolvedBy?: string
  action?: ReportAction
}

export const reasonLabels: Record<ReportReason, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  fraud: 'Fraud / Scam',
  inappropriate_content: 'Inappropriate content',
  fake_account: 'Fake account',
  other: 'Other',
}

export const initialReports: Report[] = [
  {
    id: 'r_001',
    reporterId: 'u_001',
    reportedUserId: 'u_002',
    reason: 'fraud',
    description:
      'Seller asked me to complete the payment outside the platform after I placed the order. Refused to ship until I sent extra fees via bank transfer.',
    createdAt: '2026-05-14 09:24',
    status: 'pending',
  },
  {
    id: 'r_002',
    reporterId: 'u_003',
    reportedUserId: 'u_004',
    reason: 'harassment',
    description:
      'Received repeated insulting messages after leaving a negative product review. They keep creating new conversations to harass me.',
    createdAt: '2026-05-13 17:12',
    status: 'pending',
  },
  {
    id: 'r_003',
    reporterId: 'u_005',
    reportedUserId: 'u_002',
    reason: 'fraud',
    description:
      'Listed counterfeit huarache sandals as authentic leather. Product received was clearly a knockoff.',
    createdAt: '2026-05-11 11:48',
    status: 'pending',
  },
  {
    id: 'r_004',
    reporterId: 'u_006',
    reportedUserId: 'u_004',
    reason: 'inappropriate_content',
    description:
      'Profile picture contains explicit content. Already reported via in-app flag last week.',
    createdAt: '2026-05-09 20:03',
    status: 'actioned',
    adminNote:
      'Confirmed violation. Account banned per repeat-offender policy.',
    resolvedAt: '2026-05-10 08:30',
    resolvedBy: 'Sabbir Ahmed',
    action: 'banned',
  },
  {
    id: 'r_005',
    reporterId: 'u_007',
    reportedUserId: 'u_001',
    reason: 'spam',
    description:
      'User sent the same promotional message to me 8 times in 2 days via chat.',
    createdAt: '2026-05-08 14:21',
    status: 'dismissed',
    adminNote:
      'Reviewed chat logs — messages were follow-ups about a legitimate pending order, not spam.',
    resolvedAt: '2026-05-09 10:05',
    resolvedBy: 'Sabbir Ahmed',
    action: 'none',
  },
  {
    id: 'r_006',
    reporterId: 'u_003',
    reportedUserId: 'u_002',
    reason: 'fake_account',
    description:
      'Profile name and avatar look stolen from another seller I follow on social media.',
    createdAt: '2026-05-15 08:55',
    status: 'pending',
  },
]
