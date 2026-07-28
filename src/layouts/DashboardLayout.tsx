import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'

const currentUser = {
  name: 'Eddie Murphy',
  location: 'Super Admin',
}

export default function DashboardLayout() {
  const navigate = useNavigate()

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