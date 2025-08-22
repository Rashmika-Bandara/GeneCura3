import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import LandingPage from './pages/LandingPage';
import AuthHub from './pages/AuthHub';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import GeneticistDashboard from './pages/dashboards/GeneticistDashboard';
import PharmacologistDashboard from './pages/dashboards/PharmacologistDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AddGene from './components/geneticist/AddGene.jsx';   
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/:role/*" element={<AuthHub />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/doctor/*"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
          <Route
          path="/add-gene"
          element={<AddGene />}  
        />
        <Route
          path="/dashboard/geneticist/*"
          element={
            <ProtectedRoute allowedRoles={['geneticist']}>
              <GeneticistDashboard />
            </ProtectedRoute>
          }
        />
        {/* Route for AddGene page under components/geneticist/ */}
        <Route
          path="/components/geneticist/add-gene"
          element={
            <ProtectedRoute allowedRoles={['geneticist']}>
              <AddGene />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard/pharmacologist/*"
          element={
            <ProtectedRoute allowedRoles={['pharmacologist']}>
              <PharmacologistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['head_doctor', 'head_geneticist', 'head_pharmacologist']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect based on user role */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Navigate 
                to={
                  user.role === 'doctor' ? '/dashboard/doctor' :
                  user.role === 'geneticist' ? '/dashboard/geneticist' :
                  user.role === 'pharmacologist' ? '/dashboard/pharmacologist' :
                  user.role.startsWith('head_') ? '/admin' :
                  '/' 
                }
                replace 
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
