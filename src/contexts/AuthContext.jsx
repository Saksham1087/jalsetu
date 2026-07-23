import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { loginWithEmail } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  const enhancedAuth = {
    ...auth,
    loginWithEmail: async (email, password) => {
      const result = await loginWithEmail(email, password)
      if (auth.refreshRole) await auth.refreshRole()
      return result
    },
  }
  return <AuthContext.Provider value={enhancedAuth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}
