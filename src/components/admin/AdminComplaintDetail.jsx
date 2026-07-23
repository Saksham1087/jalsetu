import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: 'bg-yellow-500' },
  { value: 'acknowledged', label: 'Acknowledged', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-indigo-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
]

export function AdminComplaintDetail({ complaint, onClose, onUpdateStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status || '')
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)

  if (!complaint) return null

  const timeline = Array.isArray(complaint.timeline) ? complaint.timeline : []

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === complaint.status) return
    setUpdating(true)
    try {
      await onUpdateStatus(complaint.id, selectedStatus, note)
      onClose()
    } catch (err) {
      console.error('Status update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Complaint Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.filter(s => s.value === complaint.status).map(s => (
              <span key={s.value} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${s.color.replace('bg-', 'bg-').replace('500', '100')} ${s.color.replace('bg-', 'text-').replace('500', '800')}`}>
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.label}
              </span>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-gray-900">{complaint.description || 'No description'}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
              <p className="text-gray-900 capitalize">{complaint.type || complaint.severity || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Ward</h3>
              <p className="text-gray-900">{complaint.ward || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Landmark</h3>
              <p className="text-gray-900">{complaint.landmark || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile</h3>
              <p className="text-gray-900">{complaint.mobile || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted by</h3>
              <p className="text-gray-900">{complaint.userName || 'Anonymous'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
              <p className="text-gray-900 text-sm">
                {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Address */}
          {complaint.address && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
              <p className="text-gray-900 text-sm">{complaint.address}</p>
            </div>
          )}

          {/* Photo */}
          {complaint.images?.[0] && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
              <img src={complaint.images[0]} alt="Complaint" className="max-w-sm rounded-lg border border-gray-200" />
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Timeline</h3>
            <div className="space-y-3">
              {timeline.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${i === timeline.length - 1 ? 'bg-primary-500' : 'bg-gray-300'}`} />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium text-gray-900 capitalize">{entry.status?.replace('_', ' ')}</p>
                    {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_OPTIONS.filter(s => s.value !== complaint.status).map(s => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === s.value
                      ? `${s.color.replace('bg-', 'bg-').replace('500', '100')} ${s.color.replace('bg-', 'text-').replace('500', '800')} border-2 border-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === complaint.status || updating}
                className="flex-1 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}