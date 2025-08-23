import { useState } from 'react'
import { Plus, Search } from 'lucide-react'

const PrescriptionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Placeholder data - would come from API
  const prescriptions = [
    {
      id: 'PRESC001',
      patient_id: 'PAT001',
      patient_name: 'John Doe',
      medicine_id: 'MED001',
      medicine_name: 'Aspirin',
      special_notes: 'Take with food',
      created_date: '2025-01-15'
    },
    {
      id: 'PRESC002',
      patient_id: 'PAT002',
      patient_name: 'Jane Smith',
      medicine_id: 'MED002',
      medicine_name: 'Lisinopril',
      special_notes: 'Monitor blood pressure',
      created_date: '2025-01-14'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Prescription Management</h2>
          <p className="text-sm text-gray-600">Manage patient prescriptions and medication notes</p>
        </div>
        <button className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </button>
      </div>

      {/* Search 
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search prescriptions..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>*/}

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Prescriptions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {prescription.patient_name}
                      </h4>
                      <p className="text-sm text-gray-500">Patient ID: {prescription.patient_id}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {prescription.medicine_name}
                      </h4>
                      <p className="text-sm text-gray-500">Medicine ID: {prescription.medicine_id}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {prescription.special_notes}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {prescription.created_date}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
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

export default PrescriptionManagement
