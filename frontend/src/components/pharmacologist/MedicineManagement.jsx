import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { medicinesAPI } from '../../services/api'

const MedicineManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const navigate = useNavigate();

  // Fetch medicines from backend and return an array of medicines (support both response shapes)
  const { data, isLoading, isError } = useQuery(
    'medicines',
    () => medicinesAPI.getAll().then(res => res.data?.data?.medicines || res.data?.medicines || []),
    {
      retry: false,
      onError: (error) => {
        const message = error?.response?.data?.message || error?.message || 'Failed to load medicines';
        // eslint-disable-next-line no-console
        console.error('Medicines fetch error:', message);
      }
    }
  );

  const medicines = Array.isArray(data) ? data : [];

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.medicine_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Medicine Management</h2>
          <p className="text-sm text-gray-600">Manage pharmaceutical database and drug information</p>
        </div>
        <button
          className="btn-primary mt-4 sm:mt-0"
          onClick={() => navigate('/dashboard/pharmacologist/add-medicine')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Medicines Database</h3>
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading medicines...</div>
        ) : isError ? (
          <div className="p-6 text-center text-red-600">Failed to load medicines.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allergy Risks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.medicine_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{medicine.medicine_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editId === medicine.medicine_id ? (
                        <input
                          name="name"
                          value={editForm?.name ?? medicine.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          className="form-input"
                        />
                      ) : (
                        <div className="font-medium">{medicine.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editId === medicine.medicine_id ? (
                        <input
                          name="purpose"
                          value={editForm?.purpose ?? medicine.purpose}
                          onChange={e => setEditForm(f => ({ ...f, purpose: e.target.value }))}
                          className="form-input"
                        />
                      ) : (
                        <div className="max-w-xs truncate">{medicine.purpose}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editId === medicine.medicine_id ? (
                        <input
                          name="drug_interactions"
                          value={editForm?.drug_interactions ?? medicine.drug_interactions}
                          onChange={e => setEditForm(f => ({ ...f, drug_interactions: e.target.value }))}
                          className="form-input"
                        />
                      ) : (
                        <div className="max-w-xs truncate">{medicine.drug_interactions || 'None known'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editId === medicine.medicine_id ? (
                        <input
                          name="allergy_risks"
                          value={editForm?.allergy_risks ?? medicine.allergy_risks}
                          onChange={e => setEditForm(f => ({ ...f, allergy_risks: e.target.value }))}
                          className="form-input"
                        />
                      ) : (
                        <div className="max-w-xs truncate">{medicine.allergy_risks || 'Standard precautions'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.created_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editId === medicine.medicine_id ? (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={async () => {
                                try {
                                  await medicinesAPI.update(medicine.medicine_id, {
                                    medicine_id: medicine.medicine_id,
                                    ...editForm
                                  })
                                  setEditId(null)
                                  setEditForm({})
                                  window.location.reload()
                                } catch (err) {
                                  alert('Failed to update medicine')
                                }
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => { setEditId(null); setEditForm({}) }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="text-primary-600 hover:text-primary-900"
                              onClick={() => {
                                setEditId(medicine.medicine_id)
                                setEditForm({
                                  name: medicine.name || '',
                                  purpose: medicine.purpose || '',
                                  drug_interactions: medicine.drug_interactions || '',
                                  allergy_risks: medicine.allergy_risks || '',
                                })
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete ${medicine.name}?`)) {
                                  try {
                                    await medicinesAPI.delete(medicine.medicine_id)
                                    window.location.reload()
                                  } catch (err) {
                                    alert('Failed to delete medicine')
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicineManagement
