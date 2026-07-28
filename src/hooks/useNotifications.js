import { useState, useEffect, useCallback, useRef } from 'react'
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead } from '../services/firestore'
import { complaintService } from '../services/complaintService'
import { appConfig } from '../lib/config'

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const unsubscribeRef = useRef(null)

  const userId = user?.uid ?? null

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }

    if (!appConfig.hasFirebase) {
      const load = () => complaintService.subscribeToNotifications(userId, (data) => {
        setNotifications(data)
        setLoading(false)
      })
      load()
      const interval = setInterval(load, 2000)
      return () => clearInterval(interval)
    }

    let fallbackInterval = null
    const unsubscribe = subscribeToNotifications(
      userId,
      (data) => {
        setNotifications(data)
        setLoading(false)
      },
      () => {
        const loadFallback = () => complaintService.subscribeToNotifications(userId, (data) => {
          setNotifications(data)
          setLoading(false)
        })
        loadFallback()
        fallbackInterval = setInterval(loadFallback, 2000)
      }
    )
    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      if (fallbackInterval) clearInterval(fallbackInterval)
    }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = useCallback(async (notificationId) => {
    if (!appConfig.hasFirebase) {
      await complaintService.markNotificationRead(notificationId)
    } else {
      await markNotificationRead(notificationId)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    if (!appConfig.hasFirebase) {
      await complaintService.markAllNotificationsRead(userId)
    } else {
      await markAllNotificationsRead(userId)
    }
  }, [userId])

  return { notifications, unreadCount, loading, markRead, markAllRead }
}
