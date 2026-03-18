import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const usersFile = path.join(__dirname, 'data', 'users.json')

// Create users.json if it doesn't exist
const initializeDatabase = () => {
  const dataDir = path.join(__dirname, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  if (!fs.existsSync(usersFile)) {
    // Create with one admin user for testing
    const defaultUsers = [
      {
        id: 'admin-001',
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 10),
        contactNumber: '+1234567890',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ]
    fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2))
  }
}

const readUsers = () => {
  initializeDatabase()
  const data = fs.readFileSync(usersFile, 'utf-8')
  return JSON.parse(data)
}

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

const generateUserId = () => {
  return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export const userDB = {
  // Find user by email
  findByEmail: (email) => {
    const users = readUsers()
    return users.find(u => u.email === email)
  },

  // Find user by ID
  findById: (id) => {
    const users = readUsers()
    return users.find(u => u.id === id)
  },

  // Create new user
  create: (fullName, email, password, contactNumber) => {
    const users = readUsers()
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
      return null
    }

    const newUser = {
      id: generateUserId(),
      fullName,
      email,
      password: bcrypt.hashSync(password, 10),
      contactNumber,
      role: 'user', // New signups are always users
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    writeUsers(users)
    return newUser
  },

  // Get all users (for admin)
  getAllUsers: () => {
    const users = readUsers()
    // Don't return passwords
    return users.map(({ password, ...user }) => user)
  },

  // Verify password
  verifyPassword: (password, hash) => {
    return bcrypt.compareSync(password, hash)
  }
}

// Initialize on module load
initializeDatabase()
