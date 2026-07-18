import { useState, useCallback, useEffect } from 'react'
import { subscribeToUserComplaints, addComplaint, updateComplaintStatus, getAllComplaints } from '../services/firestore'
import { complaintService } from '../services/complaintService'

export function useComplaints(userLocation, user) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      complaintService.seedDemoData()
      const demo = complaintService.getAll()
      setComplaints(demo)
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToUserComplaints(user.uid, (userComplaints) => {
      setComplaints(userComplaints)
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, userLocation])

  const submitComplaint = useCallback(async (complaintData) => {
    if (!user) throw new Error('Must be logged in')
    setSubmitting(true)
    setError(null)
    try {
      const newComplaint = await addComplaint(user, complaintData)
      return newComplaint
    } catch (err) {
      setError(err.message || 'Failed to submit complaint')
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [user])

  const updateComplaint = useCallback(async (id, updates) => {
    try {
      await updateComplaintStatus(id, updates.status)
    } catch (err) {
      setError(err.message || 'Failed to update complaint')
      throw err
    }
  }, [])

  const deleteComplaint = useCallback(async (id) => {
    throw new Error('Delete not supported')
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      const demo = complaintService.getAll()
      setComplaints(demo)
      return
    }
    const all = await getAllComplaints()
    setComplaints(all.filter(c => c.userId === user.uid))
  }, [user])

  return {
    complaints,
    loading,
    error,
    submitting,
    submitComplaint,
    updateComplaint,
    deleteComplaint,
    refresh,
  }
}
