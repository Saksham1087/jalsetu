import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  query, 
  where,
  orderBy, 
  onSnapshot, 
  getDocs,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  limit,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generateDisplayId } from '../lib/ids'

const COLLECTION = 'complaints'
const NOTIFICATIONS_COLLECTION = 'notifications'
const STATUSES = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected']

function createComplaintData(user, input) {
  const lat = input.latitude ?? input.lat
  const lng = input.longitude ?? input.lng
  if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
    throw new Error('Valid latitude and longitude are required')
  }
  return {
    displayId: generateDisplayId(),
    userId: user.uid,
    userName: user.displayName || 'Anonymous',
    userEmail: user.email || null,
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
    deleted: false,
    deletedAt: null,
    deletedBy: null,
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
    }).filter(c => !c.deleted)
    callback(complaints)
  }, (error) => {
    console.error('Complaints subscription error:', error)
    errorCallback?.(error)
  })
}

export async function getComplaintById(id) {
  if (!db) throw new Error('Firestore not initialized')

  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data()
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      timeline: (data.timeline || []).map(entry => ({
        ...entry,
        timestamp: entry.timestamp?.toDate?.() || entry.timestamp,
      })),
    }
  }

  const q = query(collection(db, COLLECTION), where('displayId', '==', id), limit(1))
  const qSnap = await getDocs(q)
  if (!qSnap.empty) {
    const doc_ = qSnap.docs[0]
    const data = doc_.data()
    return {
      id: doc_.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      timeline: (data.timeline || []).map(entry => ({
        ...entry,
        timestamp: entry.timestamp?.toDate?.() || entry.timestamp,
      })),
    }
  }

  return null
}

export async function getAllComplaints() {
  if (!db) throw new Error('Firestore not initialized')
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  })).filter(c => !c.deleted)
}

export async function softDeleteComplaint(complaintId, adminUid) {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, COLLECTION, complaintId)
  await updateDoc(ref, {
    deleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: adminUid,
  })
}

export async function restoreComplaint(complaintId) {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, COLLECTION, complaintId)
  await updateDoc(ref, {
    deleted: false,
    deletedAt: null,
    deletedBy: null,
  })
}

export function subscribeToDeletedComplaints(callback, errorCallback) {
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
        deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
        timeline: (data.timeline || []).map(entry => ({
          ...entry,
          timestamp: entry.timestamp?.toDate?.() || entry.timestamp,
        })),
      }
    }).filter(c => c.deleted)
    callback(complaints)
  }, (error) => {
    console.error('Deleted complaints subscription error:', error)
    errorCallback?.(error)
  })
}

export async function createNotification({ userId, type, title, message, complaintId }) {
  if (!db) throw new Error('Firestore not initialized')
  const ref = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    userId,
    type,
    title,
    message,
    complaintId: complaintId || null,
    read: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function batchCreateNotifications(userIds, { type, title, message, complaintId }) {
  if (!db) throw new Error('Firestore not initialized')
  const col = collection(db, NOTIFICATIONS_COLLECTION)
  const chunks = []
  for (let i = 0; i < userIds.length; i += 500) {
    chunks.push(userIds.slice(i, i + 500))
  }
  const refs = []
  for (const chunk of chunks) {
    const batch = writeBatch(db)
    for (const userId of chunk) {
      const ref = doc(col)
      batch.set(ref, {
        userId,
        type,
        title,
        message,
        complaintId: complaintId || null,
        read: false,
        createdAt: serverTimestamp(),
      })
      refs.push(ref.id)
    }
    await batch.commit()
  }
  return refs
}

export function subscribeToNotifications(userId, callback, errorCallback) {
  if (!db) {
    errorCallback?.(new Error('Firestore not initialized'))
    return () => {}
  }

  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      }
    })
    callback(notifications)
  }, (error) => {
    console.error('Notifications subscription error:', error)
    errorCallback?.(error)
  })
}

export async function markNotificationRead(notificationId) {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
  await updateDoc(ref, { read: true })
}

export async function markAllNotificationsRead(userId) {
  if (!db) throw new Error('Firestore not initialized')
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('read', '==', false)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach(d => batch.update(d.ref, { read: true }))
  await batch.commit()
}


