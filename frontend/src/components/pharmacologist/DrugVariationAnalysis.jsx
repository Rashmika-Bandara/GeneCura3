import { useState, useEffect } from 'react'
import { TrendingUp, Plus, Eye } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000/api/v1'

const MedicineVariationAnalysis = () => {
  const [selectedMedicine, setSelectedMedicine] = useState('')
  const [medicines, setMedicines] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportsError, setReportsError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ medicine_id: '', description: '' })
  const [successMsg, setSuccessMsg] = useState('')
  const [viewReport, setViewReport] = useState(null)

  const handleAddFormChange = (e) => {
    const { name, value } = e.target
    setAddForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddReport = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    if (!addForm.medicine_id) {
      alert('Please select a medicine')
      return
    }
    if (!addForm.description.trim()) {
      alert('Please enter a description')
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/variation-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          medicine_id: addForm.medicine_id,
          description: addForm.description
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setShowAddModal(false)
        setSuccessMsg('Report added successfully!')
        setAddForm({ medicine_id: '', description: '' })
        if (addForm.medicine_id === selectedMedicine) {
          setReports(prev => [data.data.report, ...prev])
        }
      } else {
        alert(data.message || 'Error adding analysis report')
      }
    } catch (err) {
      alert('Failed to add analysis report')
    }
  }

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`${API_BASE_URL}/medicines`, { credentials: 'include' })
        if (res.status === 401) {
          setError('Unauthorized. Please login as a pharmacologist.')
          setLoading(false)
          return
        }
        const data = await res.json()
        setMedicines(data.data?.medicines || [])
        setSelectedMedicine(data.data?.medicines?.[0]?.medicine_id || '')
        setLoading(false)
      } catch (err) {
        setError('Failed to load medicines')
        setLoading(false)
      }
    }
    fetchMedicines()
  }, [])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setReportsLoading(true)
        setReportsError('')
        const res = await fetch(`${API_BASE_URL}/variation-analysis`, { credentials: 'include' })
        if (res.status === 401) {
          setReportsError('Unauthorized. Please login as a pharmacologist.')
          setReportsLoading(false)
          return
        }
        const data = await res.json()
        setReports(Array.isArray(data.data?.reports) ? data.data.reports : [])
        setReportsLoading(false)
      } catch (err) {
        setReportsError('Failed to load reports')
        setReportsLoading(false)
      }
    }
    fetchReports()
  }, [selectedMedicine, showAddModal])

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading medicines...</div>
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Medicine Variation Analysis</h2>
          <p className="text-sm text-gray-600">Add and view variation analysis reports for medicines</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Report
        </button>
      </div>

      {/* Add Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Variation Analysis Report</h3>
            <form onSubmit={handleAddReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Medicine</label>
                <select
                  name="medicine_id"
                  value={addForm.medicine_id}
                  onChange={handleAddFormChange}
                  className="form-select"
                  required
                >
                  <option value="">Select medicine</option>
                  {medicines.map((medicine) => (
                    <option key={medicine.medicine_id} value={medicine.medicine_id}>
                      {medicine.name} ({medicine.medicine_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={addForm.description}
                  onChange={handleAddFormChange}
                  className="form-input"
                  rows={3}
                  placeholder="Describe the analysis..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-center">
          {successMsg}
        </div>
      )}

      {/* Medicine Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Select Medicine</h3>
        </div>
        <div className="max-w-md">
          <select
            className="form-select"
            value={selectedMedicine}
            onChange={(e) => setSelectedMedicine(e.target.value)}
          >
            {medicines.map((medicine) => (
              <option key={medicine.medicine_id} value={medicine.medicine_id}>
                {medicine.name} ({medicine.medicine_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Variation Analysis Reports</h3>
        {reportsLoading ? (
          <div className="text-gray-500">Loading reports...</div>
        ) : reportsError ? (
          <div className="text-red-600">{reportsError}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(reports) && reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.analysis_report_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.analysis_report_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.medicine_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{report.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.createdAt?.slice(0,10) || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="btn-secondary flex items-center"
                        onClick={() => setViewReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View Report Modal */}
      {viewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">View Variation Analysis Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Report ID</label>
                <div className="text-gray-900">{viewReport.analysis_report_id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medicine ID</label>
                <div className="text-gray-900">{viewReport.medicine_id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <div className="text-gray-900">{viewReport.description}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Created At</label>
                <div className="text-gray-900">{viewReport.createdAt?.slice(0,10) || '-'}</div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn-secondary" onClick={() => setViewReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineVariationAnalysis
