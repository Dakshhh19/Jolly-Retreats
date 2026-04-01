import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '..', 'data', 'fallback-db.json')

const defaultPropertySeeds = [
  {
    id: 1,
    name: 'Emerald Cliff Villa',
    location: 'Bali, Indonesia',
    price_per_night: 450,
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    description: 'Perched cliffside villa with panoramic views'
  },
  {
    id: 2,
    name: 'Serene Mountain Cottage',
    location: 'Swiss Alps, Switzerland',
    price_per_night: 320,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    image_url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop',
    description: 'Charming alpine cottage retreat'
  },
  {
    id: 3,
    name: 'Coastal Haven Villa',
    location: 'Amalfi Coast, Italy',
    price_per_night: 680,
    capacity: 10,
    bedrooms: 5,
    bathrooms: 4,
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    description: 'Mediterranean villa with sea views'
  },
  {
    id: 4,
    name: 'Forest Hideaway Cottage',
    location: 'Cotswolds, England',
    price_per_night: 195,
    capacity: 3,
    bedrooms: 1,
    bathrooms: 1,
    image_url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop',
    description: 'Private countryside hideaway'
  },
  {
    id: 5,
    name: 'Sunset Bay Villa',
    location: 'Santorini, Greece',
    price_per_night: 520,
    capacity: 6,
    bedrooms: 3,
    bathrooms: 3,
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    description: 'Sunset-facing Greek island villa'
  },
  {
    id: 6,
    name: 'Lakeside Timber Lodge',
    location: 'Lake Como, Italy',
    price_per_night: 380,
    capacity: 5,
    bedrooms: 2,
    bathrooms: 2,
    image_url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop',
    description: 'Lakeside lodge with mountain backdrop'
  }
]

const defaultStore = {
  users: [
    {
      id: 1,
      full_name: 'Admin User',
      email: 'admin@example.com',
      username: 'admin',
      password_hash: '$2a$10$euiu2LRoFkL03DTzuJitY.Rjrd0f3LKIabEre7zcOOY4QhGp38F0G',
      contact_number: '+1234567890',
      security_question: 'What city was the first Jolly Retreats office opened in?',
      security_answer_hash: '$2b$10$ceUy7fK9xN0Yj7l9nJYl2OT.x3OdWy9iDsN.Bs2M2wVQstM0W7KRe',
      role: 'admin',
      is_blocked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  tours: [],
  treks: [],
  restaurants: [],
  car_rentals: [],
  properties: defaultPropertySeeds,
  bookings: [],
  counters: {
    users: 2,
    tours: 1,
    treks: 1,
    restaurants: 1,
    car_rentals: 1,
    properties: 7,
    bookings: 1
  }
}

const ensureStore = async () => {
  try {
    await fs.access(dataPath)
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    await fs.writeFile(dataPath, JSON.stringify(defaultStore, null, 2))
  }
}

const readStore = async () => {
  await ensureStore()
  const raw = await fs.readFile(dataPath, 'utf-8')
  const parsed = JSON.parse(raw)

  parsed.users = parsed.users || defaultStore.users
  parsed.tours = parsed.tours || []
  parsed.treks = parsed.treks || []
  parsed.restaurants = parsed.restaurants || []
  parsed.car_rentals = parsed.car_rentals || []
  parsed.properties = parsed.properties || []
  if (!parsed.properties.length) {
    parsed.properties = defaultPropertySeeds
  }
  parsed.bookings = parsed.bookings || []
  parsed.counters = parsed.counters || { ...defaultStore.counters }
  parsed.counters.properties = parsed.counters.properties || (parsed.properties.length + 1)
  parsed.users = parsed.users.map((user) => ({
    ...user,
    username: user.username || `user_${user.id}`,
    contact_number: typeof user.contact_number === 'string' ? user.contact_number.replace(/\s+/g, '') : '',
    security_question: user.security_question || null,
    security_answer_hash: user.security_answer_hash || null,
    updated_at: user.updated_at || user.created_at || new Date().toISOString()
  }))

  return parsed
}

const writeStore = async (store) => {
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2))
}

const nextId = (store, key) => {
  const id = store.counters[key]
  store.counters[key] += 1
  return id
}

const getFallbackServiceName = (store, serviceType, serviceId) => {
  const collections = {
    tour: store.tours,
    trek: store.treks,
    restaurant: store.restaurants,
    car: store.car_rentals,
    property: store.properties
  }
  const rows = collections[serviceType] || []
  const match = rows.find((item) => Number(item.id) === Number(serviceId))
  if (!match) return ''
  return match.title || match.name || match.car_name || ''
}

const decorateBooking = (booking, store) => ({
  ...booking,
  service_name: booking.service_name || getFallbackServiceName(store, booking.service_type, booking.service_id)
})

const createServiceModel = (collection) => ({
  async getAll() {
    const store = await readStore()
    return store[collection]
  },

  async getById(id) {
    const store = await readStore()
    return store[collection].find((item) => item.id === Number(id)) || null
  },

  async create(payload) {
    const store = await readStore()
    const id = nextId(store, collection)
    const item = { id, ...payload }
    if (collection === 'tours' && !item.created_at) {
      item.created_at = new Date().toISOString()
    }
    store[collection].unshift(item)
    await writeStore(store)
    return item
  },

  async updateById(id, payload) {
    const store = await readStore()
    const index = store[collection].findIndex((item) => item.id === Number(id))
    if (index < 0) {
      return null
    }
    const current = store[collection][index]
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    )
    const updated = { ...current, ...cleaned }
    store[collection][index] = updated
    await writeStore(store)
    return updated
  },

  async deleteById(id) {
    const store = await readStore()
    const before = store[collection].length
    store[collection] = store[collection].filter((item) => item.id !== Number(id))
    if (before === store[collection].length) {
      return false
    }

    // Cascade remove bookings for deleted service.
    const serviceTypeMap = {
      tours: 'tour',
      treks: 'trek',
      restaurants: 'restaurant',
      car_rentals: 'car',
      properties: 'property'
    }
    const serviceType = serviceTypeMap[collection]
    store.bookings = store.bookings.filter(
      (booking) => !(booking.service_type === serviceType && booking.service_id === Number(id))
    )
    await writeStore(store)
    return true
  }
})

export const fallbackUsersModel = {
  async findByEmail(email) {
    const store = await readStore()
    return store.users.find((user) => user.email === email) || null
  },

  async findByUsername(username) {
    const store = await readStore()
    return store.users.find((user) => user.username === username) || null
  },

  async findByContactNumber(contactNumber) {
    const store = await readStore()
    return store.users.find((user) => user.contact_number === contactNumber) || null
  },

  async findById(id) {
    const store = await readStore()
    return store.users.find((user) => user.id === Number(id)) || null
  },

  async getAll() {
    const store = await readStore()
    return store.users
  },

  async create({
    fullName,
    email,
    username,
    passwordHash,
    contactNumber,
    securityQuestion,
    securityAnswerHash,
    role = 'user',
    isBlocked = false
  }) {
    const store = await readStore()
    const id = nextId(store, 'users')
    const user = {
      id,
      full_name: fullName,
      email,
      username,
      password_hash: passwordHash,
      contact_number: contactNumber,
      security_question: securityQuestion,
      security_answer_hash: securityAnswerHash,
      role,
      is_blocked: Boolean(isBlocked),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    store.users.unshift(user)
    await writeStore(store)
    return user
  },

  async updateById(id, payload) {
    const store = await readStore()
    const index = store.users.findIndex((user) => user.id === Number(id))
    if (index < 0) {
      return null
    }

    const current = store.users[index]
    const next = { ...current }
    if (payload.fullName !== undefined) next.full_name = payload.fullName
    if (payload.email !== undefined) next.email = payload.email
    if (payload.username !== undefined) next.username = payload.username
    if (payload.passwordHash !== undefined) next.password_hash = payload.passwordHash
    if (payload.contactNumber !== undefined) next.contact_number = payload.contactNumber
    if (payload.securityQuestion !== undefined) next.security_question = payload.securityQuestion
    if (payload.securityAnswerHash !== undefined) next.security_answer_hash = payload.securityAnswerHash
    if (payload.role !== undefined) next.role = payload.role
    if (payload.isBlocked !== undefined) next.is_blocked = Boolean(payload.isBlocked)
    next.updated_at = new Date().toISOString()

    store.users[index] = next
    await writeStore(store)
    return next
  },

  async deleteById(id) {
    const store = await readStore()
    const before = store.users.length
    store.users = store.users.filter((user) => user.id !== Number(id))
    if (before === store.users.length) {
      return false
    }
    store.bookings = store.bookings.filter((booking) => booking.user_id !== Number(id))
    await writeStore(store)
    return true
  }
}

export const fallbackToursModel = createServiceModel('tours')
export const fallbackTreksModel = createServiceModel('treks')
export const fallbackRestaurantsModel = createServiceModel('restaurants')
export const fallbackCarRentalsModel = createServiceModel('car_rentals')
export const fallbackPropertiesModel = createServiceModel('properties')

export const fallbackBookingsModel = {
  async getAll() {
    const store = await readStore()
    return store.bookings.map((booking) => decorateBooking(booking, store))
  },

  async getByUserId(userId) {
    const store = await readStore()
    return store.bookings
      .filter((booking) => booking.user_id === Number(userId))
      .map((booking) => decorateBooking(booking, store))
  },

  async getById(id) {
    const store = await readStore()
    const booking = store.bookings.find((booking) => booking.id === Number(id)) || null
    return booking ? decorateBooking(booking, store) : null
  },

  async getByServiceId(serviceId, serviceType = null) {
    const store = await readStore()
    return store.bookings.filter(
      (booking) => booking.service_id === Number(serviceId) && (!serviceType || booking.service_type === serviceType)
    ).map((booking) => decorateBooking(booking, store))
  },

  async create({ userId, serviceType, serviceId, bookingCount = 1, bookingDate, status = 'pending', serviceName }) {
    const store = await readStore()
    const id = nextId(store, 'bookings')
    const booking = {
      id,
      user_id: Number(userId),
      service_type: serviceType,
      service_id: Number(serviceId),
      service_name: serviceName || getFallbackServiceName(store, serviceType, serviceId),
      booking_count: Number(bookingCount),
      booking_date: bookingDate,
      status,
      created_at: new Date().toISOString()
    }
    store.bookings.unshift(booking)
    await writeStore(store)
    return decorateBooking(booking, store)
  },

  async updateById(id, payload) {
    const store = await readStore()
    const index = store.bookings.findIndex((booking) => booking.id === Number(id))
    if (index < 0) {
      return null
    }
    const current = store.bookings[index]
    const next = { ...current }
    if (payload.bookingDate !== undefined) next.booking_date = payload.bookingDate
    if (payload.bookingCount !== undefined) next.booking_count = Number(payload.bookingCount)
    if (payload.status !== undefined) next.status = payload.status
    store.bookings[index] = next
    await writeStore(store)
    return decorateBooking(next, store)
  },

  async deleteById(id) {
    const store = await readStore()
    const before = store.bookings.length
    store.bookings = store.bookings.filter((booking) => booking.id !== Number(id))
    if (before === store.bookings.length) {
      return false
    }
    await writeStore(store)
    return true
  }
}
