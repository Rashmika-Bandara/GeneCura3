import { Routes, Route, Navigate } from 'react-router-dom'
import { Dna, TestTube, FileText, BarChart3 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DashboardHome from '../../components/dashboard/DashboardHome'
import GeneManagement from '../../components/geneticist/GeneManagement'
import MetabolizerManagement from '../../components/geneticist/MetabolizerManagement'
import ReportManagement from '../../components/common/ReportManagement'
import TreatmentAnalysis from '../../components/common/TreatmentAnalysis'

const GeneticistDashboard = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/geneticist', icon: BarChart3 },
    { name: 'Genes', href: '/dashboard/geneticist/genes', icon: Dna },
    { name: 'Metabolizer Details', href: '/dashboard/geneticist/metabolizers', icon: TestTube },
    { name: 'Reports', href: '/dashboard/geneticist/reports', icon: FileText },
    { name: 'Treatment Analysis', href: '/dashboard/geneticist/treatment-analysis', icon: BarChart3 },
  ]

  const dashboardCards = [
    {
      title: 'Total Genes',
      value: '342',
      change: '+18%',
      changeType: 'increase',
      icon: Dna,
      color: 'green'
    },
    {
      title: 'Metabolizer Records',
      value: '127',
      change: '+15%',
      changeType: 'increase',
      icon: TestTube,
      color: 'blue'
    },
    {
      title: 'Reports Submitted',
      value: '31',
      change: '+22%',
      changeType: 'increase',
      icon: FileText,
      color: 'purple'
    },
    {
      title: 'Approved Reports',
      value: '28',
      change: '+12%',
      changeType: 'increase',
      icon: FileText,
      color: 'orange'
    }
  ]

  return (
    <DashboardLayout
      navigation={navigation}
      title="Clinical Geneticist Portal"
      icon={Dna}
    >
      <Routes>
        <Route index element={<DashboardHome cards={dashboardCards} role="geneticist" />} />
        <Route path="genes/*" element={<GeneManagement />} />
        <Route path="metabolizers/*" element={<MetabolizerManagement />} />
        <Route path="reports/*" element={<ReportManagement role="geneticist" />} />
        <Route path="treatment-analysis" element={<TreatmentAnalysis />} />
        <Route path="*" element={<Navigate to="/dashboard/geneticist" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default GeneticistDashboard
