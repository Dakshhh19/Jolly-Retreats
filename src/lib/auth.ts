export const COMMON_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'] as const

export const COUNTRY_CODE_OPTIONS = [
  { value: '+1', label: 'US/CA (+1)', localLength: 10 },
  { value: '+44', label: 'UK (+44)', localLength: 10 },
  { value: '+61', label: 'Australia (+61)', localLength: 10 },
  { value: '+91', label: 'India (+91)', localLength: 10 },
  { value: '+971', label: 'UAE (+971)', localLength: 10 }
] as const

export const SECURITY_QUESTION_OPTIONS = [
  'What was the name of your first school?',
  'What city were you born in?',
  'What was the name of your childhood best friend?',
  'What was your first job title?',
  'What is the name of the street you grew up on?'
] as const

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/
export const passwordStrengthPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/

export const normalizeEmail = (value: string) => value.trim().toLowerCase()
export const normalizeUsername = (value: string) => value.trim().toLowerCase()
export const normalizeSecurityAnswer = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()

export function isValidAllowedEmail(value: string): boolean {
  const normalized = normalizeEmail(value)
  return emailPattern.test(normalized)
}

export function isStrongPassword(value: string): boolean {
  return passwordStrengthPattern.test(value)
}

export function buildContactNumber(countryCode: string, localNumber: string): string {
  return `${countryCode}${localNumber.replace(/\D/g, '')}`
}
