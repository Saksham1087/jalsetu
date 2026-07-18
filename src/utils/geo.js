export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity
  
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export function getBounds(complaints) {
  const valid = complaints.filter(c => c.latitude && c.longitude)
  if (valid.length === 0) return null
  
  let minLat = Infinity, maxLat = -Infinity
  let minLon = Infinity, maxLon = -Infinity
  
  valid.forEach(c => {
    minLat = Math.min(minLat, c.latitude)
    maxLat = Math.max(maxLat, c.latitude)
    minLon = Math.min(minLon, c.longitude)
    maxLon = Math.max(maxLon, c.longitude)
  })
  
  return { minLat, maxLat, minLon, maxLon }
}

export function getCenter(bounds) {
  return {
    latitude: (bounds.minLat + bounds.maxLat) / 2,
    longitude: (bounds.minLon + bounds.maxLon) / 2,
  }
}

export function debounce(fn, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
