import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs,
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const COLLECTION = 'complaints'
const STATUSES = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected']

function createComplaintData(user, input) {
  const lat = input.latitude ?? input.lat
  const lng = input.longitude ?? input.lng
  if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
    throw new Error('Valid latitude and longitude are required')
  }
  return {
    userId: user.uid,
    userName: user.displayName || 'Anonymous',
    userPhotoURL: user.photoURL || null,
    type: input.type || 'other',
    description: input.description,
    severity: input.severity || 'medium',
    photoURL: input.photoURL || null,
    lat: Number(lat),
    lng: Number(lng),
    address: input.address || null,
    ward: input.ward || null,
    landmark: input.landmark || null,
    mobile: input.mobile || null,
    createdAt: serverTimestamp(),
    status: 'submitted',
    timeline: [
      { status: 'submitted', timestamp: new Date(), note: 'Complaint submitted' }
    ]
  }
}

export async function addComplaint(user, input) {
  if (!db) throw new Error('Firestore not initialized')
  const data = createComplaintData(user, input)
  const docRef = await addDoc(collection(db, COLLECTION), data)
  return { id: docRef.id, ...data }
}

export async function updateComplaintStatus(complaintId, status, note = '') {
  if (!db) throw new Error('Firestore not initialized')
  if (!STATUSES.includes(status)) throw new Error('Invalid status')
  
  const ref = doc(db, COLLECTION, complaintId)
  const entry = { status, timestamp: new Date() }
  if (note) entry.note = note
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    timeline: arrayUnion(entry),
  })
}

export function subscribeToAllComplaints(callback, errorCallback) {
  if (!db) {
    errorCallback?.(new Error('Firestore not initialized'))
    return () => {}
  }
  
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const complaints = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        timeline: (data.timeline || []).map(entry => ({
          ...entry,
          timestamp: entry.timestamp?.toDate?.() || entry.timestamp,
        })),
      }
    })
    callback(complaints)
  }, (error) => {
    console.error('Complaints subscription error:', error)
    errorCallback?.(error)
  })
}

export async function getAllComplaints() {
  if (!db) throw new Error('Firestore not initialized')
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  }))
}


