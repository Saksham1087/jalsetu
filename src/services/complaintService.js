const STORAGE_KEY = 'jalsetu_complaints'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const getComplaints = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveComplaints = (complaints) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints))
}

const generateId = () => crypto.randomUUID()

export const complaintService = {
  async getAll() {
    await delay(300)
    const complaints = getComplaints()
    return complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getById(id) {
    await delay(200)
    const complaints = getComplaints()
    return complaints.find(c => c.id === id) || null
  },

  async create(data) {
    await delay(500)
    const complaints = getComplaints()
    const newComplaint = {
      id: generateId(),
      ...data,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: data.images || [],
      timeline: [
        { status: 'submitted', timestamp: new Date().toISOString(), note: 'Complaint submitted' },
      ],
    }
    complaints.unshift(newComplaint)
    saveComplaints(complaints)
    return newComplaint
  },

  async update(id, updates) {
    await delay(300)
    const complaints = getComplaints()
    const index = complaints.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Complaint not found')
    
    const updated = {
      ...complaints[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    if (updates.status && updates.status !== complaints[index].status) {
      updated.timeline = [
        ...(updated.timeline || []),
        { status: updates.status, timestamp: new Date().toISOString(), note: `Status changed to ${updates.status}` },
      ]
    }
    
    complaints[index] = updated
    saveComplaints(complaints)
    return updated
  },

  async delete(id) {
    await delay(200)
    const complaints = getComplaints()
    const filtered = complaints.filter(c => c.id !== id)
    saveComplaints(filtered)
  },

  async getByUser(userId) {
    await delay(200)
    const complaints = getComplaints()
    return complaints.filter(c => c.userId === userId)
  },

  seedDemoData() {
    const existing = getComplaints()
    if (existing.length > 0) return

    const demoComplaints = [
      {
        id: generateId(),
        type: 'leakage',
        description: 'Major water leakage from main pipe near the community center. Water flowing on road causing traffic issues.',
        latitude: 19.2850,
        longitude: 72.8600,
        address: 'Near Bhayander Railway Station, Bhayander West',
        ward: 'Ward 1',
        landmark: 'Near Station Road',
        images: [],
        userId: 'demo-user',
        userName: 'Rajesh Kumar',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: 'submitted', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint submitted' },
          { status: 'acknowledged', timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Acknowledged by water dept' },
          { status: 'in_progress', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Repair team dispatched' },
        ],
      },
      {
        id: generateId(),
        type: 'contamination',
        description: 'Water has brownish color and foul smell. Suspected contamination in the supply line.',
        latitude: 19.2900,
        longitude: 72.8700,
        address: 'Sector 5, Mira Road East',
        ward: 'Ward 15',
        landmark: 'Near Mira Road Station',
        images: [],
        userId: 'demo-user',
        userName: 'Priya Sharma',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: 'submitted', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), note: 'Complaint submitted' },
          { status: 'acknowledged', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), note: 'Sample collection scheduled' },
        ],
      },
      {
        id: generateId(),
        type: 'low_pressure',
        description: 'Very low water pressure since morning. Unable to fill tanks on upper floors.',
        latitude: 19.2750,
        longitude: 72.8450,
        address: 'Block B, Bhayander West',
        ward: 'Ward 8',
        landmark: 'Opposite Bhayander Market',
        images: [],
        userId: 'demo-user',
        userName: 'Amit Singh',
        status: 'resolved',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: 'submitted', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint submitted' },
          { status: 'acknowledged', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Pressure issue confirmed' },
          { status: 'in_progress', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: 'Pump station checked' },
          { status: 'resolved', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: 'Pressure restored to normal' },
        ],
      },
      {
        id: generateId(),
        type: 'no_water',
        description: 'No water supply for 24 hours in entire block. Emergency situation for residents.',
        latitude: 19.2950,
        longitude: 72.8750,
        address: 'Sector 10, Mira Road East',
        ward: 'Ward 20',
        landmark: 'Near Mira Road Station',
        images: [],
        userId: 'demo-user',
        userName: 'Sunita Devi',
        status: 'submitted',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        timeline: [
          { status: 'submitted', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), note: 'Complaint submitted' },
        ],
      },
      {
        id: generateId(),
        type: 'billing',
        description: 'Incorrect billing amount. Meter reading seems wrong. Requesting re-check.',
        latitude: 19.2700,
        longitude: 72.8500,
        address: 'House 45, Bhayander East',
        ward: 'Ward 4',
        landmark: 'Near Bhayander Station',
        images: [],
        userId: 'demo-user',
        userName: 'Vikram Patel',
        status: 'acknowledged',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: 'submitted', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), note: 'Complaint submitted' },
          { status: 'acknowledged', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), note: 'Meter re-reading scheduled' },
        ],
      },
    ]

    saveComplaints(demoComplaints)
    return demoComplaints
  },
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
