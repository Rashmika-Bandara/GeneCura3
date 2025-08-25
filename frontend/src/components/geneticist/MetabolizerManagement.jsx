

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000/api/v1'

const MetabolizerManagement = () => {
  const [genes, setGenes] = useState([])
  const [metabolizers, setMetabolizers] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    gene_id: '',
    status_label: '',
    notes: ''
  })

  // Fetch all genes on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/genes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setGenes(data.data?.genes || []))
  }, [])

  // Fetch all metabolizer details for all genes
  useEffect(() => {
    const fetchAllMetabolizers = async () => {
      let all = []
      for (const gene of genes) {
        const res = await fetch(`${API_BASE_URL}/genes/${gene.gene_id}`, { credentials: 'include' })
        const data = await res.json()
        if (data.success && data.data?.metabolizerDetails) {
          all = all.concat(data.data.metabolizerDetails.map(md => ({
            ...md,
            gene_name: gene.gene_name
          })))
        }
      }
      setMetabolizers(all)
    }
    if (genes.length) fetchAllMetabolizers()
  }, [genes])

  // Handle add form changes
  const handleAddFormChange = (e) => {
    const { name, value } = e.target
    setAddForm((prev) => ({ ...prev, [name]: value }))
  }

  // Submit add metabolizer detail
  const handleAddReport = async (e) => {
    e.preventDefault()
    if (!addForm.gene_id) {
      alert('Please select a gene')
      return
    }
    if (!addForm.status_label) {
      alert('Please select a metabolizer status')
      return
    }
    // POST to backend
    const res = await fetch(`${API_BASE_URL}/genes/${addForm.gene_id}/metabolizers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status_label: addForm.status_label,
        notes: addForm.notes
      })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setShowAddModal(false)
      setAddForm({ gene_id: '', status_label: '', notes: '' })
      // Refresh metabolizer details
      const geneRes = await fetch(`${API_BASE_URL}/genes/${addForm.gene_id}`, { credentials: 'include' })
      const geneData = await geneRes.json()
      if (geneData.success && geneData.data?.metabolizerDetails) {
        setMetabolizers(prev => [
          ...geneData.data.metabolizerDetails.map(md => ({
            ...md,
            gene_name: genes.find(g => g.gene_id === addForm.gene_id)?.gene_name || addForm.gene_id
          })),
          ...prev.filter(md => md.gene_id !== addForm.gene_id)
        ])
      }
    } else {
      alert(data.message || 'Error adding metabolizer detail')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Metabolizer Reports</h2>
          <p className="text-sm text-gray-600">Add and view metabolizer descriptions by gene</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Metabolizer Report
        </button>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Metabolizer Report</h3>
              <form onSubmit={handleAddReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gene</label>
                  <select
                    name="gene_id"
                    value={addForm.gene_id}
                    onChange={handleAddFormChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select gene</option>
                    {genes.map((gene) => (
                      <option key={gene.gene_id} value={gene.gene_id}>
                        {gene.gene_name} ({gene.gene_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Metabolizer Status</label>
                  <select
                    name="status_label"
                    value={addForm.status_label}
                    onChange={handleAddFormChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="poor">Poor</option>
                    <option value="normal">Normal</option>
                    <option value="rapid">Rapid</option>
                    <option value="ultra-rapid">Ultra-rapid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <textarea
                    name="notes"
                    value={addForm.notes}
                    onChange={handleAddFormChange}
                    className="form-input"
                    rows={3}
                    placeholder="Describe metabolizer details..."
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
      </div>

      {/* Metabolizer Details Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Metabolizer Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metabolizer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gene</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metabolizers.map((md) => (
                <tr key={md.metabolizer_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{md.metabolizer_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{md.gene_name}</div>
                      <div className="text-gray-500">{md.gene_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{md.status_label}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{md.notes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{md.createdAt?.slice(0,10) || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MetabolizerManagement
