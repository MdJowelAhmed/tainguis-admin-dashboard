import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { useGetMyProfileQuery, useLogoutMutation } from '../redux/api/authApi'
import { useAppDispatch } from '../redux/hooks'
import { clearCredentials } from '../redux/slice/authSlice'
import { baseApi } from '../redux/baseApi'
import {
  getFirstPermittedRoute,
  hasRoutePermission,
} from '../utils/permissionUtils'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { data: profileRes, isLoading } = useGetMyProfileQuery()
  const [logout] = useLogoutMutation()

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

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // Ignore API errors during logout
    } finally {
      // Always purge credentials and RTK Query cache memory
      dispatch(clearCredentials())
      dispatch(baseApi.util.resetApiState())
      localStorage.removeItem('resetPasswordToken')
      navigate('/login', { replace: true })
    }
  }

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
      <Sidebar user={currentUser} onLogout={handleLogout} />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}