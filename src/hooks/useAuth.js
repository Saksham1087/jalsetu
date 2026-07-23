import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { appConfig } from '../lib/config'
import { createUserRoleDocument, getUserRole } from '../services/authService'

const demoUser = {
  uid: 'demo-user',
  displayName: 'Demo User',
  email: 'demo@jalsetu.app',
  phoneNumber: null,
  photoURL: null,
  isDemoUser: true,
  role: 'citizen',
  getIdToken: () => Promise.resolve(null),
  toJSON: () => ({}),
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (!appConfig.hasFirebase) {
      setUser(demoUser)
      setUserRole('citizen')
      setLoading(false)
      return
    }

    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await createUserRoleDocument(currentUser)
        const role = await getUserRole(currentUser.uid)
        setUserRole(role)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async () => {
    if (!appConfig.hasFirebase) {
      setUser(demoUser)
      setUserRole('citizen')
      return demoUser
    }
    if (!auth || !googleProvider) {
      setError('Firebase not configured')
      throw new Error('Firebase not configured')
    }
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await createUserRoleDocument(result.user)
      const role = await getUserRole(result.user.uid)
      setUserRole(role)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    if (!appConfig.hasFirebase) {
      setUser(null)
      setUserRole(null)
      return
    }
    if (!auth) return
    try {
      await signOut(auth)
      setUserRole(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const refreshRole = useCallback(async () => {
    if (!user || user.isDemoUser) return
    const role = await getUserRole(user.uid)
    setUserRole(role)
  }, [user])

  return { user, loading, error, login, logout, userRole, refreshRole, isAuthenticated: !!user }
}
