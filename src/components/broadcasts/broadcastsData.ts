export type BroadcastType = 'announcement' | 'warning' | 'promo' | 'info'

export type BroadcastChannel = 'in_app' | 'email' | 'push'

export type BroadcastAudience =
  | 'all'
  | 'active'
  | 'restricted'
  | 'banned'
  | 'recent_orders'
  | 'no_orders'

export type BroadcastStatus = 'sent' | 'scheduled' | 'draft'

export type Broadcast = {
  id: string
  type: BroadcastType
  title: string
  message: string
  audience: BroadcastAudience
  channels: BroadcastChannel[]
  status: BroadcastStatus
  sentAt?: string
  scheduledFor?: string
  recipients: number
  readRate?: number
}

export const broadcastTypeLabels: Record<BroadcastType, string> = {
  announcement: 'Announcement',
  warning: 'Warning',
  promo: 'Promo',
  info: 'Info',
}

export const channelLabels: Record<BroadcastChannel, string> = {
  in_app: 'In-App',
  email: 'Email',
  push: 'Push',
}

export const audienceLabels: Record<BroadcastAudience, string> = {
  all: 'All Users',
  active: 'Active users only',
  restricted: 'Restricted users',
  banned: 'Banned users',
  recent_orders: 'Customers with recent orders',
  no_orders: 'Users with no orders yet',
}

export const MESSAGE_MAX = 280

export const initialBroadcasts: Broadcast[] = [
  {
    id: 'BC-008',
    type: 'announcement',
    title: 'New Safety Features Rolled Out',
    message:
      'We rolled out new safety features to protect your account. Review them in Settings.',
    audience: 'all',
    channels: ['in_app', 'email'],
    status: 'sent',
    sentAt: '2026-05-14 10:00',
    recipients: 12842,
    readRate: 0.69,
  },
  {
    id: 'BC-007',
    type: 'warning',
    title: 'Scheduled Maintenance — Oct 25',
    message:
      'The platform will be down for scheduled maintenance from 02:00 to 04:00 UTC.',
    audience: 'all',
    channels: ['in_app', 'email', 'push'],
    status: 'sent',
    sentAt: '2026-05-12 09:00',
    recipients: 12842,
    readRate: 0.75,
  },
  {
    id: 'BC-006',
    type: 'promo',
    title: 'Premium Plan 20% Off This Week',
    message: 'Upgrade to Premium and get 20% off your first month — this week only.',
    audience: 'no_orders',
    channels: ['in_app', 'push'],
    status: 'sent',
    sentAt: '2026-05-09 14:30',
    recipients: 8420,
    readRate: 0.5,
  },
  {
    id: 'BC-005',
    type: 'info',
    title: 'Community Guidelines Updated',
    message: 'We updated our community guidelines. Please review the changes.',
    audience: 'all',
    channels: ['in_app', 'email'],
    status: 'sent',
    sentAt: '2026-05-05 11:00',
    recipients: 12600,
    readRate: 0.62,
  },
  {
    id: 'BC-004',
    type: 'announcement',
    title: 'Weekend Meetup Challenge',
    message: 'Join the weekend meetup challenge and win exclusive rewards.',
    audience: 'active',
    channels: ['push'],
    status: 'scheduled',
    scheduledFor: '2026-05-20 09:00',
    recipients: 4219,
  },
]
