import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react'
import { patientsAPI } from '../../services/api'
import DataTable from '../DataTable'
import PatientForm from './PatientForm'
import PatientDetails from './PatientDetails'
import LoadingSpinner from '../LoadingSpinner'
import toast from 'react-hot-toast'

const PatientList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState({})

  const { data: patients, isLoading, error } = useQuery(
    ['patients', searchParams],
    () => patientsAPI.getAll(searchParams),
    {
      select: (response) => response.data.patients || [],
      onError: (error) => {
        toast.error('Failed to load patients')
      }
    }
  )

  const deleteMutation = useMutation(patientsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('patients')
      toast.success('Patient deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete patient')
    }
  })

  const handleDelete = async (patient) => {
    if (window.confirm(`Are you sure you want to delete patient ${patient.patient_name}?`)) {
      deleteMutation.mutate(patient.patient_id)
    }
  }

  const columns = [
    {
      key: 'patient_id',
      title: 'Patient ID',
      sortable: true
    },
    {
      key: 'patient_name',
      title: 'Name',
      sortable: true
    },
    {
      key: 'gender',
      title: 'Gender',
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    {
      key: 'mobile_number',
      title: 'Mobile',
      render: (value) => value || '-'
    },
    {
      key: 'health_condition',
      title: 'Health Condition',
      render: (value) => value || '-'
    },
    {
      key: 'gene_name',
      title: 'Associated Gene',
      render: (value) => value || '-'
    },
    {
      key: 'medicine_name',
      title: 'Associated Medicine',
      render: (value) => value || '-'
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Patient Management</h2>
          <p className="text-sm text-gray-600">Manage patient records and medical information</p>
        </div>
        <button
          onClick={() => navigate('new')}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name or ID
            </label>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="form-input pl-10"
                onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              className="form-select"
              onChange={(e) => setSearchParams({ ...searchParams, gender: e.target.value })}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Health Condition
            </label>
            <input
              type="text"
              placeholder="Filter by condition..."
              className="form-input"
              onChange={(e) => setSearchParams({ ...searchParams, health_condition: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={patients || []}
        loading={isLoading}
        onView={(patient) => navigate(`${patient.patient_id}`)}
        onEdit={(patient) => navigate(`${patient.patient_id}/edit`)}
        onDelete={handleDelete}
        searchable={false} // We have custom search
      />
    </div>
  )
}

const PatientManagement = () => {
  return (
    <Routes>
      <Route index element={<PatientList />} />
      <Route path="new" element={<PatientForm />} />
      <Route path=":id" element={<PatientDetails />} />
      <Route path=":id/edit" element={<PatientForm />} />
    </Routes>
  )
}

export default PatientManagement
