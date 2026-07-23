import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from '../hooks/useLocation'
import { appConfig } from '../lib/config'
import { MIRA_BHAYANDER } from '../lib/miraBhayander'
import '../styles/complaint-form.css'

const TYPE_OPTIONS = [
  { value: 'critical_leak', label: 'Critical Leak', description: 'Major pipe burst, flooding' },
  { value: 'low_pressure', label: 'Low Pressure', description: 'Weak flow, cannot fill tanks' },
  { value: 'no_supply', label: 'No Supply', description: 'Complete water outage' },
  { value: 'contamination', label: 'Contamination', description: 'Discolored, smelly, unsafe water' },
  { value: 'billing', label: 'Billing Issue', description: 'Wrong meter reading, high charges' },
  { value: 'other', label: 'Other', description: 'Any other water issue' },
]

const MAX_PHOTO_SIZE = 1200
const JPEG_QUALITY = 0.7

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_PHOTO_SIZE || height > MAX_PHOTO_SIZE) {
        const ratio = Math.min(MAX_PHOTO_SIZE / width, MAX_PHOTO_SIZE / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function ComplaintForm({ onSubmit, userLocation, user, authLoading, loading, prefill, onPrefillComplete }) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    landmark: '',
    ward: '',
    mobile: '',
    images: [],
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [userMarker, setUserMarker] = useState(null)

  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const fileInputRef = useRef(null)
  const { getCurrentLocation, permission, location } = useLocation()
  const [geoInitAttempted, setGeoInitAttempted] = useState(false)

  useEffect(() => {
    if (geoInitAttempted) return
    if (location && !formData.latitude) {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      }))
      reverseGeocode(location.latitude, location.longitude)
      setGeoInitAttempted(true)
    }
  }, [location])

  useEffect(() => {
    if (prefill && !formData.description) {
      setFormData(prev => ({
        ...prev,
        type: prefill.suggestedType || 'other',
        description: prefill.userMessage || '',
      }))
    }
  }, [prefill])

  useEffect(() => {
    if (onPrefillComplete && prefill && formData.description) {
      onPrefillComplete()
    }
  }, [onPrefillComplete, prefill, formData.description])

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      initMap()
    }
  }, [showMap])

  const initMap = async () => {
    try {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = userMarker
        ? [userMarker.lat, userMarker.lng]
        : (userLocation ? [userLocation.latitude, userLocation.longitude] : [28.6139, 77.2090])

      const map = L.map(mapRef.current, {
        center,
        zoom: userMarker ? 17 : (userLocation ? 15 : 12),
        zoomControl: false,
        attributionControl: false,
        tap: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      L.control.zoom({ position: 'topright' }).addTo(map)

      if (userLocation && !userMarker) {
        L.marker([userLocation.latitude, userLocation.longitude], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="user-marker-pulse"><div class="user-marker-dot"></div></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
          interactive: false,
        }).addTo(map)
      }

      const initialPos = userMarker ? [userMarker.lat, userMarker.lng] : center
      const marker = L.marker(initialPos, {
        draggable: true,
        icon: L.divIcon({
          className: 'complaint-marker',
          html: '<div class="marker-wrapper"><div class="marker-pin"></div><div class="marker-pulse"></div></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        }),
      }).addTo(map)

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        setUserMarker({ lat: pos.lat, lng: pos.lng })
        reverseGeocode(pos.lat, pos.lng)
      })

      map.on('click', (e) => {
        marker.setLatLng(e.latlng)
        setUserMarker({ lat: e.latlng.lat, lng: e.latlng.lng })
        reverseGeocode(e.latlng.lat, e.latlng.lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker
      setMapReady(true)

      setTimeout(() => map.invalidateSize(), 100)
    } catch (err) {
      console.error('Map init error:', err)
    }
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data.address) {
        const addr = data.address
        setFormData(prev => ({
          ...prev,
          address: data.display_name || '',
          ward: addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '',
          landmark: addr.road || addr.path || addr.footway || '',
        }))
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e)
    }
  }

  const handleLocationPick = useCallback(async () => {
    try {
      const loc = await getCurrentLocation()
      setUserMarker({ lat: loc.latitude, lng: loc.longitude })
      setFormData(prev => ({
        ...prev,
        latitude: loc.latitude.toString(),
        longitude: loc.longitude.toString(),
      }))
      reverseGeocode(loc.latitude, loc.longitude)
    } catch (err) {
      setErrors(prev => ({ ...prev, location: 'Unable to get location. Please enable location access.' }))
    }
  }, [getCurrentLocation])

  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      if (appConfig.hasCloudinary && window.cloudinary) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        if (cloudName && uploadPreset) {
          window.cloudinary.openUploadWidget(
            {
              cloudName, uploadPreset,
              folder: 'jalsetu/complaints',
              tags: ['complaint', 'user_upload'],
              context: { user_id: user?.uid || 'anonymous', type: formData.type },
              maxFileSize: 10 * 1024 * 1024, resourceType: 'image', multiple: false,
              showAdvancedOptions: false, clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'], theme: 'white',
            },
            (error, result) => {
              setUploading(false)
              if (error) {
                setErrors(prev => ({ ...prev, photo: error.message || 'Upload failed' }))
                return
              }
              if (result?.info?.secure_url) {
                setFormData(prev => ({ ...prev, images: [result.info.secure_url] }))
              }
            }
          )
          return
        }
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Photo must be under 10MB' }))
        setUploading(false)
        return
      }

      const dataUrl = await resizeImage(file)
      setFormData(prev => ({ ...prev, images: [dataUrl] }))
    } catch (err) {
      setErrors(prev => ({ ...prev, photo: err.message || 'Upload failed' }))
    } finally {
      setUploading(false)
    }
  }, [formData.type, user])

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, images: [] }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.type) newErrors.type = 'Please select type'
    if (!formData.latitude || !formData.longitude) newErrors.location = 'Please select location on map'

    if (!authLoading && !appConfig.isDemo && !user) {
      newErrors.auth = 'Please sign in to submit'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const complaintData = {
        type: formData.type,
        description: formData.description,
        images: formData.images,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        address: formData.address,
        ward: formData.ward,
        landmark: formData.landmark,
        mobile: formData.mobile || null,
      }

      await onSubmit(complaintData)

      setFormData({
        type: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        landmark: '',
        ward: '',
        mobile: '',
        images: [],
      })
      setUserMarker(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

    } catch (err) {
      setErrors({ submit: err.message || 'Failed to submit complaint' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 safe-area-inset-bottom overflow-y-auto pb-32">
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6" noValidate>
        <div className="max-w-xl mx-auto pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Water Issue</h2>
          <p className="text-gray-500 text-sm mb-6">Help us improve water supply in your area</p>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {authLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Checking authentication...
            </div>
          )}

          {!authLoading && !user && !appConfig.isDemo && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
              Please sign in to submit a complaint.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E")] bg-right bg-no-repeat pr-8 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="" disabled>Select type</option>
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Describe the issue in detail..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Max 10MB)</label>
            <div className="space-y-3">
              {formData.images.length > 0 ? (
                <div className="relative aspect-square max-w-xs rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.images[0]} alt="Uploaded complaint photo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {(formData.latitude && formData.longitude) && (
                    <span className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      GPS: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="relative aspect-square w-full max-w-xs rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 font-medium">Tap to upload photo</span>
                  <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={handlePhotoUpload} />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  Processing photo...
                </div>
              )}
              {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLocationPick}
                  className="flex-1 touch-target px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use My Location
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="touch-target px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-5.447A1 1 0 013 12.383V5.25A2.56 2.56 0 015.593 3H10.25a2.56 2.56 0 012.56 2.25v6.133a1 1 0 01-1.59.814L9 20z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Pick on Map
                </button>
              </div>

              {!formData.latitude && permission === 'denied' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Enable Location
                  </p>
                  <p className="text-xs text-amber-700 mt-1">Location access is blocked. Please enable it in browser settings or use the map to mark your location.</p>
                </div>
              )}

              {(formData.latitude && formData.longitude) && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <p className="text-sm text-primary-800 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Location captured
                  </p>
                  <p className="text-xs text-primary-600 mt-1 font-mono">
                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="mt-2 text-sm text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Adjust on map
                  </button>
                </div>
              )}
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ward / Area</label>
              <select
                value={formData.ward}
                onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E")] bg-right bg-no-repeat pr-8`}
              >
                <option value="">Select Ward</option>
                {MIRA_BHAYANDER.wards.map(w => (
                  <option key={w.id} value={w.name}>{w.name} — {w.area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nearby landmark"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number (optional)</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                setFormData(prev => ({ ...prev, mobile: val }))
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="10-digit mobile number"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading || uploading || authLoading || (!appConfig.isDemo && !user)}
            className="w-full mt-8 touch-target min-h-[48px] py-3.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : uploading ? 'Uploading photo...' : 'Submit Complaint'}
          </button>

          <p className="text-center text-xs text-gray-500">
            By submitting, you agree to share your location and contact info with JalSetu authorities
          </p>
        </div>
      </form>

      {showMap && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col safe-area-insets animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="map-title">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 id="map-title" className="text-lg font-semibold">Select Location</h3>
            <button onClick={() => setShowMap(false)} className="touch-target p-2 text-gray-400 hover:text-gray-600" aria-label="Close map">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 relative" style={{ height: '100%' }}>
            <div ref={mapRef} className="absolute inset-0" />
            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            )}

            {mapReady && userMarker && (
              <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-2 max-w-md mx-auto">
                <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-700 flex-1">Drag the pin or tap map to set location</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={handleLocationPick}
              className="flex-1 touch-target border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Use My Location
            </button>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="flex-1 touch-target bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
