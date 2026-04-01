import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthService from '@/services/authService'
import { COUNTRY_CODE_OPTIONS, buildContactNumber, isStrongPassword, isValidAllowedEmail } from '@/lib/auth'

type RecoveryStep = 'identify' | 'verify' | 'reset'
type RecoveryMode = 'email' | 'contact'

interface FieldErrors {
  email?: string
  contactNumber?: string
  securityAnswer?: string
  password?: string
  confirmPassword?: string
  form?: string
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<RecoveryStep>('identify')
  const [recoveryMode, setRecoveryMode] = useState<RecoveryMode>('email')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [helperMessage, setHelperMessage] = useState('')
  const [challengeToken, setChallengeToken] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    countryCode: '+91',
    localContactNumber: '',
    securityAnswer: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const resolvedIdentifier = recoveryMode === 'email'
    ? formData.email.trim()
    : buildContactNumber(formData.countryCode, formData.localContactNumber)

  const handleIdentify = async (e: FormEvent) => {
    e.preventDefault()

    if (recoveryMode === 'email') {
      if (!formData.email.trim()) {
        setErrors({ email: 'Enter your email address.' })
        return
      }
      if (!isValidAllowedEmail(formData.email)) {
        setErrors({ email: 'Enter a valid email address.' })
        return
      }
    } else {
      if (!formData.localContactNumber.trim()) {
        setErrors({ contactNumber: 'Enter your contact number.' })
        return
      }
      if (!/^\d{10}$/.test(formData.localContactNumber.trim())) {
        setErrors({ contactNumber: 'Enter exactly 10 digits for the local contact number.' })
        return
      }
    }

    if (!resolvedIdentifier) {
      setErrors({ form: 'Enter your registered email or contact number.' })
      return
    }

    setLoading(true)
    setErrors({})
    const result = await AuthService.startPasswordRecovery(resolvedIdentifier)
    setLoading(false)

    if (!result.success) {
      setErrors({ form: result.message || 'Unable to start recovery.' })
      return
    }

    setHelperMessage(result.message)
    if (result.challengeToken && result.securityQuestion) {
      setChallengeToken(result.challengeToken)
      setSecurityQuestion(result.securityQuestion)
      setStep('verify')
    } else {
      toast.info(result.message)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.securityAnswer.trim()) {
      setErrors({ securityAnswer: 'Enter your security answer.' })
      return
    }

    setLoading(true)
    setErrors({})
    const result = await AuthService.verifyRecoveryAnswer(challengeToken, formData.securityAnswer.trim())
    setLoading(false)

    if (!result.success) {
      setErrors({ form: result.message || 'Verification failed.' })
      return
    }

    setHelperMessage(result.message)
    setStep('reset')
  }

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: FieldErrors = {}

    if (!formData.password) {
      nextErrors.password = 'New password is required.'
    } else if (!isStrongPassword(formData.password)) {
      nextErrors.password = 'Use 8+ characters with uppercase, lowercase, number, and special character.'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm the new password.'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    setErrors({})
    const result = await AuthService.resetPassword(challengeToken, formData.password, formData.confirmPassword)
    setLoading(false)

    if (!result.success) {
      setErrors({ form: result.message || 'Reset failed.' })
      return
    }

    toast.success('Password reset successful. Please login with your new password.')
    navigate('/login', {
      replace: true,
      state: { message: 'Password reset successful. Please login with your new password.' }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 pt-32 pb-12">
      <div className="mx-auto max-w-md px-6">
        <Card className="p-8">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-block">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <span className="font-serif text-sm font-bold text-primary-foreground">JR</span>
              </div>
            </Link>
            <h1 className="font-serif text-3xl font-bold text-foreground">Password Recovery</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Verify your security question and reset your password securely.
            </p>
          </div>

          {helperMessage && (
            <Alert className="mb-6 border-sky-200 bg-sky-50 text-sky-900">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{helperMessage}</AlertDescription>
            </Alert>
          )}

          {errors.form && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          {step === 'identify' && (
            <form onSubmit={handleIdentify} className="space-y-5" noValidate>
              <div>
                <Label>Recover Using</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={recoveryMode === 'email' ? 'default' : 'outline'}
                    onClick={() => setRecoveryMode('email')}
                    disabled={loading}
                  >
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={recoveryMode === 'contact' ? 'default' : 'outline'}
                    onClick={() => setRecoveryMode('contact')}
                    disabled={loading}
                  >
                    Contact Number
                  </Button>
                </div>
              </div>

              {recoveryMode === 'email' ? (
                <div>
                  <Label htmlFor="email">Registered Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@gmail.com"
                    className="mt-2"
                    autoComplete="email"
                    disabled={loading}
                  />
                  {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>
              ) : (
                <div>
                  <Label htmlFor="localContactNumber">Registered Contact Number</Label>
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
                      id="localContactNumber"
                      name="localContactNumber"
                      value={formData.localContactNumber}
                      onChange={handleChange}
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
              )}

                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ll continue only if the information matches an account with recovery configured.
                </p>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Checking account...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-5" noValidate>
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Security Question</p>
                <p className="mt-2 font-medium text-foreground">{securityQuestion}</p>
              </div>

              <div>
                <Label htmlFor="securityAnswer">Security Answer</Label>
                <Input
                  id="securityAnswer"
                  name="securityAnswer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  className="mt-2"
                  autoComplete="off"
                  disabled={loading}
                />
                {errors.securityAnswer && <p className="mt-1 text-sm text-destructive">{errors.securityAnswer}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying answer...' : 'Verify Answer'}
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-5" noValidate>
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2"
                  autoComplete="new-password"
                  disabled={loading}
                />
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-2"
                  autoComplete="new-password"
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting password...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
