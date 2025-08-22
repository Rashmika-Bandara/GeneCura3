import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useEffect } from 'react'
import { Stethoscope, Dna, Pill, Shield } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading } = useAuth()

  // Handle authenticated user redirection
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const redirectPath = 
        user.role === 'doctor' ? '/dashboard/doctor' :
        user.role === 'geneticist' ? '/dashboard/geneticist' :
        user.role === 'pharmacologist' ? '/dashboard/pharmacologist' :
        user.role.startsWith('head_') ? '/admin' :
        '/'
      
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, isLoading, navigate])

  // Don't render landing page if user is authenticated
  if (isAuthenticated && user) {
    return null
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const roles = [
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'Manage patients, prescriptions, and create medical reports',
      icon: Stethoscope,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Patient Management',
        'Prescription Management',
        'Medical Reports',
        'Treatment Analysis'
      ]
    },
    {
      id: 'geneticist',
      title: 'Clinical Geneticist',
      description: 'Manage genetic data and metabolizer information',
      icon: Dna,
      color: 'from-green-500 to-green-600',
      features: [
        'Gene Management',
        'Metabolizer Details',
        'Genetic Reports',
        'Treatment Analysis'
      ]
    },
    {
      id: 'pharmacologist',
      title: 'Clinical Pharmacologist',
      description: 'Manage medicines and analyze drug variations',
      icon: Pill,
      color: 'from-purple-500 to-purple-600',
      features: [
        'Medicine Management',
        'Drug Variation Analysis',
        'Pharmacological Reports',
        'Treatment Analysis'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">GeneCura</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            GeneCura Healthcare Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive system for analyzing how genetic differences affect drug response.
            Choose your role to access specialized tools and features.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={() => navigate(`/auth/${role.id}`)}
              >
                <div className={`h-32 bg-gradient-to-r ${role.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 group-hover:bg-primary-50 group-hover:text-primary-700">
                    Access Portal
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LandingPage
