import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { defaultTourSeeds } from '../data/tourSeeds.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '..', 'data', 'fallback-db.json')
const TAX_RATE = 0.12

const buildSeedTours = () => defaultTourSeeds.map((tour, index) => ({
  id: 200 + index + 1,
  title: tour.title,
  description: tour.description,
  location: tour.location,
  price: tour.price,
  duration: tour.duration,
  image_url: tour.image_url,
  created_at: new Date().toISOString(),
  max_capacity: tour.max_capacity,
  current_bookings: 0,
  available_slots: tour.max_capacity,
  status: 'available',
  is_enabled: true,
  occupancy_rate: 0,
  min_start_date: tour.min_start_date,
  max_end_date: tour.max_end_date
}))

const ensureStore = async () => {
  try {
    await fs.access(dataPath)
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true })
    await fs.writeFile(dataPath, JSON.stringify({}, null, 2))
  }
}

const readStore = async () => {
  await ensureStore()
  const raw = await fs.readFile(dataPath, 'utf-8')
  const parsed = raw ? JSON.parse(raw) : {}

  parsed.users = parsed.users || []
  parsed.tours = parsed.tours || []
  parsed.tour_bookings = parsed.tour_bookings || []
  parsed.booking_travelers = parsed.booking_travelers || []
  parsed.counters = parsed.counters || {}
  parsed.counters.tour_bookings = parsed.counters.tour_bookings || 1
  parsed.counters.booking_travelers = parsed.counters.booking_travelers || 1

  if (!parsed.tours.length) {
    parsed.tours = buildSeedTours()
  } else {
    parsed.tours = parsed.tours.map((tour) => ({
      ...tour,
      max_capacity: Number(tour.max_capacity ?? 50),
      current_bookings: Number(tour.current_bookings ?? 0),
      available_slots: Number(tour.available_slots ?? Math.max(Number(tour.max_capacity ?? 50) - Number(tour.current_bookings ?? 0), 0)),
      status: tour.status || 'available',
      is_enabled: tour.is_enabled !== false,
      occupancy_rate: Number(tour.occupancy_rate ?? 0)
    }))
  }

  return parsed
}

const writeStore = async (store) => {
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2))
}

const calculateStatus = (tour) => {
  if (!tour.is_enabled || tour.status === 'closed') return 'closed'
  const slots = Number(tour.max_capacity) - Number(tour.current_bookings)
  if (slots <= 0) return 'full'
  if (slots <= 5) return 'limited'
  return 'available'
}

const parseDurationDays = (duration) => {
  const match = String(duration || '').match(/(\d+)/)
  const parsed = match ? Number(match[1]) : NaN
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const getTripLengthInDays = (startDate, endDate) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startDate || '')) || !/^\d{4}-\d{2}-\d{2}$/.test(String(endDate || ''))) {
    return null
  }
  const startUtc = new Date(`${startDate}T00:00:00Z`).getTime()
  const endUtc = new Date(`${endDate}T00:00:00Z`).getTime()
  if (Number.isNaN(startUtc) || Number.isNaN(endUtc) || endUtc < startUtc) {
    return null
  }
  return Math.floor((endUtc - startUtc) / 86400000) + 1
}

const refreshTourMetrics = (tour) => ({
  ...tour,
  current_bookings: Number(tour.current_bookings),
  available_slots: Math.max(Number(tour.max_capacity) - Number(tour.current_bookings), 0),
  occupancy_rate: Number(tour.max_capacity) > 0
    ? Number(((Number(tour.current_bookings) / Number(tour.max_capacity)) * 100).toFixed(2))
    : 0,
  status: calculateStatus(tour)
})

const generateBookingId = () => `TB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

const normalizeTour = (tour) => refreshTourMetrics({
  ...tour,
  min_start_date: tour.min_start_date || tour.minStartDate,
  max_end_date: tour.max_end_date || tour.maxEndDate
})

const decorateBooking = (booking, store) => {
  const tour = store.tours.find((item) => Number(item.id) === Number(booking.tour_id))
  const user = store.users.find((item) => Number(item.id) === Number(booking.user_id))
  const travelers = store.booking_travelers.filter((item) => item.booking_id === booking.booking_id)
  return {
    ...booking,
    tour_title: tour?.title || booking.tour_name_snapshot,
    tour_description: tour?.description || booking.tour_description_snapshot,
    primary_contact_person: booking.primary_contact_name,
    primary_contact_phone: booking.primary_contact_phone,
    customer_name: user?.full_name || booking.primary_contact_name,
    customer_email: user?.email || '',
    user_contact_number: user?.contact_number || booking.primary_contact_phone,
    travelers
  }
}

export const fallbackToursModel = {
  async getAll() {
    const store = await readStore()
    return store.tours.map(normalizeTour)
  },

  async getById(id) {
    const store = await readStore()
    const tour = store.tours.find((item) => Number(item.id) === Number(id))
    return tour ? normalizeTour(tour) : null
  },

  async create(payload) {
    const store = await readStore()
    const nextId = Math.max(200, ...store.tours.map((tour) => Number(tour.id))) + 1
    const created = normalizeTour({
      id: nextId,
      title: payload.title,
      description: payload.description || null,
      location: payload.location,
      price: Number(payload.price),
      duration: payload.duration,
      image_url: payload.imageUrl || null,
      created_at: new Date().toISOString(),
      max_capacity: Number(payload.maxCapacity || 50),
      current_bookings: 0,
      is_enabled: payload.isEnabled !== undefined ? Boolean(payload.isEnabled) : true,
      min_start_date: payload.minStartDate,
      max_end_date: payload.maxEndDate
    })
    store.tours.unshift(created)
    await writeStore(store)
    return created
  },

  async updateById(id, payload) {
    const store = await readStore()
    const index = store.tours.findIndex((item) => Number(item.id) === Number(id))
    if (index < 0) return null
    const current = store.tours[index]
    const updated = normalizeTour({
      ...current,
      title: payload.title ?? current.title,
      description: payload.description ?? current.description,
      location: payload.location ?? current.location,
      price: payload.price !== undefined ? Number(payload.price) : current.price,
      duration: payload.duration ?? current.duration,
      image_url: payload.imageUrl !== undefined ? (payload.imageUrl || null) : current.image_url,
      max_capacity: payload.maxCapacity !== undefined ? Number(payload.maxCapacity) : current.max_capacity,
      is_enabled: payload.isEnabled !== undefined ? Boolean(payload.isEnabled) : current.is_enabled,
      min_start_date: payload.minStartDate ?? current.min_start_date,
      max_end_date: payload.maxEndDate ?? current.max_end_date
    })
    store.tours[index] = updated
    await writeStore(store)
    return updated
  },

  async deleteById(id) {
    const store = await readStore()
    const before = store.tours.length
    store.tours = store.tours.filter((item) => Number(item.id) !== Number(id))
    if (before === store.tours.length) return false
    const removedBookingIds = store.tour_bookings.filter((item) => Number(item.tour_id) === Number(id)).map((item) => item.booking_id)
    store.tour_bookings = store.tour_bookings.filter((item) => Number(item.tour_id) !== Number(id))
    store.booking_travelers = store.booking_travelers.filter((item) => !removedBookingIds.includes(item.booking_id))
    await writeStore(store)
    return true
  }
}

export const fallbackTourBookingsModel = {
  async list(filters = {}, requestUser = null) {
    const store = await readStore()
    let rows = [...store.tour_bookings]
    if (requestUser?.role !== 'admin') {
      rows = rows.filter((item) => Number(item.user_id) === Number(requestUser?.id))
    }
    if (filters.tourId) {
      rows = rows.filter((item) => Number(item.tour_id) === Number(filters.tourId))
    }
    if (filters.status) {
      rows = rows.filter((item) => item.booking_status === filters.status)
    }
    if (filters.startDate) {
      rows = rows.filter((item) => item.start_date >= filters.startDate)
    }
    if (filters.endDate) {
      rows = rows.filter((item) => item.end_date <= filters.endDate)
    }
    return rows
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map((item) => decorateBooking(item, store))
  },

  async getByBookingId(bookingId) {
    const store = await readStore()
    const booking = store.tour_bookings.find((item) => item.booking_id === bookingId)
    return booking ? decorateBooking(booking, store) : null
  },

  async create({ userId, tourId, startDate, endDate, totalPeople, travelers }) {
    const store = await readStore()
    const tourIndex = store.tours.findIndex((item) => Number(item.id) === Number(tourId))
    if (tourIndex < 0) {
      throw new Error('Tour not found')
    }
    const currentTour = normalizeTour(store.tours[tourIndex])
    if (!currentTour.is_enabled || currentTour.status === 'closed') {
      throw new Error('Tour is currently unavailable')
    }
    if (startDate < currentTour.min_start_date || endDate > currentTour.max_end_date) {
      throw new Error('Selected dates fall outside the available range')
    }
    const maxTripDays = parseDurationDays(currentTour.duration)
    const tripLength = getTripLengthInDays(startDate, endDate)
    if (maxTripDays && tripLength && tripLength > maxTripDays) {
      throw new Error(`This tour can be booked for up to ${maxTripDays} day${maxTripDays > 1 ? 's' : ''}`)
    }

    const availableSlots = Number(currentTour.max_capacity) - Number(currentTour.current_bookings)
    if (Number(totalPeople) > availableSlots) {
      throw new Error(availableSlots > 0 ? `Only ${availableSlots} slots left` : 'Tour is fully booked')
    }

    const subtotal = Number(currentTour.price) * Number(totalPeople)
    const taxAmount = Number((subtotal * TAX_RATE).toFixed(2))
    const totalAmount = Number((subtotal + taxAmount).toFixed(2))
    const bookingId = generateBookingId()
    const primaryTraveler = travelers[0]
    const createdAt = new Date().toISOString()

    const booking = {
      id: store.counters.tour_bookings++,
      booking_id: bookingId,
      user_id: Number(userId),
      tour_id: Number(tourId),
      start_date: startDate,
      end_date: endDate,
      total_people: Number(totalPeople),
      price_per_person: Number(currentTour.price),
      tax_amount: taxAmount,
      total_amount: totalAmount,
      booking_status: 'confirmed',
      primary_contact_name: primaryTraveler.name,
      primary_contact_phone: primaryTraveler.contact_number,
      tour_name_snapshot: currentTour.title,
      tour_description_snapshot: currentTour.description,
      created_at: createdAt,
      updated_at: createdAt
    }

    store.tour_bookings.unshift(booking)
    travelers.forEach((traveler) => {
      store.booking_travelers.push({
        traveler_id: store.counters.booking_travelers++,
        booking_id: bookingId,
        name: traveler.name,
        age: Number(traveler.age),
        gender: traveler.gender,
        contact_number: traveler.contact_number
      })
    })

    store.tours[tourIndex] = normalizeTour({
      ...currentTour,
      current_bookings: Number(currentTour.current_bookings) + Number(totalPeople)
    })

    await writeStore(store)
    return decorateBooking(booking, store)
  },

  async updateStatus(bookingId, status) {
    const store = await readStore()
    const index = store.tour_bookings.findIndex((item) => item.booking_id === bookingId)
    if (index < 0) return null

    const current = store.tour_bookings[index]
    if (current.booking_status === status) {
      return decorateBooking(current, store)
    }

    const tourIndex = store.tours.findIndex((item) => Number(item.id) === Number(current.tour_id))
    const tour = tourIndex >= 0 ? normalizeTour(store.tours[tourIndex]) : null
    const currentApplied = current.booking_status === 'cancelled' ? 0 : Number(current.total_people)
    const nextApplied = status === 'cancelled' ? 0 : Number(current.total_people)
    const delta = nextApplied - currentApplied

    if (tour) {
      const availableSlots = Number(tour.max_capacity) - Number(tour.current_bookings)
      if (delta > availableSlots) {
        throw new Error('Tour does not have enough remaining capacity')
      }
      store.tours[tourIndex] = normalizeTour({
        ...tour,
        current_bookings: Math.max(0, Number(tour.current_bookings) + delta)
      })
    }

    const updated = {
      ...current,
      booking_status: status,
      updated_at: new Date().toISOString()
    }
    store.tour_bookings[index] = updated
    await writeStore(store)
    return decorateBooking(updated, store)
  },

  async getInvoiceData(bookingId) {
    return this.getByBookingId(bookingId)
  }
}

export const tourBookingTaxRate = TAX_RATE
