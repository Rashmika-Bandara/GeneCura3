import { Routes, Route, Navigate } from 'react-router-dom'
import { Shield, FileCheck, Users, BarChart3 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AdminReports from '../../components/admin/AdminReports'
import AdminDashboardHome from '../../components/admin/AdminDashboardHome'

const AdminDashboard = () => {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Report Reviews', href: '/admin/reports', icon: FileCheck },
    { name: 'User Management', href: '/admin/users', icon: Users },
  ]

  return (
    <DashboardLayout
      navigation={navigation}
      title="Administrative Portal"
      icon={Shield}
    >
      <Routes>
        <Route index element={<AdminDashboardHome />} />
        <Route path="reports/*" element={<AdminReports />} />
        <Route path="users" element={<div>User Management - Coming Soon</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default AdminDashboard
