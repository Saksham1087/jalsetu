import { useAuthContext } from '../contexts/AuthContext'
import { appConfig } from '../lib/config'
import { formatDate } from '../utils/formatters'

export function ProfilePage({ complaints, onClose }) {
  const { user, logout, login } = useAuthContext()

  const myComplaints = complaints.filter(c => c.userId === user?.uid || c.userId === 'demo-user')
  const total = myComplaints.length
  const resolved = myComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length

  const memberSince = user?.metadata?.creationTime
    ? formatDate(new Date(user.metadata.creationTime).toISOString())
    : user?.isDemoUser
      ? 'Demo account'
      : 'Unknown'

  const handleSignOut = async () => {
    await logout()
    onClose()
  }

  const isDemo = user?.isDemoUser || appConfig.isDemo

  return (
    <div className="min-h-screen min-h-[100dvh] pb-24 safe-area-inset-bottom bg-page">
      <div className="px-4 pt-6 pb-6">
        {/* Back button */}
        <button
          onClick={onClose}
          className="touch-target flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-border mb-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {(user?.displayName || user?.email || 'D')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Name & Email */}
          <h2 className="font-display text-xl font-semibold text-text-primary">
            {isDemo ? 'Demo User' : (user?.displayName || 'User')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {isDemo ? 'demo@jalsetu.app' : (user?.email || '')}
          </p>
          <p className="text-xs text-text-tertiary mt-1">Member since {memberSince}</p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-text-primary tabular-nums">{total}</p>
            <p className="text-xs text-text-secondary mt-1">Total Complaints</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600 tabular-nums">{resolved}</p>
            <p className="text-xs text-text-secondary mt-1">Resolved</p>
          </div>
        </div>

        {/* Sign Out / Sign In */}
        <div className="mt-8">
          {isDemo || user ? (
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-emergency/10 text-emergency font-medium rounded-xl hover:bg-emergency/20 transition-colors text-sm"
            >
              {isDemo ? 'Sign In' : 'Sign Out'}
            </button>
          ) : (
            <button
              onClick={login}
              className="w-full py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
