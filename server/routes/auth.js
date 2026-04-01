import crypto from 'crypto'
import express from 'express'
import bcrypt from 'bcryptjs'
import { generateToken, verifyToken } from '../utils/jwt.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { createRateLimiter } from '../middleware/rateLimit.js'
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
  sanitizeText
} from '../utils/validators.js'

const router = express.Router()
const getUsersStore = () => (isDbConnected() ? usersModel : fallbackUsersModel)

const recoveryChallenges = new Map()
const RECOVERY_TTL_MS = 10 * 60 * 1000
const MAX_SECURITY_ATTEMPTS = 5

const signupLimiter = createRateLimiter({
  key: 'auth-signup',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many signup attempts. Please try again later.'
})

const loginLimiter = createRateLimiter({
  key: 'auth-login',
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts. Please try again later.'
})

const recoveryLimiter = createRateLimiter({
  key: 'auth-recovery',
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Too many password recovery attempts. Please try again later.'
})

const toApiUser = (user) => ({
  id: String(user.id),
  fullName: user.full_name,
  email: user.email,
  username: user.username,
  contactNumber: user.contact_number,
  role: user.role
})

const pruneChallenges = () => {
  const now = Date.now()
  for (const [token, entry] of recoveryChallenges.entries()) {
    if (entry.expiresAt <= now) {
      recoveryChallenges.delete(token)
    }
  }
}

const buildGenericRecoveryResponse = () => ({
  success: true,
  message: 'If the provided account details are valid, the next recovery step will be available shortly.'
})

const findRecoveryUser = async (identifier) => {
  const cleanedIdentifier = sanitizeText(identifier)
  if (!cleanedIdentifier) {
    return null
  }

  const usersStore = getUsersStore()
  if (cleanedIdentifier.includes('@')) {
    if (!isValidEmail(cleanedIdentifier)) {
      return null
    }
    return usersStore.findByEmail(normalizeEmail(cleanedIdentifier))
  }

  const normalizedPhoneNumber = normalizePhoneNumber(cleanedIdentifier)
  if (!isValidPhoneNumber(normalizedPhoneNumber)) {
    return null
  }

  return usersStore.findByContactNumber(normalizedPhoneNumber)
}

router.post('/signup', signupLimiter, asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    username,
    password,
    confirmPassword,
    contactNumber,
    securityQuestion,
    securityAnswer
  } = req.body

  if (!fullName || !email || !username || !password || !confirmPassword || !contactNumber || !securityQuestion || !securityAnswer) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    })
  }

  const normalizedFullName = normalizeWhitespace(fullName)
  const normalizedEmail = normalizeEmail(email)
  const normalizedUsername = sanitizeText(username).toLowerCase()
  const normalizedContactNumber = normalizePhoneNumber(contactNumber)
  const normalizedSecurityQuestion = normalizeWhitespace(securityQuestion)
  const normalizedSecurityAnswerValue = normalizeSecurityAnswer(securityAnswer)

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    })
  }

  if (!isValidUsername(normalizedUsername)) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 3-30 characters and can only contain letters, numbers, and underscores.'
    })
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be 8-72 characters and include uppercase, lowercase, number, and special character.'
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Confirm password must match the password.'
    })
  }

  if (!isValidPhoneNumber(normalizedContactNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid contact number with country code and 10-digit local number.'
    })
  }

  if (!isValidSecurityPrompt(normalizedSecurityQuestion)) {
    return res.status(400).json({
      success: false,
      message: 'Security question must be between 10 and 150 characters.'
    })
  }

  if (!isValidSecurityAnswer(normalizedSecurityAnswerValue)) {
    return res.status(400).json({
      success: false,
      message: 'Security answer must be between 2 and 120 characters.'
    })
  }

  const usersStore = getUsersStore()
  const [existingEmail, existingUsername, existingContact] = await Promise.all([
    usersStore.findByEmail(normalizedEmail),
    usersStore.findByUsername(normalizedUsername),
    usersStore.findByContactNumber(normalizedContactNumber)
  ])

  if (existingEmail) {
    return res.status(409).json({ success: false, message: 'Email already registered' })
  }
  if (existingUsername) {
    return res.status(409).json({ success: false, message: 'Username is already taken' })
  }
  if (existingContact) {
    return res.status(409).json({ success: false, message: 'Contact number already registered' })
  }

  const [passwordHash, securityAnswerHash] = await Promise.all([
    bcrypt.hash(password, 12),
    bcrypt.hash(normalizedSecurityAnswerValue, 12)
  ])

  await usersStore.create({
    fullName: normalizedFullName,
    email: normalizedEmail,
    username: normalizedUsername,
    passwordHash,
    contactNumber: normalizedContactNumber,
    securityQuestion: normalizedSecurityQuestion,
    securityAnswerHash,
    role: 'user'
  })

  return res.status(201).json({
    success: true,
    message: 'Account created successfully. Please login to continue.'
  })
}))

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }

  const normalizedEmail = normalizeEmail(email)
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.'
    })
  }

  const user = await getUsersStore().findByEmail(normalizedEmail)
  if (!user || user.is_blocked) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const token = generateToken(user.id, user.role)
  res.setHeader('Cache-Control', 'no-store')

  return res.status(200).json({
    success: true,
    message: 'Login successful. Welcome back!',
    token,
    user: toApiUser(user)
  })
}))

router.post('/logout', asyncHandler(async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({
    success: true,
    message: 'You have been logged out successfully.'
  })
}))

router.post('/forgot-password/start', recoveryLimiter, asyncHandler(async (req, res) => {
  pruneChallenges()

  const identifier = req.body?.identifier
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Email or contact number is required.'
    })
  }

  const user = await findRecoveryUser(identifier)
  if (!user || !user.security_question || !user.security_answer_hash) {
    return res.status(200).json(buildGenericRecoveryResponse())
  }

  const challengeToken = crypto.randomBytes(32).toString('hex')
  recoveryChallenges.set(challengeToken, {
    userId: user.id,
    attemptsRemaining: MAX_SECURITY_ATTEMPTS,
    verified: false,
    expiresAt: Date.now() + RECOVERY_TTL_MS
  })

  return res.status(200).json({
    ...buildGenericRecoveryResponse(),
    challengeToken,
    securityQuestion: user.security_question
  })
}))

router.post('/forgot-password/verify', recoveryLimiter, asyncHandler(async (req, res) => {
  pruneChallenges()

  const challengeToken = sanitizeText(req.body?.challengeToken)
  const securityAnswer = req.body?.securityAnswer

  if (!challengeToken || !securityAnswer) {
    return res.status(400).json({
      success: false,
      message: 'Challenge token and security answer are required.'
    })
  }

  const challenge = recoveryChallenges.get(challengeToken)
  if (!challenge || challenge.expiresAt <= Date.now()) {
    recoveryChallenges.delete(challengeToken)
    return res.status(410).json({
      success: false,
      message: 'Recovery session expired. Please start again.'
    })
  }

  if (challenge.attemptsRemaining <= 0) {
    recoveryChallenges.delete(challengeToken)
    return res.status(429).json({
      success: false,
      message: 'Too many incorrect answers. Please start again later.'
    })
  }

  const user = await getUsersStore().findById(challenge.userId)
  if (!user || !user.security_answer_hash) {
    recoveryChallenges.delete(challengeToken)
    return res.status(404).json({
      success: false,
      message: 'Recovery session is no longer valid.'
    })
  }

  const normalizedAnswer = normalizeSecurityAnswer(securityAnswer)
  const isAnswerCorrect = await bcrypt.compare(normalizedAnswer, user.security_answer_hash)

  if (!isAnswerCorrect) {
    challenge.attemptsRemaining -= 1
    recoveryChallenges.set(challengeToken, challenge)
    return res.status(401).json({
      success: false,
      message: challenge.attemptsRemaining > 0
        ? `Incorrect security answer. ${challenge.attemptsRemaining} attempt(s) remaining.`
        : 'Too many incorrect answers. Please start again later.'
    })
  }

  challenge.verified = true
  recoveryChallenges.set(challengeToken, challenge)

  return res.status(200).json({
    success: true,
    message: 'Security answer verified. You can now set a new password.'
  })
}))

router.post('/forgot-password/reset', recoveryLimiter, asyncHandler(async (req, res) => {
  pruneChallenges()

  const challengeToken = sanitizeText(req.body?.challengeToken)
  const password = req.body?.password
  const confirmPassword = req.body?.confirmPassword

  if (!challengeToken || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Challenge token, new password, and confirm password are required.'
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Confirm password must match the password.'
    })
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be 8-72 characters and include uppercase, lowercase, number, and special character.'
    })
  }

  const challenge = recoveryChallenges.get(challengeToken)
  if (!challenge || challenge.expiresAt <= Date.now() || !challenge.verified) {
    recoveryChallenges.delete(challengeToken)
    return res.status(403).json({
      success: false,
      message: 'Recovery session is invalid. Please start again.'
    })
  }

  const user = await getUsersStore().findById(challenge.userId)
  if (!user) {
    recoveryChallenges.delete(challengeToken)
    return res.status(404).json({
      success: false,
      message: 'User not found.'
    })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await getUsersStore().updateById(user.id, { passwordHash })
  recoveryChallenges.delete(challengeToken)

  return res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login with your new password.'
  })
}))

router.get('/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
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

  if (user.is_blocked) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Contact support.'
    })
  }

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({
    success: true,
    user: toApiUser(user)
  })
}))

export default router
