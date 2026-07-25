import { useState, useCallback, useEffect } from 'react'

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState('prompt')

  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) return
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' })
      setPermission(perm.state)
      perm.onchange = () => setPermission(perm.state)
    } catch (e) {
      console.warn('Permission query failed:', e)
    }
  }, [])

  const getCurrentLocation = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          }
          setLocation(loc)
          setError(null)
          resolve(loc)
        },
        (err) => {
          let message = 'Unable to get location'
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = 'Location permission denied. Please enable in settings.'
              setPermission('denied')
              break
            case err.POSITION_UNAVAILABLE:
              message = 'Location unavailable'
              break
            case err.TIMEOUT:
              message = 'Location request timed out'
              break
          }
          setError(message)
          reject(new Error(message))
        },
        { ...defaultOptions, ...options }
      )
    })
  }, [])

  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) return false
    try {
      await getCurrentLocation()
      return true
    } catch {
      return false
    }
  }, [getCurrentLocation])

  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  return {
    location,
    error,
    permission,
    getCurrentLocation,
    requestPermission,
  }
}
