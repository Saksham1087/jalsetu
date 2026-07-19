import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { appConfig } from '../lib/config'

const demoUser = {
  uid: 'demo-user',
  displayName: 'Demo User',
  email: 'demo@jalsetu.app',
  phoneNumber: null,
  photoURL: null,
  isDemoUser: true,
  getIdToken: () => Promise.resolve(null),
  toJSON: () => ({}),
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!appConfig.hasFirebase) {
      setUser(demoUser)
      setLoading(false)
      return
    }

    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async () => {
    if (!appConfig.hasFirebase) {
      setUser(demoUser)
      return demoUser
    }
    if (!auth || !googleProvider) {
      setError('Firebase not configured')
      throw new Error('Firebase not configured')
    }
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    if (!appConfig.hasFirebase) {
      setUser(null)
      return
    }
    if (!auth) return
    try {
      await signOut(auth)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  return { user, loading, error, login, logout, isAuthenticated: !!user }
}
