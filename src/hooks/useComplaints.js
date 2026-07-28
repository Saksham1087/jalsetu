import { useState, useCallback, useEffect } from 'react'
import { subscribeToAllComplaints, addComplaint, getAllComplaints } from '../services/firestore'
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
    deletedAt: c.deletedAt?.toDate
      ? c.deletedAt.toDate().toISOString()
      : c.deletedAt,
    timeline: (c.timeline || []).map(entry => ({
      ...entry,
      timestamp: entry.timestamp?.toDate
        ? entry.timestamp.toDate().toISOString()
        : entry.timestamp,
    })),
  }))
}

export function useComplaints(userLocation, user) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      setError(null)
      try {
        return await complaintService.create(complaintData)
      } catch (err) {
        setError(err.message || 'Failed to submit complaint')
        throw err
      }
    }

    if (!user || user.isDemoUser) throw new Error('Must be logged in')
    setError(null)
    try {
      return await addComplaint(user, complaintData)
    } catch (err) {
      setError(err.message || 'Failed to submit complaint')
      throw err
    }
  }, [user])

  const refresh = useCallback(async () => {
    if (!appConfig.hasFirebase) {
      setComplaints(normalizeData(complaintService.getAll()))
      return
    }
    const all = await getAllComplaints()
    setComplaints(normalizeData(all))
  }, [])

  return {
    complaints,
    loading,
    error,
    submitComplaint,
    refresh,
  }
}
