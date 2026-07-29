import { useState, useMemo } from 'react'
import { batchCreateNotifications, logSentNotification } from '../../services/firestore'
import { complaintService } from '../../services/complaintService'
import { appConfig } from '../../lib/config'
import { useAuthContext } from '../../contexts/AuthContext'
import { useToast } from '../Toast'
import { formatRelativeTime } from '../../utils/formatters'

export function AdminSendNotification({ complaints, sentNotifications, onDeleteSentNotification }) {
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [targetType, setTargetType] = useState('user')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingLogId, setDeletingLogId] = useState(null)

  const users = useMemo(() => {
    const map = new Map()
    if (user && !user.isDemoUser) {
      map.set(user.uid, {
        id: user.uid,
        name: user.displayName || user.email || user.uid,
        email: user.email || '',
      })
    }
    for (const c of complaints) {
      if (c.userId && !map.has(c.userId)) {
        map.set(c.userId, {
          id: c.userId,
          name: c.userName || c.userId,
          email: c.userEmail || '',
        })
      }
    }
    return [...map.values()]
  }, [complaints, user])

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return
    if (targetType === 'user' && !selectedUserId) return

    setSending(true)

    try {
      let userIds

      if (targetType === 'user') {
        userIds = [selectedUserId]
      } else {
        const allUsers = new Set(complaints.map(c => c.userId).filter(Boolean))
        userIds = [...allUsers]
        if (userIds.length === 0) {
          toast.error('No users found.')
          setSending(false)
          return
        }
      }

      const type = targetType === 'user' ? 'status_update' : 'global_broadcast'
      const batchId = crypto.randomUUID()
      const opts = { type, title: title.trim(), message: message.trim(), batchId }
      const logData = {
        sentBy: user?.uid || 'unknown',
        sentByName: user?.displayName || user?.email || 'Admin',
        targetType,
        targetUserId: targetType === 'user' ? selectedUserId : null,
        type,
        title: title.trim(),
        message: message.trim(),
        userCount: userIds.length,
        batchId,
      }

      if (appConfig.hasFirebase) {
        try {
          await batchCreateNotifications(userIds, opts)
          await logSentNotification(logData)
        } catch {
          await complaintService.batchCreateNotifications(userIds, opts)
          await complaintService.logSentNotification(logData)
        }
      } else {
        await complaintService.batchCreateNotifications(userIds, opts)
        await complaintService.logSentNotification(logData)
      }

      toast.success(`Notification sent to ${userIds.length} user${userIds.length === 1 ? '' : 's'}.`)
      setTitle('')
      setMessage('')
      setSelectedUserId('')
    } catch (err) {
      toast.error(err.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h3 className="font-display text-base font-semibold text-text-primary mb-1">Send Notification</h3>
      <p className="text-sm text-text-secondary mb-6">Send a notification to a specific user or broadcast to all users.</p>

      <div className="space-y-4 mb-10">
        {/* Target Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Send to</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTargetType('user')}
              className={`touch-target px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                targetType === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-surface text-text-body hover:bg-surface/80'
              }`}
            >
              Select User
            </button>
            <button
              onClick={() => setTargetType('all')}
              className={`touch-target px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                targetType === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-surface text-text-body hover:bg-surface/80'
              }`}
            >
              All Users
            </button>
          </div>
        </div>

        {/* User Selector */}
        {targetType === 'user' && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-text-primary focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none"
            >
              <option value="">Choose a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}{u.email ? ` (${u.email})` : ''}</option>
              ))}
            </select>
            {users.length === 0 && (
              <p className="text-xs text-text-tertiary mt-1">No users with complaints yet.</p>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Water Supply Update"
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-text-primary focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-text-primary focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none resize-none"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !message.trim() || (targetType === 'user' && !selectedUserId)}
          className="w-full py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            'Send Notification'
          )}
        </button>
      </div>

      {/* Notification History */}
      <div className="border-t border-border/60 pt-6">
        <h3 className="font-display text-base font-semibold text-text-primary mb-1">Notification History</h3>
        <p className="text-sm text-text-secondary mb-4">Previously sent notifications.</p>

        {sentNotifications.length === 0 ? (
          <div className="p-6 text-center bg-surface rounded-xl">
            <svg className="w-8 h-8 mx-auto text-text-tertiary/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm text-text-secondary">No notifications sent yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sentNotifications.map(entry => (
              <div key={entry.id}>
                {deletingLogId === entry.id ? (
                  <div className="p-4 rounded-xl border border-border/60 bg-surface/80">
                    <p className="text-sm font-medium text-text-body mb-1">Delete this notification?</p>
                    <p className="text-xs text-text-tertiary mb-3">It will be permanently removed from all users' inboxes. This action cannot be undone.</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDeletingLogId(null)}
                        className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteSentNotification(entry.id, entry.batchId)
                          setDeletingLogId(null)
                        }}
                        className="text-xs font-semibold text-emergency hover:text-red-700 transition-colors"
                      >
                        Delete for All
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-border/60 bg-card hover:bg-surface/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 shrink-0 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
                          </svg>
                          <p className="text-sm font-medium text-text-primary truncate">{entry.title}</p>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2 mb-2">{entry.message}</p>
                        <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                          <span>→ {entry.userCount} {entry.userCount === 1 ? 'user' : 'users'}</span>
                          <span>{entry.sentByName}</span>
                          <span>{formatRelativeTime(entry.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeletingLogId(entry.id)}
                        className="shrink-0 p-1.5 text-text-tertiary hover:text-emergency hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete sent notification"
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
  )
}