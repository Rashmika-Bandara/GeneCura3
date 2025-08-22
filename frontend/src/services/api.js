import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred'
    
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      Cookies.remove('auth_token')
      // Don't redirect immediately, let the auth context handle it
      return Promise.reject(error)
    }
    
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.status >= 400) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (role, credentials) =>
    api.post(`/auth/${role}/login`, credentials),
  
  signup: (role, userData) =>
    api.post(`/auth/${role}/signup`, userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
}

// Patients API (Doctor only)
export const patientsAPI = {
  getAll: (params = {}) =>
    api.get('/patients', { params }),
  
  getById: (id) =>
    api.get(`/patients/${id}`),
  
  create: (data) =>
    api.post('/patients', data),
  
  update: (id, data) =>
    api.put(`/patients/${id}`, data),
  
  delete: (id) =>
    api.delete(`/patients/${id}`),
}

// Genes API (Geneticist only)
export const genesAPI = {
  getAll: (params = {}) =>
    api.get('/genes', { params }),
  
  getById: (id) =>
    api.get(`/genes/${id}`),
  
  create: (data) =>
    api.post('/genes', data),
  
  update: (id, data) =>
    api.put(`/genes/${id}`, data),
  
  delete: (id) =>
    api.delete(`/genes/${id}`),
}

// Medicines API (Pharmacologist only)
export const medicinesAPI = {
  getAll: (params = {}) =>
    api.get('/medicines', { params }),
  
  getById: (id) =>
    api.get(`/medicines/${id}`),
  
  create: (data) =>
    api.post('/medicines', data),
  
  update: (id, data) =>
    api.put(`/medicines/${id}`, data),
  
  delete: (id) =>
    api.delete(`/medicines/${id}`),
}

// Prescriptions API (Doctor only)
export const prescriptionsAPI = {
  getAll: (params = {}) =>
    api.get('/prescriptions', { params }),
  
  getById: (id) =>
    api.get(`/prescriptions/${id}`),
  
  create: (data) =>
    api.post('/prescriptions', data),
  
  update: (id, data) =>
    api.put(`/prescriptions/${id}`, data),
  
  delete: (id) =>
    api.delete(`/prescriptions/${id}`),
}

// Reports API (All roles)
export const reportsAPI = {
  getAll: (params = {}) =>
    api.get('/reports', { params }),
  
  getById: (id) =>
    api.get(`/reports/${id}`),
  
  create: (data) =>
    api.post('/reports', data),
  
  update: (id, data) =>
    api.put(`/reports/${id}`, data),
  
  delete: (id) =>
    api.delete(`/reports/${id}`),
}

// Treatment Cases API (Read-only)
export const treatmentCasesAPI = {
  getAll: (params = {}) =>
    api.get('/treatment-cases', { params }),
}

// Admin API (Admin only)
export const adminAPI = {
  getReports: (params = {}) =>
    api.get('/admin/reports', { params }),
  
  updateReport: (id, data) =>
    api.put(`/admin/reports/${id}`, data),
  
  getStats: () =>
    api.get('/admin/stats'),
}

export default api
