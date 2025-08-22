import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema } from '../../utils/validation'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { patientsAPI, genesAPI, medicinesAPI } from '../../services/api'
import { ArrowLeft, Save } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import toast from 'react-hot-toast'

const PatientForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const queryClient = useQueryClient()

  // Fetch existing patient data if editing
  const { data: patient, isLoading: loadingPatient } = useQuery(
    ['patient', id],
    () => patientsAPI.getById(id),
    {
      enabled: isEditing,
      select: (response) => response.data.patient,
      onError: () => {
        toast.error('Failed to load patient data')
        navigate('/dashboard/doctor/patients')
      }
    }
  )

  // Fetch genes for dropdown
  const { data: genes } = useQuery(
    'genes',
    () => genesAPI.getAll(),
    {
      select: (response) => response.data.genes || [],
      onError: () => {
        // Silent fail - genes are optional
      }
    }
  )

  // Fetch medicines for dropdown
  const { data: medicines } = useQuery(
    'medicines',
    () => medicinesAPI.getAll(),
    {
      select: (response) => response.data.medicines || [],
      onError: () => {
        // Silent fail - medicines are optional
      }
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: patient || {}
  })

  // Update form values when patient data is loaded
  React.useEffect(() => {
    if (patient) {
      Object.keys(patient).forEach(key => {
        setValue(key, patient[key])
      })
    }
  }, [patient, setValue])

  const createMutation = useMutation(patientsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('patients')
      toast.success('Patient created successfully')
      navigate('/dashboard/doctor/patients')
    },
    onError: () => {
      toast.error('Failed to create patient')
    }
  })

  const updateMutation = useMutation(
    (data) => patientsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patients')
        queryClient.invalidateQueries(['patient', id])
        toast.success('Patient updated successfully')
        navigate('/dashboard/doctor/patients')
      },
      onError: () => {
        toast.error('Failed to update patient')
      }
    }
  )

  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = loadingPatient || createMutation.isLoading || updateMutation.isLoading

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
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
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Patient' : 'Add New Patient'}
        </h2>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID *
                </label>
                <input
                  {...register('patient_id')}
                  type="text"
                  className="form-input"
                  placeholder="e.g., PAT001"
                  disabled={isEditing}
                />
                {errors.patient_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  {...register('patient_name')}
                  type="text"
                  className="form-input"
                  placeholder="Enter patient's full name"
                />
                {errors.patient_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.patient_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select {...register('gender')} className="form-select">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  {...register('mobile_number')}
                  type="tel"
                  className="form-input"
                  placeholder="+1234567890"
                />
                {errors.mobile_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  {...register('weight', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="500"
                  className="form-input"
                  placeholder="Enter weight in kg"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  {...register('address.street')}
                  type="text"
                  className="form-input"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  {...register('address.city')}
                  type="text"
                  className="form-input"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province/State
                </label>
                <input
                  {...register('address.province')}
                  type="text"
                  className="form-input"
                  placeholder="Province or state"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Condition
                </label>
                <textarea
                  {...register('health_condition')}
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe current health condition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Medications
                </label>
                <textarea
                  {...register('current_medication')}
                  className="form-textarea"
                  rows={3}
                  placeholder="List current medications"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drug Reaction History
                </label>
                <textarea
                  {...register('drug_reaction_history')}
                  className="form-textarea"
                  rows={3}
                  placeholder="Previous drug reactions or adverse events"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <textarea
                  {...register('allergies')}
                  className="form-textarea"
                  rows={3}
                  placeholder="Known allergies"
                />
              </div>
            </div>
          </div>

          {/* Genetic and Medicine Association */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Associations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Gene
                </label>
                <select
                  {...register('gene_id')}
                  className="form-select"
                  onChange={(e) => {
                    const selectedGene = genes?.find(g => g.gene_id === e.target.value)
                    setValue('gene_name', selectedGene?.gene_name || '')
                  }}
                >
                  <option value="">Select a gene</option>
                  {genes?.map((gene) => (
                    <option key={gene.gene_id} value={gene.gene_id}>
                      {gene.gene_name} ({gene.gene_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Medicine
                </label>
                <select
                  {...register('medicine_id')}
                  className="form-select"
                  onChange={(e) => {
                    const selectedMedicine = medicines?.find(m => m.medicine_id === e.target.value)
                    setValue('medicine_name', selectedMedicine?.name || '')
                  }}
                >
                  <option value="">Select a medicine</option>
                  {medicines?.map((medicine) => (
                    <option key={medicine.medicine_id} value={medicine.medicine_id}>
                      {medicine.name} ({medicine.medicine_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/doctor/patients')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Patient' : 'Create Patient'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientForm
