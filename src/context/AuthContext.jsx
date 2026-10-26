/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { apiRequest } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore the session when the application starts
  useEffect(() => {
    let active = true

    async function restoreSession() {
      const token = localStorage.getItem('authToken')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const result = await apiRequest('/api/auth/me')

        if (active) {
          setCurrentUser(result.user)
        }
      } catch (error) {
        localStorage.removeItem('authToken')

        if (active) {
          setCurrentUser(null)
        }

        console.error('Session restoration failed:', error.message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  // Login through the Express backend
  async function login(email, password) {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    })

    localStorage.setItem('authToken', result.token)
    setCurrentUser(result.user)

    return result.user
  }

  // Clear the active JWT and logged-in state
  function logout() {
    localStorage.removeItem('authToken')
    setCurrentUser(null)
  }

  // Retrieve the latest user details from the backend
  async function refreshUser() {
    const result = await apiRequest('/api/auth/me')

    setCurrentUser(result.user)

    return result.user
  }

  const value = {
    currentUser,
    isLoggedIn: Boolean(currentUser),
    loading,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}