import { useState } from 'react'
import { Plus, Search, TestTube } from 'lucide-react'

const MetabolizerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGene, setSelectedGene] = useState('')

  const [metabolizers, setMetabolizers] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    gene_id: '',
    status_label: 'normal',
    notes: ''
  })

  // Handle add form changes
  const handleAddFormChange = (e) => {
    const { name, value } = e.target
    setAddForm((prev) => ({ ...prev, [name]: value }))
  }

  // Submit add metabolizer (frontend only)
  const handleAddMetabolizer = (e) => {
    e.preventDefault()
    if (!addForm.gene_id) {
      alert('Please select a gene')
      return
    }
    // Find gene name for display
    const geneObj = genes.find(g => g.gene_id === addForm.gene_id)
    const newMetabolizer = {
      id: `MET${Date.now()}`,
      gene_id: addForm.gene_id,
      gene_name: geneObj ? geneObj.gene_name : addForm.gene_id,
      status_label: addForm.status_label,
      notes: addForm.notes,
      created_date: new Date().toISOString().slice(0, 10)
    }
    setMetabolizers(prev => [newMetabolizer, ...prev])
    setShowAddModal(false)
    setAddForm({ gene_id: '', status_label: 'normal', notes: '' })
  }

  const genes = [
    { gene_id: 'GENE001', gene_name: 'CYP2D6' },
    { gene_id: 'GENE002', gene_name: 'BRCA1' },
    { gene_id: 'GENE003', gene_name: 'CYP3A4' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'poor':
        return 'bg-red-100 text-red-800'
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'rapid':
        return 'bg-blue-100 text-blue-800'
      case 'ultra-rapid':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMetabolizers = metabolizers.filter(metabolizer => {
    const matchesSearch = metabolizer.gene_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metabolizer.gene_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metabolizer.status_label.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGene = selectedGene === '' || metabolizer.gene_id === selectedGene
    return matchesSearch && matchesGene
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Metabolizer Details</h2>
          <p className="text-sm text-gray-600">Manage metabolizer status and genetic variations</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Metabolizer Detail
        </button>
      {/* Add Metabolizer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Metabolizer Detail</h3>
            <form onSubmit={handleAddMetabolizer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gene</label>
                <select name="gene_id" value={addForm.gene_id} onChange={handleAddFormChange} className="form-select" required>
                  <option value="">Select gene</option>
                  {genes.map((gene) => (
                    <option key={gene.gene_id} value={gene.gene_id}>{gene.gene_name} ({gene.gene_id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status_label" value={addForm.status_label} onChange={handleAddFormChange} className="form-select">
                  <option value="poor">Poor</option>
                  <option value="normal">Normal</option>
                  <option value="rapid">Rapid</option>
                  <option value="ultra-rapid">Ultra-rapid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea name="notes" value={addForm.notes} onChange={handleAddFormChange} className="form-input" rows={3} />
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search metabolizers..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="form-select"
              value={selectedGene}
              onChange={(e) => setSelectedGene(e.target.value)}
            >
              <option value="">All Genes</option>
              {genes.map((gene) => (
                <option key={gene.gene_id} value={gene.gene_id}>
                  {gene.gene_name} ({gene.gene_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metabolizer Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['poor', 'normal', 'rapid', 'ultra-rapid'].map((status) => {
          const count = metabolizers.filter(m => m.status_label === status).length
          return (
            <div key={status} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <TestTube className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 capitalize">{status} Metabolizers</p>
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Metabolizers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Metabolizer Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gene
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMetabolizers.map((metabolizer) => (
                <tr key={metabolizer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{metabolizer.gene_name}</div>
                      <div className="text-gray-500">{metabolizer.gene_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(metabolizer.status_label)}`}>
                      {metabolizer.status_label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">
                      {metabolizer.notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metabolizer.created_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        View
                      </button>
                     
                    </div>
                  </td>
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
