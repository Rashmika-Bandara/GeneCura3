import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  doctorSignupSchema, 
  geneticistSignupSchema, 
  pharmacologistSignupSchema 
} from '../../utils/validation'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

const SignupForm = ({ role }) => {
  const { signup, isLoading } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Select appropriate schema based on role
  const getSchema = () => {
    switch (role) {
      case 'doctor':
        return doctorSignupSchema
      case 'geneticist':
        return geneticistSignupSchema
      case 'pharmacologist':
        return pharmacologistSignupSchema
      default:
        return doctorSignupSchema
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(getSchema())
  })

  const onSubmit = async (data) => {
    try {
      // Remove confirmPassword from the data before sending
      const { confirmPassword, ...signupData } = data
      await signup(role, signupData)
      // Redirect to login page after successful signup
      navigate(`/auth/${role}/login`)
    } catch (error) {
      setError('root', {
        message: error.response?.data?.message || 'Signup failed'
      })
    }
  }

  const getIdFieldName = () => {
    switch (role) {
      case 'doctor':
        return 'doctor_id'
      case 'geneticist':
        return 'geneticist_id'
      case 'pharmacologist':
        return 'pharmacologist_id'
      default:
        return 'doctor_id'
    }
  }

  const idFieldName = getIdFieldName()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h3>
        <p className="text-gray-600">Join the GeneCura platform</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* ID Field */}
        <div>
          <label htmlFor={idFieldName} className="block text-sm font-medium text-gray-700 mb-1">
            {role === 'doctor' ? 'Doctor ID' : 
             role === 'geneticist' ? 'Geneticist ID' : 
             'Pharmacologist ID'} *
          </label>
          <input
            {...register(idFieldName)}
            type="text"
            className="form-input"
            placeholder="e.g., DOC001, GEN001, PHARM001"
          />
          {errors[idFieldName] && (
            <p className="mt-1 text-sm text-red-600">{errors[idFieldName].message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            {...register('name')}
            type="text"
            className="form-input"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* License ID */}
        <div>
          <label htmlFor="licence_id" className="block text-sm font-medium text-gray-700 mb-1">
            License ID *
          </label>
          <input
            {...register('licence_id')}
            type="text"
            className="form-input"
            placeholder="Enter your professional license ID"
          />
          {errors.licence_id && (
            <p className="mt-1 text-sm text-red-600">{errors.licence_id.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            {...register('email')}
            type="email"
            className="form-input"
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-1">
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

        {/* Date of Birth */}
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            {...register('date_of_birth')}
            type="date"
            className="form-input"
          />
          {errors.date_of_birth && (
            <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select {...register('gender')} className="form-select">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        {/* Role-specific fields */}
        {role === 'doctor' && (
          <>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                {...register('specialization')}
                type="text"
                className="form-input"
                placeholder="e.g., Cardiology, Neurology"
              />
            </div>
            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                Hospital/Institution
              </label>
              <input
                {...register('hospital')}
                type="text"
                className="form-input"
                placeholder="Enter your workplace"
              />
            </div>
          </>
        )}

        {(role === 'geneticist' || role === 'pharmacologist') && (
          <div>
            <label htmlFor="working_place" className="block text-sm font-medium text-gray-700 mb-1">
              Working Place
            </label>
            <input
              {...register('working_place')}
              type="text"
              className="form-input"
              placeholder="Enter your workplace"
            />
          </div>
        )}

        {/* Common fields for all roles */}
        <div>
          <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-1">
            Qualifications
          </label>
          <textarea
            {...register('qualifications')}
            className="form-textarea"
            rows={3}
            placeholder="Enter your qualifications and certifications"
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            {...register('experience', { valueAsNumber: true })}
            type="number"
            min="0"
            className="form-input"
            placeholder="0"
          />
          {errors.experience && (
            <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="form-input pr-10"
              placeholder="At least 8 characters with letters and numbers"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-input pr-10"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to={`/auth/${role}/login`}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupForm
