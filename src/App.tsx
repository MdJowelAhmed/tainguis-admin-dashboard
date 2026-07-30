import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { message } from 'antd'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import CheckEmail from './pages/auth/CheckEmail'
import SetNewPassword from './pages/auth/SetNewPassword'
import PasswordResetSuccess from './pages/auth/PasswordResetSuccess'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import Users from './pages/dashboard/Users'
import UserDetails from './pages/dashboard/UserDetails'
import Reports from './pages/dashboard/Reports'
import ReportDetails from './pages/dashboard/ReportDetails'
import Orders from './pages/dashboard/Orders'
import OrderDetails from './pages/dashboard/OrderDetails'
import Support from './pages/dashboard/Support'
import SupportTicket from './pages/dashboard/SupportTicket'
import Broadcast from './pages/dashboard/Broadcast'
import Settings from './pages/dashboard/Settings'
import Admins from './pages/dashboard/Admins'
import Revenue from './pages/dashboard/Revenue'
import Notifications from './pages/dashboard/Notifications'
import Live from './pages/dashboard/Live'
import LiveDetails from './pages/dashboard/LiveDetails'
import Categories from './pages/dashboard/Categories'
import CommissionSettings from './pages/dashboard/CommissionSettings'
import { extractErrorMessage } from './utils/errorUtils'

export default function App() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // If error was already handled by RTK Query middleware, skip duplicate toast
      if (event.reason?.name === 'RTKQueryError') return

      const errMsg = extractErrorMessage(event.reason)
      if (errMsg) {
        message.error(errMsg)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/reset-password" element={<SetNewPassword />} />
      <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="live" element={<Live />} />
        <Route path="live/:id" element={<LiveDetails />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:id" element={<ReportDetails />} />
        <Route path="support" element={<Support />} />
        <Route path="support/:id" element={<SupportTicket />} />
        <Route path="broadcast" element={<Broadcast />} />
        <Route path="categories" element={<Categories />} />
        <Route path="commission" element={<CommissionSettings />} />
        <Route path="admins" element={<Admins />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
