import { useState } from 'react'
import { FileCheck, CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react'

const AdminReports = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  // Placeholder data - would come from API
  const reports = [
    {
      id: 'RPT001',
      title: 'Genetic Analysis Report - CYP2D6 Variants',
      description: 'Comprehensive analysis of CYP2D6 genetic variants and drug metabolism',
      owner_role: 'geneticist',
      owner_name: 'Dr. Sarah Johnson',
      status: 'pending',
      submitted_date: '2025-01-15',
      pdf_file: 'genetic_analysis_001.pdf'
    },
    {
      id: 'RPT002',
      title: 'Drug Interaction Study - Warfarin',
      description: 'Analysis of warfarin interactions with genetic polymorphisms',
      owner_role: 'pharmacologist',
      owner_name: 'Dr. Michael Chen',
      status: 'pending',
      submitted_date: '2025-01-14',
      pdf_file: 'drug_interaction_002.pdf'
    },
    {
      id: 'RPT003',
      title: 'Patient Treatment Outcomes Study',
      description: 'Retrospective analysis of treatment outcomes in cardiac patients',
      owner_role: 'doctor',
      owner_name: 'Dr. Emily Rodriguez',
      status: 'approved',
      submitted_date: '2025-01-13',
      approved_date: '2025-01-14',
      final_decision: 'Excellent comprehensive study with solid methodology. Approved for publication.',
      pdf_file: 'treatment_outcomes_003.pdf'
    },
    {
      id: 'RPT004',
      title: 'Pharmacogenomics in Pediatric Care',
      description: 'Analysis of genetic factors in pediatric drug dosing',
      owner_role: 'geneticist',
      owner_name: 'Dr. James Wilson',
      status: 'rejected',
      submitted_date: '2025-01-12',
      approved_date: '2025-01-13',
      final_decision: 'Study requires additional controls and larger sample size. Please revise and resubmit.',
      pdf_file: 'pediatric_pharma_004.pdf'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800'
      case 'geneticist':
        return 'bg-green-100 text-green-800'
      case 'pharmacologist':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === '' || report.status === statusFilter
    const matchesRole = roleFilter === '' || report.owner_role === roleFilter
    return matchesStatus && matchesRole
  })

  const pendingCount = reports.filter(r => r.status === 'pending').length
  const approvedCount = reports.filter(r => r.status === 'approved').length
  const rejectedCount = reports.filter(r => r.status === 'rejected').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Report Reviews</h2>
          <p className="text-sm text-gray-600">Review and approve submitted reports from users</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="geneticist">Geneticists</option>
              <option value="pharmacologist">Pharmacologists</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reports for Review</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {report.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(report.owner_role)}`}>
                        {report.owner_role}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span>Submitted by: <span className="font-medium text-gray-900">{report.owner_name}</span></span>
                    <span>Date: {report.submitted_date}</span>
                    {report.approved_date && (
                      <span>Reviewed: {report.approved_date}</span>
                    )}
                  </div>

                  {report.final_decision && (
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Administrative Decision:</p>
                          <p className="text-sm text-gray-600 mt-1">{report.final_decision}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button className="btn-secondary flex items-center text-sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View PDF
                  </button>
                  {report.status === 'pending' && (
                    <>
                      <button className="btn-primary text-sm">
                        Review
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminReports
