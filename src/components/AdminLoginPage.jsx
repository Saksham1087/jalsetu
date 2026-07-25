import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { loginWithGoogleAdmin } from '../services/authService'
import { appConfig } from '../lib/config'
import { useTheme } from '../hooks/useTheme'

export function AdminLoginPage({ onNavigateHome }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { loginWithEmail, user, userRole, loading: authLoading, refreshRole } = useAuthContext()
  const { isDark, toggleTheme } = useTheme()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user && userRole === 'admin') {
    window.location.hash = '#/admin'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (appConfig.hasFirebase) {
        await loginWithEmail(email, password)
      } else {
        if (email === 'raisakshamclg@gmail.com' && password === 'admin123') {
          window.location.hash = '#/admin'
          return
        }
        throw new Error('Invalid email or password')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      if (!appConfig.hasFirebase) {
        if (user) {
          window.location.hash = '#/admin'
        }
        return
      }
      await loginWithGoogleAdmin()
      if (refreshRole) await refreshRole()
      window.location.hash = '#/admin'
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
      setGoogleLoading(false)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 touch-target flex items-center justify-center w-10 h-10 rounded-xl bg-card shadow-lg text-text-secondary hover:text-text-primary border border-border transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )}
      </button>
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Admin Login</h1>
            <p className="text-text-secondary text-sm mt-1">MBMC Water Management Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-card"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-body mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-card"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 border border-border text-text-body font-medium rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={onNavigateHome}
              className="text-sm text-teal-600 hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}