import { useState } from 'react'
import { Plus, Search, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'

const ReportManagement = ({ role }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Placeholder data - would come from API
  const reports = [
    {
      id: 'RPT001',
      title: 'Genetic Analysis Report - Patient PAT001',
      description: 'Comprehensive genetic analysis for drug response',
      status: 'approved',
      created_date: '2025-01-15',
      approved_date: '2025-01-16'
    },
    {
      id: 'RPT002',
      title: 'Treatment Efficacy Study',
      description: 'Analysis of treatment outcomes for cardiac patients',
      status: 'pending',
      created_date: '2025-01-14',
      approved_date: null
    },
    {
      id: 'RPT003',
      title: 'Drug Interaction Analysis',
      description: 'Comprehensive drug interaction study results',
      status: 'rejected',
      created_date: '2025-01-13',
      approved_date: '2025-01-14'
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

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Report Management</h2>
          <p className="text-sm text-gray-600">Create and manage your research reports</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Upload Report
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
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
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h4 className="text-lg font-medium text-gray-900">
                      {report.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <span>Created: {report.created_date}</span>
                    {report.approved_date && (
                      <span>
                        {report.status === 'approved' ? 'Approved' : 'Reviewed'}: {report.approved_date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-900 text-sm">
                    View
                  </button>
                  <button className="text-primary-600 hover:text-primary-900 text-sm">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportManagement
