import { useState, useMemo } from 'react'
import { MIRA_BHAYANDER } from '../../lib/miraBhayander'
import { statusConfig } from '../../lib/statusConfig'
import { formatType } from '../../utils/formatters'
import { toDate } from '../../utils/date'

const statusColors = Object.fromEntries(
  Object.entries(statusConfig).map(([key, v]) => [key, { bg: v.adminBg, text: v.adminText, dot: v.dot }])
)

export function AdminDashboard({ complaints, onSelectComplaint }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [wardFilter, setWardFilter] = useState('')

  const stats = useMemo(() => {
    const arr = Array.isArray(complaints) ? complaints : []
    const counts = { total: arr.length, pending: 0, acknowledged: 0, inProgress: 0, resolved: 0, rejected: 0 }
    for (const c of arr) {
      if (c.status === 'submitted') counts.pending++
      else if (c.status === 'acknowledged') counts.acknowledged++
      else if (c.status === 'in_progress') counts.inProgress++
      else if (c.status === 'resolved') counts.resolved++
      else if (c.status === 'rejected') counts.rejected++
    }
    return counts
  }, [complaints])

  const filteredComplaints = useMemo(() => {
    const arr = Array.isArray(complaints) ? complaints : []
    return arr.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false
      if (wardFilter && c.ward !== wardFilter) return false
      return true
    })
  }, [complaints, statusFilter, wardFilter])

  const statCards = [
    { label: 'Total', value: stats.total, color: 'bg-gray-500' },
    { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
    { label: 'Acknowledged', value: stats.acknowledged, color: 'bg-teal-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-indigo-500' },
    { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-card rounded-xl shadow-sm border border-border p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-text-primary mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-card"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-text-secondary mb-1">Ward</label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-card"
            >
              <option value="">All Wards</option>
              {MIRA_BHAYANDER.wards.map(w => (
                <option key={w.id} value={w.name}>{w.name} — {w.area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaint Queue */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-text-primary">Complaint Queue</h3>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <p>No complaints match the selected filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {filteredComplaints.map(complaint => {
              const sc = statusColors[complaint.status] || statusColors.submitted
              const date = toDate(complaint.createdAt)
              return (
                <div key={complaint.id} className="px-4 py-3 hover:bg-surface transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {complaint.status?.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary font-medium truncate">{complaint.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                        {complaint.ward && <span>Ward: {complaint.ward}</span>}
                        <span>{formatType(complaint.type || complaint.severity)}</span>
                        {complaint.userName && <span>by {complaint.userName}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectComplaint(complaint)}
                      className="touch-target px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-600/10 rounded-lg hover:bg-teal-600/20 transition-colors flex-shrink-0"
                    >
                      View
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}