import { Routes, Route, useParams, Navigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'
import { Stethoscope, Dna, Pill, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const AuthHub = () => {
  const { role } = useParams()

  const roleConfig = {
    doctor: {
      title: 'Doctor Portal',
      icon: Stethoscope,
      color: 'from-blue-500 to-blue-600',
      description: 'Access patient management and medical reporting tools'
    },
    geneticist: {
      title: 'Clinical Geneticist Portal',
      icon: Dna,
      color: 'from-green-500 to-green-600',
      description: 'Manage genetic data and metabolizer information'
    },
    pharmacologist: {
      title: 'Clinical Pharmacologist Portal',
      icon: Pill,
      color: 'from-purple-500 to-purple-600',
      description: 'Handle medicine management and drug analysis'
    }
  }

  const config = roleConfig[role]
  if (!config) {
    return <Navigate to="/" replace />
  }

  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-600">GeneCura System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className={`px-8 py-6 bg-gradient-to-r ${config.color} text-white text-center`}>
            <Icon className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
            <p className="text-blue-100 text-sm">{config.description}</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <Routes>
              <Route index element={<LoginForm role={role} />} />
              <Route path="login" element={<LoginForm role={role} />} />
              <Route path="signup" element={<SignupForm role={role} />} />
              <Route path="*" element={<Navigate to="login" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthHub
