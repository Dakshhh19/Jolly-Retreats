import express from 'express'
import bcrypt from 'bcryptjs'
import { generateToken, verifyToken } from '../utils/jwt.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { usersModel } from '../models/usersModel.js'
import { fallbackUsersModel } from '../models/fallbackModels.js'
import { isDbConnected } from '../config/runtime.js'
import {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  normalizeEmail,
  normalizePhoneNumber
} from '../utils/validators.js'

const router = express.Router()
const getUsersStore = () => (isDbConnected() ? usersModel : fallbackUsersModel)

// Signup endpoint
router.post('/signup', asyncHandler(async (req, res) => {
  const { fullName, email, password, contactNumber } = req.body

  // Validation
  if (!fullName || !email || !password || !contactNumber) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    })
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters and include letters and numbers'
    })
  }

  const normalizedContactNumber = normalizePhoneNumber(contactNumber)
  if (!isValidPhoneNumber(normalizedContactNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid contact number with country code and 10-digit local number'
    })
  }

  const normalizedEmail = normalizeEmail(email)
  const usersStore = getUsersStore()
  const existingUser = await usersStore.findByEmail(normalizedEmail)
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    })
  }
  const existingContact = await usersStore.findByContactNumber(normalizedContactNumber)
  if (existingContact) {
    return res.status(400).json({
      success: false,
      message: 'Contact number already registered'
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await usersStore.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    contactNumber: normalizedContactNumber,
    role: 'user'
  })

  // Generate token
  const token = generateToken(user.id, user.role)

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      id: String(user.id),
      fullName: user.full_name,
      email: user.email,
      contactNumber: user.contact_number,
      role: user.role
    }
  })
}))

// Login endpoint
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }

  // Find user
  const user = await getUsersStore().findByEmail(normalizeEmail(email))

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash)

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  // Generate token
  const token = generateToken(user.id, user.role)

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: String(user.id),
      fullName: user.full_name,
      email: user.email,
      contactNumber: user.contact_number,
      role: user.role
    }
  })
}))

// Get current user endpoint
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    })
  }

  if (user.is_blocked) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Contact support.'
    })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
  const user = await getUsersStore().findById(decoded.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  res.status(200).json({
    success: true,
    user: {
      id: String(user.id),
      fullName: user.full_name,
      email: user.email,
      contactNumber: user.contact_number,
      role: user.role
    }
  })
}))

export default router
