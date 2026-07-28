import { useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import { getComplaintById } from '../services/firestore'
import { complaintService } from '../services/complaintService'
import { appConfig } from '../lib/config'
import { formatRelativeTime, formatType } from '../utils/formatters'
import { Skeleton, SkeletonStatGrid } from './Skeleton'
import { useToast } from './Toast'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border/70 rounded-xl p-3.5 flex items-center gap-3">
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-text-primary tabular-nums">{value}</p>
        <p className="text-xs text-text-secondary truncate">{label}</p>
      </div>
    </div>
  )
}

function TrackByIDCard({ onComplaintFound }) {
  const { toast } = useToast()
  const [searchId, setSearchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    const id = searchId.trim()
    if (!id) return

    setLoading(true)
    setNotFound(false)
    setError(null)

    try {
      let result = null

      if (appConfig.hasFirebase) {
        try {
          result = await getComplaintById(id)
        } catch {
          result = await complaintService.getById(id)
        }
      } else {
        result = await complaintService.getById(id)
      }

      if (result) {
        onComplaintFound(result)
        setSearchId('')
        toast.success('Complaint found!')
      } else {
        setNotFound(true)
        toast.error('Complaint not found. Please check the ID.')
      }
    } catch (err) {
      setError(err.message || 'Failed to look up complaint')
      toast.error(err.message || 'Failed to look up complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-display text-sm font-semibold text-text-primary mb-1">Track a Complaint</h3>
      <p className="text-xs text-text-secondary mb-3">Enter a complaint ID to see its status and progress.</p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchId}
          onChange={(e) => { setSearchId(e.target.value); setNotFound(false) }}
          placeholder="e.g. #754KT0"
          className="flex-1 px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card text-text-primary focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !searchId.trim()}
          className="touch-target px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          )}
          Track
        </button>
      </form>
      {notFound && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Complaint not found. Please check the ID.
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}

function RecentComplaints({ complaints, onComplaintSelect }) {
  const recent = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  if (recent.length === 0) return null

  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-text-primary mb-3">Recent Complaints</h3>
      <div className="space-y-2">
        {recent.map(c => (
          <button
            key={c.id}
            onClick={() => onComplaintSelect(c)}
            className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 text-left hover:bg-surface transition-colors"
          >
            <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              c.status === 'resolved' ? 'bg-green-500' :
              c.status === 'in_progress' ? 'bg-blue-500' :
              c.status === 'acknowledged' ? 'bg-amber-500' :
              'bg-gray-400'
            }`}>
              {c.type?.charAt(0).toUpperCase() || 'W'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{formatType(c.type)}</p>
              <p className="text-xs text-text-secondary">{c.ward || 'No ward'}</p>
            </div>
            <span className="shrink-0 text-[11px] text-text-tertiary">{formatRelativeTime(c.createdAt)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function NotificationSection({ notifications, onViewAll }) {
  const recent = notifications.filter(n => !n.read).slice(0, 3)

  if (recent.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-text-primary">Notifications</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          View all
        </button>
      </div>
      <div className="space-y-2">
        {recent.map(n => (
          <div key={n.id} className="flex items-start gap-3 bg-card border border-border rounded-xl p-3.5">
            <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${n.read ? 'bg-border' : 'bg-teal-500'}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-text-primary truncate`}>{n.title}</p>
              <p className="text-xs text-text-secondary line-clamp-1">{n.message}</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">{formatRelativeTime(n.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ onTabChange }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="font-display text-lg font-semibold text-text-primary mb-2">No complaints yet</h2>
      <p className="text-sm text-text-secondary max-w-xs mb-6">
        You haven't reported any issues yet. Tap 'Report Issue' to get started or explore the map.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => onTabChange('report')}
          className="touch-target px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors"
        >
          Report Issue
        </button>
        <button
          onClick={() => onTabChange('map')}
          className="touch-target px-5 py-2.5 bg-surface text-text-body text-sm font-medium rounded-xl hover:bg-surface/80 transition-colors"
        >
          Explore Map
        </button>
      </div>
    </div>
  )
}

export function Dashboard({ complaints, loading, onComplaintSelect, onComplaintFound, onTabChange, onNotificationClick }) {
  const { user } = useAuthContext()
  const { notifications } = useNotifications(user)

  const myComplaints = complaints.filter(c => c.userId === user?.uid || c.userId === 'demo-user')
  const total = myComplaints.length
  const resolved = myComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thisWeek = myComplaints.filter(c => new Date(c.createdAt) >= weekAgo).length

  const showNotifications = !!user

  if (loading && myComplaints.length === 0) {
    return (
      <div className="min-h-screen min-h-[100dvh] pb-24 safe-area-inset-bottom overflow-y-auto">
        <div className="px-4 pt-5 pb-6 space-y-5">
          <div>
            <Skeleton width={180} height={24} rounded="lg" />
          </div>
          <SkeletonStatGrid />
          <div className="bg-card border border-border rounded-xl p-4">
            <Skeleton width={120} height={16} rounded="lg" />
            <div className="mt-3 flex gap-2">
              <Skeleton width="70%" height={44} rounded="lg" />
              <Skeleton width="30%" height={44} rounded="lg" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5">
                <Skeleton width={36} height={36} rounded="full" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] pb-24 safe-area-inset-bottom overflow-y-auto">
      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* Welcome */}
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {user ? `Welcome${user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}` : 'Welcome'}
          </h2>
        </div>

        {total === 0 ? (
          <EmptyState onTabChange={onTabChange} />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Complaints"
                value={total}
                color="bg-teal-100"
                icon={<svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <StatCard
                label="Resolved"
                value={resolved}
                color="bg-green-100"
                icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Resolution Rate"
                value={`${rate}%`}
                color="bg-blue-100"
                icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
              />
              <StatCard
                label="This Week"
                value={thisWeek}
                color="bg-amber-100"
                icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
              />
            </div>

            {/* Track by ID Card */}
            <TrackByIDCard onComplaintFound={onComplaintFound} />

            {/* Emergency Call Card */}
            <div className="bg-emergency/5 border border-emergency/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-emergency/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emergency" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-semibold text-text-primary">Speak to someone</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Call the MBMC helpline directly for water emergencies.</p>
                </div>
              </div>
              <a
                href="tel:1800224849"
                className="mt-3 w-full touch-target min-h-[44px] py-2.5 bg-emergency text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call Helpline
              </a>
            </div>
          </>
        )}

        {/* Notifications Section (only for auth users) */}
        {showNotifications && (
          <NotificationSection
            notifications={notifications}
            onViewAll={onNotificationClick}
          />
        )}

        {/* Recent Complaints (only when user has complaints) */}
        {total > 0 && (
          <RecentComplaints
            complaints={myComplaints}
            onComplaintSelect={onComplaintSelect}
          />
        )}
      </div>
    </div>
  )
}
