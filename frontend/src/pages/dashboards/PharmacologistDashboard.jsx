import { Routes, Route, Navigate } from 'react-router-dom'
import { Pill, TrendingUp, FileText, BarChart3 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DashboardHome from '../../components/dashboard/DashboardHome'
import AddMedicine from '../../components/pharmacologist/AddMedicine'
import MedicineManagement from '../../components/pharmacologist/MedicineManagement'
import DrugVariationAnalysis from '../../components/pharmacologist/DrugVariationAnalysis'
import ReportManagement from '../../components/common/ReportManagement'
import TreatmentAnalysis from '../../components/common/TreatmentAnalysis'

const PharmacologistDashboard = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/pharmacologist', icon: BarChart3 },
    { name: 'Medicines', href: '/dashboard/pharmacologist/medicines', icon: Pill },
    { name: 'Drug Variation Analysis', href: '/dashboard/pharmacologist/drug-analysis', icon: TrendingUp },
    { name: 'Reports', href: '/dashboard/pharmacologist/reports', icon: FileText },
    { name: 'Treatment Analysis', href: '/dashboard/pharmacologist/treatment-analysis', icon: BarChart3 },
  ]

  const dashboardCards = [
    {
      title: 'Total Medicines',
      value: '789',
      change: '+24%',
      changeType: 'increase',
      icon: Pill,
      color: 'purple'
    },
    {
      title: 'Drug Interactions',
      value: '156',
      change: '+8%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Reports Submitted',
      value: '45',
      change: '+18%',
      changeType: 'increase',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Approved Reports',
      value: '41',
      change: '+15%',
      changeType: 'increase',
      icon: FileText,
      color: 'orange'
    }
  ]

  return (
    <DashboardLayout
      navigation={navigation}
      title="Clinical Pharmacologist Portal"
      icon={Pill}
    >
      <Routes>
        <Route index element={<DashboardHome cards={dashboardCards} role="pharmacologist" />} />
        <Route path="medicines/*" element={<MedicineManagement />} />
        <Route path="add-medicine" element={<AddMedicine />} />
        <Route path="drug-analysis" element={<DrugVariationAnalysis />} />
        <Route path="reports/*" element={<ReportManagement role="pharmacologist" />} />
        <Route path="treatment-analysis" element={<TreatmentAnalysis />} />
        <Route path="*" element={<Navigate to="/dashboard/pharmacologist" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default PharmacologistDashboard
