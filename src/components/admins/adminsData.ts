export type AdminPermission =
  | 'dashboard'
  | 'users'
  | 'orders'
  | 'broadcast'
  | 'support'
  | 'reports'
  | 'settings'
  | 'admins'

export type AdminRole = 'super_admin' | 'manager' | 'support' | 'custom'

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
  dashboard: 'Dashboard',
  users: 'Users',
  orders: 'Orders',
  broadcast: 'Broadcast',
  support: 'Support',
  reports: 'Reports',
  settings: 'Settings',
  admins: 'Admin management',
}

export const permissionDescriptions: Record<AdminPermission, string> = {
  dashboard: 'View the home dashboard and key metrics',
  users: 'Manage customer accounts, edit profiles, ban or restrict',
  orders: 'View, update status, refund, and cancel orders',
  broadcast: 'Send announcements and notifications to users',
  support: 'Respond to customer support tickets',
  reports: 'Review and act on user reports',
  settings: 'Change account settings and platform configuration',
  admins: 'Create, edit, and remove admin accounts',
}

export const allPermissions: AdminPermission[] = [
  'dashboard',
  'users',
  'orders',
  'broadcast',
  'support',
  'reports',
  'settings',
  'admins',
]

export const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  support: 'Support agent',
  custom: 'Custom',
}

export const rolePresets: Record<AdminRole, AdminPermission[]> = {
  super_admin: allPermissions,
  manager: ['dashboard', 'users', 'orders', 'support', 'reports', 'broadcast'],
  support: ['dashboard', 'support', 'users'],
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
    permissions: ['dashboard', 'orders', 'reports'],
    status: 'suspended',
    createdAt: '2025-11-02',
    lastActiveAt: '2026-04-30 11:11',
  },
]
