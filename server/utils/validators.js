export const allowedEmailDomains = new Set([
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'hotmail.com',
  'icloud.com'
])

export const sanitizeText = (value = '') => String(value).replace(/[<>]/g, '').trim()

export const normalizeWhitespace = (value = '') => sanitizeText(value).replace(/\s+/g, ' ')

export const normalizeEmail = (email = '') => sanitizeText(email).toLowerCase()

export const isValidEmail = (email = '') => {
  const normalizedEmail = normalizeEmail(email)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
}

export const isValidUsername = (username = '') => /^[a-zA-Z0-9_]{3,30}$/.test(sanitizeText(username))

export const isValidPassword = (password = '') => {
  if (password.length < 8 || password.length > 72) {
    return false
  }
  return /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
}

export const normalizeSecurityAnswer = (answer = '') => normalizeWhitespace(answer).toLowerCase()

export const isValidSecurityPrompt = (value = '') => {
  const normalized = normalizeWhitespace(value)
  return normalized.length >= 10 && normalized.length <= 150
}

export const isValidSecurityAnswer = (value = '') => {
  const normalized = normalizeSecurityAnswer(value)
  return normalized.length >= 2 && normalized.length <= 120
}

export const normalizePhoneNumber = (phone = '') => {
  const value = sanitizeText(phone)
  const hasPlusPrefix = value.startsWith('+')
  const digitsOnly = value.replace(/\D/g, '')
  if (!digitsOnly) {
    return ''
  }
  return hasPlusPrefix ? `+${digitsOnly}` : digitsOnly
}

export const isValidPhoneNumber = (phone = '') => {
  const normalized = normalizePhoneNumber(phone)
  // Required format: +<country_code><10_digit_local_number>
  // Country code length: 1 to 4 digits.
  if (!/^\+\d{11,14}$/.test(normalized)) {
    return false
  }

  const digits = normalized.slice(1)
  const countryCode = digits.slice(0, -10)
  const localNumber = digits.slice(-10)

  return countryCode.length >= 1 && countryCode.length <= 4 && /^\d{10}$/.test(localNumber)
}

export const validRoles = new Set(['user', 'admin'])
export const validServiceTypes = new Set(['tour', 'trek', 'restaurant', 'car', 'property', 'stay', 'experience'])
export const validBookingStatuses = new Set(['pending', 'confirmed', 'cancelled'])

export const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) >= 0
export const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0
