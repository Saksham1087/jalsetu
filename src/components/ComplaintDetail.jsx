import { formatRelativeTime, formatType, formatStatus } from '../utils/formatters'
import { statusConfig } from '../lib/statusConfig'
import { TypeIcon } from './TypeIcon'

export function ComplaintDetail({ complaint, onClose, onUpdateStatus, viewOnly }) {
  const config = statusConfig[complaint.status] || statusConfig.submitted

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center sm:p-4 bg-overlay backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="bg-card rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-card border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-header flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <h2 id="detail-title" className="font-display text-base font-semibold text-text-primary">Complaint Detail</h2>
          </div>
          <button onClick={onClose} className="touch-target p-1.5 rounded-lg text-text-tertiary hover:bg-surface" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90dvh-60px)]">
          <div className="relative overflow-hidden">
            <div
              className="h-2 w-full transition-colors duration-500"
              style={{ backgroundColor: config.gaugeColor }}
            />
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-teal-600 flex-shrink-0" aria-hidden="true">
                    <TypeIcon type={complaint.type} className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-text-primary">{formatType(complaint.type)}</h3>
                    <p className="text-sm text-text-secondary">{complaint.address || complaint.landmark || 'Location not specified'}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.badgeBg} ${config.badgeText} whitespace-nowrap tracking-tight`}>
                  {config.label}
                </span>
              </div>

              {complaint.displayId && (
                <div className="bg-deep-50 border border-deep-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-deep-700 font-medium">Complaint ID</p>
                    <p className="text-sm font-bold text-deep-800 font-mono tracking-wider mt-0.5 select-all">{complaint.displayId}</p>
                  </div>
                  <svg className="w-8 h-8 text-deep-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              )}

              <div className="bg-surface rounded-xl p-4">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-text-body/80 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {complaint.ward && (
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Ward</p>
                    <p className="text-sm font-medium text-text-primary">{complaint.ward}</p>
                  </div>
                )}
                {complaint.landmark && (
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Landmark</p>
                    <p className="text-sm font-medium text-text-primary">{complaint.landmark}</p>
                  </div>
                )}
                <div className="bg-surface rounded-xl p-3">
                  <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Reported</p>
                  <p className="text-sm font-medium text-text-primary">{formatRelativeTime(complaint.createdAt)}</p>
                </div>
                <div className="bg-surface rounded-xl p-3">
                  <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Updated</p>
                  <p className="text-sm font-medium text-text-primary">{formatRelativeTime(complaint.updatedAt)}</p>
                </div>
              </div>

              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Photos ({complaint.images.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {complaint.images.slice(0, 4).map((img, i) => (
                      <img key={i} src={img} alt={`Photo ${i + 1}`} className="w-full aspect-square object-cover rounded-xl" loading="lazy" />
                    ))}
                    {complaint.images.length > 4 && (
                      <div className="col-span-2 aspect-[2/1] rounded-xl bg-surface flex items-center justify-center text-sm text-text-tertiary border border-dashed border-border font-medium">
                        +{complaint.images.length - 4} more photos
                      </div>
                    )}
                  </div>
                </div>
              )}

              {complaint.timeline && complaint.timeline.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {complaint.timeline.map((event, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div
                            className="w-3 h-3 rounded-full border-2"
                            style={{
                              backgroundColor: index === 0 ? config.gaugeColor : 'var(--color-card)',
                              borderColor: config.gaugeColor,
                            }}
                          />
                          {index < complaint.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: config.gaugeColor + '20' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-3">
                          <p className="text-sm font-medium text-text-primary">{event.note || formatStatus(event.status)}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-card border-t border-border/60 p-4 flex gap-2">
            {!viewOnly && (
              <>
                {complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
                  <button
                    onClick={() => onUpdateStatus(complaint.id, 'acknowledged')}
                    className="flex-1 touch-target py-2.5 border border-teal-600/30 text-teal-700 font-medium rounded-xl hover:bg-teal-50 transition-colors text-sm"
                  >
                    Acknowledge
                  </button>
                )}
                {complaint.status === 'acknowledged' && (
                  <button
                    onClick={() => onUpdateStatus(complaint.id, 'in_progress')}
                    className="flex-1 touch-target py-2.5 bg-brass-400 text-white font-medium rounded-xl hover:bg-brass-500 transition-colors text-sm"
                  >
                    Start Work
                  </button>
                )}
                {complaint.status === 'in_progress' && (
                  <button
                    onClick={() => onUpdateStatus(complaint.id, 'resolved')}
                    className="flex-1 touch-target py-2.5 bg-resolved text-white font-medium rounded-xl hover:bg-green-700 transition-colors text-sm"
                  >
                    Mark Resolved
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="flex-1 touch-target py-2.5 bg-deep-800 text-white font-medium rounded-xl hover:bg-deep-900 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
