import express from 'express'
import bcrypt from 'bcryptjs'
import { asyncHandler } from '../middleware/errorHandler.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { usersModel } from '../models/usersModel.js'
import { fallbackUsersModel } from '../models/fallbackModels.js'
import { isDbConnected } from '../config/runtime.js'
import {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  isValidSecurityAnswer,
  isValidSecurityPrompt,
  isValidUsername,
  normalizeEmail,
  normalizePhoneNumber,
  normalizeSecurityAnswer,
  normalizeWhitespace,
  sanitizeText,
  validRoles
} from '../utils/validators.js'

const router = express.Router()
const getUsersStore = () => (isDbConnected() ? usersModel : fallbackUsersModel)

const toApiUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  username: user.username,
  contact_number: user.contact_number,
  security_question: user.security_question,
  role: user.role,
  is_blocked: Boolean(user.is_blocked),
  created_at: user.created_at,
  updated_at: user.updated_at
})

router.get('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const users = await getUsersStore().getAll()
  res.json({ success: true, data: users.map(toApiUser) })
}))

router.get('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const user = await getUsersStore().findById(req.params.id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  return res.json({ success: true, data: toApiUser(user) })
}))

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    username,
    password,
    contactNumber,
    securityQuestion,
    securityAnswer,
    role = 'user',
    isBlocked = false
  } = req.body

  if (!fullName || !email || !username || !password || !contactNumber || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ success: false, message: 'All fields are required' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' })
  }
  if (!isValidUsername(username)) {
    return res.status(400).json({ success: false, message: 'Invalid username format' })
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ success: false, message: 'Invalid password format' })
  }
  const normalizedContactNumber = normalizePhoneNumber(contactNumber)
  if (!isValidPhoneNumber(normalizedContactNumber)) {
    return res.status(400).json({ success: false, message: 'Invalid contact number' })
  }
  if (!validRoles.has(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' })
  }
  if (!isValidSecurityPrompt(securityQuestion)) {
    return res.status(400).json({ success: false, message: 'Invalid security question' })
  }
  if (!isValidSecurityAnswer(securityAnswer)) {
    return res.status(400).json({ success: false, message: 'Invalid security answer' })
  }

  const normalizedEmail = normalizeEmail(email)
  const normalizedUsername = sanitizeText(username).toLowerCase()
  const usersStore = getUsersStore()
  const existingUser = await usersStore.findByEmail(normalizedEmail)
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' })
  }
  const existingUsername = await usersStore.findByUsername(normalizedUsername)
  if (existingUsername) {
    return res.status(400).json({ success: false, message: 'Username already registered' })
  }
  const existingContact = await usersStore.findByContactNumber(normalizedContactNumber)
  if (existingContact) {
    return res.status(400).json({ success: false, message: 'Contact number already registered' })
  }

  const [passwordHash, securityAnswerHash] = await Promise.all([
    bcrypt.hash(password, 12),
    bcrypt.hash(normalizeSecurityAnswer(securityAnswer), 12)
  ])
  const user = await usersStore.create({
    fullName: normalizeWhitespace(fullName),
    email: normalizedEmail,
    username: normalizedUsername,
    passwordHash,
    contactNumber: normalizedContactNumber,
    securityQuestion: normalizeWhitespace(securityQuestion),
    securityAnswerHash,
    role,
    isBlocked: Boolean(isBlocked)
  })

  res.status(201).json({ success: true, data: toApiUser(user) })
}))

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { fullName, email, username, password, contactNumber, securityQuestion, securityAnswer, role, isBlocked } = req.body
  const usersStore = getUsersStore()
  const existingUser = await usersStore.findById(req.params.id)
  if (!existingUser) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  const updatePayload = {}
  if (fullName !== undefined) {
    updatePayload.fullName = normalizeWhitespace(fullName)
  }
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' })
    }
    updatePayload.email = normalizeEmail(email)
  }
  if (username !== undefined) {
    if (!isValidUsername(username)) {
      return res.status(400).json({ success: false, message: 'Invalid username format' })
    }
    updatePayload.username = sanitizeText(username).toLowerCase()
  }
  if (contactNumber !== undefined) {
    const normalizedContactNumber = normalizePhoneNumber(contactNumber)
    if (!isValidPhoneNumber(normalizedContactNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid contact number' })
    }
    updatePayload.contactNumber = normalizedContactNumber
  }
  if (role !== undefined) {
    if (!validRoles.has(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }
    updatePayload.role = role
  }
  if (isBlocked !== undefined) {
    updatePayload.isBlocked = Boolean(isBlocked)
  }
  if (password !== undefined) {
    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, message: 'Invalid password format' })
    }
    updatePayload.passwordHash = await bcrypt.hash(password, 12)
  }
  if (securityQuestion !== undefined) {
    if (!isValidSecurityPrompt(securityQuestion)) {
      return res.status(400).json({ success: false, message: 'Invalid security question' })
    }
    updatePayload.securityQuestion = normalizeWhitespace(securityQuestion)
  }
  if (securityAnswer !== undefined) {
    if (!isValidSecurityAnswer(securityAnswer)) {
      return res.status(400).json({ success: false, message: 'Invalid security answer' })
    }
    updatePayload.securityAnswerHash = await bcrypt.hash(normalizeSecurityAnswer(securityAnswer), 12)
  }

  if (updatePayload.email && updatePayload.email !== existingUser.email) {
    const emailOwner = await usersStore.findByEmail(updatePayload.email)
    if (emailOwner && emailOwner.id !== existingUser.id) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }
  }
  if (updatePayload.username && updatePayload.username !== existingUser.username) {
    const usernameOwner = await usersStore.findByUsername(updatePayload.username)
    if (usernameOwner && usernameOwner.id !== existingUser.id) {
      return res.status(400).json({ success: false, message: 'Username already registered' })
    }
  }
  if (updatePayload.contactNumber && updatePayload.contactNumber !== existingUser.contact_number) {
    const contactOwner = await usersStore.findByContactNumber(updatePayload.contactNumber)
    if (contactOwner && contactOwner.id !== existingUser.id) {
      return res.status(400).json({ success: false, message: 'Contact number already registered' })
    }
  }

  const user = await usersStore.updateById(req.params.id, updatePayload)
  res.json({ success: true, data: toApiUser(user) })
}))

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const userId = Number(req.params.id)
  if (Number(req.user.id) === userId) {
    return res.status(400).json({ success: false, message: 'Admin cannot delete own account' })
  }

  const deleted = await getUsersStore().deleteById(userId)
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  return res.json({ success: true, message: 'User deleted successfully' })
}))

export default router
