import { useState, useMemo } from 'react'
import { MIRA_BHAYANDER } from '../../lib/miraBhayander'
import { AdminComplaintDetail } from './AdminComplaintDetail'
import { statusConfig } from '../../lib/statusConfig'

const statusColors = Object.fromEntries(
  Object.entries(statusConfig).map(([key, v]) => [key, { bg: v.adminBg, text: v.adminText, dot: v.dot }])
)

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
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-card"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
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
          <div className="flex-1 min-w-[120px]">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-card"
            >
              <option value="">All Wards</option>
              {MIRA_BHAYANDER.wards.map(w => (
                <option key={w.id} value={w.name}>{w.name} - {w.area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            {Array.isArray(complaints) && complaints.length === 0
              ? 'No complaints found.'
              : 'No complaints match the current filters.'}
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {filteredComplaints.map(complaint => {
              const sc = statusColors[complaint.status] || statusColors.submitted
              return (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className="px-4 py-3 hover:bg-surface transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {complaint.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                        {complaint.ward && (
                          <span className="text-xs text-text-tertiary">{complaint.ward}</span>
                        )}
                      </div>
                      <p className="text-sm text-text-primary font-medium truncate">
                        {complaint.description || 'No description'}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {complaint.userName || 'Anonymous'} · {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs text-text-tertiary capitalize mt-1 flex-shrink-0">
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
