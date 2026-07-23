import { useState, useMemo } from 'react'
import { MIRA_BHAYANDER } from '../../lib/miraBhayander'

const statusColors = {
  submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  acknowledged: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
}

export function AdminDashboard({ complaints, onSelectComplaint, onRefresh: _onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [wardFilter, setWardFilter] = useState('')

  const stats = useMemo(() => {
    const arr = Array.isArray(complaints) ? complaints : []
    return {
      total: arr.length,
      pending: arr.filter(c => c.status === 'submitted').length,
      acknowledged: arr.filter(c => c.status === 'acknowledged').length,
      inProgress: arr.filter(c => c.status === 'in_progress').length,
      resolved: arr.filter(c => c.status === 'resolved').length,
    }
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
    { label: 'In Progress', value: stats.inProgress, color: 'bg-indigo-500' },
    { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Ward</label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Wards</option>
              {MIRA_BHAYANDER.wards.map(w => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaint Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Complaint Queue</h3>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No complaints match the selected filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredComplaints.map(complaint => {
              const sc = statusColors[complaint.status] || statusColors.submitted
              const date = new Date(complaint.createdAt)
              return (
                <div key={complaint.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {complaint.status?.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium truncate">{complaint.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {complaint.ward && <span>Ward: {complaint.ward}</span>}
                        <span>{complaint.type || complaint.severity}</span>
                        {complaint.userName && <span>by {complaint.userName}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectComplaint(complaint)}
                      className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors flex-shrink-0"
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