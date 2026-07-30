export type AdminPermission =
  | 'dashboard_overview'
  | 'user_management'
  | 'orders'
  | 'broadcast'
  | 'report'
  | 'settings'
  | 'support'

export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'support_agent'
  | 'support'
  | 'custom'

export type AdminStatus = 'active' | 'suspended'

export type AdminAccount = {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role: AdminRole
  permissions: AdminPermission[]
  status: AdminStatus
  createdAt: string
  lastActiveAt?: string
}

export const permissionLabels: Record<AdminPermission, string> = {
  dashboard_overview: 'Dashboard Overview',
  user_management: 'User Management',
  orders: 'Orders',
  broadcast: 'Broadcast',
  report: 'Report',
  settings: 'Settings',
  support: 'Support',
}

export const permissionDescriptions: Record<AdminPermission, string> = {
  dashboard_overview: 'View the home dashboard and key metrics',
  user_management: 'Manage customer and staff accounts',
  orders: 'View, update status, refund, and cancel orders',
  broadcast: 'Send announcements and notifications to users',
  report: 'Review and act on user reports',
  settings: 'Change account settings and platform configuration',
  support: 'Respond to customer support tickets',
}

export const allPermissions: AdminPermission[] = [
  'dashboard_overview',
  'user_management',
  'orders',
  'broadcast',
  'report',
  'settings',
  'support',
]

export const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  support_agent: 'Support agent',
  support: 'Support agent',
  custom: 'Custom',
}

export const rolePresets: Record<AdminRole, AdminPermission[]> = {
  super_admin: allPermissions,
  admin: ['user_management', 'orders', 'support', 'report', 'broadcast', 'settings'],
  manager: ['user_management', 'orders', 'support', 'report', 'broadcast'],
  support_agent: ['support', 'user_management'],
  support: ['support', 'user_management'],
  custom: [],
}

export const initialAdmins: AdminAccount[] = [
  {
    id: 'ad_001',
    name: 'Super Admin',
    email: 'admin@tianguislive.com',
    phone: '+1 (555) 123-4567',
    role: 'super_admin',
    permissions: allPermissions,
    status: 'active',
    createdAt: '2024-01-12',
    lastActiveAt: '2026-05-17 09:42',
  },
  {
    id: 'ad_002',
    name: 'Renata Salinas',
    email: 'renata@tianguislive.com',
    phone: '+52 55 9090 1212',
    role: 'manager',
    permissions: rolePresets.manager,
    status: 'active',
    createdAt: '2025-03-04',
    lastActiveAt: '2026-05-16 18:20',
  },
  {
    id: 'ad_003',
    name: 'Diego Pereira',
    email: 'diego@tianguislive.com',
    role: 'support',
    permissions: rolePresets.support,
    status: 'active',
    createdAt: '2025-08-19',
    lastActiveAt: '2026-05-15 14:05',
  },
  {
    id: 'ad_004',
    name: 'Lucía Méndez',
    email: 'lucia.m@tianguislive.com',
    role: 'custom',
    permissions: ['dashboard_overview', 'orders', 'report'],
    status: 'suspended',
    createdAt: '2025-11-02',
    lastActiveAt: '2026-04-30 11:11',
  },
]
