import { useState, useMemo, useCallback } from 'react'
import { ComplaintCard } from './ComplaintCard'
import { FilterBar } from './FilterBar'

export function ComplaintList({ complaints, loading, error, onRefresh, userLocation }) {
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    search: '',
    sortBy: 'distance',
  })

  const handleRefresh = useCallback(() => {
    if (onRefresh) onRefresh()
  }, [onRefresh])

  const sortedComplaints = useMemo(() => {
    const complaintsArray = Array.isArray(complaints) ? complaints : []
    let filtered = complaintsArray.filter(c => {
      if (filter.type && c.type !== filter.type) return false
      if (filter.status && c.status !== filter.status) return false
      if (filter.search) {
        const search = filter.search.toLowerCase()
        return c.description.toLowerCase().includes(search) ||
               c.address?.toLowerCase().includes(search) ||
               c.ward?.toLowerCase().includes(search)
      }
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
  }, [complaints, filter, userLocation])

  const complaintTypes = [
    { value: '', label: 'All Types' },
    { value: 'leakage', label: 'Leakage' },
    { value: 'contamination', label: 'Contamination' },
    { value: 'low_pressure', label: 'Low Pressure' },
    { value: 'no_water', label: 'No Water' },
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

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gray-50 flex items-center justify-center pb-24 safe-area-inset-bottom">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 pb-24 safe-area-inset-bottom">
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        complaintTypes={complaintTypes}
        statusOptions={statusOptions}
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
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No complaints found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or pull to refresh</p>
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

function getDistance(userLoc, complaint) {
  if (!userLoc || !complaint.latitude || !complaint.longitude) return Infinity
  const R = 6371e3
  const φ1 = userLoc.latitude * Math.PI / 180
  const φ2 = complaint.latitude * Math.PI / 180
  const Δφ = (complaint.latitude - userLoc.latitude) * Math.PI / 180
  const Δλ = (complaint.longitude - userLoc.longitude) * Math.PI / 180
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
