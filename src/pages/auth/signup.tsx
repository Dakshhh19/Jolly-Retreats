import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AuthService from '@/services/authService'
import { getDashboardRoute } from '@/auth/privileges'

export default function SignupPage() {
  const countryCodes = [
    { code: '+1', label: 'US/CA (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+91', label: 'India (+91)' },
    { code: '+971', label: 'UAE (+971)' }
  ]

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    countryCode: '+1',
    phoneNumber: ''
  })

  useEffect(() => {
    const prefillEmail = searchParams.get('email')
    if (!prefillEmail) return

    setFormData((prev) => ({
      ...prev,
      email: prev.email || prefillEmail
    }))
  }, [searchParams])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleCountryCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: e.target.value
    }))
    setError('')
  }

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
    setFormData((prev) => ({
      ...prev,
      phoneNumber: digitsOnly
    }))
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Please enter exactly 10 digits for phone number')
      setLoading(false)
      return
    }

    const result = await AuthService.signup({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      contactNumber: `${formData.countryCode}${formData.phoneNumber}`
    })

    if (result.success) {
      navigate(getDashboardRoute(result.user?.role ?? AuthService.getUserRole()))
    } else {
      setError(result.message || 'Signup failed')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 pt-32 pb-12">
      <div className="mx-auto max-w-md px-6">
        <Card className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary mx-auto">
                <span className="font-serif text-sm font-bold text-primary-foreground">JR</span>
              </div>
            </Link>
            <h1 className="font-serif text-3xl font-bold text-foreground">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Join Jolly Retreats and start exploring</p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-2"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-2"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="contactNumber" className="text-sm font-medium">Contact Number</Label>
              <div className="mt-2 grid grid-cols-[140px_1fr] gap-2">
                <select
                  aria-label="Country code"
                  value={formData.countryCode}
                  onChange={handleCountryCodeChange}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  disabled={loading}
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <Input
                  id="contactNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  maxLength={10}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Enter 10 digits (country code selected separately)</p>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-2"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>

          {/* Privacy Notice */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>
    </div>
  )
}
