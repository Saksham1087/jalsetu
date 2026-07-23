import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const COLLECTION = 'complaints'
const STATUSES = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected']

export function createComplaintData(user, input) {
  return {
    userId: user.uid,
    userName: user.displayName || 'Anonymous',
    userPhotoURL: user.photoURL || null,
    description: input.description,
    severity: input.severity || 'medium',
    photoURL: input.photoURL || null,
    lat: input.latitude,
    lng: input.longitude,
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
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
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
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }))
    callback(complaints)
  }, (error) => {
    console.error('Complaints subscription error:', error)
    errorCallback?.(error)
  })
}

export function subscribeToUserComplaints(userId, callback, errorCallback) {
  if (!db) {
    errorCallback?.(new Error('Firestore not initialized'))
    return () => {}
  }
  
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }))
    callback(complaints)
  }, (error) => {
    console.error('User complaints subscription error:', error)
    errorCallback?.(error)
  })
}

export function subscribeToNearbyComplaints(lat, lng, radiusKm = 10, callback, errorCallback) {
  if (!db) {
    errorCallback?.(new Error('Firestore not initialized'))
    return () => {}
  }
  
  const latRange = radiusKm / 111
  const lngRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180))
  
  const q = query(
    collection(db, COLLECTION),
    where('lat', '>=', lat - latRange),
    where('lat', '<=', lat + latRange),
    where('lng', '>=', lng - lngRange),
    where('lng', '<=', lng + lngRange),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const complaints = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }))
    callback(complaints)
  }, (error) => {
    console.error('Nearby complaints subscription error:', error)
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

export async function uploadComplaintPhoto(file, userId) {
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
  const storage = getStorage()
  const fileRef = ref(storage, `complaints/${userId}/${Date.now()}_${file.name}`)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}
