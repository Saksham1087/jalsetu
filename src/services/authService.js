import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db, googleProvider, signInWithPopup, signOut } from '../lib/firebase'
import { appConfig } from '../lib/config'

const STORAGE_KEY = 'jalsetu_users'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export async function createUserRoleDocument(user, role = 'citizen') {
  if (!appConfig.hasFirebase || !db) return
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      role,
      createdAt: serverTimestamp(),
    })
  }
}

export async function getUserRole(uid) {
  if (!appConfig.hasFirebase || !db) return 'citizen'
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    return snap.data().role || 'citizen'
  }
  return 'citizen'
}

async function setUserRole(uid, role = 'citizen') {
  if (!appConfig.hasFirebase || !db) return
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    await setDoc(userRef, { role, updatedAt: serverTimestamp() }, { merge: true })
  } else {
    await setDoc(userRef, { uid, email: '', name: 'Unknown', role, createdAt: serverTimestamp() })
  }
}

export async function loginWithGoogleAdmin() {
  if (!appConfig.hasFirebase || !auth || !googleProvider) {
    throw new Error('Firebase not configured')
  }
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user
  if (!user.email || user.email.toLowerCase() !== 'raisakshamclg@gmail.com') {
    await signOut(auth)
    throw new Error('Access denied. Only the admin email can access this portal.')
  }
  await setUserRole(user.uid, 'admin')
  return user
}

export async function loginWithEmail(email, password) {
  if (!appConfig.hasFirebase || !auth || !db) {
    await delay(500)
    const users = getUsers()
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}
