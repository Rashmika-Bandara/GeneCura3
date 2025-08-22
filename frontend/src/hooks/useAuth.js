import { useState, useEffect, createContext, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { authAPI } from '../services/api'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const queryClient = useQueryClient()

  // Get current user query
  const { data: userData, isLoading, error } = useQuery(
    'currentUser',
    authAPI.getCurrentUser,
    {
      retry: false,
      enabled: !!Cookies.get('auth_token'),
      onSuccess: (response) => {
        setUser(response.data.user)
      },
      onError: () => {
        setUser(null)
        Cookies.remove('auth_token')
      },
    }
  )

  // Login mutation
  const loginMutation = useMutation(
    ({ role, credentials }) => authAPI.login(role, credentials),
    {
      onSuccess: (response) => {
        const { token, user: loggedInUser } = response.data
        Cookies.set('auth_token', token, { 
          expires: 7, // 7 days
          secure: true,
          sameSite: 'strict'
        })
        setUser(loggedInUser)
        queryClient.setQueryData('currentUser', response)
        toast.success(`Welcome back, ${loggedInUser.name}!`)
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Login failed'
        toast.error(message)
      },
    }
  )

  // Signup mutation
  const signupMutation = useMutation(
    ({ role, userData }) => authAPI.signup(role, userData),
    {
      onSuccess: () => {
        toast.success('Account created successfully! Please login.')
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Signup failed'
        toast.error(message)
      },
    }
  )

  // Logout mutation
  const logoutMutation = useMutation(authAPI.logout, {
    onSuccess: () => {
      setUser(null)
      Cookies.remove('auth_token')
      queryClient.clear()
      toast.success('Logged out successfully')
    },
    onError: () => {
      // Force logout even if API call fails
      setUser(null)
      Cookies.remove('auth_token')
      queryClient.clear()
    },
  })

  const login = (role, credentials) => {
    return loginMutation.mutateAsync({ role, credentials })
  }

  const signup = (role, userData) => {
    return signupMutation.mutateAsync({ role, userData })
  }

  const logout = () => {
    logoutMutation.mutate()
  }

  const isAuthenticated = !!user
  const isHead = user?.role?.startsWith('head_')

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isHead,
        isLoading: isLoading || loginMutation.isLoading || signupMutation.isLoading,
        login,
        signup,
        logout,
        loginError: loginMutation.error,
        signupError: signupMutation.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
