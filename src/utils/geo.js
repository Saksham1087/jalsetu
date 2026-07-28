export function getDistance(userLoc, complaint) {
  if (!userLoc || !complaint.latitude || !complaint.longitude) return Infinity
  const R = 6371e3
  const φ1 = userLoc.latitude * Math.PI / 180
  const φ2 = complaint.latitude * Math.PI / 180
  const Δφ = (complaint.latitude - userLoc.latitude) * Math.PI / 180
  const Δλ = (complaint.longitude - userLoc.longitude) * Math.PI / 180
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
