import { useState, useMemo, useCallback } from 'react'
import { ComplaintCard } from './ComplaintCard'
import { FilterBar } from './FilterBar'
import { MIRA_BHAYANDER } from '../lib/miraBhayander'
import { getDistance } from '../utils/geo'

function normalizeType(type) {
  if (type === 'critical_leak' || type === 'leakage') return 'critical_leak'
  return type
}

export function ComplaintList({ complaints, loading, error, onRefresh, userLocation, user }) {
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    ward: '',
    sortBy: 'distance',
    myComplaintsOnly: false,
  })

  const handleRefresh = useCallback(() => {
    if (onRefresh) onRefresh()
  }, [onRefresh])

  const sortedComplaints = useMemo(() => {
    const complaintsArray = Array.isArray(complaints) ? complaints : []
    let filtered = complaintsArray.filter(c => {
      if (filter.type && normalizeType(c.type) !== normalizeType(filter.type)) return false
      if (filter.status && c.status !== filter.status) return false
      if (filter.ward && c.ward !== filter.ward) return false
      if (filter.myComplaintsOnly && user && c.userId !== user.uid) return false
      return true
    })

    switch (filter.sortBy) {
      case 'distance':
        if (userLocation) {
          filtered.sort((a, b) => {
            const distA = getDistance(userLocation, a)
            const distB = getDistance(userLocation, b)
            return distA - distB
          })
        }
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case 'status':
        const statusOrder = { submitted: 0, acknowledged: 1, in_progress: 2, resolved: 3, rejected: 4 }
        filtered.sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5))
        break
    }
    return filtered
  }, [complaints, filter, userLocation, user])

  const complaintTypes = [
    { value: '', label: 'All Types' },
    { value: 'critical_leak', label: 'Critical Leak' },
    { value: 'contamination', label: 'Contamination' },
    { value: 'low_pressure', label: 'Low Pressure' },
    { value: 'no_supply', label: 'No Supply' },
    { value: 'billing', label: 'Billing' },
    { value: 'other', label: 'Other' },
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const wardOptions = [
    { value: '', label: 'All Wards' },
    ...MIRA_BHAYANDER.wards.map(w => ({ value: w.name, label: `${w.name} — ${w.area}` })),
  ]

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center pb-24 safe-area-inset-bottom">
        <div className="text-center p-8">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-teal-100 animate-[water-ripple_1.5s_ease-out_infinite]" />
            <div className="absolute inset-0 rounded-full bg-teal-100 animate-[water-ripple_1.5s_ease-out_infinite_0.5s]" />
            <svg className="relative w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-2.5 4.5-7.5 9-7.5 13.5a7.5 7.5 0 0015 0c0-4.5-5-9-7.5-13.5z" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary">Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] pb-24 safe-area-inset-bottom">
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          complaintTypes={complaintTypes}
          statusOptions={statusOptions}
          wardOptions={wardOptions}
          user={user}
        />

      <div className="px-4 pb-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={handleRefresh} className="text-sm font-medium text-red-700 hover:underline">Retry</button>
          </div>
        )}

        {sortedComplaints.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-14 h-14 mx-auto text-text-tertiary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="font-display text-base font-semibold text-text-primary mb-1">No complaints yet</h3>
            <p className="text-sm text-text-secondary mb-4">Be the first to report a water issue in your area.</p>
            <button
              onClick={() => onRefresh?.()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-3" role="feed" aria-label="Water complaints">
            {sortedComplaints.map((complaint, index) => (
              <ComplaintCard key={complaint.id} complaint={complaint} userLocation={userLocation} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


