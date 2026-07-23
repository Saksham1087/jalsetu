import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'

export function AuthModal({ isOpen, onClose }) {
  const { login } = useAuthContext()
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (mode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
      else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter valid 10-digit Indian mobile number'
    }
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (mode === 'register' && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await login({ email: formData.email, password: formData.password })
      onClose()
    } catch (err) {
      setErrors({ submit: err.message || 'Authentication failed' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="auth-title" className="text-xl font-semibold text-gray-900">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <button onClick={onClose} className="touch-target p-1 text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{errors.submit}</div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Your full name"
                  autoComplete="name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  inputMode="tel"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full touch-target bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErrors({}); setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' }) }}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
