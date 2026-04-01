import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AuthService from '@/services/authService'
import {
  COUNTRY_CODE_OPTIONS,
  buildContactNumber,
  SECURITY_QUESTION_OPTIONS,
  isStrongPassword,
  isValidAllowedEmail,
  normalizeUsername,
  usernamePattern
} from '@/lib/auth'

interface FieldErrors {
  fullName?: string
  email?: string
  username?: string
  contactNumber?: string
  password?: string
  confirmPassword?: string
  securityQuestion?: string
  securityAnswer?: string
  form?: string
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formData, setFormData] = useState<{
    fullName: string
    email: string
    username: string
    countryCode: string
    localContactNumber: string
    password: string
    confirmPassword: string
    securityQuestion: string
    customSecurityQuestion: string
    securityAnswer: string
  }>({
    fullName: '',
    email: '',
    username: '',
    countryCode: '+91',
    localContactNumber: '',
    password: '',
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTION_OPTIONS[0],
    customSecurityQuestion: '',
    securityAnswer: ''
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'localContactNumber' ? value.replace(/\D/g, '').slice(0, 10) : value
    }))
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }

  const resolvedSecurityQuestion = formData.securityQuestion === '__custom__'
    ? formData.customSecurityQuestion
    : formData.securityQuestion

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {}

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidAllowedEmail(formData.email)) {
      nextErrors.email = 'Please enter a valid email address (Gmail, Outlook, Yahoo, etc.).'
    }

    if (!formData.username.trim()) {
      nextErrors.username = 'Username is required.'
    } else if (!usernamePattern.test(normalizeUsername(formData.username))) {
      nextErrors.username = 'Username must be 3-30 characters and use only letters, numbers, and underscores.'
    }

    if (!formData.localContactNumber.trim()) {
      nextErrors.contactNumber = 'Contact number is required.'
    } else if (!/^\d{10}$/.test(formData.localContactNumber.trim())) {
      nextErrors.contactNumber = 'Enter exactly 10 digits for the local contact number.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    } else if (!isStrongPassword(formData.password)) {
      nextErrors.password = 'Use 8+ characters with uppercase, lowercase, number, and special character.'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!resolvedSecurityQuestion.trim()) {
      nextErrors.securityQuestion = 'Security question is required.'
    } else if (resolvedSecurityQuestion.trim().length < 10) {
      nextErrors.securityQuestion = 'Security question should be at least 10 characters.'
    }

    if (!formData.securityAnswer.trim()) {
      nextErrors.securityAnswer = 'Security answer is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    const result = await AuthService.signup({
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      username: normalizeUsername(formData.username),
      contactNumber: buildContactNumber(formData.countryCode, formData.localContactNumber),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      securityQuestion: resolvedSecurityQuestion.trim(),
      securityAnswer: formData.securityAnswer.trim()
    })
    setLoading(false)

    if (!result.success) {
      setErrors({ form: result.message || 'Signup failed.' })
      return
    }

    toast.success('Account created successfully. Please login to continue.')
    navigate('/login', {
      replace: true,
      state: { message: 'Account created successfully. Please login to continue.' }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 pt-28 pb-12">
      <div className="mx-auto max-w-xl px-6">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-block">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <span className="font-serif text-sm font-bold text-primary-foreground">JR</span>
              </div>
            </Link>
            <h1 className="font-serif text-3xl font-bold text-foreground">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Set up your account with a secure recovery question.</p>
          </div>

          {errors.form && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-2"
                  autoComplete="name"
                  disabled={loading}
                />
                {errors.fullName && <p className="mt-1 text-sm text-destructive">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-2"
                  autoComplete="username"
                  disabled={loading}
                />
                {errors.username && <p className="mt-1 text-sm text-destructive">{errors.username}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@gmail.com"
                className="mt-2"
                autoComplete="email"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Please enter a valid email address (Gmail, Outlook, Yahoo, etc.)
              </p>
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <div className="mt-2 grid grid-cols-[170px_1fr] gap-2">
                <select
                  id="countryCode"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleSelectChange}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  disabled={loading}
                >
                  {COUNTRY_CODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <Input
                  id="contactNumber"
                  name="localContactNumber"
                  type="tel"
                  value={formData.localContactNumber}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="mt-0"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  maxLength={10}
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a country code and enter exactly 10 digits.
              </p>
              {errors.contactNumber && <p className="mt-1 text-sm text-destructive">{errors.contactNumber}</p>}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-2"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use 8+ characters with uppercase, lowercase, number, and special character.
                </p>
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-2"
                  autoComplete="new-password"
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="securityQuestion">Security Question</Label>
              <select
                id="securityQuestion"
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleSelectChange}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                disabled={loading}
              >
                {SECURITY_QUESTION_OPTIONS.map((question) => (
                  <option key={question} value={question}>{question}</option>
                ))}
                <option value="__custom__">Use my own question</option>
              </select>
              {formData.securityQuestion === '__custom__' && (
                <Input
                  id="customSecurityQuestion"
                  name="customSecurityQuestion"
                  value={formData.customSecurityQuestion}
                  onChange={handleInputChange}
                  className="mt-3"
                  placeholder="Enter your custom security question"
                  disabled={loading}
                />
              )}
              {errors.securityQuestion && <p className="mt-1 text-sm text-destructive">{errors.securityQuestion}</p>}
            </div>

            <div>
              <Label htmlFor="securityAnswer">Security Answer</Label>
              <Input
                id="securityAnswer"
                name="securityAnswer"
                value={formData.securityAnswer}
                onChange={handleInputChange}
                className="mt-2"
                autoComplete="off"
                disabled={loading}
              />
              {errors.securityAnswer && <p className="mt-1 text-sm text-destructive">{errors.securityAnswer}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
