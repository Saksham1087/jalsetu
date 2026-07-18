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
