import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import { appConfig } from '../lib/config'

const STORAGE_KEY = 'jalsetu_users'
const CURRENT_USER_KEY = 'jalsetu_user'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
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

export async function checkAdminRole(uid) {
  const role = await getUserRole(uid)
  return role === 'admin'
}

export async function registerWithEmail(name, email, password) {
  if (!appConfig.hasFirebase || !auth || !db) {
    await delay(500)
    const users = getUsers()
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered')
    }
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveUsers(users)
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await createUserRoleDocument(cred.user, 'citizen')
  return cred.user
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

export const authService = {
  async login({ email, password }) {
    await delay(500)
    const users = getUsers()
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },

  async register({ name, email, password, phone, ward }) {
    await delay(500)
    const users = getUsers()
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered')
    }
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      phone,
      ward,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveUsers(users)
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  },

  async updateProfile(userId, updates) {
    await delay(300)
    const users = getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index === -1) throw new Error('User not found')
    users[index] = { ...users[index], ...updates }
    saveUsers(users)
    const { password: _, ...userWithoutPassword } = users[index]
    return userWithoutPassword
  },

  async getProfile(userId) {
    await delay(200)
    const users = getUsers()
    const user = users.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },
}
