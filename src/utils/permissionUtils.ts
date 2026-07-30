export const routePermissions: { path: string; permissionKeys: string[] }[] = [
  { path: '/dashboard', permissionKeys: ['dashboard_overview', 'dashboard'] },
  { path: '/dashboard/users', permissionKeys: ['user_management', 'users'] },
  { path: '/dashboard/live', permissionKeys: ['live'] },
  { path: '/dashboard/orders', permissionKeys: ['orders'] },
  { path: '/dashboard/categories', permissionKeys: ['categories'] },
  { path: '/dashboard/revenue', permissionKeys: ['revenue'] },
  { path: '/dashboard/broadcast', permissionKeys: ['broadcast'] },
  { path: '/dashboard/support', permissionKeys: ['support'] },
  { path: '/dashboard/reports', permissionKeys: ['report', 'reports'] },
  { path: '/dashboard/notifications', permissionKeys: ['notifications'] },
  { path: '/dashboard/commission', permissionKeys: ['commission'] },
  { path: '/dashboard/admins', permissionKeys: ['admins'] },
  { path: '/dashboard/settings', permissionKeys: ['settings'] },
]

export function hasRoutePermission(
  pathname: string,
  permissions?: string[],
  isSuperAdmin?: boolean,
): boolean {
  if (isSuperAdmin) return true
  if (!permissions || !Array.isArray(permissions)) return true

  // Normalize path (exact match or sub-routes like /dashboard/users/123)
  let routeConfig = routePermissions.find((r) => r.path === pathname)
  if (!routeConfig) {
    routeConfig = routePermissions.find(
      (r) => r.path !== '/dashboard' && pathname.startsWith(r.path),
    )
  }

  // If route is not in permission map (e.g. unknown route), allow by default
  if (!routeConfig) return true

  return routeConfig.permissionKeys.some((pKey) => permissions.includes(pKey))
}

export function getFirstPermittedRoute(
  permissions?: string[],
  isSuperAdmin?: boolean,
): string {
  if (isSuperAdmin || !permissions || !Array.isArray(permissions)) {
    return '/dashboard'
  }

  for (const item of routePermissions) {
    if (item.permissionKeys.some((pKey) => permissions.includes(pKey))) {
      return item.path
    }
  }

  return '/dashboard'
}
