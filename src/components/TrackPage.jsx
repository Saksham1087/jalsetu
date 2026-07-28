import { useState } from 'react'
import { getComplaintById } from '../services/firestore'
import { complaintService } from '../services/complaintService'
import { ComplaintDetail } from './ComplaintDetail'
import { appConfig } from '../lib/config'

export function TrackPage({ complaints = [] }) {
  const [searchId, setSearchId] = useState('')
  const [complaint, setComplaint] = useState(null)
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
    setComplaint(null)

    const searchLocal = (term) => {
      const clean = term.replace(/^#/, '').toUpperCase()
      return complaints.find(c => {
        if (c.displayId && c.displayId.toUpperCase() === clean) return true
        if (c.id === term) return true
        if (c.id.slice(-6).toUpperCase() === clean) return true
        return false
      }) || null
    }

    try {
      let result = searchLocal(id)

      if (!result && appConfig.hasFirebase) {
        try {
          result = await getComplaintById(id)
        } catch {
          complaintService.seedDemoData()
          result = await complaintService.getById(id)
        }
      }

      if (!result && !appConfig.hasFirebase) {
        result = await complaintService.getById(id)
      }

      if (result) {
        setComplaint(result)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      setError(err.message || 'Failed to look up complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] pb-24 safe-area-inset-bottom">
      <div className="px-4 pt-6 pb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">Track Complaint</h2>
        <p className="text-sm text-text-secondary mt-1">Enter your complaint ID to see real-time status and progress.</p>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g. #754KT0"
            className="flex-1 px-4 py-3 border border-border rounded-xl text-sm bg-card text-text-primary focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="touch-target px-5 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
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
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
            Complaint not found. Check the ID and try again.
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!complaint && !notFound && !error && !loading && (
          <div className="mt-8 p-6 bg-surface rounded-xl text-center">
            <svg className="w-12 h-12 mx-auto text-text-tertiary/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm text-text-secondary">Enter your complaint ID above to check its status and see the full resolution timeline.</p>
          </div>
        )}
      </div>

      {complaint && (
        <ComplaintDetail
          complaint={complaint}
          viewOnly
          onClose={() => setComplaint(null)}
        />
      )}
    </div>
  )
}
