import { useState, useCallback, useEffect } from 'react'
import { subscribeToAllComplaints, addComplaint, updateComplaintStatus, getAllComplaints } from '../services/firestore'
import { complaintService } from '../services/complaintService'
import { appConfig } from '../lib/config'

function normalizeData(items) {
  return (items || []).map(c => ({
    ...c,
    latitude: c.latitude ?? c.lat ?? null,
    longitude: c.longitude ?? c.lng ?? null,
    type: c.type ?? c.severity ?? 'other',
    images: Array.isArray(c.images)
      ? c.images
      : c.photoURL
        ? [c.photoURL]
        : [],
    createdAt: c.createdAt?.toDate
      ? c.createdAt.toDate().toISOString()
      : c.createdAt,
    updatedAt: c.updatedAt?.toDate
      ? c.updatedAt.toDate().toISOString()
      : c.updatedAt,
  }))
}

export function useComplaints(userLocation, user) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!appConfig.hasFirebase) {
      complaintService.seedDemoData()
      setComplaints(normalizeData(complaintService.getAll()))
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToAllComplaints((data) => {
      setComplaints(normalizeData(data))
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const submitComplaint = useCallback(async (complaintData) => {
    if (!appConfig.hasFirebase) {
      setSubmitting(true)
      setError(null)
      try {
        return await complaintService.create(complaintData)
      } catch (err) {
        setError(err.message || 'Failed to submit complaint')
        throw err
      } finally {
        setSubmitting(false)
      }
    }

    if (!user || user.isDemoUser) throw new Error('Must be logged in')
    setSubmitting(true)
    setError(null)
    try {
      return await addComplaint(user, complaintData)
    } catch (err) {
      setError(err.message || 'Failed to submit complaint')
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [user])

  const updateComplaint = useCallback(async (id, updates) => {
    if (!appConfig.hasFirebase) {
      try {
        return await complaintService.update(id, updates)
      } catch (err) {
        setError(err.message || 'Failed to update complaint')
        throw err
      }
    }

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
    if (!appConfig.hasFirebase) {
      setComplaints(normalizeData(complaintService.getAll()))
      return
    }
    const all = await getAllComplaints()
    setComplaints(normalizeData(all))
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
