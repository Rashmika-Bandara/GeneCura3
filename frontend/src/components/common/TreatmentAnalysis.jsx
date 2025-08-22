import { useState } from 'react'
import { Download, Filter, BarChart3 } from 'lucide-react'

const TreatmentAnalysis = () => {
  const [filters, setFilters] = useState({
    gene_id: '',
    medicine_id: '',
    effectiveness_min: '',
    patient_age_max: '',
    patient_gender: ''
  })

  // Placeholder data - would come from API
  const treatmentCases = [
    {
      case_id: 'CASE001',
      gene_id: 'GENE001',
      gene_name: 'CYP2D6',
      medicine_id: 'MED001',
      medicine_name: 'Codeine',
      doctor_id: 'DOC001',
      pharmacologist_id: 'PHARM001',
      geneticist_id: 'GEN001',
      effectiveness: 85,
      treatment_time: 14,
      patient_gender: 'female',
      patient_age: 45
    },
    {
      case_id: 'CASE002',
      gene_id: 'GENE002',
      gene_name: 'BRCA1',
      medicine_id: 'MED002',
      medicine_name: 'Tamoxifen',
      doctor_id: 'DOC002',
      pharmacologist_id: 'PHARM001',
      geneticist_id: 'GEN002',
      effectiveness: 92,
      treatment_time: 21,
      patient_gender: 'female',
      patient_age: 52
    },
    {
      case_id: 'CASE003',
      gene_id: 'GENE001',
      gene_name: 'CYP2D6',
      medicine_id: 'MED003',
      medicine_name: 'Metoprolol',
      doctor_id: 'DOC001',
      pharmacologist_id: 'PHARM002',
      geneticist_id: 'GEN001',
      effectiveness: 78,
      treatment_time: 28,
      patient_gender: 'male',
      patient_age: 38
    }
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const filteredCases = treatmentCases.filter(case_ => {
    return (
      (filters.gene_id === '' || case_.gene_id.includes(filters.gene_id)) &&
      (filters.medicine_id === '' || case_.medicine_id.includes(filters.medicine_id)) &&
      (filters.effectiveness_min === '' || case_.effectiveness >= parseInt(filters.effectiveness_min)) &&
      (filters.patient_age_max === '' || case_.patient_age <= parseInt(filters.patient_age_max)) &&
      (filters.patient_gender === '' || case_.patient_gender === filters.patient_gender)
    )
  })

  const handleExportCSV = () => {
    // In a real app, this would call the API to export data
    console.log('Exporting CSV with filters:', filters)
    alert('CSV export functionality would be implemented here')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Treatment Analysis</h2>
          <p className="text-sm text-gray-600">Analyze treatment effectiveness across genetic profiles</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-secondary mt-4 sm:mt-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gene ID
            </label>
            <input
              type="text"
              placeholder="e.g., GENE001"
              className="form-input"
              value={filters.gene_id}
              onChange={(e) => handleFilterChange('gene_id', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine ID
            </label>
            <input
              type="text"
              placeholder="e.g., MED001"
              className="form-input"
              value={filters.medicine_id}
              onChange={(e) => handleFilterChange('medicine_id', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Effectiveness (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              className="form-input"
              value={filters.effectiveness_min}
              onChange={(e) => handleFilterChange('effectiveness_min', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Patient Age
            </label>
            <input
              type="number"
              min="0"
              max="120"
              placeholder="120"
              className="form-input"
              value={filters.patient_age_max}
              onChange={(e) => handleFilterChange('patient_age_max', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Gender
            </label>
            <select
              className="form-select"
              value={filters.patient_gender}
              onChange={(e) => handleFilterChange('patient_gender', e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Cases</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredCases.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Effectiveness</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredCases.length > 0 
                  ? Math.round(filteredCases.reduce((sum, case_) => sum + case_.effectiveness, 0) / filteredCases.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Treatment Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredCases.length > 0 
                  ? Math.round(filteredCases.reduce((sum, case_) => sum + case_.treatment_time, 0) / filteredCases.length)
                  : 0} days
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unique Genes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(filteredCases.map(case_ => case_.gene_id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Treatment Cases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gene
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effectiveness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Treatment Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.map((case_) => (
                <tr key={case_.case_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {case_.case_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{case_.gene_name}</div>
                      <div className="text-gray-500">{case_.gene_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{case_.medicine_name}</div>
                      <div className="text-gray-500">{case_.medicine_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${case_.effectiveness}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{case_.effectiveness}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {case_.treatment_time} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="capitalize">{case_.patient_gender}</div>
                      <div className="text-gray-500">{case_.patient_age} years</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>Dr: {case_.doctor_id}</div>
                      <div>Ph: {case_.pharmacologist_id}</div>
                      <div>Gn: {case_.geneticist_id}</div>
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

export default TreatmentAnalysis
