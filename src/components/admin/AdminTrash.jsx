import { useState, useMemo } from 'react'
import { MIRA_BHAYANDER } from '../../lib/miraBhayander'
import { formatType } from '../../utils/formatters'

export function AdminTrash({ deletedComplaints, onRestore }) {
  const [search, setSearch] = useState('')
  const [wardFilter, setWardFilter] = useState('')
  const [restoringId, setRestoringId] = useState(null)

  const filteredComplaints = useMemo(() => {
    const arr = Array.isArray(deletedComplaints) ? deletedComplaints : []
    return arr.filter(c => {
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
  }, [deletedComplaints, wardFilter, search])

  const handleRestore = async (id) => {
    setRestoringId(id)
    try {
      await onRestore(id)
    } catch (err) {
      console.error('Restore failed:', err)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deleted complaints..."
              className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-card"
            />
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
            {Array.isArray(deletedComplaints) && deletedComplaints.length === 0
              ? 'No deleted complaints.'
              : 'No deleted complaints match the current filters.'}
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {filteredComplaints.map(complaint => (
              <div
                key={complaint.id}
                className="px-4 py-3 hover:bg-surface transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Deleted
                      </span>
                      {complaint.ward && (
                        <span className="text-xs text-text-tertiary">{complaint.ward}</span>
                      )}
                      <span className="text-xs text-text-tertiary">
                        {formatType(complaint.type || 'N/A')}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary font-medium truncate">
                      {complaint.description || 'No description'}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {complaint.userName || 'Anonymous'} · Deleted {complaint.deletedAt ? new Date(complaint.deletedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(complaint.id)}
                    disabled={restoringId === complaint.id}
                    className="touch-target px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {restoringId === complaint.id ? 'Restoring...' : 'Restore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
