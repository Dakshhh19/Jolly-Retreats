# 🔐 Authentication Quick Reference

## 🎯 System Overview

| Feature | Details |
|---------|---------|
| **Auth Type** | JWT Token-based |
| **Password Hashing** | bcryptjs (10 rounds) |
| **Token Storage** | localStorage |
| **Roles** | User, Admin |
| **Backend** | Node.js + Express |
| **Token Expiry** | 7 days |

---

## ⚡ Quick Start Commands

### Terminal 1: Start Backend
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Terminal 2: Start Frontend
```bash
npm run dev
# App runs on http://localhost:3000
```

---

## 📝 User Data Model

```typescript
{
  id: string              // Auto-generated ID
  fullName: string        // User's full name
  email: string           // Unique email
  password: string        // Hashed password
  contactNumber: string   // Phone number
  role: "user" | "admin"  // User role
  createdAt: string       // Account creation date
}
```

---

## 🔑 Test Credentials

```
Email:    admin@example.com
Password: admin123
Role:     Admin
```

---

## 📍 Routes Map

### Auth Routes
| Route | Purpose |
|-------|---------|
| `/login` | User login |
| `/signup` | User registration |

### Dashboard Routes (Protected)
| Route | Role Required |
|-------|--------------|
| `/user-dashboard` | user |
| `/admin-dashboard` | admin |

### Public Routes
| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/tours` | Browse tours |
| `/treks` | Browse treks |
| `/restaurants` | Browse restaurants |
| `/car-rentals` | Browse car rentals |
| `/properties` | Browse properties |
| `/blog` | Read blog |

---

## 🎨 Navbar Behavior

### Not Logged In
```
[Logo] [Nav Links] [Search] [Login] [Sign Up]
```

### Logged In as User
```
[Logo] [Nav Links] [Search] [Dashboard] [Logout]
```

### Logged In as Admin
```
[Logo] [Nav Links] [Search] [Admin Dashboard] [Logout]
```

---

## 💻 API Endpoints

### POST /api/auth/signup
Creates new user account
- Required: fullName, email, password, contactNumber
- Returns: token, user info

### POST /api/auth/login
User authentication
- Required: email, password
- Returns: token, user info

### GET /api/auth/me
Get current user (requires token header)
- Header: Authorization: Bearer <token>
- Returns: user info

---

## 🛠️ AuthService Methods

```typescript
// Authentication
AuthService.signup(data)          // Register new user
AuthService.login(data)           // Login user
AuthService.logout()              // Clear session

// User Info
AuthService.getCurrentUser()      // Get logged-in user
AuthService.getUserRole()         // Get user's role
AuthService.getToken()            // Get JWT token

// Status Checks
AuthService.isAuthenticated()     // Is user logged in?
AuthService.isAdmin()             // Is user admin?
AuthService.isUser()              // Is user regular user?
```

---

## 🛡️ Protected Route Usage

```tsx
<ProtectedRoute requiredRole="user">
  <UserDashboard />
</ProtectedRoute>

<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

---

## 📱 Login Page Features

- **Email Input** - Valid email required
- **Password Input** - Minimum 6 characters
- **Test Credentials Button** - Quick fill for admin testing
- **Navigation** - Links to signup and home
- **Error Messages** - Clear validation feedback

---

## 📋 Signup Page Features

- **Full Name** - Required
- **Email** - Valid email format required
- **Contact Number** - 10+ digits required
- **Password** - Minimum 6 characters required
- **Navigation** - Link to login page
- **Privacy Notice** - Terms and conditions mention

---

## 👤 User Dashboard

Features:
- Welcome message with user's name
- Quick access cards to all sections
- Profile view with user information
- Browse tours, treks, restaurants, properties
- View account details

---

## 🔧 Admin Dashboard

Features:
- System overview with statistics
- Management cards for each section
- Add/Edit/Delete functionality UI
- User management view
- System status monitoring

---

## 🔐 Security Implementation

✅ **Implemented:**
- Bcrypt password hashing
- JWT token authentication
- Role-based access control
- Protected routes
- CORS configuration
- Error handling

⚠️ **Production Checklist:**
- [ ] Use HTTPS only
- [ ] Change JWT_SECRET
- [ ] Enable rate limiting
- [ ] Implement password strength rules
- [ ] Add email verification
- [ ] Add password reset
- [ ] Implement token refresh
- [ ] Add audit logging
- [ ] Setup monitoring
- [ ] Regular security updates

---

## 💾 LocalStorage Keys

```javascript
localStorage.getItem('token')      // JWT token
localStorage.getItem('user')       // User object (JSON)
localStorage.getItem('userRole')   // Role string
```

---

## 🚦 Authentication Flow Diagram

```
User Signup/Login
       ↓
AuthService.signup/login()
       ↓
Backend validates credentials
       ↓
Generate JWT token
       ↓
Store token + user in localStorage
       ↓
Redirect to dashboard
       ↓
ProtectedRoute checks role
       ↓
Display appropriate dashboard
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot POST /api/auth/signup" | Backend not running on port 5000 |
| "Token not in localStorage" | Check if localStorage is enabled |
| "Not authenticated" | Login required, check token expiry |
| "Invalid password" | Password must be 6+ characters |
| "Email already registered" | Use different email to signup |

---

## 📊 Component Files

| Component | Location | Purpose |
|-----------|----------|---------|
| LoginPage | `src/pages/auth/login.tsx` | Login form |
| SignupPage | `src/pages/auth/signup.tsx` | Registration form |
| UserDashboard | `src/dashboards/user-dashboard.tsx` | User dashboard |
| AdminDashboard | `src/dashboards/admin-dashboard.tsx` | Admin dashboard |
| ProtectedRoute | `src/auth/ProtectedRoute.tsx` | Route protection |
| AuthService | `src/services/authService.ts` | API service |
| Navbar | `src/components/layout/navbar.tsx` | Navigation |

---

## 🎯 Next Steps

1. ✅ Backend server setup
2. ✅ Frontend authentication
3. 📌 Setup email notifications
4. 📌 Add password reset
5. 📌 Implement 2FA
6. 📌 Add user profiles
7. 📌 Admin user management

---

## 💡 Tips

- Use test admin credentials to explore the admin dashboard
- Try creating multiple regular user accounts
- Test logout and re-login to verify token persistence
- Check browser DevTools > Applications > LocalStorage to see stored data
- Network tab to see API calls being made

---

## ✉️ Support Files

- **Setup Guide**: AUTHENTICATION_SETUP.md
- **Backend Server**: server/server.js
- **Email Template**: (Ready for when email is added)

---

**Status**: ✅ Ready for Testing

All components are functional. Test the system and let us know about any improvements needed!

