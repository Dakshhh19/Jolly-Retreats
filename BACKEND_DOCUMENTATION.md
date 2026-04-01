# 🖥️ Backend Authentication Documentation

## Overview

Express.js backend server with JWT authentication, bcrypt password hashing, and simple JSON-based user database.

---

## 📦 Directory Structure

```
server/
├── server.js                 # Main Express application
├── db.js                     # User database operations
├── package.json              # Project dependencies
├── .env.example              # Environment template
│
├── routes/
│   └── auth.js              # Authentication endpoints
│
├── middleware/
│   └── errorHandler.js      # Error handling middleware
│
├── utils/
│   └── jwt.js               # JWT token utilities
│
└── data/
    └── users.json           # User database (created on first run)
```

---

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

This installs:
- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### 2. Create .env File

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
PORT=5000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

### 3. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 📂 Module Details

### server.js

Main application file that:
- Sets up Express server
- Configures middleware (CORS, JSON)
- Registers routes
- Starts the server

**Key Middleware:**
```javascript
app.use(express.json())              // Parse JSON requests
app.use(cors({ origin: ... }))       // Enable CORS
```

**Health Check:**
```
GET /health
Returns: { message: 'Server is running' }
```

### db.js

User database operations using JSON file.

**Initialize Database:**
- Creates `data/` directory on first run
- Creates `data/users.json` with default admin user
- Admin user: `admin@example.com` / `admin123`

**Functions:**

```typescript
userDB.findByEmail(email)                    // Find user by email
userDB.findById(id)                          // Find user by ID
userDB.create(fullName, email, password, phone) // Create new user
userDB.getAllUsers()                         // Get all users (no passwords)
userDB.verifyPassword(password, hash)        // Verify password
```

**User JSON Structure:**
```json
{
  "id": "user-xxx",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "contactNumber": "+1-555-1234",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### routes/auth.js

Authentication endpoints.

#### POST /api/auth/signup
Register new user account.

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "contactNumber": "+1 (555) 123-4567"
}
```

**Validations:**
- All fields required
- Password minimum 6 characters
- Email must be unique

**Response (201):**
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

**Error (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

#### POST /api/auth/login
User login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validations:**
- Both fields required
- Email must exist
- Password must match

**Response (200):**
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

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### GET /api/auth/me
Get current user information (requires valid token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-xxx",
    "fullName": "John Doe",
    "email": "john@example.com",
    "contactNumber": "+1-555-1234",
    "role": "user"
  }
}
```

### middleware/errorHandler.js

Error handling utilities.

**errorHandler Function:**
- Catches and logs errors
- Returns JSON error responses
- Includes error details in development mode

**asyncHandler Function:**
- Wraps async route handlers
- Catches promise rejections
- Passes errors to error handler

**Usage:**
```javascript
router.post('/route', asyncHandler(async (req, res) => {
  // Code here
}))
```

### utils/jwt.js

JWT token utilities.

**generateToken(userId, role)**
```typescript
const token = generateToken('user-123', 'user')
// Returns: JWT token string
// Expires: 7 days
```

**verifyToken(token)**
```typescript
const decoded = verifyToken(token)
// Returns: { id, role, iat, exp } or null if invalid
```

---

## 🔐 Security Details

### Password Hashing
- Algorithm: bcryptjs
- Salt rounds: 10
- Hashing: One-way cryptographic process
- Verification: Constant-time comparison

```javascript
// Hashing
const hash = bcrypt.hashSync(password, 10)

// Verification
const isMatch = bcrypt.compareSync(plainPassword, hash)
```

### JWT Tokens
- Algorithm: HS256 (HMAC SHA-256)
- Expiration: 7 days
- Secret: JWT_SECRET from .env
- Claims: id, role, iat, exp

**Token Structure:**
```
Header.Payload.Signature

Header: { alg: "HS256", typ: "JWT" }
Payload: { id: "...", role: "...", iat: ..., exp: ... }
Signature: HMAC(Secret, Header.Payload)
```

### CORS Configuration
```javascript
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

Only allows requests from frontend on port 3000.

---

## 🧪 Test Requests

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane","email":"jane@example.com","password":"pass123","contactNumber":"+1-555-5678"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Using Postman

1. Create collection "Jolly Retreats Auth"
2. Add POST request to `http://localhost:5000/api/auth/signup`
3. Set Body as JSON and enter signup data
4. Send request and save token for next request
5. Add Authorization header with Bearer token

---

## 📊 Database

### Auto-Generated Structure

**users.json** (created on first run):
```json
[
  {
    "id": "admin-001",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "password": "$2a$10$...",
    "contactNumber": "+1234567890",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Adding Users Programmatically

```javascript
import { userDB } from './db.js'

const newUser = userDB.create(
  'John Doe',
  'john@example.com',
  'password123',
  '+1-555-1234'
)
// Returns: user object or null if email exists
```

---

## 🚨 Error Handling

### Response Format

Success (2xx):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error (4xx, 5xx):
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (auth error) |
| 404 | Not found |
| 500 | Server error |

---

## 🔄 Data Flow

### Signup Flow
```
Client Request
    ↓
Validate input
    ↓
Check if email exists
    ↓
Hash password with bcrypt
    ↓
Create user in database
    ↓
Generate JWT token
    ↓
Return token + user info
```

### Login Flow
```
Client Request (email, password)
    ↓
Find user by email
    ↓
Verify password with bcrypt.compare
    ↓
Generate JWT token
    ↓
Return token + user info
```

---

## 🛠️ Troubleshooting

### Port 5000 Already in Use

**Windows:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Modules Not Found

```bash
cd server
npm install
npm list
```

### .env Not Loading

- Check file is named `.env` (not `.env.txt`)
- Must be in `server/` directory
- Restart server after creating
- Check for syntax errors (quotes, spaces)

### Database Corruption

- Delete `server/data/users.json`
- Restart server (will recreate with admin user)

---

## 📈 Scaling Considerations

For production, consider:
1. **Replace JSON DB** - Use MongoDB, PostgreSQL, etc.
2. **Connection Pooling** - For database connections
3. **Rate Limiting** - Prevent brute force attacks
4. **Request Logging** - Track all API calls
5. **Email Verification** - Confirm user email addresses
6. **Refresh Tokens** - Separate short/long-lived tokens
7. **API Versioning** - Plan for /v1/, /v2/ endpoints
8. **Pagination** - Limit returned user lists
9. **Caching** - Cache frequently accessed data
10. **Monitoring** - APM tools, error tracking

---

## 🎯 Next Features

- [ ] Email verification on signup
- [ ] Password reset flow
- [ ] Email notifications
- [ ] User profile updates
- [ ] Admin user creation
- [ ] Refresh token mechanism
- [ ] Activity audit logs
- [ ] Rate limiting
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)

---

## 📝 Code Examples

### Adding a New Endpoint

```javascript
router.post('/change-password', asyncHandler(async (req, res) => {
  const { email, oldPassword, newPassword } = req.body
  
  // Validation
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'All fields required'
    })
  }
  
  const user = userDB.findByEmail(email)
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  
  if (!userDB.verifyPassword(oldPassword, user.password)) {
    return res.status(401).json({
      success: false,
      message: 'Old password incorrect'
    })
  }
  
  // Update password
  user.password = bcrypt.hashSync(newPassword, 10)
  // Save to database...
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  })
}))
```

---

## ✅ Deployment Checklist

- [ ] Update JWT_SECRET with strong random value
- [ ] Set NODE_ENV to production
- [ ] Enable HTTPS only
- [ ] Setup secrets management
- [ ] Configure proper CORS for frontend domain
- [ ] Setup database (not JSON file)
- [ ] Enable logging and monitoring
- [ ] Setup rate limiting
- [ ] Configure backups
- [ ] Test all endpoints
- [ ] Setup CI/CD pipeline
- [ ] Plan security updates

---

**Server Status**: ✅ Ready for Development & Testing

