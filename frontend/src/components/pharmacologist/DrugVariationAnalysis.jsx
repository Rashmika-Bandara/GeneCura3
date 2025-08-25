import { useState } from 'react'
import { TrendingUp, Calendar, User, Edit, Plus, Trash2 } from 'lucide-react'

const DrugVariationAnalysis = () => {
  const [selectedMedicine, setSelectedMedicine] = useState('MED001')

  // Placeholder data - would come from API
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Drug Variation Analysis</h2>
          <p className="text-sm text-gray-600">Track changes and variations in drug information over time</p>
        </div>
      </div>

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

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Changes</p>
              <p className="text-2xl font-semibold text-gray-900">{auditHistory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Contributors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(auditHistory.map(h => h.actor_id)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {auditHistory[0]?.timestamp.split(' ')[0] || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Change History - {selectedMedicineName}
          </h3>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {auditHistory.map((item, itemIdx) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {itemIdx !== auditHistory.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          item.action === 'CREATE' ? 'bg-green-500' :
                          item.action === 'UPDATE' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}>
                          {getActionIcon(item.action)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(item.action)}`}>
                              {item.action}
                            </span>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{item.actor_name}</span>
                              {' '}
                              {item.action.toLowerCase()}d field{' '}
                              <span className="font-medium">{item.field}</span>
                            </p>
                          </div>
                          {item.action !== 'CREATE' && (
                            <div className="mt-2 text-sm text-gray-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="font-medium text-red-600">Before:</span>
                                  <p className="bg-red-50 p-2 rounded border border-red-200 mt-1">
                                    {item.before || 'No previous value'}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-green-600">After:</span>
                                  <p className="bg-green-50 p-2 rounded border border-green-200 mt-1">
                                    {item.after}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {item.reason && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">Reason:</span>
                              <p className="text-sm text-gray-600 italic">{item.reason}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={item.timestamp}>
                            {new Date(item.timestamp).toLocaleDateString()}
                            <br />
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrugVariationAnalysis
