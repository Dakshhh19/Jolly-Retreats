# 🔐 Authentication System Setup Guide

## Overview

A complete JWT-based authentication system has been implemented for the Jolly Retreats website with:
- User signup and login
- JWT token management
- Role-based access control (User & Admin)
- Protected routes
- Separate user and admin dashboards

---

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Create .env File

```bash
cd server
cp .env.example .env
```

The `.env` file should contain:
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

### 3. Start Backend Server

```bash
cd server
npm run dev
```

The backend will be running at `http://localhost:5000`

### 4. Start Frontend (in another terminal)

```bash
npm run dev
```

The frontend will be running at `http://localhost:3000`

---

## 📋 User Information Collected

During signup, users provide only:
- **Full Name** - User's complete name
- **Email** - Unique email address for account
- **Password** - Minimum 6 characters (hashed with bcrypt)
- **Contact Number** - Phone number for communication

No unnecessary fields are collected. The signup process is minimal and fast.

---

## 🔑 Authentication Flow

### Signup Process
1. User enters name, email, password, contact number
2. Password is hashed using bcrypt (10 salt rounds)
3. User created with role = "user" by default
4. JWT token generated and stored in localStorage
5. Redirected to User Dashboard

### Login Process
1. User enters email and password
2. Email lookup in database
3. Password verification using bcryptjs
4. JWT token generated on success
5. Token + user info stored in localStorage
6. Redirected based on role (user or admin dashboard)

---

## 🎯 Roles

### User Role
- Can browse all listings (tours, treks, restaurants, car rentals)
- Access User Dashboard
- View account profile
- Plan trips

### Admin Role
- Full access to management features
- Can create, edit, delete listings
- View registered users
- Access Admin Dashboard
- Manage all content

---

## 📁 Project Structure

### Backend Files
```
server/
├── server.js                 # Main Express server
├── db.js                     # User database & operations
├── package.json              # Dependencies
├── .env.example              # Environment template
├── routes/
│   └── auth.js              # Authentication endpoints
├── middleware/
│   └── errorHandler.js      # Error handling
├── utils/
│   └── jwt.js               # JWT utilities
└── data/
    └── users.json           # User database (auto-created)
```

### Frontend Files
```
src/
├── services/
│   └── authService.ts       # API service for auth
├── auth/
│   └── ProtectedRoute.tsx   # Route protection component
├── pages/auth/
│   ├── login.tsx            # Login page
│   └── signup.tsx           # Signup page
├── dashboards/
│   ├── user-dashboard.tsx   # User dashboard
│   └── admin-dashboard.tsx  # Admin dashboard
└── routes/
    └── AppRoutes.tsx        # Route configuration
```

---

## 🔗 API Endpoints

### POST /api/auth/signup
**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "contactNumber": "+1 (555) 123-4567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "user-xxx",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "user-xxx",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 🧪 Testing the System

### Admin Test Account
- **Email:** `admin@example.com`
- **Password:** `admin123`

The admin account is pre-created in the system. You can use the "Fill Test Credentials" button on the login page to quickly test.

### Create a New User
1. Go to `/signup`
2. Fill in the form with your details
3. Click "Create Account"
4. You'll be logged in as a regular user

---

## 💾 Local Storage

The authentication system stores:
- **token** - JWT token for API authentication
- **user** - User information (id, name, email, role)
- **userRole** - User's role ("user" or "admin")

These are cleared on logout.

---

## 🛡️ Security Features

### Implemented
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Token stored in localStorage
- ✅ CORS enabled for frontend

### Production Recommendations
- 🔄 Use HTTPS only
- 🔑 Change JWT_SECRET in production
- 🌐 Use environment-specific configurations
- 📊 Implement rate limiting on auth endpoints
- 🔐 Add password strength validation
- 📝 Log authentication events
- 🗑️ Implement token refresh mechanism
- 🚫 Add account lockout after failed attempts

---

## 📊 Component Details

### AuthService
Handles all authentication operations:
```typescript
AuthService.signup(data)      // Create new account
AuthService.login(data)       // Login with email/password
AuthService.logout()          // Clear session
AuthService.getCurrentUser()  // Get logged-in user info
AuthService.getUserRole()     // Get user's role
AuthService.getToken()        // Get JWT token
AuthService.isAuthenticated() // Check if logged in
AuthService.isAdmin()         // Check if user is admin
AuthService.isUser()          // Check if user is regular user
```

### ProtectedRoute Component
```typescript
<ProtectedRoute requiredRole="user">
  <UserDashboard />
</ProtectedRoute>
```

Routes certain pages only if:
- User is authenticated
- User has the required role
- Redirects to login if not authenticated
- Redirects to appropriate dashboard if wrong role

### Navbar Updates
- Shows "Login" and "Sign Up" buttons when not authenticated
- Shows "Dashboard" and "Logout" buttons when authenticated
- Mobile menu displays user info when logged in
- "Book Now" button only visible when not authenticated

---

## 🚦 Route Status

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/tours` - Tours listing
- `/treks` - Treks listing
- `/restaurants` - Restaurants listing
- `/car-rentals` - Car rentals listing
- `/properties` - Properties listing
- `/blog` - Blog pages

### Protected Routes
- `/user-dashboard` - Requires role: "user"
- `/admin-dashboard` - Requires role: "admin"

### Role-Based Redirection
- If user tries to access admin route as regular user → redirected to user dashboard
- If admin tries to access user route as admin → redirected to admin dashboard
- If not authenticated → redirected to login

---

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

**Module Not Found Errors**
```bash
cd server
npm install
```

**Env Variables Not Loading**
- Make sure `.env` file is in the `server/` directory
- Restart the server after creating `.env`

### Frontend Issues

**API Connection Failed**
- Make sure backend is running on port 5000
- Check CORS is enabled (default: http://localhost:3000)
- Verify API_URL in authService.ts

**Tokens Not Persisting**
- Check localStorage is enabled in browser
- Clear browser cache and try again

**Protected Routes Not Working**
- Verify token is in localStorage
- Check if token is valid and not expired
- Try logging out and logging back in

---

## 🔄 Next Steps

### Future Enhancements
1. **Email Verification** - Verify email before account activation
2. **Password Reset** - Allow users to reset forgotten passwords
3. **Profile Updates** - Let users edit their information
4. **Profile Picture** - Add avatar/profile image upload
5. **Two-Factor Authentication** - Add 2FA for security
6. **Refresh Tokens** - Implement token refresh mechanism
7. **Admin Invitations** - Allow admins to create other admins
8. **User Deletion** - Allow users to delete their accounts
9. **Activity Logs** - Track user and admin actions
10. **Email Notifications** - Send confirmation and notification emails

---

## 📞 Support

### File Reference
- Backend server: `server/server.js`
- Frontend auth service: `src/services/authService.ts`
- Login page: `src/pages/auth/login.tsx`
- Signup page: `src/pages/auth/signup.tsx`
- Protected routes: `src/auth/ProtectedRoute.tsx`
- User dashboard: `src/dashboards/user-dashboard.tsx`
- Admin dashboard: `src/dashboards/admin-dashboard.tsx`
- Navbar: `src/components/layout/navbar.tsx`
- Routes: `src/routes/AppRoutes.tsx`

---

## ✅ Checklist

- [ ] Backend dependencies installed
- [ ] `.env` file created
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Can access login page at `/login`
- [ ] Can access signup page at `/signup`
- [ ] Can signup with new account
- [ ] Can login with test admin credentials
- [ ] Can access user dashboard when logged in as user
- [ ] Can access admin dashboard when logged in as admin
- [ ] Logout works correctly
- [ ] Navbar updates based on auth status

---

## 🎉 System Ready!

Your authentication system is complete and ready to use. Test it out by:

1. **Create a new account** - Go to `/signup`
2. **Login as admin** - Go to `/login` and use admin@example.com / admin123
3. **Access dashboards** - Use the dashboard links in the navbar
4. **Logout** - Click the logout button to clear session

Happy building! 🚀

