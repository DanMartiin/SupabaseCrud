import { AdminDashboard } from '@/components/AdminDashboard'
import { AdminRoute } from '@/components/auth/AdminRoute'

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  )
}



