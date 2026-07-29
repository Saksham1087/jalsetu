import { useEffect, useRef, useState } from 'react'
import { formatRelativeTime } from '../utils/formatters'

export function NotificationPanel({ notifications, onClose, onMarkRead, onMarkAllRead, onNavigateToComplaint, onDelete }) {
  const panelRef = useRef(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const unread = notifications.filter(n => !n.read).length

  const handleTap = (notification) => {
    if (!notification.read) {
      onMarkRead(notification.id)
    }
    if (notification.type === 'status_update' && notification.complaintId) {
      onNavigateToComplaint(notification)
    }
  }

  const handleDeleteTap = (e, id) => {
    e.stopPropagation()
    setDeletingId(id)
  }

  const handleConfirmDelete = (e, id) => {
    e.stopPropagation()
    onDelete(id)
    setDeletingId(null)
  }

  const handleCancelDelete = (e) => {
    e.stopPropagation()
    setDeletingId(null)
  }

  const typeIcon = (type) => {
    switch (type) {
      case 'status_update':
        return (
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'ward_broadcast':
      case 'global_broadcast':
        return (
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.451.451 0 01-.611-.2 18.04 18.04 0 01-2.104-6.024m2.09-9.18a14.49 14.49 0 01-2.09-.09m5.204 0a14.519 14.519 0 012.831-.643 17.6 17.6 0 015.817.288 1.5 1.5 0 011.155 1.313 17.002 17.002 0 010 4.773 1.5 1.5 0 01-1.155 1.313 17.664 17.664 0 01-5.817.288 14.463 14.463 0 01-2.831-.643m-5.204 0a14.248 14.248 0 01-2.09.09m5.204 0a17.548 17.548 0 01-2.09 0" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="flex-1 min-h-0" />
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-card/95 backdrop-blur-xl rounded-t-2xl shadow-2xl max-h-[70dvh] flex flex-col animate-slide-up"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0 bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-semibold text-text-primary">Notifications</h2>
            {unread > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-teal-100 text-teal-700 rounded-full">
                {unread} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                className="touch-target px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="touch-target p-1.5 text-text-tertiary hover:text-text-body rounded-lg hover:bg-surface transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-10 h-10 mx-auto text-text-tertiary/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <p className="text-sm text-text-secondary">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map(n => (
                <div key={n.id}>
                  {deletingId === n.id ? (
                    <div className="px-4 py-4 border-b border-border/50 bg-surface flex items-center justify-between gap-3">
                      <p className="text-sm text-text-body">Delete this notification?</p>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={handleCancelDelete}
                          className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => handleConfirmDelete(e, n.id)}
                          className="text-xs font-semibold text-emergency hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleTap(n)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTap(n) }}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-surface transition-colors border-b border-border/50 ${
                        !n.read ? 'bg-teal-600/[0.03]' : ''
                      }`}
                    >
                      <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                        n.type === 'status_update' ? 'bg-teal-100' : 'bg-amber-100'
                      }`}>
                        {typeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.read ? 'font-semibold text-text-primary' : 'text-text-body'}`}>
                            {n.title}
                          </p>
                          <span className="shrink-0 text-[11px] text-text-tertiary mt-0.5">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 text-left">{n.message}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-teal-500" />
                        )}
                        <button
                          onClick={(e) => handleDeleteTap(e, n.id)}
                          className="p-1.5 text-text-tertiary hover:text-emergency hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Delete notification"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}