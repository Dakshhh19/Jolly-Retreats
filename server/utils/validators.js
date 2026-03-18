export const isValidEmail = (email = '') => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPassword = (password = '') => {
  if (password.length < 6) {
    return false
  }
  return /[A-Za-z]/.test(password) && /\d/.test(password)
}

export const normalizePhoneNumber = (phone = '') => {
  const value = String(phone).trim()
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

export const normalizeEmail = (email = '') => email.trim().toLowerCase()

export const validRoles = new Set(['user', 'admin'])
export const validServiceTypes = new Set(['tour', 'trek', 'restaurant', 'car', 'property', 'stay', 'experience'])
export const validBookingStatuses = new Set(['pending', 'confirmed', 'cancelled'])

export const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) >= 0
export const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0
