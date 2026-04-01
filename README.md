# 🏨 Jolly Retreats

A full-stack web application for booking travel experiences, including tours, treks, car rentals, restaurants, and vacation properties. Built with modern technologies for a seamless user experience.

---

## ✨ Features

### 📍 Core Services
- **Tours & Treks** - Explore curated travel experiences with detailed itineraries
- **Car Rentals** - Book vehicles for your adventures
- **Restaurants** - Discover and reserve dining options
- **Properties** - Browse and book accommodation
- **Bookings** - Manage reservations across all services

### 👤 User Features
- **Authentication** - Secure JWT-based user authentication
- **User Dashboard** - View bookings and manage profile
- **Admin Dashboard** - Manage services and analytics
- **Responsive Design** - Works seamlessly on desktop and mobile

### 🔐 Security
- JWT token-based authentication
- Password hashing with bcryptjs
- CORS protection
- Rate limiting
- Input validation

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless component library
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Backend
- **Node.js** with Express.js
- **MySQL** - Relational database
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Nodemon** - Development server auto-reload

### Development Tools
- **TypeScript** - Type-safe development
- **ESLint** - Code linting
- **Concurrently** - Run multiple npm scripts

---

## 📂 Project Structure

```
FSE/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── services/                 # API service clients
│   ├── lib/                      # Utilities and constants
│   ├── routes/                   # Route configuration
│   ├── auth/                     # Authentication logic
│   ├── dashboards/               # User and admin dashboards
│   └── styles/                   # Global styles
│
├── server/                       # Backend source code
│   ├── routes/                   # API routes
│   ├── models/                   # Database models
│   ├── middleware/               # Express middleware
│   ├── utils/                    # Utility functions
│   ├── config/                   # Configuration
│   ├── sql/                      # Database schemas
│   └── data/                     # Seed data
│
├── public/                       # Static assets
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL 8+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FSE
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Configure environment variables**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jolly_retreats
```

5. **Set up the database**
```bash
# Create the database and tables
mysql -u root -p jolly_retreats < server/sql/retreat_platform_db.sql
```

### Running the Project

**Development mode** (runs both frontend and backend):
```bash
npm run dev
```

This runs:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Production build**:
```bash
npm run build
npm run preview
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout user
```

### Tours & Treks
```
GET    /api/tours              - Get all tours
GET    /api/tours/:id          - Get tour details
POST   /api/tours              - Create tour (admin)
PUT    /api/tours/:id          - Update tour (admin)
DELETE /api/tours/:id          - Delete tour (admin)
```

### Bookings
```
GET    /api/bookings           - Get user bookings
POST   /api/bookings           - Create booking
GET    /api/bookings/:id       - Get booking details
PUT    /api/bookings/:id       - Update booking
DELETE /api/bookings/:id       - Cancel booking
```

### Services (Restaurants, Properties, Car Rentals)
```
GET    /api/:service           - Get all items
GET    /api/:service/:id       - Get item details
POST   /api/:service           - Create item (admin)
PUT    /api/:service/:id       - Update item (admin)
DELETE /api/:service/:id       - Delete item (admin)
```

---

## 📖 Documentation

- [Architecture Overview](./ARCHITECTURE.md) - Component and data flow architecture
- [Backend Documentation](./BACKEND_DOCUMENTATION.md) - Server setup and API details
- [Authentication Setup](./AUTHENTICATION_SETUP.md) - Auth configuration guide
- [Migration Guide](./MIGRATION_GUIDE.md) - Database migration information

---

## 👥 User Roles

### Guest
- Browse services and properties
- View booking details

### User
- Complete bookings
- View personal bookings
- Update profile information
- Access user dashboard

### Admin
- Create and manage services
- View analytics and reports
- Manage user bookings
- Access admin dashboard

---

## 🧪 Testing

Run linting:
```bash
npm run lint
```

Health check for backend:
```bash
curl http://localhost:5000/health
```

---

## 📝 Available Scripts

### Frontend
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

### Backend
```bash
npm --prefix server run dev       # Start dev server with nodemon
npm --prefix server start         # Start production server
npm --prefix server run db:check  # Check database health
```

### Full Stack
```bash
npm run dev               # Run both frontend and backend
```

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcryptjs with salt rounds
- **CORS** - Cross-origin resource sharing protection
- **Rate Limiting** - Protection against brute-force attacks
- **Input Validation** - Zod schema validation
- **Environment Variables** - Sensitive data protection

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5000 (backend)
# Kill process on port 5173 (frontend)
```

**Database connection error:**
- Verify MySQL is running
- Check `.env` credentials
- Ensure database exists: `USE jolly_retreats;`

**Build fails:**
```bash
npm run lint          # Check for errors
npm run build         # Try building again
```

---

## 📋 License

This project is private and proprietary.

---

## 👨‍💻 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📞 Support

For issues or questions, please refer to the documentation files or create an issue in the repository.

---

**Happy retreating! 🏖️✈️**
