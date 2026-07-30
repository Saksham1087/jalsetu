import { useState, useMemo } from 'react'
import { AdminComplaintDetail } from './AdminComplaintDetail'
import { statusConfig } from '../../lib/statusConfig'
import { formatType } from '../../utils/formatters'
import { toDate } from '../../utils/date'

const statusColors = Object.fromEntries(
  Object.entries(statusConfig).map(([key, v]) => [key, { bg: v.adminBg, text: v.adminText, dot: v.dot }])
)

export function AdminUsers({ complaints, onUpdateStatus, onDelete }) {
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  const users = useMemo(() => {
    const map = new Map()
    for (const c of complaints) {
      if (!c.userId) continue
      if (!map.has(c.userId)) {
        map.set(c.userId, {
          userId: c.userId,
          userName: c.userName || 'Anonymous',
          userEmail: c.userEmail || null,
          mobile: c.mobile || null,
          count: 0,
          lastComplaintAt: c.createdAt,
        })
      }
      const u = map.get(c.userId)
      u.count++
      if (!u.lastComplaintAt || (c.createdAt && c.createdAt > u.lastComplaintAt)) {
        u.lastComplaintAt = c.createdAt
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [complaints])

  const filteredUsers = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u => u.userName.toLowerCase().includes(q))
  }, [users, search])

  const userComplaints = useMemo(() => {
    if (!selectedUserId) return []
    return complaints.filter(c => c.userId === selectedUserId)
  }, [complaints, selectedUserId])

  const selectedUser = selectedUserId
    ? users.find(u => u.userId === selectedUserId)
    : null

  if (selectedUserId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedUserId(null); setSelectedComplaint(null) }}
            className="touch-target flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Users
          </button>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {selectedUser?.userName || 'User'}
          </h2>
          <p className="text-sm text-text-secondary">{userComplaints.length} complaint{userComplaints.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border">
          {userComplaints.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">No complaints from this user.</div>
          ) : (
            <div className="divide-y divide-divider">
              {userComplaints.map(complaint => {
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
                          {(() => { const d = toDate(complaint.createdAt); return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown' })()}
                        </p>
                      </div>
                      <span className="text-xs text-text-tertiary mt-1 flex-shrink-0">
                        {formatType(complaint.type || 'N/A')}
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
            onDelete={onDelete}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-card"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center text-text-secondary">
          {search ? 'No users match the search.' : 'No users found.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <button
              key={user.userId}
              onClick={() => setSelectedUserId(user.userId)}
              className="w-full text-left bg-card rounded-xl shadow-sm border border-border p-4 hover:bg-surface transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary truncate">{user.userName}</h3>
                  {user.mobile && (
                    <p className="text-sm text-text-secondary mt-0.5">📞 {user.mobile}</p>
                  )}
                  {user.userEmail && (
                    <p className="text-sm text-text-secondary truncate">{user.userEmail}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-semibold text-teal-600 bg-teal-600/10">
                    {user.count}
                  </span>
                  {user.lastComplaintAt && (
                    <p className="text-[11px] text-text-tertiary mt-1">
                      {(() => {
                        const d = toDate(user.lastComplaintAt)
                        if (!d) return ''
                        const now = new Date()
                        const diff = now - d
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                        if (days === 0) return 'Today'
                        if (days === 1) return 'Yesterday'
                        return `${days}d ago`
                      })()}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
