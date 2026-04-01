import { getApiBaseUrl } from '@/lib/api-base'

const API_URL = getApiBaseUrl('/api/auth')

export interface AuthUser {
  id: string
  fullName: string
  email: string
  username: string
  contactNumber?: string
  role: 'user' | 'admin'
}

interface ApiResponse {
  success: boolean
  message: string
}

export interface SignupData {
  fullName: string
  email: string
  username: string
  password: string
  confirmPassword: string
  contactNumber: string
  securityQuestion: string
  securityAnswer: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse extends ApiResponse {
  token?: string
  user?: AuthUser
}

export interface RecoveryStartResponse extends ApiResponse {
  challengeToken?: string
  securityQuestion?: string
}

const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const USER_ROLE_KEY = 'userRole'

class AuthService {
  private static getNetworkErrorMessage(): string {
    return 'Unable to reach the authentication server. Make sure the backend is running and your local dev origin is allowed.'
  }

  private static isTokenExpired(token: string): boolean {
    try {
      const [, payload] = token.split('.')
      if (!payload) {
        return true
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
      const decoded = JSON.parse(atob(normalizedPayload)) as { exp?: number }
      if (!decoded.exp) {
        return false
      }

      return decoded.exp * 1000 <= Date.now()
    } catch {
      return true
    }
  }

  private static persistAuth(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(USER_ROLE_KEY, user.role)
  }

  static clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(USER_ROLE_KEY)
  }

  private static async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {})
        }
      })

      const rawBody = await response.text()
      const parsedBody = rawBody ? JSON.parse(rawBody) : null

      if (!response.ok) {
        throw new Error(parsedBody?.message || 'Request failed')
      }

      return parsedBody as T
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Received an invalid response from the server.')
      }
      if (error instanceof TypeError) {
        throw new Error(this.getNetworkErrorMessage())
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error(this.getNetworkErrorMessage())
    }
  }

  static async signup(data: SignupData): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/signup', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Signup failed. Please try again.'
      }
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const result = await this.request<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (result.success && result.token && result.user) {
        this.persistAuth(result.token, result.user)
      }

      return result
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed. Please try again.'
      }
    }
  }

  static async logout(): Promise<ApiResponse> {
    try {
      const token = this.getToken()
      const result = await this.request<ApiResponse>('/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      this.clearAuth()
      return result
    } catch (error) {
      this.clearAuth()
      return {
        success: true,
        message: 'You have been logged out successfully.'
      }
    }
  }

  static async fetchCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken()
    if (!token) {
      return null
    }

    try {
      const result = await this.request<{ success: boolean; user: AuthUser }>('/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      localStorage.setItem(USER_ROLE_KEY, result.user.role)
      return result.user
    } catch {
      this.clearAuth()
      return null
    }
  }

  static async startPasswordRecovery(identifier: string): Promise<RecoveryStartResponse> {
    try {
      return await this.request<RecoveryStartResponse>('/forgot-password/start', {
        method: 'POST',
        body: JSON.stringify({ identifier })
      })
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to start password recovery.'
      }
    }
  }

  static async verifyRecoveryAnswer(challengeToken: string, securityAnswer: string): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/forgot-password/verify', {
        method: 'POST',
        body: JSON.stringify({ challengeToken, securityAnswer })
      })
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to verify the security answer.'
      }
    }
  }

  static async resetPassword(challengeToken: string, password: string, confirmPassword: string): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify({ challengeToken, password, confirmPassword })
      })
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to reset password.'
      }
    }
  }

  static getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) {
      return null
    }

    try {
      return JSON.parse(userStr) as AuthUser
    } catch {
      this.clearAuth()
      return null
    }
  }

  static getUserRole(): 'user' | 'admin' | null {
    return (localStorage.getItem(USER_ROLE_KEY) as 'user' | 'admin' | null) || null
  }

  static getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return null
    }

    if (this.isTokenExpired(token)) {
      this.clearAuth()
      return null
    }

    return token
  }

  static isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getCurrentUser())
  }

  static isAdmin(): boolean {
    return this.getUserRole() === 'admin'
  }

  static isUser(): boolean {
    return this.getUserRole() === 'user'
  }
}

export default AuthService
