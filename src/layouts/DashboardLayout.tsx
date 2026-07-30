import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { useGetMyProfileQuery } from '../redux/api/authApi'
import {
  getFirstPermittedRoute,
  hasRoutePermission,
} from '../utils/permissionUtils'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: profileRes, isLoading } = useGetMyProfileQuery()

  const profile = profileRes?.data
  const isSuperAdmin = profile?.role === 'super_admin'
  const permissions = profile?.admin?.permissions

  useEffect(() => {
    if (isLoading || !profile) return

    const canAccessCurrent = hasRoutePermission(
      location.pathname,
      permissions,
      isSuperAdmin,
    )

    if (!canAccessCurrent) {
      const target = getFirstPermittedRoute(permissions, isSuperAdmin)
      navigate(target, { replace: true })
    }
  }, [isLoading, profile, permissions, isSuperAdmin, location.pathname, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-page">
        <Spin size="large" />
      </div>
    )
  }

  const currentUser = {
    name: profile?.name ?? 'Admin',
    location: profile?.role ? profile.role.replace(/_/g, ' ').toUpperCase() : 'Staff',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page text-gray-900">
      <Sidebar user={currentUser} onLogout={() => navigate('/login')} />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}