import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { doctorLoginSchema } from '../../utils/validation'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

const LoginForm = ({ role }) => {
  const { login, isLoading, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(doctorLoginSchema)
  })

  // Redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = 
        user.role === 'doctor' ? '/dashboard/doctor' :
        user.role === 'geneticist' ? '/dashboard/geneticist' :
        user.role === 'pharmacologist' ? '/dashboard/pharmacologist' :
        user.role.startsWith('head_') ? '/admin' :
        '/'
      
      navigate(dashboardPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const onSubmit = async (data) => {
    try {
      await login(role, data)
      // Navigation will be handled by useEffect above
    } catch (error) {
      setError('root', {
        message: error.response?.data?.message || 'Login failed'
      })
    }
  }

  // Don't render form if user is already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Redirecting to dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div>
          <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            {...register('user_id')}
            type="text"
            className="form-input"
            placeholder="Enter your user ID"
          />
          {errors.user_id && (
            <p className="mt-1 text-sm text-red-600">{errors.user_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="form-input pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to={`/auth/${role}/signup`} className="text-primary-600 hover:text-primary-500">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
