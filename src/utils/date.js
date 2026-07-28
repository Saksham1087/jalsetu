
export function toDate(value) {
  if (value == null) return null
  if (value instanceof Date && !isNaN(value.getTime())) return value
  if (typeof value.toDate === 'function') {
    const d = value.toDate()
    return isNaN(d.getTime()) ? null : d
  }
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}
