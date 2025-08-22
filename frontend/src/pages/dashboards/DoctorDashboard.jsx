import { Routes, Route, Navigate } from 'react-router-dom'
import { Stethoscope, Users, FileText, Pill, BarChart3 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DashboardHome from '../../components/dashboard/DashboardHome'
import PatientManagement from '../../components/doctor/PatientManagement'
import PrescriptionManagement from '../../components/doctor/PrescriptionManagement'
import ReportManagement from '../../components/common/ReportManagement'
import TreatmentAnalysis from '../../components/common/TreatmentAnalysis'

const DoctorDashboard = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/doctor', icon: BarChart3 },
    { name: 'Patients', href: '/dashboard/doctor/patients', icon: Users },
    { name: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: Pill },
    { name: 'Reports', href: '/dashboard/doctor/reports', icon: FileText },
    { name: 'Treatment Analysis', href: '/dashboard/doctor/treatment-analysis', icon: BarChart3 },
  ]

  const dashboardCards = [
    {
      title: 'Total Patients',
      value: '156',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Prescriptions',
      value: '89',
      change: '+5%',
      changeType: 'increase',
      icon: Pill,
      color: 'green'
    },
    {
      title: 'Reports Submitted',
      value: '23',
      change: '+8%',
      changeType: 'increase',
      icon: FileText,
      color: 'purple'
    },
    {
      title: 'Approved Reports',
      value: '18',
      change: '+2%',
      changeType: 'increase',
      icon: FileText,
      color: 'orange'
    }
  ]

  return (
    <DashboardLayout
      navigation={navigation}
      title="Doctor Portal"
      icon={Stethoscope}
    >
      <Routes>
        <Route index element={<DashboardHome cards={dashboardCards} role="doctor" />} />
        <Route path="patients/*" element={<PatientManagement />} />
        <Route path="prescriptions/*" element={<PrescriptionManagement />} />
        <Route path="reports/*" element={<ReportManagement role="doctor" />} />
        <Route path="treatment-analysis" element={<TreatmentAnalysis />} />
        <Route path="*" element={<Navigate to="/dashboard/doctor" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default DoctorDashboard
