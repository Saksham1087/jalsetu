import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from '../hooks/useLocation'
import { appConfig } from '../lib/config'
import { MIRA_BHAYANDER } from '../lib/miraBhayander'
import { generateComplaintPdf } from '../utils/pdfGenerator'


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

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function resizeImage(file) {
  const blobUrl = URL.createObjectURL(file)
  try {
    const dataUrl = await new Promise((resolve, reject) => {
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
        if (!ctx) return reject(new Error('Canvas not supported'))
        try {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
        } catch (e) {
          reject(new Error('Failed to process image: ' + e.message))
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = blobUrl
    })
    return dataUrl
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

export function ComplaintForm({ onSubmit, userLocation, user, authLoading, loading }) {
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
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedComplaint, setSubmittedComplaint] = useState(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
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
  }, [location, formData.latitude, geoInitAttempted])

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
        : (userLocation ? [userLocation.latitude, userLocation.longitude] : MIRA_BHAYANDER.center)

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
          className: 'custom-complaint-marker',
          html: '<div class="marker-wrapper" style="--marker-color: #127A7A"><div class="marker-pin"></div><div class="marker-pulse"></div></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        }),
      }).addTo(map)

      const onMarkerMove = (lat, lng) => {
        setUserMarker({ lat, lng })
        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }))
        reverseGeocode(lat, lng)
      }

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        onMarkerMove(pos.lat, pos.lng)
      })

      map.on('click', (e) => {
        marker.setLatLng(e.latlng)
        onMarkerMove(e.latlng.lat, e.latlng.lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker
      setMapReady(true)

      setTimeout(() => map.invalidateSize(), 100)
    } catch (err) {
      console.error('Map init error:', err)
    }
  }

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      initMap()
    }
  }, [showMap])

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

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'type':
        return !value ? 'Please select type' : ''
      case 'description':
        return !value.trim() ? 'Description is required' : ''
      default:
        return ''
    }
  }, [])

  const handleBlur = useCallback((name, value) => {
    setErrors(prev => {
      const msg = validateField(name, value)
      if (msg) return { ...prev, [name]: msg }
      const r = { ...prev }
      delete r[name]
      return r
    })
  }, [validateField])

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

      if (mapInstanceRef.current && markerRef.current) {
        const latlng = [loc.latitude, loc.longitude]
        markerRef.current.setLatLng(latlng)
        mapInstanceRef.current.setView(latlng, 17)
        mapInstanceRef.current.invalidateSize()
      }
    } catch {
      setErrors(prev => ({ ...prev, location: 'Unable to get location. Please enable location access.' }))
    }
  }, [getCurrentLocation])

  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setErrors(prev => { const r = { ...prev }; delete r.photo; return r })
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
            async (error, result) => {
              if (error) {
                if (error.message === 'User cancelled') {
                  setUploading(false)
                  return
                }
                try {
                  let dataUrl
                  try {
                    dataUrl = await resizeImage(file)
                  } catch {
                    dataUrl = await fileToDataUrl(file)
                  }
                  setFormData(prev => ({ ...prev, images: [dataUrl] }))
                } catch {
                  setErrors(prev => ({ ...prev, photo: 'Could not process photo. Please try a different image.' }))
                } finally {
                  setUploading(false)
                }
                return
              }
              setUploading(false)
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

      let dataUrl
      try {
        dataUrl = await resizeImage(file)
      } catch {
        dataUrl = await fileToDataUrl(file)
      }
      setFormData(prev => ({ ...prev, images: [dataUrl] }))
    } catch {
      setErrors(prev => ({ ...prev, photo: 'Could not upload photo. Please try a different image or skip this step.' }))
    } finally {
      setUploading(false)
    }
  }, [formData.type, user])

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setSubmittedComplaint(null)
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
  }

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
        userEmail: user?.email || null,
      }

      const result = await onSubmit(complaintData)
      const complaintWithData = {
        ...result,
        userName: user?.displayName || result.userName || 'User',
        userEmail: user?.email || result.userEmail || null,
        images: result.images?.length ? result.images : formData.images,
      }
      setSubmittedComplaint(complaintWithData)

      setShowSuccess(true)

    } catch (err) {
      setErrors({ submit: err.message || 'Failed to submit complaint' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto safe-area-inset-bottom pb-24">
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6" noValidate>
        <div className="max-w-xl mx-auto pb-4">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Report Water Issue</h2>
          <p className="text-text-secondary text-sm mb-6">Help us improve water supply in your area</p>

          {showSuccess ? (
            <div className="mb-6 p-6 bg-card rounded-2xl border border-teal-200/60 shadow-sm text-center animate-fade-in">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-teal-100 animate-[water-ripple_1.5s_ease-out_infinite]" />
                <div className="absolute inset-0 rounded-full bg-teal-100 animate-[water-ripple_1.5s_ease-out_infinite_0.5s]" />
                <div className="relative w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-1">Complaint Submitted</h3>
              <p className="text-sm text-text-secondary">Your water issue has been reported. Track its status in the list view.</p>
              <div className="mt-4 h-1.5 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full animate-[water-rise_2s_ease-out]" />
              </div>
              <p className="text-xs text-text-tertiary mt-2">Ticket created</p>
              {user?.email && (
                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg text-left">
                  <p className="text-xs text-teal-700 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Confirmation sent to {user.email}
                  </p>
                  <p className="text-xs text-teal-600 mt-1">We've sent a confirmation email with your complaint details.</p>
                </div>
              )}
              {submittedComplaint && (
                <button
                  type="button"
                  onClick={async () => {
                    setDownloadingPdf(true)
                    try {
                      await generateComplaintPdf(submittedComplaint)
                    } catch {
                      // silent
                    }
                    setDownloadingPdf(false)
                  }}
                  disabled={downloadingPdf}
                  className="mt-4 w-full touch-target min-h-[44px] py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {downloadingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Download Report
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseSuccess}
                className="mt-3 w-full touch-target min-h-[44px] py-2.5 border border-border text-text-body font-medium rounded-lg hover:bg-surface transition-colors"
              >
                Back
              </button>
            </div>
          ) : (
          <>
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
            <label className="block text-sm font-medium text-text-body mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, type: e.target.value }))
                setErrors(prev => { const r = { ...prev }; delete r.type; return r })
              }}
              onBlur={(e) => handleBlur('type', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-card bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23889ba3%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E")] bg-right bg-no-repeat pr-8 ${errors.type ? 'border-red-500' : 'border-border'}`}
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
            <label className="block text-sm font-medium text-text-body mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }))
                setErrors(prev => { const r = { ...prev }; delete r.description; return r })
              }}
              onBlur={(e) => handleBlur('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-card ${errors.description ? 'border-red-500' : 'border-border'}`}
              placeholder="Describe the issue in detail..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-2">Photo <span className="text-text-tertiary font-normal">(Optional, Max 10MB)</span></label>
            <div className="space-y-3">
              {formData.images.length > 0 ? (
                <div className="relative aspect-square max-w-[280px] sm:max-w-xs rounded-lg overflow-hidden border border-border">
                  <img src={formData.images[0]} alt="Uploaded complaint photo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 touch-target"
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
                  className="relative aspect-square w-full max-w-xs rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-600/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-12 h-12 text-text-tertiary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-text-body font-medium">Tap to upload photo</span>
                  <span className="text-xs text-text-tertiary">JPG, PNG up to 10MB</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={handlePhotoUpload} />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-text-body">
                  <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  Processing photo...
                </div>
              )}
              {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-2">Location *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLocationPick}
                  className="flex-1 touch-target px-4 py-3 border border-border rounded-lg bg-card text-sm font-medium text-text-body flex items-center justify-center gap-2"
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
                  className="touch-target px-4 py-3 border border-border rounded-lg bg-card text-sm font-medium text-text-body flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <circle cx="12" cy="11" r="3" strokeWidth={2} />
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
                <div className="bg-teal-600/10 border border-teal-600/20 rounded-lg p-3">
                  <p className="text-sm text-teal-600 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Location captured
                  </p>
                  <p className="text-xs text-teal-600 mt-1 font-mono">
                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="mt-2 text-sm text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Adjust on map
                  </button>
                </div>
              )}
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-body mb-2">Ward / Area</label>
              <select
                value={formData.ward}
                onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                className={`w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-card bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23889ba3%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E")] bg-right bg-no-repeat pr-8`}
              >
                <option value="">Select Ward</option>
                {MIRA_BHAYANDER.wards.map(w => (
                  <option key={w.id} value={w.name}>{w.name} — {w.area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-body mb-2">Landmark</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-card"
                placeholder="Nearby landmark"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-body mb-2">Mobile Number (optional)</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                setFormData(prev => ({ ...prev, mobile: val }))
              }}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-card"
              placeholder="10-digit mobile number"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading || uploading || authLoading || (!appConfig.isDemo && !user)}
            className="w-full mt-8 touch-target min-h-[48px] py-3.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : uploading ? 'Uploading photo...' : 'Submit Complaint'}
          </button>

          <p className="text-center text-xs text-text-secondary">
            By submitting, you agree to share your location and contact info with JalSetu authorities
          </p>
        </>
        )}
        </div>
      </form>

      {showMap && (
        <div className="fixed inset-0 z-50 bg-card flex flex-col safe-area-insets animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="map-title">
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
            <h3 id="map-title" className="text-lg font-semibold text-text-primary">Select Location</h3>
            <button onClick={() => setShowMap(false)} className="touch-target p-2 text-text-tertiary hover:text-text-body" aria-label="Close map">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 relative" style={{ height: '100%' }}>
            <div ref={mapRef} className="absolute inset-0" />
            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-text-body">Loading map...</p>
                </div>
              </div>
            )}

            {mapReady && userMarker && (
              <div className="absolute top-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-2 max-w-md mx-auto">
                <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-text-body flex-1">Drag the pin or tap map to set location</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-card flex gap-2">
            <button
              type="button"
              onClick={handleLocationPick}
              className="flex-1 touch-target border border-border text-text-body font-medium rounded-lg hover:bg-surface"
            >
              Use My Location
            </button>
            <button
              type="button"
              onClick={() => {
                if (userMarker) {
                  setFormData(prev => ({
                    ...prev,
                    latitude: userMarker.lat.toString(),
                    longitude: userMarker.lng.toString(),
                  }))
                }
                setShowMap(false)
              }}
              className="flex-1 touch-target bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
