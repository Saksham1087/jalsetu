export const MIRA_BHAYANDER = {
  center: [19.2813, 72.8568],
  bounds: [[19.25, 72.83], [19.32, 72.90]],
  defaultZoom: 12,

  wards: [
    { id: 1, name: 'Ward 1', area: 'Bhayander West' },
    { id: 2, name: 'Ward 2', area: 'Bhayander West' },
    { id: 3, name: 'Ward 3', area: 'Bhayander East' },
    { id: 4, name: 'Ward 4', area: 'Bhayander East' },
    { id: 5, name: 'Ward 5', area: 'Bhayander East' },
    { id: 6, name: 'Ward 6', area: 'Bhayander East' },
    { id: 7, name: 'Ward 7', area: 'Bhayander East' },
    { id: 8, name: 'Ward 8', area: 'Bhayander West' },
    { id: 9, name: 'Ward 9', area: 'Bhayander West' },
    { id: 10, name: 'Ward 10', area: 'Bhayander West' },
    { id: 11, name: 'Ward 11', area: 'Mira Road East' },
    { id: 12, name: 'Ward 12', area: 'Mira Road East' },
    { id: 13, name: 'Ward 13', area: 'Mira Road East' },
    { id: 14, name: 'Ward 14', area: 'Mira Road East' },
    { id: 15, name: 'Ward 15', area: 'Mira Road East' },
    { id: 16, name: 'Ward 16', area: 'Mira Road East' },
    { id: 17, name: 'Ward 17', area: 'Mira Road East' },
    { id: 18, name: 'Ward 18', area: 'Mira Road East' },
    { id: 19, name: 'Ward 19', area: 'Mira Road East' },
    { id: 20, name: 'Ward 20', area: 'Mira Road East' },
    { id: 21, name: 'Ward 21', area: 'Mira Road East' },
    { id: 22, name: 'Ward 22', area: 'Mira Road East' },
    { id: 23, name: 'Ward 23', area: 'Bhayander West' },
    { id: 24, name: 'Ward 24', area: 'Bhayander East' },
  ],

  defaultSchedule: {
    morning: { start: '07:00', end: '09:00' },
    evening: { start: '19:00', end: '21:00' },
  },

  contacts: {
    mbmc: '022-28140002',
    waterComplaint: '022-28140002',
    emergency: '1916',
    website: 'https://mbmc.gov.in',
  },

  knownIssueAreas: [
    { area: 'Mira Road East', issues: ['Low pressure during peak hours', 'Pipeline aging in older sectors'] },
    { area: 'Bhayander West', issues: ['Pipeline aging issues in older areas', 'Coastal area supply intermittency'] },
    { area: 'Ghodbunder', issues: ['Supply intermittency during monsoon', 'Low pressure in uphill areas'] },
    { area: 'Kashimira', issues: ['Irregular supply in fringe areas', 'Pipeline breach incidents'] },
    { area: 'Uttan', issues: ['Saltwater intrusion during high tide', 'Low pressure in inland areas'] },
    { area: 'Mira Road East (Sectors 1-10)', issues: ['Frequent pipeline bursts', 'Waterlogging during rains'] },
    { area: 'Bhayander East', issues: ['Old pipeline network', 'Supply timing inconsistencies'] },
  ],
}

export function getWardName(wardId) {
  const ward = MIRA_BHAYANDER.wards.find(w => w.id === wardId)
  return ward ? ward.name : null
}

export function getWardById(wardId) {
  return MIRA_BHAYANDER.wards.find(w => w.id === wardId) || null
}

export function formatSchedule(schedule) {
  if (!schedule) {
    schedule = MIRA_BHAYANDER.defaultSchedule
  }
  return `${schedule.morning.start}–${schedule.morning.end} AM and ${schedule.evening.start}–${schedule.evening.end} PM`
}

export function isInMiraBhayander(lat, lng) {
  const [south, west] = MIRA_BHAYANDER.bounds[0]
  const [north, east] = MIRA_BHAYANDER.bounds[1]
  return lat >= south && lat <= north && lng >= west && lng <= east
}
