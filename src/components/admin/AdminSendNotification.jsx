import { useState, useMemo } from 'react'
import { batchCreateNotifications } from '../../services/firestore'
import { complaintService } from '../../services/complaintService'
import { appConfig } from '../../lib/config'
import { useAuthContext } from '../../contexts/AuthContext'

export function AdminSendNotification({ complaints }) {
  const { user } = useAuthContext()
  const [targetType, setTargetType] = useState('user')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
    setResult(null)
    setError(null)

    try {
      let userIds

      if (targetType === 'user') {
        userIds = [selectedUserId]
      } else {
        const allUsers = new Set(complaints.map(c => c.userId).filter(Boolean))
        userIds = [...allUsers]
        if (userIds.length === 0) {
          setError('No users found.')
          setSending(false)
          return
        }
      }

      const type = targetType === 'user' ? 'status_update' : 'global_broadcast'

      if (appConfig.hasFirebase) {
        await batchCreateNotifications(userIds, { type, title: title.trim(), message: message.trim() })
      } else {
        await complaintService.batchCreateNotifications(userIds, { type, title: title.trim(), message: message.trim() })
      }

      setResult(`Notification sent to ${userIds.length} user${userIds.length === 1 ? '' : 's'}.`)
      setTitle('')
      setMessage('')
      setSelectedUserId('')
    } catch (err) {
      setError(err.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h3 className="font-display text-base font-semibold text-text-primary mb-1">Send Notification</h3>
      <p className="text-sm text-text-secondary mb-6">Send a notification to a specific user or broadcast to all users.</p>

      <div className="space-y-4">
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

        {/* Result / Error */}
        {result && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {result}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
