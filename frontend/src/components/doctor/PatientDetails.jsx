import { useQuery } from 'react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { patientsAPI } from '../../services/api'
import { ArrowLeft, Edit, User, MapPin, Heart, Pill } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

const PatientDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: patient, isLoading, error } = useQuery(
    ['patient', id],
    () => patientsAPI.getById(id),
    {
      select: (response) => response.data.patient,
      onError: () => {
        navigate('/dashboard/doctor/patients')
      }
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/doctor/patients')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.patient_name}</h2>
            <p className="text-gray-600">Patient ID: {patient.patient_id}</p>
          </div>
          <button
            onClick={() => navigate(`/dashboard/doctor/patients/${id}/edit`)}
            className="btn-primary"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900">{patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                <p className="text-gray-900">{patient.mobile_number || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Weight</label>
                <p className="text-gray-900">{patient.weight ? `${patient.weight} kg` : 'Not recorded'}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          {patient.address && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Address</h3>
              </div>
              <div className="space-y-2">
                {patient.address.street && <p className="text-gray-900">{patient.address.street}</p>}
                <p className="text-gray-900">
                  {[patient.address.city, patient.address.province].filter(Boolean).join(', ') || 'Not provided'}
                </p>
              </div>
            </div>
          )}

          {/* Medical Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Heart className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Health Condition</label>
                <p className="text-gray-900 mt-1">{patient.health_condition || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Medications</label>
                <p className="text-gray-900 mt-1">{patient.current_medication || 'None specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Drug Reaction History</label>
                <p className="text-gray-900 mt-1">{patient.drug_reaction_history || 'No history recorded'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Allergies</label>
                <p className="text-gray-900 mt-1">{patient.allergies || 'No known allergies'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Genetic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Genetic Association</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Gene ID</label>
                <p className="text-gray-900">{patient.gene_id || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gene Name</label>
                <p className="text-gray-900">{patient.gene_name || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          {/* Medicine Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Pill className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Medicine Association</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Medicine ID</label>
                <p className="text-gray-900">{patient.medicine_id || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Medicine Name</label>
                <p className="text-gray-900">{patient.medicine_name || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Record Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">
                  {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">
                  {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetails
