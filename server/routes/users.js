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
  normalizeEmail,
  normalizePhoneNumber,
  validRoles
} from '../utils/validators.js'

const router = express.Router()
const getUsersStore = () => (isDbConnected() ? usersModel : fallbackUsersModel)

const toApiUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  contact_number: user.contact_number,
  role: user.role,
  is_blocked: Boolean(user.is_blocked),
  created_at: user.created_at
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
  const { fullName, email, password, contactNumber, role = 'user', isBlocked = false } = req.body

  if (!fullName || !email || !password || !contactNumber) {
    return res.status(400).json({ success: false, message: 'All fields are required' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' })
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

  const normalizedEmail = normalizeEmail(email)
  const usersStore = getUsersStore()
  const existingUser = await usersStore.findByEmail(normalizedEmail)
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' })
  }
  const existingContact = await usersStore.findByContactNumber(normalizedContactNumber)
  if (existingContact) {
    return res.status(400).json({ success: false, message: 'Contact number already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await usersStore.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    contactNumber: normalizedContactNumber,
    role,
    isBlocked: Boolean(isBlocked)
  })

  res.status(201).json({ success: true, data: toApiUser(user) })
}))

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { fullName, email, password, contactNumber, role, isBlocked } = req.body
  const usersStore = getUsersStore()
  const existingUser = await usersStore.findById(req.params.id)
  if (!existingUser) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  const updatePayload = {}
  if (fullName !== undefined) {
    updatePayload.fullName = String(fullName).trim()
  }
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' })
    }
    updatePayload.email = normalizeEmail(email)
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
    updatePayload.passwordHash = await bcrypt.hash(password, 10)
  }

  if (updatePayload.email && updatePayload.email !== existingUser.email) {
    const emailOwner = await usersStore.findByEmail(updatePayload.email)
    if (emailOwner && emailOwner.id !== existingUser.id) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
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
