import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import L from 'leaflet'
import { subscribeToAllComplaints } from '../services/firestore'
import { appConfig } from '../lib/config'
import { MIRA_BHAYANDER } from '../lib/miraBhayander'
import { toDate } from '../utils/date'
import '../styles/map.css'

const typeColors = {
  leakage: '#dc2626',
  critical_leak: '#dc2626',
  low_pressure: '#f97316',
  no_supply: '#f59e0b',
  contamination: '#0ea5e9',
  billing: '#8b5cf6',
  other: '#6b7280',
}

const typeLabels = {
  leakage: 'Critical Leak',
  critical_leak: 'Critical Leak',
  low_pressure: 'Low Pressure',
  no_supply: 'No Supply',
  contamination: 'Contamination',
  billing: 'Billing Issue',
  other: 'Other',
}

const filterKeys = ['leakage', 'low_pressure', 'no_supply', 'contamination', 'billing', 'other']

function normalizeType(type) {
  if (type === 'critical_leak') return 'leakage'
  if (type === 'leakage' || type === 'low_pressure' || type === 'no_supply' || type === 'contamination' || type === 'billing' || type === 'other') return type
  return 'other'
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
  let color = '#127A7A'
  if (count >= 100) color = '#dc2626'
  else if (count >= 50) color = '#f97316'
  else if (count >= 20) color = '#f59e0b'
  const size = count >= 100 ? 50 : count >= 50 ? 45 : count >= 20 ? 40 : 35
  return L.divIcon({
    className: 'custom-cluster-marker',
    html: `<div class="cluster-circle" style="background: ${color}; width: ${size}px; height: ${size}px;"><span>${count}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createPopupContent(complaint) {
  const color = typeColors[complaint.type] || typeColors.other
  const label = typeLabels[complaint.type] || 'Other'
  const date = toDate(complaint.createdAt) || new Date()

  return `
    <div style="padding: 8px; font-family: system-ui, sans-serif; font-size: 14px; color: #1f2937;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
        <h4 style="font-weight: 600; font-size: 14px; flex: 1; padding-right: 8px; margin: 0;">${label}</h4>
        <span style="padding: 2px 8px; font-size: 12px; font-weight: 500; border-radius: 9999px; white-space: nowrap; flex-shrink: 0; background-color: ${color}20; color: ${color}; border: 1px solid ${color}40;">
          ${label}
        </span>
      </div>
      <p style="font-size: 14px; color: #4b5563; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${complaint.description || 'No description'}</p>
      ${complaint.address ? `<p style="font-size: 12px; color: #6b7280; margin: 0 0 4px; display: flex; align-items: center; gap: 4px;"><svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${complaint.address.slice(0, 60)}${complaint.address.length > 60 ? '...' : ''}</p>` : ''}
      ${complaint.ward ? `<p style="font-size: 12px; color: #6b7280; margin: 0 0 4px; display: flex; align-items: center; gap: 4px;"><svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>${complaint.ward}</p>` : ''}
      <div style="display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; margin-top: 4px;">
        <span style="font-size: 12px; color: #9ca3af; flex: 1;">${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        <button data-complaint-id="${complaint.id}" class="view-details-btn" style="width: 100%; padding: 6px 12px; background-color: #127A7A; color: white; font-size: 14px; font-weight: 500; border-radius: 8px; border: none; cursor: pointer;">View Details</button>
      </div>
    </div>
  `
}

const StatsBar = memo(({ complaints }) => {
  const arr = Array.isArray(complaints) ? complaints : []
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
      <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-xl px-4 py-2 border border-border flex items-center gap-4 flex-wrap pointer-events-auto pr-14">
        {filterKeys.map((key) => {
          const color = typeColors[key]
          const count = arr.filter(c => normalizeType(c.type ?? c.severity) === key).length
          if (count === 0) return null
          return (
            <div key={key} className="flex items-center gap-1.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-text-body">{count} {typeLabels[key]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})

const SeverityLegend = memo(({ rawComplaints, filterType, onFilterChange, filterWard, onWardChange, myComplaintsOnly, onMyComplaintsToggle, user }) => {
  const allTypeSelected = filterType.length === 0
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-border max-h-[70vh] overflow-y-auto">
      {user && !user.isDemoUser && (
        <div className="mb-3">
          <button
            type="button"
            onClick={onMyComplaintsToggle}
            className={`w-full px-3 py-2 rounded-full text-sm font-medium touch-target transition-colors ${
              myComplaintsOnly
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-surface text-text-body hover:bg-surface/80'
            }`}
            aria-pressed={myComplaintsOnly}
          >
            My Complaints Only
          </button>
        </div>
      )}

      <div className="font-semibold text-text-primary mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-5.447A1 1 0 013 12.383V5.25A2.56 2.56 0 015.593 3H10.25a2.56 2.56 0 012.56 2.25v6.133a1 1 0 01-1.59.814L9 20z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Type
      </div>
      <div className="space-y-1.5">
        {filterKeys.map((key) => {
          const color = typeColors[key]
          const label = typeLabels[key]
          const count = rawComplaints.filter(c => normalizeType(c.type ?? c.severity) === key).length
          const isChecked = allTypeSelected || filterType.includes(key)
          return (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onFilterChange(key)}
                className="w-4 h-4 text-teal-600 border-border rounded focus:ring-teal-500"
              />
              <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: color, backgroundColor: color }} />
              <span className="text-sm text-text-body group-hover:font-medium">{label}</span>
              <span className="text-xs text-text-tertiary ml-auto">{count}</span>
            </label>
          )
        })}
        <label className="flex items-center gap-2 cursor-pointer border-t border-border pt-1.5 mt-1">
          <input
            type="checkbox"
            checked={allTypeSelected}
            onChange={() => onFilterChange('__all__')}
            className="w-4 h-4 text-teal-600 border-border rounded focus:ring-teal-500"
          />
          <span className="w-3 h-3 rounded-full border-2 flex-shrink-0 border-border" />
          <span className="text-sm text-text-body font-medium">All ({rawComplaints.length})</span>
        </label>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
      <div className="font-semibold text-text-primary mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Ward
        </div>
        <select
          value={filterWard}
          onChange={(e) => onWardChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-text-body focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        >
          <option value="">All Wards</option>
          {MIRA_BHAYANDER.wards.map((ward) => {
            const count = rawComplaints.filter(c => c.ward === ward.name).length
            return (
              <option key={ward.id} value={ward.name}>
                Ward {ward.id} — {ward.area}{count > 0 ? ` (${count})` : ''}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
})

export function PublicMap({
  center = MIRA_BHAYANDER.center,
  zoom = MIRA_BHAYANDER.defaultZoom,
  onComplaintClick,
  showUserLocation = true,
  userLocation,
  complaints: propComplaints,
  loading: propLoading,
  user,
}) {
  const [fbComplaints, setFbComplaints] = useState([])
  const [fbLoading, setFbLoading] = useState(appConfig.hasFirebase)
  const [fbError, setFbError] = useState(null)
  const [filterType, setFilterType] = useState([])
  const [filterWard, setFilterWard] = useState('')
  const [myComplaintsOnly, setMyComplaintsOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)

  useEffect(() => {
    if (mapContainerRef.current && mapRef.current) {
      mapRef.current.invalidateSize()
    }

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  useEffect(() => {
    if (!appConfig.hasFirebase) return
    setFbLoading(true)
    const unsub = subscribeToAllComplaints(
      (data) => { setFbComplaints(data); setFbLoading(false) },
      (err) => { setFbError(err?.message || 'Failed to load complaints'); setFbLoading(false) },
    )
    return () => unsub?.()
  }, [])

  const rawComplaints = useMemo(() => {
    if (!appConfig.hasFirebase) return propComplaints ?? []
    if (fbComplaints.length > 0) return fbComplaints
    if (propComplaints && propComplaints.length > 0) return propComplaints
    return []
  }, [fbComplaints, propComplaints])
  const isLoading = appConfig.hasFirebase ? (fbLoading && fbComplaints.length === 0) : (propLoading ?? false)
  const displayError = appConfig.hasFirebase && !fbLoading && fbComplaints.length === 0 && (!propComplaints || propComplaints.length === 0) ? (fbError || 'Failed to load complaints') : null

  const filteredComplaints = useMemo(() => {
    if (!rawComplaints || !Array.isArray(rawComplaints)) return []
    let filtered = rawComplaints
    if (filterType.length > 0) {
      filtered = filtered.filter(c => filterType.includes(normalizeType(c.type ?? c.severity)))
    }
    if (filterWard) {
      filtered = filtered.filter(c => c.ward === filterWard)
    }
    if (myComplaintsOnly && user && !user.isDemoUser) {
      filtered = filtered.filter(c => c.userId === user.uid)
    }
    return filtered
  }, [rawComplaints, filterType, filterWard, myComplaintsOnly, user])

  const bounds = useMemo(() => {
    if (!filteredComplaints || filteredComplaints.length === 0) return null
    const coords = filteredComplaints
      .filter(c => (c.latitude ?? c.lat) && (c.longitude ?? c.lng))
      .map(c => [c.latitude ?? c.lat, c.longitude ?? c.lng])
    if (coords.length === 0) return null
    return L.latLngBounds(coords)
  }, [filteredComplaints])

  const hasFittedBounds = useRef(false)

  useEffect(() => {
    if (bounds && mapRef.current && !hasFittedBounds.current) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
      hasFittedBounds.current = true
    }
  }, [bounds])

  const handleMarkerClick = useCallback((complaint) => {
    if (onComplaintClick) onComplaintClick(complaint)
  }, [onComplaintClick])

  const handleMyComplaintsToggle = useCallback(() => {
    setMyComplaintsOnly(prev => !prev)
  }, [])

  const handleFilterChange = useCallback((key) => {
    if (key === '__all__') {
      setFilterType([])
      return
    }
    setFilterType(prev => {
      if (prev.length === 0) {
        return [key]
      }
      if (prev.includes(key)) {
        return prev.filter(t => t !== key)
      }
      return [...prev, key]
    })
  }, [])

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full bg-teal-100 animate-[water-ripple_1.5s_ease-out_infinite]" />
            <div className="absolute inset-0 rounded-full bg-teal-100 animate-[water-ripple_1.5s_ease-out_infinite_0.5s]" />
            <svg className="relative w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-2.5 4.5-7.5 9-7.5 13.5a7.5 7.5 0 0015 0c0-4.5-5-9-7.5-13.5z" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary">Loading complaints...</p>
        </div>
      </div>
    )
  }

  if (displayError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-page p-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto text-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v2m0 4h.01" />
          </svg>
          <p className="text-text-body mb-2">{displayError}</p>
          <button onClick={() => window.location.reload()} className="text-teal-600 hover:underline text-sm">Retry</button>
        </div>
      </div>
    )
  }

return (
    <div ref={mapContainerRef} className="relative flex-1 min-h-0 w-full">
    <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        className="absolute inset-0"
        whenCreated={(map) => {
          mapRef.current = map
          setTimeout(() => map.invalidateSize(), 100)
        }}
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

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <div className="leaflet-control-zoom leaflet-bar leaflet-control leaflet-control-custom shadow-lg rounded-lg overflow-hidden">
            <button
              onClick={() => mapRef.current?.zoomIn?.()}
              className="leaflet-control-zoom-in bg-card hover:bg-surface border-b border-border w-11 h-11 flex items-center justify-center text-text-body touch-target"
              aria-label="Zoom in"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut?.()}
              className="leaflet-control-zoom-out bg-card hover:bg-surface w-11 h-11 flex items-center justify-center text-text-body touch-target"
              aria-label="Zoom out"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
          </div>

          {showUserLocation && (
            <button
              onClick={() => {
                if (userLocation && mapRef.current) {
                  mapRef.current.setView([userLocation.latitude, userLocation.longitude], 16)
                } else if (mapRef.current) {
                  mapRef.current.locate({ setView: true, maxZoom: 16 })
                }
              }}
              className="w-11 h-11 bg-card rounded-lg shadow-lg flex items-center justify-center hover:bg-surface active:bg-surface transition-colors touch-target"
              aria-label="Locate me"
              type="button"
            >
              <svg className="w-5 h-5 text-text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>

        <StatsBar complaints={filteredComplaints} />
        {showFilters && <SeverityLegend rawComplaints={rawComplaints} filterType={filterType} onFilterChange={handleFilterChange} filterWard={filterWard} onWardChange={setFilterWard} myComplaintsOnly={myComplaintsOnly} onMyComplaintsToggle={handleMyComplaintsToggle} user={user} />}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden absolute bottom-24 right-4 z-[1000] w-11 h-11 bg-card rounded-full shadow-lg flex items-center justify-center touch-target hover:bg-surface active:bg-surface transition-colors"
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          type="button"
        >
          {showFilters ? (
            <svg className="w-5 h-5 text-text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </button>
      </MapContainer>
    </div>
  )
}

const ClusterMarkers = memo(function ClusterMarkers({ complaints, onComplaintClick }) {
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

    const arr = Array.isArray(complaints) ? complaints : []
    arr
      .filter(c => (c.latitude ?? c.lat) && (c.longitude ?? c.lng))
      .forEach(complaint => {
        const color = typeColors[complaint.type ?? complaint.severity] || typeColors.other
        const marker = L.marker([complaint.latitude ?? complaint.lat, complaint.longitude ?? complaint.lng], {
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

        marker.on('popupopen', () => {
          requestAnimationFrame(() => {
            const el = marker.getPopup()?.getElement()
            if (!el) return
            const btn = el.querySelector('.view-details-btn')
            if (btn) {
              btn.onclick = () => {
                if (onComplaintClick) onComplaintClick(complaint)
              }
            }
          })
        })

        cluster.addLayer(marker)
      })
  }, [complaints, map, onComplaintClick])

  return null
})
