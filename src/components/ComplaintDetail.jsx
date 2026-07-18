import { formatRelativeTime, formatDate, formatType, formatStatus, formatDistance } from '../utils/formatters'
import { calculateDistance } from '../utils/geo'

export function ComplaintDetail({ complaint, onClose, onUpdateStatus }) {
  const statusConfig = {
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Submitted' },
    acknowledged: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Acknowledged' },
    in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'In Progress' },
    resolved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Resolved' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' },
  }

  const typeIcons = {
    leakage: '💧',
    contamination: '⚠️',
    low_pressure: '📉',
    no_water: '🚫',
    billing: '💰',
    other: '📝',
  }

  const config = statusConfig[complaint.status] || statusConfig.submitted

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 id="detail-title" className="text-lg font-semibold text-gray-900">Complaint Details</h2>
          <button onClick={onClose} className="touch-target p-1 text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-60px)]">
          <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">{typeIcons[complaint.type] || '📝'}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{formatType(complaint.type)}</h3>
                  <p className="text-sm text-gray-500">{complaint.address || complaint.landmark || 'Location not specified'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.text} ${config.bg} ${config.border} whitespace-nowrap`}>
                {config.label}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {complaint.ward && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Ward / Area</p>
                <p className="text-sm font-medium text-gray-900">{complaint.ward}</p>
              </div>
            )}
            {complaint.landmark && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Landmark</p>
                <p className="text-sm font-medium text-gray-900">{complaint.landmark}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Reported</p>
              <p className="text-sm font-medium text-gray-900">{formatRelativeTime(complaint.createdAt)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Updated</p>
              <p className="text-sm font-medium text-gray-900">{formatRelativeTime(complaint.updatedAt)}</p>
            </div>
          </div>

          {complaint.images && complaint.images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Photos ({complaint.images.length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {complaint.images.slice(0, 4).map((img, i) => (
                  <img key={i} src={img} alt={`Complaint photo ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
                ))}
                {complaint.images.length > 4 && (
                  <div className="col-span-2 aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 border border-dashed border-gray-300">
                    +{complaint.images.length - 4} more photos
                  </div>
                )}
              </div>
            </div>
          )}

          {complaint.timeline && complaint.timeline.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
              <div className="space-y-3">
                {complaint.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-primary-500' : 'bg-gray-300'}`} />
                      {index < complaint.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.note || formatStatus(event.status)}</p>
                      <p className="text-xs text-gray-500">{formatRelativeTime(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 flex gap-2">
            {complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
              <button
                onClick={() => onUpdateStatus(complaint.id, 'acknowledged')}
                className="flex-1 touch-target border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Acknowledge
              </button>
            )}
            {complaint.status === 'acknowledged' && (
              <button
                onClick={() => onUpdateStatus(complaint.id, 'in_progress')}
                className="flex-1 touch-target bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
              >
                Start Work
              </button>
            )}
            {complaint.status === 'in_progress' && (
              <button
                onClick={() => onUpdateStatus(complaint.id, 'resolved')}
                className="flex-1 touch-target bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                Mark Resolved
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 touch-target bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
