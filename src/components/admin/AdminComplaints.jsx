import { useState, useMemo } from 'react'
import { MIRA_BHAYANDER } from '../../lib/miraBhayander'
import { AdminComplaintDetail } from './AdminComplaintDetail'

const statusColors = {
  submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  acknowledged: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
}

export function AdminComplaints({ complaints, onUpdateStatus }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [wardFilter, setWardFilter] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  const filteredComplaints = useMemo(() => {
    const arr = Array.isArray(complaints) ? complaints : []
    return arr.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false
      if (wardFilter && c.ward !== wardFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const desc = (c.description || '').toLowerCase()
        const name = (c.userName || '').toLowerCase()
        const addr = (c.address || '').toLowerCase()
        if (!desc.includes(q) && !name.includes(q) && !addr.includes(q)) return false
      }
      return true
    })
  }, [complaints, statusFilter, wardFilter, search])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
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
          <div className="flex-1 min-w-[120px]">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Wards</option>
              {MIRA_BHAYANDER.wards.map(w => (
                <option key={w.id} value={w.name}>{w.name} - {w.area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {Array.isArray(complaints) && complaints.length === 0
              ? 'No complaints found.'
              : 'No complaints match the current filters.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredComplaints.map(complaint => {
              const sc = statusColors[complaint.status] || statusColors.submitted
              return (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {complaint.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                        {complaint.ward && (
                          <span className="text-xs text-gray-400">{complaint.ward}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {complaint.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {complaint.userName || 'Anonymous'} · {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 capitalize mt-1 flex-shrink-0">
                      {complaint.type?.replace(/_/g, ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedComplaint && (
        <AdminComplaintDetail
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </div>
  )
}
