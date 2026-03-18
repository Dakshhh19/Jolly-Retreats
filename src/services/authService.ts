const API_URL = 'http://localhost:5000/api/auth'

interface SignupData {
  fullName: string
  email: string
  password: string
  contactNumber: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    fullName: string
    email: string
    contactNumber?: string
    role: 'user' | 'admin'
  }
}

class AuthService {
  // Signup
  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success && result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('userRole', result.user.role)
      }

      return result
    } catch (error) {
      return {
        success: false,
        message: 'Signup failed. Please try again.'
      }
    }
  }

  // Login
  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success && result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('userRole', result.user.role)
      }

      return result
    } catch (error) {
      return {
        success: false,
        message: 'Login failed. Please try again.'
      }
    }
  }

  // Logout
  static logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
  }

  // Get current user
  static getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Get user role
  static getUserRole(): 'user' | 'admin' | null {
    return (localStorage.getItem('userRole') as 'user' | 'admin') || null
  }

  // Get token
  static getToken(): string | null {
    return localStorage.getItem('token')
  }

  // Check if authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Check if is admin
  static isAdmin(): boolean {
    return this.getUserRole() === 'admin'
  }

  // Check if is user
  static isUser(): boolean {
    return this.getUserRole() === 'user'
  }
}

export default AuthService
