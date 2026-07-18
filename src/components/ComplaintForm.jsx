import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from '../hooks/useLocation'
import { addComplaint } from '../services/firestore'
import EXIF from 'exif-js'

const SEVERITY_OPTIONS = [
  { value: 'critical_leak', label: 'Critical Leak', description: 'Major pipe burst, flooding' },
  { value: 'low_pressure', label: 'Low Pressure', description: 'Weak flow, cannot fill tanks' },
  { value: 'no_supply', label: 'No Supply', description: 'Complete water outage' },
  { value: 'contamination', label: 'Contamination', description: 'Discolored, smelly, unsafe water' },
  { value: 'billing', label: 'Billing Issue', description: 'Wrong meter reading, high charges' },
  { value: 'other', label: 'Other', description: 'Any other water issue' },
]

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`

export function ComplaintForm({ onSubmit, userLocation, user, loading, prefill, onPrefillComplete }) {
  const [formData, setFormData] = useState({
    severity: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    landmark: '',
    ward: '',
    photoURL: '',
    photoFile: null,
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
  const { getCurrentLocation } = useLocation()

  // Apply prefill data
  useEffect(() => {
    if (prefill && !formData.description) {
      setFormData(prev => ({
        ...prev,
        severity: prefill.suggestedSeverity || 'other',
        description: prefill.userMessage || '',
      }))
    }
  }, [prefill])

  // Notify parent when prefill is applied
  useEffect(() => {
    if (onPrefillComplete && prefill && formData.description) {
      onPrefillComplete()
    }
  }, [onPrefillComplete, prefill, formData.description])

  // Initialize map when modal opens
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

  const extractGPSFromPhoto = useCallback((file) => {
    return new Promise((resolve) => {
      EXIF.getData(file, function() {
        const lat = EXIF.getTag(this, 'GPSLatitude')
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef')
        const lon = EXIF.getTag(this, 'GPSLongitude')
        const lonRef = EXIF.getTag(this, 'GPSLongitudeRef')
        
        if (lat && lon && latRef && lonRef) {
          const convertDMS = (dms, ref) => {
            const degrees = dms[0].numerator / dms[0].denominator
            const minutes = dms[1].numerator / dms[1].denominator
            const seconds = dms[2].numerator / dms[2].denominator
            let decimal = degrees + minutes/60 + seconds/3600
            if (ref === 'S' || ref === 'W') decimal = -decimal
            return decimal
          }
          resolve({ lat: convertDMS(lat, latRef), lng: convertDMS(lon, lonRef) })
        } else {
          resolve(null)
        }
      })
    })
  }, [])

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'jalsetu/complaints')
    formData.append('tags', 'complaint,user_upload')
    formData.append('context', `user_id=${user?.uid || 'anonymous'}|severity=${formData.severity}`)

    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Upload failed')
    return data.secure_url
  }

  const updateLocation = useCallback(async (lat, lng) => {
    setUserMarker({ lat, lng })
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }))
    reverseGeocode(lat, lng)
  }, [])

  const handlePhotoSelect = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please select an image file' }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Image must be less than 10MB' }))
      return
    }

    setUploading(true)
    setErrors(prev => ({ ...prev, photo: null }))

    try {
      const gps = await extractGPSFromPhoto(file)
      if (gps) {
        await updateLocation(gps.lat, gps.lng)
      }

      const url = await uploadToCloudinary(file)
      setFormData(prev => ({
        ...prev,
        photoURL: url,
        photoFile: file,
      }))
    } catch (err) {
      setErrors(prev => ({ ...prev, photo: err.message || 'Failed to upload photo' }))
    } finally {
      setUploading(false)
    }
  }

  const handleImagePick = (e) => {
    const file = e.target.files[0]
    if (file) handlePhotoSelect(file)
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photoURL: '', photoFile: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.severity) newErrors.severity = 'Please select severity'
    if (!formData.latitude || !formData.longitude) newErrors.location = 'Please select location on map'
    if (!formData.photoURL) newErrors.photo = 'Please upload a photo'
    if (!user) newErrors.auth = 'Please sign in to submit'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const complaintData = {
        description: formData.description,
        severity: formData.severity,
        photoURL: formData.photoURL,
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
        address: formData.address,
        ward: formData.ward,
        landmark: formData.landmark,
      }

      const newComplaint = await addComplaint(user, complaintData)
      
      setFormData({
        severity: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        landmark: '',
        ward: '',
        photoURL: '',
        photoFile: null,
      })
      setUserMarker(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      if (onSubmit) onSubmit(newComplaint)
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to submit complaint' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 pb-24 safe-area-inset-bottom overflow-y-auto">
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6" noValidate>
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Water Issue</h2>
          <p className="text-gray-500 text-sm mb-6">Help us improve water supply in your area</p>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Severity Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M4%206l4%204%204-4H4z%22%2F%3E%3C%2Fsvg%3E")] bg-right bg-no-repeat pr-8 ${errors.severity ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="" disabled>Select severity</option>
              {SEVERITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
            {errors.severity && <p className="mt-1 text-sm text-red-600">{errors.severity}</p>}
          </div>

          {/* Description */}
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

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo * (Max 10MB)</label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagePick}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              {formData.photoURL ? (
                <div className="relative aspect-square max-w-xs rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.photoURL} alt="Uploaded complaint photo" className="w-full h-full object-cover" />
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
                <label className="relative aspect-square w-full max-w-xs rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 font-medium">Tap to upload photo</span>
                  <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
                </label>
              )}
              
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading to Cloudinary...
                </div>
              )}
              {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
            </div>
          </div>

          {/* Location */}
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

          {/* Ward / Landmark */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ward / Area</label>
              <input
                type="text"
                value={formData.ward}
                onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ward / Area"
              />
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || loading || uploading}
            className="w-full touch-target bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : uploading ? 'Uploading photo...' : 'Submit Complaint'}
          </button>

          <p className="text-center text-xs text-gray-500">
            By submitting, you agree to share your location and contact info with JalSetu authorities
          </p>
        </div>
      </form>

      {/* Map Modal */}
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

          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white safe-area-inset-bottom flex gap-2">
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

      <style jsx global>{`
        .user-marker-pulse { position: relative; width: 20px; height: 20px; }
        .user-marker-pulse::before, .user-marker-pulse::after {
          content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 20px; height: 20px; border-radius: 50%; background: #0ea5e9; opacity: 0.6;
          animation: pulse-ring 2s ease-out infinite;
        }
        .user-marker-pulse::after { animation-delay: 1s; }
        .user-marker-dot { width: 12px; height: 12px; border-radius: 50%; background: #0ea5e9; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative; z-index: 1; margin: 4px auto; }
        @keyframes pulse-ring { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.6; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }

        .marker-wrapper { position: relative; width: 36px; height: 36px; }
        .marker-pin { width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 24px solid #0ea5e9; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); }
        .marker-pulse { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 24px; height: 24px; border-radius: 50%; border: 2px solid #0ea5e9; animation: marker-pulse 1.5s ease-out infinite; opacity: 0.6; }
        @keyframes marker-pulse { 0% { transform: translateX(-50%) scale(0.5); opacity: 0.6; } 100% { transform: translateX(-50%) scale(2); opacity: 0; } }

        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; }
        .leaflet-control-zoom a { background: white !important; color: #374151 !important; border: none !important; width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 18px !important; }
        .leaflet-control-zoom a:hover { background: #f3f4f6 !important; }
        .leaflet-control-zoom-in { border-radius: 8px 8px 0 0 !important; }
        .leaflet-control-zoom-out { border-radius: 0 0 8px 8px !important; border-top: 1px solid #e5e7eb !important; }
      `}</style>
    </div>
  )
}
