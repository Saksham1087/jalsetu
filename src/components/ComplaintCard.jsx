import { formatDistance, formatRelativeTime } from '../utils/formatters'

export function ComplaintCard({ complaint, userLocation, index }) {
  const distance = userLocation && complaint.latitude && complaint.longitude
    ? formatDistance(getDistance(userLocation, complaint))
    : null

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
    no_supply: '🚫',
    billing: '💰',
    other: '📝',
  }

  const config = statusConfig[complaint.status] || statusConfig.submitted

  return (
    <article className="bg-white rounded-xl border shadow-sm overflow-hidden touch-target" style={{ animationDelay: `${index * 50}ms` }}>
      <div className={`p-4 ${config.bg} border-b ${config.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg" aria-hidden="true">{typeIcons[complaint.type] || '📝'}</span>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{formatType(complaint.type)}</h3>
              <p className="text-sm text-gray-500 truncate">{complaint.address || complaint.landmark || 'Location not specified'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.text} ${config.bg} ${config.border}`}>
              {config.label}
            </span>
            {distance && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {distance}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{complaint.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {complaint.ward && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              {complaint.ward}
            </span>
          )}
          {complaint.landmark && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {complaint.landmark}
            </span>
          )}
          <time dateTime={complaint.createdAt} className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatRelativeTime(complaint.createdAt)}
          </time>
        </div>

        {complaint.images && complaint.images.length > 0 && (
          <div className="mt-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {complaint.images.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt={`Complaint image ${i + 1}`} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" />
              ))}
              {complaint.images.length > 4 && (
                <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-dashed border-gray-300">
                  +{complaint.images.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">ID: {complaint.id.slice(-8).toUpperCase()}</span>
        {complaint.userId && (
          <span className="text-xs text-gray-400">Reported by {complaint.userName || 'Anonymous'}</span>
        )}
      </div>
    </article>
  )
}

const statusConfig = {
  submitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Submitted' },
  acknowledged: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Acknowledged' },
  in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'In Progress' },
  resolved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Resolved' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected' },
}

function formatType(type) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
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
