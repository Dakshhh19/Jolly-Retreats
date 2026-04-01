import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AuthService from '@/services/authService'
import { getPostAuthRoute } from '@/auth/privileges'
import { isValidAllowedEmail } from '@/lib/auth'

interface FieldErrors {
  email?: string
  password?: string
  form?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    const message = (location.state as { message?: string } | null)?.message
    if (message) {
      setSuccessMessage(message)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {}

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidAllowedEmail(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')

    if (!validate()) {
      return
    }

    setLoading(true)
    const result = await AuthService.login({
      email: formData.email.trim(),
      password: formData.password
    })
    setLoading(false)

    if (!result.success || !result.user) {
      setErrors({ form: result.message || 'Login failed.' })
      return
    }

    toast.success('Login successful. Welcome back!')
    navigate(getPostAuthRoute(result.user.role), { replace: true })
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
            <h1 className="font-serif text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to access your account securely.</p>
          </div>

          {successMessage && (
            <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {errors.form && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className="mt-2"
                autoComplete="email"
                disabled={loading}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-destructive">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-2"
                autoComplete="current-password"
                disabled={loading}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && <p id="password-error" className="mt-1 text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
