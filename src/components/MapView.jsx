import { useEffect, useRef, useState, useCallback } from 'react'
import { calculateDistance } from '../utils/geo'

const WATER_COLOR = '#0ea5e9'
const CLUSTER_COLORS = {
  small: '#0ea5e9',
  medium: '#0284c7',
  large: '#0369a1',
}

export function MapView({ complaints, userLocation, onComplaintSelect }) {
  const mapRef = useRef(null)
  const markerRefs = useRef({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [mapError, setMapError] = useState(null)

  const loadLeaflet = useCallback(async () => {
    if (window.L) return window.L
    try {
      await import('leaflet/dist/leaflet.css')
      const L = (await import('leaflet')).default
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      window.L = L
      return L
    } catch (e) {
      setMapError('Failed to load map')
      throw e
    }
  }, [])

  useEffect(() => {
    let mounted = true
    loadLeaflet().then(L => {
      if (!mounted || mapRef.current._leaflet_map) return

      const map = L.map(mapRef.current, {
        center: userLocation ? [userLocation.latitude, userLocation.longitude] : [28.6139, 77.2090],
        zoom: userLocation ? 15 : 12,
        zoomControl: false,
        attributionControl: false,
        tap: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      if (userLocation) {
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

      setMapLoaded(true)
      mapRef.current._leaflet_map = map

      map.on('click', () => {
        if (selectedComplaint) setSelectedComplaint(null)
      })
    })

    return () => { mounted = false }
  }, [loadLeaflet, userLocation, selectedComplaint])

  useEffect(() => {
    if (!mapLoaded || !window.L || !mapRef.current._leaflet_map) return
    const map = mapRef.current._leaflet_map
    const L = window.L

    Object.values(markerRefs.current).forEach(m => map.removeLayer(m))
    markerRefs.current = {}

    const bounds = L.latLngBounds()

    complaints.forEach(complaint => {
      if (!complaint.latitude || !complaint.longitude) return

      const latlng = [complaint.latitude, complaint.longitude]
      bounds.extend(latlng)

      const color = getStatusColor(complaint.status)
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: 'complaint-marker',
          html: `
            <div class="marker-wrapper" style="--marker-color: ${color}">
              <div class="marker-pin"></div>
              <div class="marker-pulse"></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        }),
        riseOnHover: true,
      })

      marker.bindPopup(createPopupContent(complaint, userLocation), {
        maxWidth: 280,
        minWidth: 240,
        className: 'custom-popup',
      })

      marker.on('click', () => {
        setSelectedComplaint(complaint)
        if (onComplaintSelect) onComplaintSelect(complaint)
      })

      marker.addTo(map)
      markerRefs.current[complaint.id] = marker
    })

    if (userLocation) {
      bounds.extend([userLocation.latitude, userLocation.longitude])
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
    }
  }, [complaints, userLocation, mapLoaded, onComplaintSelect])

  const getStatusColor = (status) => {
    const colors = {
      submitted: '#3b82f6',
      acknowledged: '#f59e0b',
      in_progress: '#8b5cf6',
      resolved: '#22c55e',
      rejected: '#ef4444',
    }
    return colors[status] || '#6b7280'
  }

  const createPopupContent = (complaint, userLoc) => {
    const distance = userLoc ? calculateDistance(userLoc.latitude, userLoc.longitude, complaint.latitude, complaint.longitude) : null
    const statusConfig = {
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
      acknowledged: { label: 'Acknowledged', color: 'bg-amber-100 text-amber-800' },
      in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
      resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
    }
    const status = statusConfig[complaint.status] || { label: complaint.status, color: 'bg-gray-100 text-gray-800' }

    return `
      <div class="popup-content p-2">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-semibold text-gray-900 text-sm flex-1 pr-2">${complaint.type?.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase()) || 'Water Complaint'}</h3>
          <span class="px-2 py-0.5 text-xs font-medium rounded-full ${status.color} whitespace-nowrap flex-shrink-0">${status.label}</span>
        </div>
        <p class="text-sm text-gray-600 mb-2 line-clamp-2">${complaint.description || 'No description'}</p>
        ${complaint.address ? `<p class="text-xs text-gray-500 mb-1 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${complaint.address.slice(0, 50)}${complaint.address.length > 50 ? '...' : ''}</p>` : ''}
        ${complaint.ward ? `<p class="text-xs text-gray-500 mb-1 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>${complaint.ward}</p>` : ''}
        ${distance !== null ? `<p class="text-xs text-primary-600 font-medium mb-2 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${(distance / 1000).toFixed(1)} km away</p>` : ''}
        <button data-complaint-id="${complaint.id}" class="view-details-btn w-full mt-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">View Details</button>
      </div>
    `
  }

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-5.447A1 1 0 013 12.383V5.25A2.56 2.56 0 015.593 3H10.25a2.56 2.56 0 012.56 2.25v6.133a1 1 0 01-1.59.814L9 20z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full" role="region" aria-label="Water complaints map">
      <div ref={mapRef} className="absolute inset-0" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2" role="group" aria-label="Map controls">
        <button
          onClick={() => mapRef.current._leaflet_map?.locate({ setView: true, maxZoom: 16 })}
          className="touch-target w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100"
          aria-label="Locate me"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={() => mapRef.current._leaflet_map?.setZoom(mapRef.current._leaflet_map.getZoom() + 1)}
          className="touch-target w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100"
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => mapRef.current._leaflet_map?.setZoom(mapRef.current._leaflet_map.getZoom() - 1)}
          className="touch-target w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100"
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {selectedComplaint && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up" role="dialog" aria-label="Complaint details">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md mx-auto">
            <div className="p-4 border-b border-gray-200 flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedComplaint.type?.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}</h4>
                <p className="text-sm text-gray-500 mt-1">{selectedComplaint.description?.slice(0, 100)}...</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="touch-target p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {selectedComplaint.address && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedComplaint.address}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { onComplaintSelect(selectedComplaint); setSelectedComplaint(null) }}
                  className="flex-1 touch-target bg-primary-600 text-white font-medium rounded-lg"
                >
                  View Details
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="touch-target px-4 border border-gray-300 text-gray-700 font-medium rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const style = document.createElement('style')
style.textContent = `
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
  .marker-pin { width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 24px solid var(--marker-color); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); }
  .marker-pulse { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--marker-color); animation: marker-pulse 1.5s ease-out infinite; opacity: 0.6; }
  @keyframes marker-pulse { 0% { transform: translateX(-50%) scale(0.5); opacity: 0.6; } 100% { transform: translateX(-50%) scale(2); opacity: 0; } }

  .leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15) !important; padding: 0 !important; }
  .leaflet-popup-content { margin: 0 !important; width: auto !important; }
  .leaflet-popup-tip { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15) !important; }
  .custom-popup .leaflet-popup-content { width: 280px !important; }
  .view-details-btn { cursor: pointer; }
`
document.head.appendChild(style)
