import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import toursRoutes from './routes/tours.js'
import treksRoutes from './routes/treks.js'
import restaurantsRoutes from './routes/restaurants.js'
import carRentalsRoutes from './routes/carRentals.js'
import propertiesRoutes from './routes/properties.js'
import bookingsRoutes from './routes/bookings.js'
import analyticsRoutes from './routes/analytics.js'
import servicesRoutes from './routes/services.js'
import ordersRoutes from './routes/orders.js'
import { errorHandler } from './middleware/errorHandler.js'
import { testConnection } from './config/db.js'
import { isDbConnected, setDbConnected } from './config/runtime.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server tools (no origin) and local frontend ports in development.
    if (!origin) return callback(null, true)
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/tours', toursRoutes)
app.use('/api/treks', treksRoutes)
app.use('/api/restaurants', restaurantsRoutes)
app.use('/api/car-rentals', carRentalsRoutes)
app.use('/api/properties', propertiesRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/orders', ordersRoutes)

// Well-known endpoint for Chrome DevTools detection
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).send()
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    message: 'Server is running',
    mode: isDbConnected() ? 'mysql' : 'fallback-local-store'
  })
})

// 404 handler for missing routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// Error handling
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    await testConnection()
    setDbConnected(true)
    console.log('Database connection established')
  } catch (error) {
    setDbConnected(false)
    console.warn(`Database unavailable (${error.message}). Running in fallback mode.`)
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer()
