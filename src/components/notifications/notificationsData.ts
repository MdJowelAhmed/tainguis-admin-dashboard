export type NotificationCategory =
  | 'order'
  | 'user'
  | 'support'
  | 'report'
  | 'broadcast'
  | 'admin'

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger'

export type Notification = {
  id: string
  category: NotificationCategory
  tone: NotificationTone
  title: string
  description: string
  linkTo: string
  createdAt: string
  read: boolean
}

export const categoryLabels: Record<NotificationCategory, string> = {
  order: 'Orders',
  user: 'Users',
  support: 'Support',
  report: 'Reports',
  broadcast: 'Broadcast',
  admin: 'Admins',
}

export const initialNotifications: Notification[] = [
  {
    id: 'n_010',
    category: 'support',
    tone: 'danger',
    title: 'Urgent ticket: Charged twice for the same order',
    description:
      'Sofía Ramírez · TKT-2043 · Payment dispute on ORD-10110',
    linkTo: '/dashboard/support/TKT-2043',
    createdAt: '2026-05-17 09:42',
    read: false,
  },
  {
    id: 'n_009',
    category: 'order',
    tone: 'info',
    title: 'New order placed',
    description: 'Lucía Vega placed ORD-10125 · 3 items · MX$330',
    linkTo: '/dashboard/orders/ORD-10125',
    createdAt: '2026-05-16 12:30',
    read: false,
  },
  {
    id: 'n_008',
    category: 'report',
    tone: 'warning',
    title: 'New report filed',
    description:
      'Sofía Ramírez reported Carlos Hernández for fake account (r_006)',
    linkTo: '/dashboard/reports/r_006',
    createdAt: '2026-05-16 08:55',
    read: false,
  },
  {
    id: 'n_007',
    category: 'support',
    tone: 'warning',
    title: 'Customer replied to a ticket',
    description: 'María González replied on TKT-2041 (delivery delay)',
    linkTo: '/dashboard/support/TKT-2041',
    createdAt: '2026-05-16 09:12',
    read: false,
  },
  {
    id: 'n_006',
    category: 'order',
    tone: 'success',
    title: 'Order delivered',
    description: 'ORD-10042 delivered to María González',
    linkTo: '/dashboard/orders/ORD-10042',
    createdAt: '2026-05-15 16:48',
    read: true,
  },
  {
    id: 'n_005',
    category: 'broadcast',
    tone: 'success',
    title: 'Broadcast sent',
    description:
      '“New Safety Features Rolled Out” sent to 12,842 recipients',
    linkTo: '/dashboard/broadcast',
    createdAt: '2026-05-14 10:00',
    read: true,
  },
  {
    id: 'n_004',
    category: 'order',
    tone: 'danger',
    title: 'Order refunded',
    description: 'ORD-09845 refunded to Carlos Hernández · MX$720',
    linkTo: '/dashboard/orders/ORD-09845',
    createdAt: '2026-05-14 09:30',
    read: true,
  },
  {
    id: 'n_003',
    category: 'user',
    tone: 'danger',
    title: 'User banned',
    description:
      'Diego Morales was banned for repeated policy violations',
    linkTo: '/dashboard/users/u_004',
    createdAt: '2026-05-12 18:00',
    read: true,
  },
  {
    id: 'n_002',
    category: 'admin',
    tone: 'info',
    title: 'New admin account created',
    description: 'Renata Salinas added with Manager role',
    linkTo: '/dashboard/admins',
    createdAt: '2026-05-10 14:20',
    read: true,
  },
  {
    id: 'n_001',
    category: 'user',
    tone: 'info',
    title: 'New customer signed up',
    description: 'Lucía Vega joined from Cancún',
    linkTo: '/dashboard/users/u_005',
    createdAt: '2025-08-30 09:00',
    read: true,
  },
]
