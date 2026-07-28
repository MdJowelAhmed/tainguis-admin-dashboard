export type TicketCategory =
  | 'order'
  | 'payment'
  | 'shipping'
  | 'refund'
  | 'account'
  | 'product'
  | 'other'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'
  | 'closed'

export type TicketChannel = 'email' | 'chat' | 'phone' | 'web'

export type TicketMessage = {
  id: string
  authorType: 'customer' | 'admin'
  authorName: string
  body: string
  createdAt: string
  internal?: boolean
}

export type Ticket = {
  id: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  channel: TicketChannel
  customerId: string
  orderId?: string
  assigneeId?: string
  assigneeName?: string
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
}

export const categoryLabels: Record<TicketCategory, string> = {
  order: 'Order issue',
  payment: 'Payment',
  shipping: 'Shipping',
  refund: 'Refund',
  account: 'Account',
  product: 'Product',
  other: 'Other',
}

export const priorityLabels: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_customer: 'Waiting on customer',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const channelLabels: Record<TicketChannel, string> = {
  email: 'Email',
  chat: 'Live chat',
  phone: 'Phone',
  web: 'Help center',
}

export type SupportAgent = {
  id: string
  name: string
}

export const supportAgents: SupportAgent[] = [
  { id: 'a_001', name: 'Sabbir Ahmed' },
  { id: 'a_002', name: 'Renata Salinas' },
  { id: 'a_003', name: 'Diego Pereira' },
]

export const initialTickets: Ticket[] = [
  {
    id: 'TKT-2041',
    subject: 'Order not delivered after 5 days',
    category: 'shipping',
    priority: 'high',
    status: 'open',
    channel: 'email',
    customerId: 'u_001',
    orderId: 'ORD-09921',
    createdAt: '2026-05-16 09:12',
    updatedAt: '2026-05-16 09:12',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'María González',
        createdAt: '2026-05-16 09:12',
        body: 'Hello, my order ORD-09921 was supposed to arrive 3 days ago. Tracking still says "in transit". Can someone check what is going on?',
      },
    ],
  },
  {
    id: 'TKT-2042',
    subject: 'Wrong size huarache sandals received',
    category: 'product',
    priority: 'medium',
    status: 'in_progress',
    channel: 'chat',
    customerId: 'u_002',
    orderId: 'ORD-09701',
    assigneeId: 'a_002',
    assigneeName: 'Renata Salinas',
    createdAt: '2026-05-15 14:30',
    updatedAt: '2026-05-15 16:48',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Carlos Hernández',
        createdAt: '2026-05-15 14:30',
        body: 'I ordered size 27 but received size 25. Need to exchange.',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Renata Salinas',
        createdAt: '2026-05-15 16:48',
        body: 'Hi Carlos, sorry about the mixup. I have started an exchange — please keep the wrong pair, we will email the return label and ship size 27 today.',
      },
    ],
  },
  {
    id: 'TKT-2043',
    subject: 'Charged twice for the same order',
    category: 'payment',
    priority: 'urgent',
    status: 'open',
    channel: 'email',
    customerId: 'u_003',
    orderId: 'ORD-10110',
    createdAt: '2026-05-16 11:45',
    updatedAt: '2026-05-16 11:45',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Sofía Ramírez',
        createdAt: '2026-05-16 11:45',
        body: 'My credit card was charged twice for order ORD-10110. Bank statement shows both transactions completed. Please refund the duplicate.',
      },
    ],
  },
  {
    id: 'TKT-2044',
    subject: 'How do I update my shipping address?',
    category: 'account',
    priority: 'low',
    status: 'resolved',
    channel: 'web',
    customerId: 'u_005',
    assigneeId: 'a_003',
    assigneeName: 'Diego Pereira',
    createdAt: '2026-05-12 10:02',
    updatedAt: '2026-05-12 10:48',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Lucía Vega',
        createdAt: '2026-05-12 10:02',
        body: 'I moved last week. How do I change my default shipping address?',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Diego Pereira',
        createdAt: '2026-05-12 10:31',
        body: 'Hi Lucía, you can update it under Account → Addresses → Edit default. Let me know if anything is unclear.',
      },
      {
        id: 'm_3',
        authorType: 'customer',
        authorName: 'Lucía Vega',
        createdAt: '2026-05-12 10:48',
        body: 'Got it, thanks!',
      },
    ],
  },
  {
    id: 'TKT-2045',
    subject: 'Refund not received after 10 days',
    category: 'refund',
    priority: 'high',
    status: 'waiting_customer',
    channel: 'email',
    customerId: 'u_002',
    orderId: 'ORD-09845',
    assigneeId: 'a_001',
    assigneeName: 'Sabbir Ahmed',
    createdAt: '2026-05-08 13:20',
    updatedAt: '2026-05-14 09:05',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Carlos Hernández',
        createdAt: '2026-05-08 13:20',
        body: 'Refund for ORD-09845 was approved 10 days ago but I have not received it.',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Sabbir Ahmed',
        createdAt: '2026-05-09 10:14',
        body: 'Refund was issued on 2026-04-28 to the card ending 4521. Could you confirm if the card is still active and share your bank statement?',
      },
      {
        id: 'm_3',
        authorType: 'admin',
        authorName: 'Sabbir Ahmed',
        createdAt: '2026-05-14 09:05',
        body: 'Following up — still waiting on the bank statement.',
        internal: false,
      },
    ],
  },
  {
    id: 'TKT-2046',
    subject: 'Product page shows wrong price',
    category: 'product',
    priority: 'medium',
    status: 'closed',
    channel: 'chat',
    customerId: 'u_006',
    assigneeId: 'a_003',
    assigneeName: 'Diego Pereira',
    createdAt: '2026-05-03 17:11',
    updatedAt: '2026-05-04 08:22',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Javier Ortiz',
        createdAt: '2026-05-03 17:11',
        body: 'Talavera mug shows MXN 165 in the listing but cart says MXN 195.',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Diego Pereira',
        createdAt: '2026-05-03 18:00',
        body: 'Thanks for the report — the price list was out of date. Fixed and cart now reflects MXN 165.',
      },
      {
        id: 'm_3',
        authorType: 'admin',
        authorName: 'Diego Pereira',
        createdAt: '2026-05-04 08:22',
        body: 'Pricing cache invalidated globally. Closing ticket.',
        internal: true,
      },
    ],
  },
]
