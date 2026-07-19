import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import L from 'leaflet'
import { subscribeToAllComplaints } from '../services/firestore'
import '../styles/map.css'

const severityColors = {
  critical_leak: '#dc2626',
  low_pressure: '#f97316',
  no_supply: '#f59e0b',
  contamination: '#0ea5e9',
  billing: '#8b5cf6',
  other: '#6b7280',
}

const severityLabels = {
  critical_leak: 'Critical Leak',
  low_pressure: 'Low Pressure',
  no_supply: 'No Supply',
  contamination: 'Contamination',
  billing: 'Billing Issue',
  other: 'Other',
}

function createMarkerIcon(color) {
  return L.divIcon({
    className: 'custom-complaint-marker',
    html: `<div class="marker-outer" style="--marker-color: ${color}"><div class="marker-inner"></div><div class="marker-pulse"></div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

function createClusterIcon(count) {
  let color = '#0ea5e9'
  if (count >= 100) color = '#dc2626'
  else if (count >= 50) color = '#f97316'
  else if (count >= 20) color = '#f59e0b'
  else if (count >= 10) color = '#0ea5e9'
  
  const size = count >= 100 ? 50 : count >= 50 ? 45 : count >= 20 ? 40 : 35
  return L.divIcon({
    className: 'custom-cluster-marker',
    html: `<div class="cluster-circle" style="background: ${color}; width: ${size}px; height: ${size}px;"><span>${count}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createPopupContent(complaint) {
  const color = severityColors[complaint.severity] || severityColors.other
  const label = severityLabels[complaint.severity] || 'Other'
  const date = new Date(complaint.createdAt?.toDate ? complaint.createdAt.toDate() : complaint.createdAt)
  
  return `
    <div class="popup-content p-2">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h4 class="font-semibold text-gray-900 text-sm flex-1 pr-2">${label}</h4>
        <span class="px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0"
          style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}40">
          ${label}
        </span>
      </div>
      <p class="text-sm text-gray-600 mb-2 line-clamp-2">${complaint.description || 'No description'}</p>
      ${complaint.address ? `<p class="text-xs text-gray-500 mb-1 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${complaint.address.slice(0, 60)}${complaint.address.length > 60 ? '...' : ''}</p>` : ''}
      ${complaint.ward ? `<p class="text-xs text-gray-500 mb-1 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>${complaint.ward}</p>` : ''}
      <div class="flex items-center gap-2 pt-2 border-t border-gray-100">
        <span class="text-xs text-gray-400 flex-1">${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        <button data-complaint-id="${complaint.id}" class="view-details-btn w-full px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">View Details</button>
      </div>
    </div>
  `
}

export function PublicMap({ 
  center = [28.6139, 77.2090], 
  zoom = 12,
  onComplaintClick,
  showUserLocation = true,
  userLocation 
}) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const mapRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToAllComplaints((data) => {
      setComplaints(data)
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  const filteredComplaints = useMemo(() => {
    if (filterSeverity === 'all') return complaints
    return complaints.filter(c => c.severity === filterSeverity)
  }, [complaints, filterSeverity])

  const bounds = useMemo(() => {
    if (filteredComplaints.length === 0) return null
    const coords = filteredComplaints
      .filter(c => c.lat && c.lng)
      .map(c => [c.lat, c.lng])
    if (coords.length === 0) return null
    return L.latLngBounds(coords)
  }, [filteredComplaints])

  useEffect(() => {
    if (bounds && mapRef.current?.leafletElement) {
      mapRef.current.leafletElement.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
    }
  }, [bounds])

  const handleMarkerClick = useCallback((complaint) => {
    setSelectedComplaint(complaint)
    if (onComplaintClick) onComplaintClick(complaint)
  }, [onComplaintClick])

  const SeverityLegend = () => (
    <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-gray-200">
      <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-5.447A1 1 0 013 12.383V5.25A2.56 2.56 0 015.593 3H10.25a2.56 2.56 0 012.56 2.25v6.133a1 1 0 01-1.59.814L9 20z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Severity
      </div>
      <div className="space-y-1.5">
        {Object.entries(severityColors).map(([key, color]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filterSeverity === 'all' || filterSeverity === key}
              onChange={() => setFilterSeverity(filterSeverity === key ? 'all' : key)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: color, backgroundColor: color }} />
            <span className="text-sm text-gray-700 group-hover:font-medium">{severityLabels[key]}</span>
            <span className="text-xs text-gray-400 ml-auto">{complaints.filter(c => c.severity === key).length}</span>
          </label>
        ))}
        <label className="flex items-center gap-2 cursor-pointer border-t border-gray-200 pt-1.5 mt-1">
          <input
            type="checkbox"
            checked={filterSeverity === 'all'}
            onChange={() => setFilterSeverity('all')}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="w-3 h-3 rounded-full border-2 flex-shrink-0 border-gray-300" />
          <span className="text-sm text-gray-700 font-medium">All ({complaints.length})</span>
        </label>
      </div>
    </div>
  )

  const StatsBar = () => (
    <div className="absolute top-4 left-4 right-4 z-20 flex justify-center">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl px-4 py-2 border border-gray-200 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityColors.critical_leak }} />
          <span className="text-gray-700">{complaints.filter(c => c.severity === 'critical_leak').length} Critical</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityColors.low_pressure }} />
          <span className="text-gray-700">{complaints.filter(c => c.severity === 'low_pressure').length} Low Pressure</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityColors.no_supply }} />
          <span className="text-gray-700">{complaints.filter(c => c.severity === 'no_supply').length} No Supply</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityColors.contamination }} />
          <span className="text-gray-700">{complaints.filter(c => c.severity === 'contamination').length} Contamination</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severityColors.other }} />
          <span className="text-gray-700">{complaints.filter(c => c.severity === 'other' || c.severity === 'billing').length} Other</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v2m0 4h.01" />
          </svg>
          <p className="text-gray-600 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-primary-600 hover:underline text-sm">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 min-h-0 w-full min-h-[100dvh]">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {showUserLocation && userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: '<div class="user-marker-pulse"><div class="user-marker-dot"></div></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          />
        )}

        <ClusterMarkers 
          complaints={filteredComplaints} 
          onComplaintClick={handleMarkerClick}
        />

        <div className="leaflet-control-zoom leaflet-bar leaflet-control leaflet-control-custom absolute top-4 right-4 z-20">
          <button 
            onClick={() => mapRef.current?.leafletElement?.zoomIn()} 
            className="leaflet-control-zoom-in bg-white hover:bg-gray-50 border-b border-gray-200 w-10 h-10 flex items-center justify-center text-gray-700"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          <button 
            onClick={() => mapRef.current?.leafletElement?.zoomOut()} 
            className="leaflet-control-zoom-out bg-white hover:bg-gray-50 w-10 h-10 flex items-center justify-center text-gray-700"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
        </div>

        {showUserLocation && (
          <button
            onClick={() => {
              if (userLocation && mapRef.current?.leafletElement) {
                mapRef.current.leafletElement.setView([userLocation.latitude, userLocation.longitude], 16)
              } else if (mapRef.current?.leafletElement) {
                mapRef.current.leafletElement.locate({ setView: true, maxZoom: 16 })
              }
            }}
            className="absolute top-16 right-4 z-20 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
            aria-label="Locate me"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}

        <StatsBar />
        <SeverityLegend />
      </MapContainer>
    </div>
  )
}

function ClusterMarkers({ complaints, onComplaintClick }) {
  const map = useMap()
  const clusterRef = useRef(null)
  const initialized = useRef(false)
  
  useEffect(() => {
    if (!map || initialized.current) return
    
    const cluster = new L.MarkerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 60,
      disableClusteringAtZoom: 16,
      iconCreateFunction: (c) => createClusterIcon(c.getChildCount()),
    })
    
    clusterRef.current = cluster
    map.addLayer(cluster)
    initialized.current = true
    
    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
        clusterRef.current = null
        initialized.current = false
      }
    }
  }, [map])

  useEffect(() => {
    if (!clusterRef.current || !map) return
    
    const cluster = clusterRef.current
    cluster.clearLayers()
    
    complaints
      .filter(c => c.lat && c.lng)
      .forEach(complaint => {
        const color = severityColors[complaint.severity] || severityColors.other
        const marker = L.marker([complaint.lat, complaint.lng], {
          icon: createMarkerIcon(color),
        })
        
        marker.bindPopup(createPopupContent(complaint), {
          maxWidth: 300,
          minWidth: 240,
          className: 'custom-popup',
        })
        
        marker.on('click', () => {
          if (onComplaintClick) onComplaintClick(complaint)
        })
        
        cluster.addLayer(marker)
      })
  }, [complaints, map, onComplaintClick])
  
  return null
}