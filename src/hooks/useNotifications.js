import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchNotifications, subscribeToDeletedBatches, markNotificationRead, markAllNotificationsRead, softDeleteNotification } from '../services/firestore'
import { complaintService } from '../services/complaintService'
import { appConfig } from '../lib/config'

const getLocallyDeletedIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem('jalsetu_deleted_notification_ids') || '[]'))
  } catch {
    return new Set()
  }
}

const saveLocallyDeletedIds = (ids) => {
  localStorage.setItem('jalsetu_deleted_notification_ids', JSON.stringify([...ids]))
}

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([])
  const locallyDeletedRef = useRef(getLocallyDeletedIds())
  const deletedBatchesRef = useRef(new Set())
  const rawNotificationsRef = useRef([])

  const userId = user?.uid ?? null

  const applyFilters = useCallback(() => {
    const filtered = rawNotificationsRef.current.filter(n => {
      if (locallyDeletedRef.current.has(n.id)) return false
      if (n.batchId && deletedBatchesRef.current.has(n.batchId)) return false
      return true
    })
    setNotifications(filtered)
  }, [])

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      return
    }

    let seeded = false

    const seedFromFirestore = async () => {
      if (!appConfig.hasFirebase || seeded) return
      try {
        const firestoreNotifications = await fetchNotifications(userId)
        await complaintService.syncNotificationsFromFirestore(firestoreNotifications)
      } catch {
      }
      seeded = true
    }

    const poll = () => {
      complaintService.subscribeToNotifications(userId, (data) => {
        rawNotificationsRef.current = data
        applyFilters()
      })
    }

    if (appConfig.hasFirebase) {
      seedFromFirestore().then(poll)
    } else {
      poll()
    }

    const interval = setInterval(poll, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [userId, applyFilters])

  useEffect(() => {
    if (!userId) return

    const updateBatches = (ids) => {
      deletedBatchesRef.current = new Set(ids)
      applyFilters()
    }

    const loadDeletedBatches = () => {
      complaintService.subscribeToDeletedBatches((ids) => {
        updateBatches(ids)
      })
    }

    if (!appConfig.hasFirebase) {
      loadDeletedBatches()
      const interval = setInterval(loadDeletedBatches, 5000)
      return () => clearInterval(interval)
    }

    const unsub = subscribeToDeletedBatches(
      (ids) => {
        updateBatches(ids)
      },
      () => {
        loadDeletedBatches()
      }
    )
    const interval = setInterval(loadDeletedBatches, 5000)

    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [userId, applyFilters])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = useCallback(async (notificationId) => {
    if (!appConfig.hasFirebase) {
      await complaintService.markNotificationRead(notificationId)
      return
    }
    try {
      await markNotificationRead(notificationId)
    } catch {
    }
    await complaintService.markNotificationRead(notificationId)
    const n = rawNotificationsRef.current.find(n => n.id === notificationId)
    if (n) n.read = true
    applyFilters()
  }, [applyFilters])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    if (!appConfig.hasFirebase) {
      await complaintService.markAllNotificationsRead(userId)
      return
    }
    try {
      await markAllNotificationsRead(userId)
    } catch {
    }
    await complaintService.markAllNotificationsRead(userId)
    rawNotificationsRef.current.forEach(n => {
      if (n.userId === userId) n.read = true
    })
    applyFilters()
  }, [userId, applyFilters])

  const deleteNotification = useCallback(async (notificationId) => {
    if (!appConfig.hasFirebase) {
      await complaintService.softDeleteNotification(notificationId)
      return
    }

    try {
      await softDeleteNotification(notificationId)
    } catch {
    }
    await complaintService.softDeleteNotification(notificationId)
    locallyDeletedRef.current.add(notificationId)
    saveLocallyDeletedIds(locallyDeletedRef.current)
    applyFilters()
  }, [applyFilters])

  return { notifications, unreadCount, markRead, markAllRead, deleteNotification }
}
