import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to home page and save the attempted location
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User doesn't have permission - redirect to their appropriate dashboard
    const redirectPath = 
      user.role === 'doctor' ? '/dashboard/doctor' :
      user.role === 'geneticist' ? '/dashboard/geneticist' :
      user.role === 'pharmacologist' ? '/dashboard/pharmacologist' :
      user.role.startsWith('head_') ? '/admin' :
      '/'
    
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
