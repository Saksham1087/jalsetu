import { useState } from 'react'
import { statusConfig } from '../../lib/statusConfig'
import { formatType } from '../../utils/formatters'
import { toDate } from '../../utils/date'
import { generateComplaintPdf } from '../../utils/pdfGenerator'
import { createNotification } from '../../services/firestore'
import { complaintService } from '../../services/complaintService'
import { appConfig } from '../../lib/config'
import { useToast } from '../Toast'

const STATUS_OPTIONS = Object.entries(statusConfig).map(([value, v]) => ({
  value,
  label: v.label,
  color: v.dot,
}))

const NEXT_STATUS = {
  submitted: 'acknowledged',
  acknowledged: 'in_progress',
  in_progress: 'resolved',
  resolved: 'resolved',
  rejected: 'rejected',
}

export function AdminComplaintDetail({ complaint, onClose, onUpdateStatus, onDelete }) {
  const { toast } = useToast()
  const defaultStatus = NEXT_STATUS[complaint?.status] || complaint?.status || ''
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus)
  const [note, setNote] = useState('')
  const [notifyUser, setNotifyUser] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  if (!complaint) return null

  const timeline = Array.isArray(complaint.timeline) ? complaint.timeline : []

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === complaint.status) return
    setUpdating(true)
    try {
      await onUpdateStatus(complaint.id, selectedStatus, note)

      if (notifyUser && complaint.userId) {
        const title = 'Status Updated'
        const message = `${note ? `${note} — ` : ''}Your complaint ${complaint.displayId || ''} has been updated to ${selectedStatus.replace(/_/g, ' ')}.`
        if (appConfig.hasFirebase) {
          await createNotification({
            userId: complaint.userId,
            type: 'status_update',
            title,
            message,
            complaintId: complaint.id,
          })
        } else {
          await complaintService.createNotification({
            userId: complaint.userId,
            type: 'status_update',
            title,
            message,
            complaintId: complaint.id,
          })
        }
      }

      toast.success(`Status updated to ${selectedStatus.replace(/_/g, ' ')}`)
      onClose()
    } catch (err) {
      setUpdateError(err.message || 'Failed to update status')
      toast.error(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(complaint.id)
      toast.success('Complaint deleted')
      onClose()
    } catch (err) {
      setUpdateError(err.message || 'Failed to delete complaint')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-overlay flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold text-text-primary">Complaint Details</h2>
          <button onClick={onClose} className="p-2 text-text-tertiary hover:text-text-body touch-target">
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
            <h3 className="text-sm font-medium text-text-secondary mb-1">Description</h3>
            <p className="text-text-primary">{complaint.description || 'No description'}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Type</h3>
              <p className="text-text-primary">{formatType(complaint.type || complaint.severity || 'N/A')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Ward</h3>
              <p className="text-text-primary">{complaint.ward || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Landmark</h3>
              <p className="text-text-primary">{complaint.landmark || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Mobile</h3>
              <p className="text-text-primary">{complaint.mobile || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Submitted by</h3>
              <p className="text-text-primary">{complaint.userName || 'Anonymous'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Location</h3>
              <p className="text-text-primary text-sm">
                {(complaint.latitude ?? complaint.lat)?.toFixed(4) ?? 'N/A'}, {(complaint.longitude ?? complaint.lng)?.toFixed(4) ?? 'N/A'}
              </p>
            </div>
          </div>

          {/* Address */}
          {complaint.address && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-1">Address</h3>
              <p className="text-text-primary text-sm">{complaint.address}</p>
            </div>
          )}

          {/* Photo */}
          {complaint.images?.[0] && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">Photo</h3>
              <img src={complaint.images[0]} alt="Complaint" className="max-w-sm rounded-lg border border-border" />
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Timeline</h3>
            <div className="space-y-3">
              {timeline.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${i === timeline.length - 1 ? 'bg-teal-500' : 'bg-border'}`} />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium text-text-primary capitalize">{entry.status?.replace('_', ' ')}</p>
                    {entry.note && <p className="text-xs text-text-secondary mt-0.5">{entry.note}</p>}
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {(() => { const d = toDate(entry.timestamp); return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Unknown' })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_OPTIONS.filter(s => s.value !== complaint.status).map(s => (
                <button
                  key={s.value}
                  onClick={() => { setSelectedStatus(s.value); setUpdateError(null) }}
                  className={`touch-target px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === s.value
                      ? `${s.color.replace('bg-', 'bg-').replace('500', '100')} ${s.color.replace('bg-', 'text-').replace('500', '800')} border-2 border-current`
                      : 'bg-surface text-text-body hover:bg-surface/80'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 mb-3 cursor-pointer touch-target">
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="w-4 h-4 rounded border-border text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-text-body">Notify user about this update</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value); setUpdateError(null) }}
              placeholder="Add a note (optional)..."
              className="w-full px-3 py-3 border border-border rounded-lg text-sm mb-3 bg-card"
              rows={2}
            />
            {updateError && (
              <p className="text-red-600 text-sm mb-3">{updateError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === complaint.status || updating}
                className="flex-1 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-surface text-text-body font-medium rounded-lg hover:bg-surface/80 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Download Report */}
          <div className="border-t border-border pt-4">
            <button
              onClick={async () => {
                setDownloadingPdf(true)
                try { await generateComplaintPdf(complaint) } catch {}
                setDownloadingPdf(false)
              }}
              disabled={downloadingPdf}
              className="w-full py-2 bg-teal-50 border border-teal-200 text-teal-700 font-medium rounded-lg hover:bg-teal-100 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {downloadingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Report (PDF)
                </>
              )}
            </button>
          </div>

          {/* Delete Complaint */}
          <div className="border-t border-border pt-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 bg-red-50 border border-red-200 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              Delete Complaint
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-overlay flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
              <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Complaint?</h3>
                <p className="text-text-secondary text-sm mb-4">This complaint will be hidden from all views. You can restore it later from the Deleted section.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-surface text-text-body font-medium rounded-lg hover:bg-surface/80 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}